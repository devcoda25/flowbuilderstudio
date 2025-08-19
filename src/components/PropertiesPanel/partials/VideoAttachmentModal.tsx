import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { VideoIcon, FileX } from 'lucide-react';
import type { ContentPart } from '@/components/CanvasWithLayoutWorker/nodes/BaseNode';

type MediaPart = { type: 'image' | 'video' | 'audio' | 'document', url: string, name?: string };

type VideoAttachmentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (media: MediaPart | MediaPart[]) => void;
  onDelete: () => void;
  media?: ContentPart;
};

export default function VideoAttachmentModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  media
}: VideoAttachmentModalProps) {
  const [url, setUrl] = useState('');
  const [isError, setIsError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
        if (media && media.type === 'video') {
            setUrl(media.url || '');
        } else {
            setUrl('');
        }
        setIsError(false);
    }
  }, [media, isOpen]);

  const handleSave = () => {
    if (!url) return;
    onSave({ type: 'video', url });
    onClose();
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    // Reset error state when user starts typing a new URL
    if (isError) {
        setIsError(false);
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (files.length === 1) {
        const file = files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            onSave({ type: 'video', url: e.target?.result as string, name: file.name });
        };
        reader.readAsDataURL(file);
    } else {
        const newParts: MediaPart[] = [];
        let processedCount = 0;
        
        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                newParts.push({ type: 'video', url: e.target?.result as string, name: file.name });
                processedCount++;
                if (processedCount === files.length) {
                    onSave(newParts);
                }
            };
            reader.readAsDataURL(file);
        });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
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
            {media && media.type === 'video' && <Button variant="destructive" onClick={onDelete}>Delete Attachment</Button>}
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
