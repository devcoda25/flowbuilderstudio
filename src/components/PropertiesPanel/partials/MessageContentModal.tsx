'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import dynamic from 'next/dynamic';
import type { ContentPart } from '@/components/CanvasWithLayoutWorker/nodes/BaseNode';
import { MediaPart } from '@/types/MediaPart';

const RichTextEditor = dynamic(() => import('./RichTextEditor'), {
  ssr: false,
  loading: () => <div className="min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2">Loading editor...</div>,
});

type MessageContentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { content: string; parts?: ContentPart[] }) => void;
  initialData?: { content: string; parts?: ContentPart[] };
  onAddMedia: (type: 'image' | 'video' | 'audio' | 'document', media?: MediaPart) => void;
};

export default function MessageContentModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  onAddMedia,
}: MessageContentModalProps) {
  const [text, setText] = useState('');
  const [parts, setParts] = useState<ContentPart[]>([]);

  useEffect(() => {
    if (isOpen) {
      setText(initialData?.content || '');
      setParts(initialData?.parts || []);
    }
  }, [initialData, isOpen]);

  const handleSave = () => {
    onSave({ content: text, parts });
    onClose();
  };

  const handleDeleteAttachment = (id: string) => {
    setParts(parts.filter((part) => part.id !== id));
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
              variables={['name', 'email', 'order_id']}
              attachments={parts as MediaPart[]}
              onDeleteAttachment={handleDeleteAttachment}
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