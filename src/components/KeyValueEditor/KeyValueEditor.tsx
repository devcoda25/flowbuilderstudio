import React from 'react';
import styles from './keyValueEditor.module.css';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Trash2 } from 'lucide-react';

export type KV = { key: string; value: string };

export default function KeyValueEditor({
  label, items, onChange, placeholderKey = 'key', placeholderValue = 'value'
}: {
  label?: string;
  items: KV[];
  onChange: (next: KV[]) => void;
  placeholderKey?: string;
  placeholderValue?: string;
}) {
  const update = (idx: number, patch: Partial<KV>) => {
    const next = items.map((r, i) => (i === idx ? { ...r, ...patch } : r));
    onChange(next);
  };
  const add = () => onChange([...(items || []), { key: '', value: '' }]);
  const remove = (idx: number) => onChange(items.filter((_, i) => i !== idx));

  return (
    <div className={styles.root}>
      {label && <div className={styles.label}>{label}</div>}
      <div className={styles.rows}>
        {items.map((r, i) => (
          <div key={i} className={styles.row}>
            <Input
              placeholder={placeholderKey}
              value={r.key}
              onChange={(e) => update(i, { key: e.target.value })}
            />
            <Input
              placeholder={placeholderValue}
              value={r.value}
              onChange={(e) => update(i, { value: e.target.value })}
            />
            <Button variant="ghost" size="icon" onClick={() => remove(i)} aria-label="Remove">
                <Trash2 className="h-4 w-4"/>
            </Button>
          </div>
        ))}
      </div>
      <Button variant="outline" size="sm" onClick={add} type="button" className="mt-2 w-fit">
        + Add
      </Button>
    </div>
  );
}
