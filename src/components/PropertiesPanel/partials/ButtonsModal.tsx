
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm, useFieldArray, FormProvider, Controller } from 'react-hook-form';
import { nanoid } from 'nanoid';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import dynamic from 'next/dynamic';
import { Trash2 } from 'lucide-react';
import { useFlowStore } from '@/store/flow';

const RichTextEditor = dynamic(() => import('./RichTextEditor'), {
  ssr: false,
  loading: () => <div className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2">Loading editor...</div>,
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
  nodeId: string;
};

const MAX_BUTTONS = 10;

export default function ButtonsModal({ isOpen, onClose, nodeId }: ButtonsModalProps) {
  const { getNode, updateNodeData } = useFlowStore((state) => ({
    getNode: (id: string) => state.nodes.find((n) => n.id === id),
    updateNodeData: state.updateNodeData,
  }));
  
  const node = getNode(nodeId);

  const methods = useForm<FormValues>({
    defaultValues: React.useMemo(() => ({
      content: 'Ask a question here',
      quickReplies: [{ id: nanoid(), label: 'Answer 1' }],
      ...node?.data,
    }), [node?.data]),
  });

  const { control, handleSubmit, register, reset } = methods;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "quickReplies"
  });

  React.useEffect(() => {
    if (isOpen && node) {
      reset({
        content: 'Ask a question here',
        quickReplies: [{ id: nanoid(), label: 'Answer 1' }],
        ...node.data,
      });
    }
  }, [node, isOpen, reset]);

  const onSubmit = (data: FormValues) => {
    updateNodeData(nodeId, data);
    onClose();
  };
  
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Configure Buttons</DialogTitle>
        </DialogHeader>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <ScrollArea className="h-[70vh] pr-4 -mr-4">
              <div className="space-y-6 p-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <Label htmlFor="media-header-switch">Media Header</Label>
                  <Controller name="mediaHeader" control={control} render={({ field }) => <Switch id="media-header-switch" checked={field.value} onCheckedChange={field.onChange} />} />
                </div>

                <div className="space-y-2">
                  <Label>Header Text <span className="text-muted-foreground">(optional, max 60 chars)</span></Label>
                  <Input {...register('headerText')} placeholder="E.g. Choose your destiny" className="max-w-md" />
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
                        placeholder="Ask a question..."
                        variables={['name', 'email', 'order_id']}
                      />
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Footer Text <span className="text-muted-foreground">(optional, max 60 chars)</span></Label>
                  <Input {...register('footerText')} placeholder="E.g. Reply to this message" className="max-w-md" />
                </div>

                <div className="space-y-4 p-4 border rounded-lg">
                  <Label>Buttons</Label>
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                      <Input {...register(`quickReplies.${index}.label`)} placeholder={`Button ${index + 1}`} />
                       <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                       </Button>
                    </div>
                  ))}
                  
                  {fields.length < MAX_BUTTONS && (
                     <Button type="button" variant="outline" size="sm" onClick={() => append({ id: nanoid(), label: '' })}>
                        + Add Button
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Save Answer In Variable</Label>
                  <Input {...register('variableName')} placeholder="@value" className="max-w-sm" />
                </div>

              </div>
            </ScrollArea>
            <DialogFooter className="pt-6">
              <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
