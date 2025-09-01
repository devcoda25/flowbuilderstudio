'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm, useFieldArray, FormProvider, Controller, useFormContext } from 'react-hook-form';
import { nanoid } from 'nanoid';
import { Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import dynamic from 'next/dynamic';
import { useFlowStore } from '@/store/flow';
import type { ContentPart } from '@/components/CanvasWithLayoutWorker/nodes/BaseNode';
import { MediaPart } from '@/types/MediaPart';

const RichTextEditor = dynamic(() => import('./RichTextEditor'), {
  ssr: false,
  loading: () => <div className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2">Loading editor...</div>,
});

type ListItem = { id: string; title: string; description?: string };
type ListSection = { id: string; title: string; items: ListItem[] };
export type ListData = {
  content?: string;
  footerText?: string;
  buttonText?: string;
  variableName?: string;
  sections?: ListSection[];
  parts?: ContentPart[];
};

type ListModalProps = {
  isOpen: boolean;
  onClose: () => void;
  nodeId: string;
};

const defaultSection = (): ListSection => ({
  id: nanoid(),
  title: 'Section 1',
  items: [{ id: nanoid(), title: 'List item 1', description: 'Item description' }],
});

const defaultItem = (): ListItem => ({
  id: nanoid(),
  title: '',
  description: '',
});

export default function ListModal({ isOpen, onClose, nodeId }: ListModalProps) {
  const { getNode, updateNodeData } = useFlowStore((state) => ({
    getNode: (id: string) => state.nodes.find((n) => n.id === id),
    updateNodeData: state.updateNodeData,
  }));

  const node = getNode(nodeId);

  const methods = useForm<ListData>({
    defaultValues: React.useMemo(() => {
      const listData = node?.data.list || {};
      const content = node?.data.content || 'Select an option';
      return {
        content,
        buttonText: listData.buttonText || 'Menu',
        sections: listData.sections && listData.sections.length > 0 ? listData.sections : [defaultSection()],
        footerText: listData.footerText || '',
        variableName: listData.variableName || '@value',
        parts: node?.data.parts || [],
      };
    }, [node?.data]),
  });

  const { reset, control, handleSubmit, register, setValue, getValues } = methods;

  const handleAddMedia = (type: 'image' | 'video' | 'audio' | 'document', media?: MediaPart) => {
    if (!media) return; // Modal opened, but no media saved yet
    const currentParts = getValues('parts') || [];
    setValue('parts', [...currentParts, { id: nanoid(), type, url: media.url, name: media.name }]);
  };

  const handleDeleteAttachment = (id: string) => {
    const currentParts = getValues('parts') || [];
    setValue('parts', currentParts.filter((part) => part.id !== id));
  };

  React.useEffect(() => {
    if (isOpen && node) {
      const listData = node.data.list || {};
      const content = node.data.content || 'Select an option';
      reset({
        content,
        buttonText: listData.buttonText || 'Menu',
        sections: listData.sections && listData.sections.length > 0 ? listData.sections : [defaultSection()],
        footerText: listData.footerText || '',
        variableName: listData.variableName || '@value',
        parts: node.data.parts || [],
      });
    }
  }, [node, isOpen, reset]);

  const onSubmit = (data: ListData) => {
    updateNodeData(nodeId, { list: data, content: data.content, parts: data.parts });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Configure List Message</DialogTitle>
          <DialogDescription>Create a list of options for the user to choose from.</DialogDescription>
        </DialogHeader>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <ScrollArea className="h-[70vh] pr-6">
              <div className="space-y-6 p-4">
                <div className="space-y-2">
                  <Label>Body Text <span className="text-muted-foreground">(required, max 1024 chars)</span></Label>
                  <Controller
                    name="content"
                    control={control}
                    render={({ field }) => (
                      <RichTextEditor
                        value={field.value || ''}
                        onChange={field.onChange}
                        variables={['name', 'email', 'order_id']}
                        onAddMedia={handleAddMedia}
                        attachments={getValues('parts') as MediaPart[]}
                        onDeleteAttachment={handleDeleteAttachment}
                      />
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Footer Text <span className="text-muted-foreground">(optional, max 60 chars)</span></Label>
                  <Input {...register('footerText')} placeholder="e.g. Required" className="max-w-md" />
                </div>

                <div className="space-y-2">
                  <Label>Button Text <span className="text-muted-foreground">(required, max 20 chars)</span></Label>
                  <Input {...register('buttonText')} placeholder="Menu" className="max-w-xs" />
                </div>

                <SectionsArray />

                <div className="space-y-2">
                  <Label>Save Answer In Variable</Label>
                  <Input {...register('variableName')} placeholder="@value" className="max-w-sm" />
                </div>
              </div>
            </ScrollArea>
            <DialogFooter className="pt-6 border-t mt-4">
              <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

function SectionsArray() {
  const { control } = useFormContext<ListData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'sections',
  });

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <Label>Sections</Label>
      {fields.map((field, index) => (
        <div key={field.id} className="p-4 border rounded-lg bg-muted/50 space-y-4">
          <div className="flex items-center justify-between">
            <Label>Section {index + 1} Title <span className="text-muted-foreground">(optional, max 24 chars)</span></Label>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(index)}
              disabled={fields.length <= 1}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          <Input {...control.register(`sections.${index}.title`)} placeholder="Section Title" />

          <ItemsArray sectionIndex={index} />
        </div>
      ))}
      <Button type="button" variant="outline" onClick={() => append(defaultSection())}>
        + Add Section
      </Button>
    </div>
  );
}

function ItemsArray({ sectionIndex }: { sectionIndex: number }) {
  const { control } = useFormContext<ListData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `sections.${sectionIndex}.items` as const,
  });

  return (
    <div className="space-y-3 pl-4 border-l-2">
      {fields.map((field, index) => (
        <div key={field.id} className="space-y-3 p-4 bg-background rounded-md shadow-sm border">
          <div className="flex justify-between items-center">
            <Label>Item {index + 1} Title <span className="text-muted-foreground ml-2">(required, max 24 chars)</span></Label>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(index)}
              disabled={fields.length <= 1}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          <Input {...control.register(`sections.${sectionIndex}.items.${index}.title`)} placeholder="Item title" />
          <div className="space-y-2">
            <Label>Description <span className="text-muted-foreground">(optional, max 72 chars)</span></Label>
            <Input {...control.register(`sections.${sectionIndex}.items.${index}.description`)} placeholder="Item description" />
          </div>
        </div>
      ))}
      <Button variant="secondary" size="sm" type="button" onClick={() => append(defaultItem())}>+ Add Item</Button>
    </div>
  );
}