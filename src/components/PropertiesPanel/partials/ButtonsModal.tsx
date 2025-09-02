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
import type { ContentPart } from '@/components/CanvasWithLayoutWorker/nodes/BaseNode';
import { MediaPart } from '@/types/MediaPart';

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
  parts?: ContentPart[];
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
    defaultValues: React.useMemo(
      () => {
        const data = node?.data || {};
        return {
          content: data.content || 'Ask a question here',
          quickReplies: data.quickReplies && data.quickReplies.length > 0 ? data.quickReplies : [{ id: nanoid(), label: 'Answer 1' }],
          parts: data.parts || [],
          headerText: data.headerText || '',
          footerText: data.footerText || '',
          variableName: data.variableName || '@value',
          mediaHeader: data.mediaHeader || false,
        };
      },
      [node?.data]
    ),
  });

  const { control, handleSubmit, register, reset, setValue, getValues } = methods;
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'quickReplies',
  });

  const modalRef = React.useRef<HTMLDivElement | null>(null);

  const handleAddMedia = (type: 'image' | 'video' | 'audio' | 'document', media?: MediaPart) => {
    if (!media) return; // Modal opened, but no media saved yet
    const currentParts = getValues('parts') || [];
    setValue('parts', [...currentParts, { id: nanoid(), type, url: media.url, name: media.name }]);
  };

  React.useEffect(() => {
    if (isOpen && node) {
       const data = node.data || {};
       reset({
        content: data.content || 'Ask a question here',
        quickReplies: data.quickReplies && data.quickReplies.length > 0 ? data.quickReplies : [{ id: nanoid(), label: 'Answer 1' }],
        parts: data.parts || [],
        headerText: data.headerText || '',
        footerText: data.footerText || '',
        variableName: data.variableName || '@value',
        mediaHeader: data.mediaHeader || false,
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
      <DialogContent className="max-w-2xl" ref={modalRef}>
        <DialogHeader>
          <DialogTitle>Configure Buttons</DialogTitle>
        </DialogHeader>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <ScrollArea className="h-[70vh] pr-4 -mr-4">
              <div className="space-y-6 p-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <Label htmlFor="media-header-switch">Media Header</Label>
                  <Controller
                    name="mediaHeader"
                    control={control}
                    render={({ field }) => <Switch id="media-header-switch" checked={field.value} onCheckedChange={field.onChange} />}
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    Header Text <span className="text-muted-foreground">(optional, max 60 chars)</span>
                  </Label>
                  <Input {...register('headerText')} placeholder="E.g. Choose your destiny" className="max-w-md" />
                </div>

                <div className="space-y-2">
                  <Label>
                    Body Text <span className="text-muted-foreground">(required, max 1024 chars)</span>
                  </Label>
                  <Controller
                    name="content"
                    control={control}
                    render={({ field }) => (
                      <RichTextEditor
                        value={field.value}
                        onChange={field.onChange}
                        placeholder=""
                        variables={['name', 'email', 'order_id']}
                        modalRef={modalRef}
                        onAddMedia={handleAddMedia}
                      />
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    Footer Text <span className="text-muted-foreground">(optional, max 60 chars)</span>
                  </Label>
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
              <Button variant="ghost" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
