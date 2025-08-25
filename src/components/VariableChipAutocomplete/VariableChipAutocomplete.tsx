
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
  const [isOpen, setIsOpen] = useState(false);

  const handleInsert = (v: string) => {
    onInsert(v);
    setIsOpen(false);
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="h-8 px-2" title={label}>
            <span className="font-mono text-base leading-none">{`{{}}`}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-0">
        <div className={styles.root}>
          <div className="p-2 border-b">
            <Input
              className="h-8"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search variables…"
            />
          </div>
          <div className={styles.list}>
            {list.length > 0 ? list.map(v => (
              <button key={v} className={styles.listItem} type="button" onClick={() => handleInsert(v)}>
                {v}
              </button>
            )) : <span className={styles.muted}>No matches</span>}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
