
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MediaPart } from '@/types/MediaPart';
import Image from 'next/image';

type ImageEditorModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (media: MediaPart) => void;
  media?: MediaPart;
};

export default function ImageEditorModal({
  isOpen,
  onClose,
  onSave,
  media,
}: ImageEditorModalProps) {
  const [editedMedia, setEditedMedia] = useState<MediaPart | undefined>(media);

  useEffect(() => {
    if (isOpen) {
      setEditedMedia(media);
    }
  }, [media, isOpen]);

  const handleSave = () => {
    if (editedMedia) {
      onSave(editedMedia);
    }
    onClose();
  };

  if (!isOpen || !editedMedia) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Image</DialogTitle>
          <DialogDescription>
            Crop, rotate, or adjust your image. (Editor coming soon)
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-center bg-muted rounded-md overflow-hidden p-4 min-h-[400px]">
            {editedMedia.url && (
              <Image
                src={editedMedia.url}
                alt={editedMedia.name || 'Image to edit'}
                width={500}
                height={400}
                className="max-w-full h-auto max-h-[400px] object-contain rounded-md"
              />
            )}
          </div>
          <div className="text-center text-muted-foreground text-sm">
            Full image editing capabilities will be available here soon.
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
