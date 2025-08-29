'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { VideoIcon, FileX } from 'lucide-react';
import { nanoid } from 'nanoid';
import { MediaPart } from '@/types/MediaPart';

type VideoAttachmentModalProps = {
  modalRef: React.MutableRefObject<HTMLDivElement | null>;
  isOpen: boolean;
  onClose: () => void;
  onSave: (media: MediaPart | MediaPart[]) => void;
  onDelete?: () => void; // Made optional to align with ImageAttachmentModal
  media?: MediaPart;
  type: 'image' | 'video' | 'audio' | 'document'; // Added type prop
};

export default function VideoAttachmentModal({
  modalRef,
  isOpen,
  onClose,
  onSave,
  onDelete,
  media,
  type,
}: VideoAttachmentModalProps) {
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
          <DialogTitle>Attach Video</DialogTitle>
          <DialogDescription>Add a video to your message. Provide a URL or upload a file. You can select multiple files.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-center h-48 bg-muted rounded-md overflow-hidden">
            {url && !isError ? 
              <video 
                key={url}
                src={url} 
                controls 
                className="w-full h-full object-contain"
                onError={() => setIsError(true)} 
              /> : 
              isError ?
                <FileX className="w-16 h-16 text-destructive" /> :
                <VideoIcon className="w-16 h-16 text-muted-foreground" />
            }
          </div>
          <div className="grid gap-2">
            <Label htmlFor="video-url">Video URL</Label>
            <Input id="video-url" value={url} onChange={handleUrlChange} placeholder="https://example.com/video.mp4" />
          </div>
          <div className="text-center text-sm text-muted-foreground">or</div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="video/*"
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