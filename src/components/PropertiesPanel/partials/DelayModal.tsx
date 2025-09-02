
'use client';

import React, { useEffect } from 'react';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';

type FormValues = {
  mode: 'delay' | 'datetime';
  delayMinutes?: number;
  runAt?: string;
};

type DelayModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: FormValues) => void;
  initialData?: FormValues;
};

export default function DelayModal({ isOpen, onClose, onSave, initialData }: DelayModalProps) {
  const methods = useForm<FormValues>({
    defaultValues: initialData || { mode: 'delay', delayMinutes: 5 },
  });

  const { control, handleSubmit, watch, reset } = methods;
  const mode = watch('mode');

  useEffect(() => {
    if (isOpen) {
      reset(initialData || { mode: 'delay', delayMinutes: 5 });
    }
  }, [initialData, isOpen, reset]);

  const onSubmit = (data: FormValues) => {
    onSave(data);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configure Delay</DialogTitle>
          <DialogDescription>Pause the flow for a specific duration or until a set date and time.</DialogDescription>
        </DialogHeader>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
            <Controller
              name="mode"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="grid grid-cols-2 gap-4"
                >
                  <div>
                    <RadioGroupItem value="delay" id="delay" className="peer sr-only" />
                    <Label
                      htmlFor="delay"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      Delay
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="datetime" id="datetime" className="peer sr-only" />
                    <Label
                      htmlFor="datetime"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      Specific Time
                    </Label>
                  </div>
                </RadioGroup>
              )}
            />
            {mode === 'delay' ? (
              <div className="space-y-2">
                <Label htmlFor="delayMinutes">Delay in minutes</Label>
                <Controller
                  name="delayMinutes"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="delayMinutes"
                      type="number"
                      placeholder="e.g. 15"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                      value={field.value || ''}
                    />
                  )}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="runAt">Date and Time</Label>
                <Controller
                    name="runAt"
                    control={control}
                    render={({ field }) => (
                         <Input 
                            id="runAt"
                            type="datetime-local" 
                            {...field}
                            value={field.value || ''}
                        />
                    )}
                />
              </div>
            )}
            <DialogFooter>
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
