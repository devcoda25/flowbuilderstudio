import React, { useMemo, useState } from 'react';
import styles from './variableChip.module.css';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

export default function VariableChipAutocomplete({
  variables = [],
  onInsert,
  label = 'Insert variable'
}: {
  variables: string[];
  onInsert: (name: string) => void;
  label?: string;
}) {
  const [q, setQ] = useState('');
  const list = useMemo(
    () => variables.filter(v => v.toLowerCase().includes(q.toLowerCase())).slice(0, 8),
    [variables, q]
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs">
          {`{{...}}`}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className={styles.root}>
          <label className={styles.label}>{label}</label>
          <Input
            className={styles.input}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search vars…"
          />
          <div className={styles.chips}>
            {list.map(v => (
              <Button key={v} variant="secondary" size="sm" className={styles.chip} type="button" onClick={() => onInsert(v)}>
                {v}
              </Button>
            ))}
             {list.length === 0 && <span className={styles.muted}>No matches</span>}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
