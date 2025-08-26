
import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
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
    loading: () => <div className="min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2">Loading editor...</div>,
});


type ListItem = { id: string; title: string; description?: string };
type ListSection = { id: string; title: string; items: ListItem[] };
type ListData = {
  content: string;
  footerText?: string;
  buttonText: string;
  variableName?: string;
  sections: ListSection[];
};

type ListModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ListData) => void;
  initialData?: Partial<ListData>;
};

const defaultSection = (): ListSection => ({
  id: nanoid(),
  title: '',
  items: [{ id: nanoid(), title: '', description: '' }],
});

const defaultItem = (): ListItem => ({
  id: nanoid(),
  title: '',
  description: '',
});

export default function ListModal({ isOpen, onClose, onSave, initialData }: ListModalProps) {
  const methods = useForm<ListData>({
    defaultValues: {
      content: 'default body',
      buttonText: 'Menu Here',
      sections: [defaultSection()],
      ...initialData,
    },
  });

  useEffect(() => {
    if (isOpen) {
      methods.reset({
        content: 'default body',
        buttonText: 'Menu Here',
        sections: [defaultSection()],
        ...initialData,
      });
    }
  }, [initialData, isOpen, methods]);

  const onSubmit = (data: ListData) => {
    onSave(data);
    onClose();
  };
  
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Set List</DialogTitle>
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
                          value={field.value}
                          onChange={field.onChange}
                          variables={['name', 'email', 'order_id']}
                        />
                      )}
                    />
                </div>

                <div className="space-y-2">
                  <Label>Footer Text <span className="text-muted-foreground">(optional, max 60 chars)</span></Label>
                  <Input {...methods.register('footerText')} placeholder="Input value" />
                </div>

                <div className="space-y-2">
                  <Label>Button Text <span className="text-muted-foreground">(required, max 20 chars)</span></Label>
                  <Input {...methods.register('buttonText')} placeholder="Menu Here" />
                </div>
                
                <SectionsArray />

                <div className="space-y-2">
                  <Label>Save Answers in a variable</Label>
                  <Input {...methods.register('variableName')} placeholder="@value" />
                </div>
              </div>
            </ScrollArea>
            <DialogFooter className="pt-4">
              <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">Save</Button>
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
    <div className="space-y-4">
      {fields.map((field, index) => (
        <div key={field.id} className="p-4 border rounded-lg bg-muted/50 space-y-4">
          <div className="space-y-2">
            <Label>Section {index + 1} Title <span className="text-muted-foreground">(optional, max 24 chars)</span></Label>
            <Input {...control.register(`sections.${index}.title`)} placeholder="Input value" />
          </div>
          
          <ItemsArray sectionIndex={index} />
          
          <Button
            type="button"
            variant="destructive"
            onClick={() => remove(index)}
            disabled={fields.length <= 1}
          >
            Remove Section
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700"
        onClick={() => append(defaultSection())}
      >
        Add New Section
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

  const watchFieldArray = watch(`sections.${sectionIndex}.items`);
  const controlledFields = fields.map((field, index) => {
    return {
      ...field,
      ...watchFieldArray[index]
    };
  });
  
  const { setValue } = useFormContext();

  return (
    <div className="space-y-2">
      {controlledFields.map((field, index) => (
        <div key={field.id} className="space-y-2">
          <div className="flex justify-between items-center">
            <Label>Row {index + 1} <span className="text-muted-foreground">(required, max 24 chars)</span></Label>
             {!field.description && (
                <Button variant="link" size="sm" className="h-auto p-0" type="button" onClick={() => setValue(`sections.${sectionIndex}.items.${index}.description`, '')}>Add Description</Button>
             )}
          </div>
          <Input {...control.register(`sections.${sectionIndex}.items.${index}.title`)} placeholder="default now" />
           {field.description !== undefined && (
             <div className="flex gap-2">
                <Input {...control.register(`sections.${sectionIndex}.items.${index}.description`)} placeholder="Description (optional, max 72 chars)" />
                <Button variant="ghost" size="icon" type="button" onClick={() => setValue(`sections.${sectionIndex}.items.${index}.description`, undefined)}>
                    <Trash2 className="w-4 h-4"/>
                </Button>
             </div>
           )}
        </div>
      ))}
      <div className="flex items-center gap-4">
        <Button variant="link" type="button" onClick={() => append(defaultItem())}>New Row</Button>
      </div>
    </div>
  );
}
