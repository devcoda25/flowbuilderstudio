'use client';

import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { nanoid } from 'nanoid';
import { MediaPart } from '@/types/MediaPart'; // Import shared MediaPart type

type ImageAttachmentModalProps = {
  modalRef: React.MutableRefObject<HTMLDivElement | null>;
  isOpen: boolean;
  onClose: () => void;
  onSave: (media: MediaPart | MediaPart[]) => void; // Updated to allow arrays
  onDelete?: () => void;
  media?: MediaPart;
  type?: 'image' | 'video' | 'audio' | 'document';
};

export default function ImageAttachmentModal({ modalRef, isOpen, onClose, onSave, onDelete, media, type }: ImageAttachmentModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]); // Store first file for preview
    }
  };

  const handleSave = () => {
    if (fileInputRef.current?.files) {
      const files = Array.from(fileInputRef.current.files);
      const mediaArray: MediaPart[] = files.map(file => ({
        id: nanoid(),
        url: URL.createObjectURL(file),
        name: file.name,
        type: type || 'image',
      }));
      onSave(mediaArray);
      onClose();
    }
  };

  const dialogTitle = type ? `${type.charAt(0).toUpperCase() + type.slice(1)}` : 'Media';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent ref={modalRef} className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload {dialogTitle}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <input
            type="file"
            ref={fileInputRef}
            accept={
              type === 'image' ? 'image/*' :
              type === 'video' ? 'video/*' :
              type === 'audio' ? 'audio/*' :
              '*/*'
            }
            onChange={handleFileChange}
            multiple // Added to support multiple files
          />
          {(file || media) && (
            <div>
              <p>Selected file: {file?.name || media?.name}</p>
              {type === 'image' && (file || media) && (
                <img
                  src={file ? URL.createObjectURL(file) : media?.url}
                  alt="Preview"
                  className="max-w-full h-auto max-h-48"
                />
              )}
            </div>
          )}
        </div>
        <div className="flex justify-between">
          <div>
            {onDelete && media && (
              <Button variant="destructive" onClick={onDelete}>
                Delete
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!file}>
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}