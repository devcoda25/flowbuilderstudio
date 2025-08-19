import { decryptString, encryptString } from './crypto';
import { idbDelete, idbGet, idbGetAll, idbPut } from './idb';
import type { ApiKeySecret, BasicSecret, BearerSecret, CredentialSummary, CredentialType, SecretByType, VaultRecord } from './types';

/** List summaries (no plaintext). */
export async function listCredentials(): Promise<CredentialSummary[]> {
  const all = await idbGetAll<VaultRecord>();
  // newest first
  return all.sort((a, b) => b.updatedAt - a.updatedAt).map(({ enc, ...summary }) => summary);
}

/** Create credential with secret payload. Returns summary. */
export async function createCredential<T extends CredentialType>(input: {
  type: T;
  name: string;
  // non-secret config for apiKey
  apiKeyName?: string;
  apiKeyIn?: 'header' | 'query';
  secret: SecretByType<T>;
}): Promise<CredentialSummary> {
  const now = Date.now();
  const enc = await encryptString(JSON.stringify(input.secret));
  const rec: VaultRecord = {
    id: crypto.randomUUID(),
    name: input.name,
    type: input.type,
    createdAt: now,
    updatedAt: now,
    rotatedAt: now,
    apiKeyName: input.type === 'apiKey' ? (input.apiKeyName || 'x-api-key') : undefined,
    apiKeyIn: input.type === 'apiKey' ? (input.apiKeyIn || 'header') : undefined,
    enc
  };
  await idbPut(rec);
  const { enc: _e, ...summary } = rec;
  return summary;
}

/** Rotate secret. */
export async function rotateCredential<T extends CredentialType>(id: string, secret: SecretByType<T>): Promise<void> {
  const rec = await idbGet<VaultRecord>(id);
  if (!rec) throw new Error('Credential not found');
  rec.enc = await encryptString(JSON.stringify(secret));
  rec.rotatedAt = Date.now();
  rec.updatedAt = rec.rotatedAt;
  await idbPut(rec);
}

/** Delete. */
export async function deleteCredential(id: string): Promise<void> {
  await idbDelete(id);
}

/** Decrypt secret for injection. */
export async function resolveSecret(id: string): Promise<BearerSecret | BasicSecret | ApiKeySecret> {
  const rec = await idbGet<VaultRecord>(id);
  if (!rec) throw new Error('Credential not found');
  const json = await decryptString(rec.enc);
  return JSON.parse(json);
}

/** Get summary by id (no plaintext). */
export async function getSummary(id: string): Promise<CredentialSummary | undefined> {
  const rec = await idbGet<VaultRecord>(id);
  if (!rec) return undefined;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { enc, ...summary } = rec;
  return summary;
}
