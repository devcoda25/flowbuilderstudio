
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm, useFieldArray, FormProvider, Controller } from 'react-hook-form';
import { nanoid } from 'nanoid';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(() => import('./RichTextEditor'), { 
    ssr: false,
    loading: () => <div className="min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2">Loading editor...</div>,
});


type QuickReply = {
  id: string;
  label: string;
};

type FormValues = {
  headerText?: string;
  content: string;
  footerText?: string;
  quickReplies: QuickReply[];
  variableName?: string;
  mediaHeader?: boolean;
};

type ButtonsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<FormValues>) => void;
  initialData?: Partial<FormValues>;
};

const MAX_BUTTONS = 3;

export default function ButtonsModal({ isOpen, onClose, onSave, initialData }: ButtonsModalProps) {
  const methods = useForm<FormValues>({
    defaultValues: {
      content: 'Ask a question here',
      quickReplies: [{ id: nanoid(), label: 'Answer 1' }],
      ...initialData,
    },
  });

  const { control, handleSubmit, register, watch } = methods;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "quickReplies"
  });
  
  const [newButtonText, setNewButtonText] = useState('');

  useEffect(() => {
    if (isOpen) {
      methods.reset({
        content: 'Ask a question here',
        quickReplies: [{ id: nanoid(), label: 'Answer 1' }],
        ...initialData,
      });
    }
  }, [initialData, isOpen, methods]);

  const onSubmit = (data: FormValues) => {
    onSave(data);
    onClose();
  };

  const handleCreateButton = () => {
    if (newButtonText.trim() && fields.length < MAX_BUTTONS) {
      append({ id: nanoid(), label: newButtonText.trim() });
      setNewButtonText('');
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Set Buttons</DialogTitle>
        </DialogHeader>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <ScrollArea className="h-[70vh] pr-4 -mr-4">
              <div className="space-y-6 py-4">
                <div className="flex items-center justify-between">
                  <Label>Media Header</Label>
                  <Controller name="mediaHeader" control={control} render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />
                </div>

                <div className="space-y-2">
                  <Label>Header Text <span className="text-muted-foreground">(optional, max 60 chars)</span></Label>
                  <div className="flex items-center gap-2">
                    <Input {...register('headerText')} placeholder="Input value" />
                    <Button variant="outline" size="sm" className="bg-green-600 hover:bg-green-700 text-white border-none shrink-0">Variables</Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Body Text <span className="text-muted-foreground">(required, max 1024 chars)</span></Label>
                  <Controller
                    name="content"
                    control={control}
                    render={({ field }) => (
                      <RichTextEditor
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Ask a question here"
                        variables={['name', 'email', 'order_id']}
                      />
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Footer Text <span className="text-muted-foreground">(optional, max 60 chars)</span></Label>
                  <Input {...register('footerText')} placeholder="Input value" />
                </div>

                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="space-y-2">
                      <Label>Button {index + 1} <span className="text-muted-foreground">(required, max 20 chars)</span></Label>
                      <Input {...register(`quickReplies.${index}.label`)} />
                    </div>
                  ))}
                  
                  {fields.length < MAX_BUTTONS && (
                    <div className="space-y-2">
                      <Label>New Button <span className="text-muted-foreground">(max 20 chars)</span></Label>
                       <div className="flex items-center gap-2">
                        <Input 
                          value={newButtonText}
                          onChange={(e) => setNewButtonText(e.target.value)}
                          placeholder="Input value"
                        />
                        <Button type="button" onClick={handleCreateButton} className="bg-green-600 hover:bg-green-700 text-white shrink-0">Create</Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Save Answers in a variable</Label>
                  <Input {...register('variableName')} placeholder="@value" />
                </div>

              </div>
            </ScrollArea>
            <DialogFooter className="pt-6">
              <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">Save</Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
