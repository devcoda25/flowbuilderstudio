import React from 'react';
import styles from './credentialSelector.module.css';
import { useCredentialVault } from '@/cred/useCredentials';
import type { CredentialSummary } from '@/cred/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';

export default function CredentialSelector({
  value,
  onChange,
  allowManage = true,
  label = 'Credential'
}: {
  value?: string;
  onChange: (id?: string) => void;
  allowManage?: boolean;
  label?: string;
}) {
  const { credentials, openVault } = useCredentialVault();

  return (
    <div className={styles.root}>
      <label className={styles.label}>{label}</label>
      <div className={styles.row}>
        <Select value={value || ''} onValueChange={(val) => onChange(val || undefined)}>
            <SelectTrigger>
                <SelectValue placeholder="— None —" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="">— None —</SelectItem>
                {credentials.map((c: CredentialSummary) => (
                    <SelectItem key={c.id} value={c.id}>
                        {c.name} ({c.type})
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
        {allowManage && (
          <Button variant="outline" onClick={openVault} type="button">
            Manage…
          </Button>
        )}
      </div>
    </div>
  );
}
