
import React, { useState, useEffect, Suspense } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(() => import('./RichTextEditor'), { 
    ssr: false,
    loading: () => <div className="min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2">Loading editor...</div>,
});

type MessageContentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { content: string }) => void;
  initialData?: { content: string };
  onAddMedia: (type: 'image' | 'video' | 'audio' | 'document') => void;
};

export default function MessageContentModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  onAddMedia
}: MessageContentModalProps) {
  const [text, setText] = useState('');

  useEffect(() => {
    if (isOpen) {
      setText(initialData?.content || '');
    }
  }, [initialData, isOpen]);

  const handleSave = () => {
    onSave({ content: text });
    onClose();
  };
  
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Message</DialogTitle>
          <DialogDescription>Modify the rich text content of your message below.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="message-text">Message Content</Label>
              <RichTextEditor
                  value={text}
                  onChange={setText}
                  placeholder="Type your message here..."
                  onAddMedia={onAddMedia}
              />
          </div>
        </div>
        <DialogFooter>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
