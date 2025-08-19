import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
import { nanoid } from 'nanoid';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

type QuickReply = {
  id: string;
  label: string;
};

type FormValues = {
  content: string;
  quickReplies: QuickReply[];
};

type ButtonsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: FormValues) => void;
  initialData?: Partial<FormValues>;
};

const MAX_BUTTONS = 10;

export default function ButtonsModal({
  isOpen,
  onClose,
  onSave,
  initialData
}: ButtonsModalProps) {
  const methods = useForm<FormValues>({
    defaultValues: {
      content: '',
      quickReplies: [{ id: nanoid(), label: 'Button 1' }],
      ...initialData
    }
  });

  const { control, handleSubmit, register, watch } = methods;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "quickReplies"
  });

  const quickReplies = watch('quickReplies');

  useEffect(() => {
    if (isOpen) {
      methods.reset({
        content: '',
        quickReplies: [{ id: nanoid(), label: 'Button 1' }],
        ...initialData,
      });
    }
  }, [initialData, isOpen, methods]);

  const onSubmit = (data: FormValues) => {
    onSave(data);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Edit Buttons</DialogTitle>
              <DialogDescription>
                Configure the question and the buttons for the user to select.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="message-text">Question</Label>
                <Textarea
                  id="message-text"
                  placeholder="Type your question here..."
                  rows={3}
                  {...register('content')}
                />
              </div>

              <div className="grid gap-2">
                <Label>Buttons</Label>
                <ScrollArea className="h-64 pr-4">
                  <div className="space-y-2">
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex items-center gap-2">
                        <Input
                          placeholder={`Button ${index + 1}`}
                          {...register(`quickReplies.${index}.label` as const)}
                        />
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-fit"
                onClick={() => append({ id: nanoid(), label: '' })}
                disabled={quickReplies && quickReplies.length >= MAX_BUTTONS}
              >
                + Add Button
              </Button>
            </div>
            <DialogFooter>
              <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
