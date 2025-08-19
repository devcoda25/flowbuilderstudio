import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

type AssignTeamModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: { assignedTeam?: string };
};

// Mock data, in a real app this would come from an API
const TEAMS = [
    { id: 'team-1', name: 'Support Tier 1' },
    { id: 'team-2', name: 'Sales Team' },
    { id: 'team-3', name: 'Technical Support' },
    { id: 'team-4', name: 'Billing Department' },
];

export default function AssignTeamModal({
  isOpen,
  onClose,
  onSave,
  initialData
}: AssignTeamModalProps) {
  const [assignedTeam, setAssignedTeam] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (isOpen) {
      setAssignedTeam(initialData?.assignedTeam);
    }
  }, [initialData, isOpen]);

  const handleSave = () => {
    onSave({ assignedTeam });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Team</DialogTitle>
        </DialogHeader>
        <Separator />
        <div className="grid gap-4 py-4">
          <Select onValueChange={setAssignedTeam} value={assignedTeam}>
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {TEAMS.map(team => (
                <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Label className="text-muted-foreground">Assigned Team</Label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
