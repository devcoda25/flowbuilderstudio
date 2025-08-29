'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { File, FileText, FileSpreadsheet, FileJson, FileQuestion } from 'lucide-react';
import { nanoid } from 'nanoid';
import { MediaPart } from '@/types/MediaPart';

type DocumentAttachmentModalProps = {
  modalRef: React.MutableRefObject<HTMLDivElement | null>;
  isOpen: boolean;
  onClose: () => void;
  onSave: (media: MediaPart | MediaPart[]) => void;
  onDelete?: () => void; // Made optional to align with ImageAttachmentModal
  media?: MediaPart;
  type: 'image' | 'video' | 'audio' | 'document'; // Added type prop
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
};

export default function DocumentAttachmentModal({
  modalRef,
  isOpen,
  onClose,
  onSave,
  onDelete,
  media,
  type,
}: DocumentAttachmentModalProps) {
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && media && media.type === type) {
      setUrl(media.url || '');
      setName(media.name || '');
    } else if (isOpen) {
      setUrl('');
      setName('');
    }
  }, [media, isOpen, type]);

  const handleSave = () => {
    if (!url) return;
    onSave({ id: nanoid(), type, url, name });
    onClose();
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
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
            {media && onDelete && <Button variant="destructive" onClick={onDelete}>Delete Attachment</Button>}
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