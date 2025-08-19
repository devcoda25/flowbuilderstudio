import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageIcon, FileX } from 'lucide-react';
import type { ContentPart } from '@/components/CanvasWithLayoutWorker/nodes/BaseNode';

type MediaPart = { type: 'image' | 'video' | 'audio' | 'document', url: string, name?: string };

type ImageAttachmentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (media: MediaPart | MediaPart[]) => void;
  onDelete: () => void;
  media?: ContentPart;
};

export default function ImageAttachmentModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  media
}: ImageAttachmentModalProps) {
  const [url, setUrl] = useState('');
  const [isError, setIsError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
        if (media && media.type === 'image') {
            setUrl(media.url || '');
        } else {
            setUrl('');
        }
        setIsError(false);
    }
  }, [media, isOpen]);

  useEffect(() => {
    setIsError(false);
  }, [url]);


  const handleSave = () => {
    if (!url) return;
    onSave({ type: 'image', url });
    onClose();
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (files.length === 1) {
        const file = files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            onSave({ type: 'image', url: e.target?.result as string, name: file.name });
        };
        reader.readAsDataURL(file);
    } else {
        const newParts: MediaPart[] = [];
        let processedCount = 0;
        
        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                newParts.push({ type: 'image', url: e.target?.result as string, name: file.name });
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
          <DialogTitle>Attach Image</DialogTitle>
          <DialogDescription>Add an image to your message. Provide a URL or upload a file. You can select multiple files.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <div className="flex items-center justify-center h-48 bg-muted rounded-md overflow-hidden">
                {url && !isError ? 
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={url} 
                      alt="Image preview" 
                      width={200} 
                      height={200} 
                      className="object-contain max-h-full"
                      onError={() => setIsError(true)}
                    /> : 
                    isError ?
                      <FileX className="w-16 h-16 text-destructive" /> :
                      <ImageIcon className="w-16 h-16 text-muted-foreground" />
                }
            </div>
            <div className="grid gap-2">
                <Label htmlFor="image-url">Image URL</Label>
                <Input id="image-url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://placehold.co/600x400.png" />
            </div>
            <div className="text-center text-sm text-muted-foreground">or</div>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
                multiple
            />
            <Button variant="outline" type="button" onClick={handleUploadClick}>Upload from device</Button>
        </div>
        <DialogFooter className="justify-between">
            <div>
              {media && media.type === 'image' && <Button variant="destructive" onClick={onDelete}>Delete Attachment</Button>}
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
