import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useForm, useFieldArray, FormProvider, Controller, useFormContext } from 'react-hook-form';
import styles from '../tabs/LogicTab.module.css';
import panelStyles from '../properties-panel.module.css';
import { Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

type Condition = {
    variable: string;
    operator: string;
    value: string;
};

type ConditionGroup = {
    type: 'and'; // Only AND for now
    conditions: Condition[];
};

type FormValues = {
    groups: ConditionGroup[];
};

type ConditionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: FormValues;
};

const OPERATORS = ['equals', 'does not equal', 'contains', 'does not contain', 'starts with', 'ends with', 'is empty', 'is not empty'];

export default function ConditionModal({
  isOpen,
  onClose,
  onSave,
  initialData
}: ConditionModalProps) {
  const methods = useForm<FormValues>({
    defaultValues: initialData || { groups: [{ type: 'and', conditions: [{ variable: '', operator: 'equals', value: '' }] }] }
  });

  useEffect(() => {
    if (isOpen) {
      methods.reset(initialData || { groups: [{ type: 'and', conditions: [{ variable: '', operator: 'equals', value: '' }] }] });
    }
  }, [initialData, isOpen, methods]);


  const onSubmit = (data: FormValues) => {
    onSave(data);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Set a Condition</DialogTitle>
          <DialogDescription>Define the logic to branch your flow. All conditions in a group must be true (AND). Create multiple groups for OR logic.</DialogDescription>
        </DialogHeader>
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4 py-4">
                {methods.watch('groups')?.map((_, groupIndex) => (
                    <div key={groupIndex} className={`${panelStyles.field} p-4 rounded-lg ${styles.conditionGroup}`}>
                        <ConditionGroupComponent groupIndex={groupIndex} removeGroup={(index) => methods.getValues('groups').length > 1 && methods.setValue('groups', methods.getValues('groups').filter((_, i) => i !== index))} />
                         {methods.getValues('groups').length > 1 && 
                          <Button 
                            type="button" 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => methods.setValue('groups', methods.getValues('groups').filter((_, i) => i !== groupIndex))}
                            className="self-start"
                          >
                            Remove OR Group
                          </Button>
                        }
                    </div>
                ))}

                <Button type="button" variant="outline" onClick={() => methods.setValue('groups', [...methods.getValues('groups'), { type: 'and', conditions: [{ variable: '', operator: 'equals', value: '' }] }])}>
                    Add OR condition group
                </Button>

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

function ConditionGroupComponent({ groupIndex, removeGroup }: { groupIndex: number, removeGroup: (index: number) => void}) {
    const { control, register, getValues, setValue } = useFormContext<FormValues>();
    const conditions = getValues(`groups.${groupIndex}.conditions`) || [];

    const append = () => {
        setValue(`groups.${groupIndex}.conditions`, [...conditions, { variable: '', operator: 'equals', value: '' }]);
    }
    
    const remove = (index: number) => {
        setValue(`groups.${groupIndex}.conditions`, conditions.filter((_, i) => i !== index));
    }


    return (
        <div className="space-y-2">
            {conditions.map((field, index) => (
                <div key={index} className={styles.conditionRow}>
                    <Input {...register(`groups.${groupIndex}.conditions.${index}.variable`)} placeholder="Variable" />
                     <Controller
                        control={control}
                        name={`groups.${groupIndex}.conditions.${index}.operator` as const}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Operator" />
                                </SelectTrigger>
                                <SelectContent>
                                    {OPERATORS.map(item => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    <Input {...register(`groups.${groupIndex}.conditions.${index}.value`)} placeholder="Value" />
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ))}
            <Button type="button" variant="secondary" size="sm" onClick={() => append()}>
                + Add AND condition
            </Button>
        </div>
    )
}
