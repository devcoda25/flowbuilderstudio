import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { File, FileText, FileSpreadsheet, FileJson, FileQuestion } from 'lucide-react';
import type { ContentPart } from '@/components/CanvasWithLayoutWorker/nodes/BaseNode';

type MediaPart = { type: 'image' | 'video' | 'audio' | 'document', url: string, name?: string };

type DocumentAttachmentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (media: MediaPart | MediaPart[]) => void;
  onDelete: () => void;
  media?: ContentPart;
};

const getFileIcon = (fileName?: string) => {
    if (!fileName) return <File className="w-16 h-16 text-muted-foreground" />;
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
        case 'pdf': return <FileText className="w-16 h-16 text-primary" />;
        case 'docx': return <FileText className="w-16 h-16 text-primary" />;
        case 'txt': return <FileText className="w-16 h-16 text-muted-foreground" />;
        case 'csv':
        case 'xlsx': return <FileSpreadsheet className="w-16 h-16 text-accent" />;
        case 'json': return <FileJson className="w-16 h-16 text-accent" />;
        default: return <FileQuestion className="w-16 h-16 text-muted-foreground" />;
    }
}

export default function DocumentAttachmentModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  media
}: DocumentAttachmentModalProps) {
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && media && media.type === 'document') {
      setUrl(media.url || '');
      setName(media.name || '');
    } else if (isOpen) {
      setUrl('');
      setName('');
    }
  }, [media, isOpen]);

  const handleSave = () => {
    if (!url) return;
    onSave({ type: 'document', url, name });
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
            onSave({ type: 'document', url: e.target?.result as string, name: file.name });
        };
        reader.readAsDataURL(file);
    } else {
        const newParts: MediaPart[] = [];
        let processedCount = 0;
        
        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                newParts.push({ type: 'document', url: e.target?.result as string, name: file.name });
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
          <DialogTitle>Attach Document</DialogTitle>
          <DialogDescription>Add a document to your message. Provide a URL or upload a file. You can select multiple files.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-center h-40 bg-muted rounded-md">
            {url ? getFileIcon(name || url) : <File className="w-16 h-16 text-muted-foreground" />}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="doc-url">Document URL</Label>
            <Input id="doc-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/document.pdf" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="doc-name">File Name (optional)</Label>
            <Input id="doc-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Annual Report.pdf" />
          </div>
          <div className="text-center text-sm text-muted-foreground">or</div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.json"
            multiple
          />
          <Button variant="outline" type="button" onClick={handleUploadClick}>Upload from device</Button>
        </div>
        <DialogFooter className="justify-between">
          <div>
            {media && media.type === 'document' && <Button variant="destructive" onClick={onDelete}>Delete Attachment</Button>}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} disabled={!url}>Save</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
