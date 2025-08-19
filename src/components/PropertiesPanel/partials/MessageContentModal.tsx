import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import VariableChipAutocomplete from '@/components/VariableChipAutocomplete/VariableChipAutocomplete';

type MessageContentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { content: string }) => void;
  initialData?: { content: string };
};

export default function MessageContentModal({
  isOpen,
  onClose,
  onSave,
  initialData
}: MessageContentModalProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setText(initialData?.content || '');
    }
  }, [initialData, isOpen]);

  const handleSave = () => {
    onSave({ content: text });
    onClose();
  };
  
  const handleInsertVariable = (name: string) => {
    const start = textareaRef.current?.selectionStart || text.length;
    const end = textareaRef.current?.selectionEnd || text.length;
    const variable = `{{${name}}}`;
    const newText = text.substring(0, start) + variable + text.substring(end);
    setText(newText);
    textareaRef.current?.focus();
    setTimeout(() => {
        const newCursorPos = start + variable.length;
        textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };


  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Message</DialogTitle>
          <DialogDescription>Modify the text content of your message below.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <div className="flex justify-between items-center">
                <Label htmlFor="message-text">Message Content</Label>
                <VariableChipAutocomplete 
                    variables={['name', 'email', 'cart_item', 'order_id']} 
                    onInsert={handleInsertVariable} 
                />
            </div>
            <Textarea 
              id="message-text" 
              ref={textareaRef}
              value={text} 
              onChange={e => setText(e.target.value)} 
              placeholder="Type your message here..."
              rows={6}
            />
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
