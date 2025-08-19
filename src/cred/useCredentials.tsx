'use client';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { CredentialSummary, CredentialType, SecretByType } from './types';
import * as svc from './vault';
import CredentialVaultModal from '@/components/CredentialVault/CredentialVaultModal';

type Ctx = {
  credentials: CredentialSummary[];
  refresh: () => Promise<void>;
  create: <T extends CredentialType>(input: {
    type: T; name: string; apiKeyName?: string; apiKeyIn?: 'header'|'query'; secret: SecretByType<T>
  }) => Promise<void>;
  rotate: <T extends CredentialType>(id: string, secret: SecretByType<T>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  resolve: (id: string) => Promise<any>;
  openVault: () => void;
  closeVault: () => void;
  canViewSecrets: boolean;
};

const VaultContext = createContext<Ctx | null>(null);

export function CredentialVaultProvider({
  children,
  canViewSecrets = true
}: { children: React.ReactNode; canViewSecrets?: boolean }) {
  const [credentials, setCredentials] = useState<CredentialSummary[]>([]);
  const [open, setOpen] = useState(false);

  const refresh = async () => setCredentials(await svc.listCredentials());

  useEffect(() => { void refresh() }, []);

  const create = async (input: any) => { await svc.createCredential(input); await refresh(); };
  const rotate = async (id: string, secret: any) => { await svc.rotateCredential(id, secret); await refresh(); };
  const remove = async (id: string) => { await svc.deleteCredential(id); await refresh(); };
  const resolve = (id: string) => svc.resolveSecret(id);

  const value = useMemo<Ctx>(() => ({
    credentials, refresh, create, rotate, remove, resolve,
    openVault: () => setOpen(true),
    closeVault: () => setOpen(false),
    canViewSecrets
  }), [credentials, canViewSecrets]);

  return (
    <VaultContext.Provider value={value}>
      {children}
      <CredentialVaultModal open={open} onClose={() => setOpen(false)} />
    </VaultContext.Provider>
  );
}

export function useCredentialVault() {
  const ctx = useContext(VaultContext);
  if (!ctx) throw new Error('CredentialVaultProvider missing');
  return ctx;
}
