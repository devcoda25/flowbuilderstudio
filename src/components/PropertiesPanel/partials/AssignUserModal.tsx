import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

type AssignUserModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: { assignedUser?: string };
};

// Mock data, in a real app this would come from an API
const USERS = [
    { id: 'user-1', name: 'Alice Johnson' },
    { id: 'user-2', name: 'Bob Williams' },
    { id: 'user-3', name: 'Charlie Brown' },
    { id: 'user-4', name: 'Diana Miller' },
];

export default function AssignUserModal({
  isOpen,
  onClose,
  onSave,
  initialData
}: AssignUserModalProps) {
  const [assignedUser, setAssignedUser] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (isOpen) {
      setAssignedUser(initialData?.assignedUser);
    }
  }, [initialData, isOpen]);

  const handleSave = () => {
    onSave({ assignedUser });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign User</DialogTitle>
        </DialogHeader>
        <Separator />
        <div className="grid gap-4 py-4">
          <Select onValueChange={setAssignedUser} value={assignedUser}>
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {USERS.map(user => (
                <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Label className="text-muted-foreground">Assigned User</Label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
