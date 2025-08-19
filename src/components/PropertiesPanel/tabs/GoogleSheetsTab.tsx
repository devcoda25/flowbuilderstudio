import React from 'react';
import { useFormContext } from 'react-hook-form';
import styles from '../properties-panel.module.css';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function GoogleSheetsTab() {
  const { watch, setValue } = useFormContext();
  const accountId = watch('googleSheets.googleAccountId');

  // Placeholder for real Google account connection logic
  const handleConnect = () => {
    // In a real app, this would open an OAuth flow
    alert('Connecting to Google Account...');
    setValue('googleSheets.googleAccountId', 'fake-account-id-123', { shouldDirty: true });
  };

  const handleDisconnect = () => {
    setValue('googleSheets.googleAccountId', null, { shouldDirty: true });
  }

  return (
    <div className={styles.tabBody}>
      <Card>
        <CardHeader>
          <CardTitle>Google Spreadsheet</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={styles.field}>
            <Label>Google Account</Label>
            {accountId ? (
                <div className="flex items-center justify-between">
                    <p className="text-sm">Connected as: <strong>{accountId}</strong></p>
                    <Button variant="destructive" size="sm" onClick={handleDisconnect}>Disconnect</Button>
                </div>
            ) : (
                <Button onClick={handleConnect} className="w-fit bg-green-600 hover:bg-green-700 text-white">
                    Add new Google Account
                </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
