
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
  isOpen: boolean;
  onClose: () => void;
  onSave: (media: MediaPart | MediaPart[]) => void;
  onDelete?: () => void;
  media?: MediaPart;
  type: 'image' | 'video' | 'audio' | 'document';
};

const getFileIcon = (fileName?: string) => {
  if (!fileName) return <File className="w-12 h-12 text-muted-foreground" />;
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf': return <FileText className="w-12 h-12 text-red-500" />;
    case 'docx': return <FileText className="w-12 h-12 text-blue-500" />;
    case 'txt': return <FileText className="w-12 h-12 text-gray-500" />;
    case 'csv':
    case 'xlsx': return <FileSpreadsheet className="w-12 h-12 text-green-500" />;
    case 'json': return <FileJson className="w-12 h-12 text-yellow-500" />;
    default: return <FileQuestion className="w-12 h-12 text-muted-foreground" />;
  }
};

export default function DocumentAttachmentModal({
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
    if (isOpen) {
        if (media && media.type === type) {
          setUrl(media.url || '');
          setName(media.name || '');
        } else {
          setUrl('');
          setName('');
        }
    }
  }, [media, isOpen, type]);

  const handleSave = () => {
    if (!url) return;
    onSave({ id: media?.id || nanoid(), type, url, name: name || url.substring(url.lastIndexOf('/')+1) });
    onClose();
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const mediaArray: MediaPart[] = [];
    for (const file of files) {
        mediaArray.push({
            id: nanoid(),
            type: type,
            url: URL.createObjectURL(file),
            name: file.name,
        });
    }

    if(mediaArray.length > 0) {
        onSave(mediaArray);
        onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Attach Document</DialogTitle>
          <DialogDescription>Add a document from a URL or upload from your device.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-center h-28 bg-muted rounded-md">
            {getFileIcon(name || url)}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="doc-url">Document URL</Label>
            <Input id="doc-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/document.pdf" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="doc-name">File Name (optional)</Label>
            <Input id="doc-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Annual Report.pdf" />
          </div>
           <div className="relative">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">OR</span>
            </div>
          </div>
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
            {media && onDelete && <Button variant="destructive" onClick={onDelete}>Delete</Button>}
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
