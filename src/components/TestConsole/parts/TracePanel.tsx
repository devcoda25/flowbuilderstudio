'use client';
import React, { useMemo, useState } from 'react';
import styles from '../test-console.module.css';
import type { TraceEvent } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function cn(...xs: Array<string | false | null | undefined>) { return xs.filter(Boolean).join(' '); }

export default function TracePanel({
  trace, onClear
}: {
  trace: TraceEvent[];
  onClear: () => void;
}) {
  const [q, setQ] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all-types');

  const types = useMemo(() => {
    const s = new Set(trace.map(t => t.type).filter(Boolean));
    return ['all-types', ...Array.from(s)];
  }, [trace]);

  const filtered = useMemo(() => trace.filter(t => {
    if (typeFilter && typeFilter !== 'all-types' && t.type !== typeFilter) return false;
    if (!q) return true;
    const line = `${t.type} ${t.nodeId ?? ''} ${t.nodeLabel ?? ''} ${t.result ?? ''} ${JSON.stringify(t.data ?? {})}`.toLowerCase();
    return line.includes(q.toLowerCase());
  }), [trace, q, typeFilter]);

  return (
    <div className={styles.traceRoot}>
      <div className={styles.traceToolbar}>
        <Input className="h-8" placeholder="Search trace…" value={q} onChange={(e) => setQ(e.target.value)} />
        <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue placeholder="All types"/></SelectTrigger>
            <SelectContent>
                {types.map(t => <SelectItem key={t} value={t}>{t === 'all-types' ? 'All types' : t}</SelectItem>)}
            </SelectContent>
        </Select>
      </div>

      <div className={styles.traceScroll}>
        {filtered.length === 0 && <div className={styles.muted}>No trace events.</div>}
        {filtered.map((line, idx) => (
          <div key={idx} className={cn(styles.traceLine, line.type === 'error' && styles.traceError)}>
            <span className={styles.traceTs}>{new Date(line.ts).toLocaleTimeString()}</span>
            {line.nodeId && <span className={styles.traceNode}>[{line.nodeId}{line.nodeLabel ? ` • ${line.nodeLabel}` : ''}]</span>}
            <span className={styles.traceType}>{line.type}</span>
            {line.result && <span className={styles.traceMsg}>— {line.result}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
