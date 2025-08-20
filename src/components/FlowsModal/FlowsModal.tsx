
'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useFlowsStore } from '@/store/flows';
import { Button } from '../ui/button';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';


type FlowsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function FlowsModal({ isOpen, onClose }: FlowsModalProps) {
  const { flows, activeFlowId, setActiveFlow, deleteFlow } = useFlowsStore();
  const { toast } = useToast();

  const handleSelectFlow = (flowId: string) => {
    setActiveFlow(flowId);
    onClose();
  };

  const handleDeleteFlow = (e: React.MouseEvent, flowId: string, flowTitle: string) => {
    e.stopPropagation(); // Prevent row click when deleting
    if (window.confirm(`Are you sure you want to delete the flow "${flowTitle}"? This cannot be undone.`)) {
        deleteFlow(flowId);
        toast({
            title: "Flow Deleted",
            description: `"${flowTitle}" has been deleted.`,
            variant: "destructive"
        });
        if (flows.length <= 1) {
            onClose(); // Close modal if it was the last flow
        }
    }
  }

  const sortedFlows = [...flows].sort((a, b) => b.lastModified - a.lastModified);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Open Flow</DialogTitle>
          <DialogDescription>Select a previously saved flow to open it in the editor.</DialogDescription>
        </DialogHeader>
        <div className="py-4 max-h-[60vh] overflow-y-auto">
          <ul className="space-y-2">
            {sortedFlows.map(flow => (
              <li
                key={flow.id}
                onClick={() => handleSelectFlow(flow.id)}
                className={`p-4 rounded-lg border flex justify-between items-center cursor-pointer transition-colors ${
                  flow.id === activeFlowId ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                }`}
              >
                <div>
                  <h3 className="font-semibold">{flow.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    Last modified: {new Date(flow.lastModified).toLocaleString()}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={(e) => handleDeleteFlow(e, flow.id, flow.title)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </li>
            ))}
            {flows.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                    <p>No saved flows found.</p>
                    <p>Create a new one from the "Flows" menu.</p>
                </div>
            )}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}

    
