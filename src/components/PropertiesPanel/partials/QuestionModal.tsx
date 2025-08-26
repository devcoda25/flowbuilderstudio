
import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(() => import('./RichTextEditor'), { 
    ssr: false,
    loading: () => <div className="min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2">Loading editor...</div>,
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
      ...initialData,
    },
  });

  const { control, handleSubmit, register, watch } = methods;

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
            <span>Set a question</span>
            <a href="#" className="text-sm font-normal text-primary hover:underline">How to use</a>
          </DialogTitle>
        </DialogHeader>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <ScrollArea className="h-[70vh] pr-4 -mr-4">
              <div className="space-y-6 py-4">
                
                <div className="space-y-2">
                  <Label>Question text</Label>
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
                    <Label>Add answer variant</Label>
                    <div className="flex items-center gap-2">
                        <Input placeholder="Hi!" />
                        <Button type="button" className="bg-green-600 hover:bg-green-700 text-white shrink-0">Create</Button>
                    </div>
                </div>

                <Separator />
                
                <div className="flex items-center justify-between">
                    <Label>Accept a media response</Label>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Off</span>
                        <Controller name="acceptMedia" control={control} render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />
                        <span className="text-sm text-muted-foreground">On</span>
                    </div>
                </div>
                
                <Separator />

                <div className="space-y-2">
                  <Label>Save Answers in a variable</Label>
                  <Input {...register('variableName')} placeholder="@value" />
                </div>
                
                <Separator />

                <div className="flex items-center justify-between">
                    <Label>Advanced options</Label>
                     <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Off</span>
                        <Controller name="advancedOptions" control={control} render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />
                        <span className="text-sm text-muted-foreground">On</span>
                    </div>
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
