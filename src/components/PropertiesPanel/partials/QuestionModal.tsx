
import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm, FormProvider, Controller, useFieldArray } from 'react-hook-form';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import dynamic from 'next/dynamic';
import { Trash2 } from 'lucide-react';
import { nanoid } from 'nanoid';

const RichTextEditor = dynamic(() => import('./RichTextEditor'), { 
    ssr: false,
    loading: () => <div className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2">Loading editor...</div>,
});


type FormValues = {
  content: string;
  answerVariants: { value: string }[];
  acceptMedia: boolean;
  variableName: string;
  advancedOptions: boolean;
};

type QuestionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<FormValues>) => void;
  initialData?: Partial<FormValues>;
};

export default function QuestionModal({ isOpen, onClose, onSave, initialData }: QuestionModalProps) {
  const methods = useForm<FormValues>({
    defaultValues: {
      content: 'Ask a question here',
      answerVariants: [],
      acceptMedia: false,
      variableName: '@value',
      advancedOptions: false,
    },
  });

  const { control, handleSubmit, register, watch } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "answerVariants"
  });

  useEffect(() => {
    if (isOpen) {
      methods.reset({
        content: 'Ask a question here',
        answerVariants: [],
        acceptMedia: false,
        variableName: '@value',
        advancedOptions: false,
        ...initialData,
      });
    }
  }, [initialData, isOpen, methods]);

  const onSubmit = (data: FormValues) => {
    onSave(data);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Ask a Question</span>
          </DialogTitle>
           <DialogDescription>Ask an open-ended question and save the user's reply.</DialogDescription>
        </DialogHeader>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <ScrollArea className="h-[70vh] pr-4 -mr-4">
              <div className="space-y-6 py-4">
                
                <div className="space-y-2">
                  <Label>Question Text</Label>
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

                <div className="space-y-3 p-4 border rounded-lg">
                    <Label>Answer Variants (optional)</Label>
                    <p className="text-xs text-muted-foreground">Add expected variations of an answer, like "Hi" or "Hello".</p>
                     {fields.map((field, index) => (
                        <div key={field.id} className="flex items-center gap-2">
                           <Controller
                                name={`answerVariants.${index}.value` as const}
                                control={control}
                                render={({ field }) => <Input {...field} placeholder="e.g. Yes" />}
                            />
                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                <Trash2 className="w-4 h-4 text-destructive"/>
                            </Button>
                        </div>
                     ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => append({ value: '' })}>+ Add Variant</Button>
                </div>

                <Separator />
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                    <Label htmlFor="accept-media-switch">Accept a media response</Label>
                    <Controller name="acceptMedia" control={control} render={({ field }) => <Switch id="accept-media-switch" checked={field.value} onCheckedChange={field.onChange} />} />
                </div>
                
                <Separator />

                <div className="space-y-2">
                  <Label>Save Answer In Variable</Label>
                  <Input {...register('variableName')} placeholder="@value" />
                </div>
                
                <Separator />

                <div className="flex items-center justify-between p-4 border rounded-lg">
                    <Label htmlFor="advanced-switch">Advanced options</Label>
                    <Controller name="advancedOptions" control={control} render={({ field }) => <Switch id="advanced-switch" checked={field.value} onCheckedChange={field.onChange} />} />
                </div>

              </div>
            </ScrollArea>
            <DialogFooter className="pt-6 border-t mt-6">
              <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
