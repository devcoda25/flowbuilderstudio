import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import styles from '../properties-panel.module.css';

type GoogleSheetsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
};

function GoogleSheetsModalContent({ onClose, onSave }: { onClose: () => void; onSave: (data: any) => void }) {
  const { watch, setValue } = useFormContext();
  const accountId = watch('googleSheets.googleAccountId');

  const handleConnect = () => {
    alert('Connecting to Google Account...');
    setValue('googleSheets.googleAccountId', 'fake-account-id-123', { shouldDirty: true });
  };

  const handleDisconnect = () => {
    setValue('googleSheets.googleAccountId', null, { shouldDirty: true });
  };

  const handleSave = () => {
    onSave({ googleSheets: { googleAccountId: accountId } });
    onClose();
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Google Sheets</DialogTitle>
        <DialogDescription>Connect your Google Account to select a spreadsheet and worksheet.</DialogDescription>
      </DialogHeader>

      <div className="py-4">
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
      </div>

      <DialogFooter>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave}>Save</Button>
      </DialogFooter>
    </>
  );
}


export default function GoogleSheetsModal({
  isOpen,
  onClose,
  onSave,
  initialData
}: GoogleSheetsModalProps) {
  const methods = useForm({
    defaultValues: initialData || {},
  });
  
  useEffect(() => {
    if (isOpen) {
      methods.reset(initialData || {});
    }
  }, [initialData, isOpen, methods]);


  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <FormProvider {...methods}>
          <GoogleSheetsModalContent onClose={onClose} onSave={onSave} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
