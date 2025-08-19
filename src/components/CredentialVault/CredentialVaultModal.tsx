'use client';
import React, { useMemo, useState } from 'react';
import styles from './credentialVault.module.css';
import { useCredentialVault } from '@/cred/useCredentials';
import type { CredentialSummary, CredentialType } from '@/cred/types';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { useToast } from '@/hooks/use-toast';

type FormState =
  | { mode: 'idle' }
  | { mode: 'create'; type: CredentialType }
  | { mode: 'rotate'; id: string; type: CredentialType; name: string };

export default function CredentialVaultModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { credentials, remove, create, rotate, resolve, canViewSecrets } = useCredentialVault();
  const [filter, setFilter] = useState<'all' | CredentialType>('all');
  const [form, setForm] = useState<FormState>({ mode: 'idle' });
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();

  const items = useMemo(
    () => credentials.filter(c => filter === 'all' ? true : c.type === filter),
    [credentials, filter]
  );

  if (!open) return null;

  const onDelete = async (id: string) => {
    if (!confirm('Delete credential? This cannot be undone.')) return;
    setBusy(true); await remove(id); setBusy(false);
  };

  const onCopy = async (c: CredentialSummary) => {
    if (!canViewSecrets) return;
    const s = await resolve(c.id);
    let text = '';
    if (c.type === 'bearer') text = s.token;
    if (c.type === 'basic') text = `${s.username}:${s.password}`;
    if (c.type === 'apiKey') text = s.key;
    await navigator.clipboard.writeText(text);
    toast({ title: 'Copied to clipboard' });
  };

  const isFormOpen = form.mode !== 'idle';
  const FormComponent = form.mode === 'create' ? CreateForm : form.mode === 'rotate' ? RotateForm : null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className={styles.modal}>
        <DialogHeader>
          <DialogTitle>Credential Vault</DialogTitle>
        </DialogHeader>
        <div className={styles.head}>
          <Select value={filter} onValueChange={(v: 'all' | CredentialType) => setFilter(v)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="bearer">Bearer</SelectItem>
              <SelectItem value="basic">Basic</SelectItem>
              <SelectItem value="apiKey">API Key</SelectItem>
            </SelectContent>
          </Select>
          <div className={styles.gap} />
          <Button onClick={() => setForm({ mode: 'create', type: 'bearer' })}>+ New Credential</Button>
        </div>

        <div className={styles.body}>
          {items.length === 0 ? (
            <div className={styles.empty}>No credentials yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Rotated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className={styles.cellName}>{c.name}</TableCell>
                    <TableCell>{c.type}</TableCell>
                    <TableCell className={styles.dim}>
                      {c.type === 'apiKey' ? `${c.apiKeyName} in ${c.apiKeyIn}` : '—'}
                    </TableCell>
                    <TableCell>{c.rotatedAt ? new Date(c.rotatedAt).toLocaleString() : '—'}</TableCell>
                    <TableCell className={styles.actions}>
                      {canViewSecrets && <Button variant="ghost" size="sm" onClick={() => onCopy(c)}>Copy</Button>}
                      <Button variant="ghost" size="sm" onClick={() => setForm({ mode: 'rotate', id: c.id, type: c.type, name: c.name })}>Rotate</Button>
                      <Button variant="destructive" size="sm" disabled={busy} onClick={() => onDelete(c.id)}>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        
        {isFormOpen && FormComponent && (
            <Dialog open={isFormOpen} onOpenChange={(isOpen) => !isOpen && setForm({mode: 'idle'})}>
                <DialogContent>
                    {form.mode === 'create' &&
                        <CreateForm
                            type={form.type}
                            onCancel={() => setForm({ mode: 'idle' })}
                            onSubmit={async (payload) => { setBusy(true); await create(payload as any); setBusy(false); setForm({ mode: 'idle' }); }}
                        />
                    }
                    {form.mode === 'rotate' &&
                        <RotateForm
                            type={form.type}
                            name={form.name}
                            onCancel={() => setForm({ mode: 'idle' })}
                            onSubmit={async (secret) => { setBusy(true); await rotate(form.id, secret as any); setBusy(false); setForm({ mode: 'idle' }); }}
                        />
                    }
                </DialogContent>
            </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ... CreateForm and RotateForm components

function CreateForm({
  type, onCancel, onSubmit
}: {
  type: CredentialType;
  onCancel: () => void;
  onSubmit: (payload: any) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [apiKeyName, setApiKeyName] = useState('x-api-key');
  const [apiKeyIn, setApiKeyIn] = useState<'header'|'query'>('header');
  const [token, setToken] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [key, setKey] = useState('');

  return (
    <>
    <DialogHeader>
        <DialogTitle>Create New {type} Credential</DialogTitle>
    </DialogHeader>
    <div className={styles.form}>
      <div className={styles.formRow}>
        <Label>Name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Prod API Token" />
      </div>

      {type === 'bearer' && (
        <div className={styles.formRow}>
          <Label>Bearer token</Label>
          <Textarea value={token} onChange={(e) => setToken(e.target.value)} rows={3} />
        </div>
      )}
      {type === 'basic' && (
        <>
          <div className={styles.formRow}>
            <Label>Username</Label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div className={styles.formRow}>
            <Label>Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        </>
      )}
      {type === 'apiKey' && (
        <>
          <div className={styles.formRow}>
            <Label>Key</Label>
            <Input value={key} onChange={(e) => setKey(e.target.value)} />
          </div>
          <div className={styles.formRowCols}>
            <div>
              <Label>Header name</Label>
              <Input value={apiKeyName} onChange={(e) => setApiKeyName(e.target.value)} />
            </div>
            <div>
              <Label>Send in</Label>
              <Select value={apiKeyIn} onValueChange={(v: 'header'|'query') => setApiKeyIn(v)}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>
                    <SelectItem value="header">Header</SelectItem>
                    <SelectItem value="query">Query</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </>
      )}
    </div>
    <DialogFooter>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button
          onClick={() => onSubmit(
            type === 'bearer' ? { type, name, secret: { token } } :
            type === 'basic'  ? { type, name, secret: { username, password } } :
                                { type, name, apiKeyName, apiKeyIn, secret: { key } }
          )}
          disabled={!name || (type === 'bearer' && !token) || (type === 'basic' && (!username || !password)) || (type === 'apiKey' && !key)}
        >
          Save
        </Button>
    </DialogFooter>
    </>
  );
}

function RotateForm({
  type, name, onCancel, onSubmit
}: { type: CredentialType; name: string; onCancel: () => void; onSubmit: (secret: any) => Promise<void> }) {
  const [token, setToken] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [key, setKey] = useState('');

  return (
    <>
    <DialogHeader>
        <DialogTitle>Rotate: <strong>{name}</strong> ({type})</DialogTitle>
    </DialogHeader>
    <div className={styles.form}>
      {type === 'bearer' && (
        <div className={styles.formRow}>
          <Label>New token</Label>
          <Textarea value={token} onChange={(e) => setToken(e.target.value)} rows={3} />
        </div>
      )}
      {type === 'basic' && (
        <>
          <div className={styles.formRow}>
            <Label>New username</Label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div className={styles.formRow}>
            <Label>New password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        </>
      )}
      {type === 'apiKey' && (
        <div className={styles.formRow}>
          <Label>New key</Label>
          <Input value={key} onChange={(e) => setKey(e.target.value)} />
        </div>
      )}
      </div>
      <DialogFooter>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button
          onClick={() => onSubmit(type === 'bearer' ? { token } : type === 'basic' ? { username, password } : { key })}
          disabled={(type === 'bearer' && !token) || (type === 'basic' && (!username || !password)) || (type === 'apiKey' && !key)}
        >
          Rotate
        </Button>
      </DialogFooter>
    </>
  );
}
