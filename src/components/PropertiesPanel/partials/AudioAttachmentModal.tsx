'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Music, FileX } from 'lucide-react';
import { nanoid } from 'nanoid';
import { MediaPart } from '@/types/MediaPart';

type AudioAttachmentModalProps = {
  modalRef: React.MutableRefObject<HTMLDivElement | null>;
  isOpen: boolean;
  onClose: () => void;
  onSave: (media: MediaPart | MediaPart[]) => void;
  onDelete?: () => void; // Made optional to align with ImageAttachmentModal
  media?: MediaPart;
  type: 'image' | 'video' | 'audio' | 'document'; // Added type prop
};

export default function AudioAttachmentModal({
  modalRef,
  isOpen,
  onClose,
  onSave,
  onDelete,
  media,
  type,
}: AudioAttachmentModalProps) {
  const [url, setUrl] = useState('');
  const [isError, setIsError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (media && media.type === type) {
        setUrl(media.url || '');
      } else {
        setUrl('');
      }
      setIsError(false);
    }
  }, [media, isOpen, type]);

  const handleSave = () => {
    if (!url) return;
    onSave({ id: nanoid(), type, url });
    onClose();
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    if (isError) {
      setIsError(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const mediaArray: MediaPart[] = Array.from(files).map(file => ({
      id: nanoid(),
      type,
      url: URL.createObjectURL(file),
      name: file.name,
    }));
    onSave(mediaArray);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent ref={modalRef}>
        <DialogHeader>
          <DialogTitle>Attach Audio</DialogTitle>
          <DialogDescription>Add an audio file to your message. Provide a URL or upload a file. You can select multiple files.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-center h-48 bg-muted rounded-md overflow-hidden p-4">
            {url && !isError ? 
              <audio 
                key={url}
                src={url} 
                controls 
                className="w-full"
                onError={() => setIsError(true)}
              /> :
              isError ?
                <FileX className="w-16 h-16 text-destructive" /> :
                <Music className="w-16 h-16 text-muted-foreground" />
            }
          </div>
          <div className="grid gap-2">
            <Label htmlFor="audio-url">Audio URL</Label>
            <Input id="audio-url" value={url} onChange={handleUrlChange} placeholder="https://example.com/audio.mp3" />
          </div>
          <div className="text-center text-sm text-muted-foreground">or</div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="audio/*"
            multiple
          />
          <Button variant="outline" type="button" onClick={handleUploadClick}>Upload from device</Button>
        </div>
        <DialogFooter className="justify-between">
          <div>
            {media && onDelete && <Button variant="destructive" onClick={onDelete}>Delete Attachment</Button>}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} disabled={!url || isError}>Save</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}