
import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm, useFieldArray, FormProvider, Controller, useFormContext } from 'react-hook-form';
import { nanoid } from 'nanoid';
import { Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(() => import('./RichTextEditor'), { 
    ssr: false,
    loading: () => <div className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2">Loading editor...</div>,
});


type ListItem = { id: string; title: string; description?: string };
type ListSection = { id: string; title: string; items: ListItem[] };
type ListData = {
  content?: string;
  footerText?: string;
  buttonText?: string;
  variableName?: string;
  sections?: ListSection[];
};

type ListModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { list: ListData }) => void;
  initialData?: { list?: ListData, content?: string };
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

export default function ListModal({ isOpen, onClose, onSave, initialData }: ListModalProps) {
  const methods = useForm<ListData>({
    defaultValues: {
      content: 'Select an option',
      buttonText: 'Menu',
      sections: [defaultSection()],
      variableName: '@value',
    },
  });

  useEffect(() => {
    if (isOpen) {
        const listData = initialData?.list || {};
        const content = initialData?.content || 'Select an option';
        const defaults = {
            content: content,
            buttonText: listData.buttonText || 'Menu',
            sections: listData.sections && listData.sections.length > 0 ? listData.sections : [defaultSection()],
            footerText: listData.footerText || '',
            variableName: listData.variableName || '@value'
        };
        methods.reset(defaults);
    }
  }, [initialData, isOpen, methods]);

  const onSubmit = (data: ListData) => {
    onSave({ list: data });
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
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <ScrollArea className="h-[70vh] pr-6">
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Body Text <span className="text-muted-foreground">(required, max 1024 chars)</span></Label>
                   <Controller
                      name="content"
                      control={methods.control}
                      render={({ field }) => (
                        <RichTextEditor
                          value={field.value || ''}
                          onChange={field.onChange}
                          variables={['name', 'email', 'order_id']}
                        />
                      )}
                    />
                </div>

                <div className="space-y-2">
                  <Label>Footer Text <span className="text-muted-foreground">(optional, max 60 chars)</span></Label>
                  <Input {...methods.register('footerText')} placeholder="e.g. Required" />
                </div>

                <div className="space-y-2">
                  <Label>Button Text <span className="text-muted-foreground">(required, max 20 chars)</span></Label>
                  <Input {...methods.register('buttonText')} placeholder="Menu" />
                </div>
                
                <SectionsArray />

                <div className="space-y-2">
                  <Label>Save Answer In Variable</Label>
                  <Input {...methods.register('variableName')} placeholder="@value" />
                </div>
              </div>
            </ScrollArea>
            <DialogFooter className="pt-4 border-t mt-4">
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
    name: "sections",
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
                <Trash2 className="w-4 h-4"/>
            </Button>
          </div>
          <Input {...control.register(`sections.${index}.title`)} placeholder="Section Title" />
          
          <ItemsArray sectionIndex={index} />
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={() => append(defaultSection())}
      >
        + Add Section
      </Button>
    </div>
  );
}

function ItemsArray({ sectionIndex }: { sectionIndex: number }) {
  const { control, watch } = useFormContext<ListData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `sections.${sectionIndex}.items` as const,
  });

  return (
    <div className="space-y-3 pl-4 border-l-2">
      {fields.map((field, index) => (
        <div key={field.id} className="space-y-2 p-3 bg-background rounded-md shadow-sm">
            <div className="flex justify-between items-center">
                 <Label>Item {index + 1} Title<span className="text-muted-foreground ml-2">(required, max 24 chars)</span></Label>
                 <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    disabled={fields.length <= 1}
                    className="text-destructive hover:text-destructive"
                 >
                    <Trash2 className="w-4 h-4"/>
                </Button>
            </div>
            <Input {...control.register(`sections.${sectionIndex}.items.${index}.title`)} placeholder="Item title" />
            <Label>Description <span className="text-muted-foreground">(optional, max 72 chars)</span></Label>
            <Input {...control.register(`sections.${sectionIndex}.items.${index}.description`)} placeholder="Item description" />
        </div>
      ))}
      <Button variant="secondary" size="sm" type="button" onClick={() => append(defaultItem())}>+ Add Item</Button>
    </div>
  );
}
