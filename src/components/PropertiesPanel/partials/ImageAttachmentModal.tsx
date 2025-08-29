'use client';

import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

type ImageAttachmentModalProps = {
  modalRef: React.MutableRefObject<HTMLDivElement | null>;
  isOpen: boolean;
  onClose: () => void;
  onSave: (file: File) => void;
  type?: 'image' | 'video' | 'audio' | 'document'; // Make type optional
};

export default function ImageAttachmentModal({ modalRef, isOpen, onClose, onSave, type }: ImageAttachmentModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleSave = () => {
    if (file) {
      onSave(file);
    }
  };

  // Fallback title if type is undefined
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
          />
          {file && (
            <div>
              <p>Selected file: {file.name}</p>
              {type === 'image' && (
                <img
                  src={URL.createObjectURL(file)}
                  alt="Preview"
                  className="max-w-full h-auto max-h-48"
                />
              )}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!file}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}