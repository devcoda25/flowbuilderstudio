'use client';
import React, { useMemo, useState } from 'react';
import styles from '../test-console.module.css';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export default function ContextEditor({
  initial,
  onApply
}: {
  initial?: Record<string, unknown>;
  onApply: (ctx: Record<string, unknown>) => void;
}) {
  const [text, setText] = useState(() => JSON.stringify(initial ?? {}, null, 2));
  const [err, setErr] = useState<string | null>(null);

  const valid = useMemo(() => {
    try { JSON.parse(text); return true; } catch { return false; }
  }, [text]);

  function apply() {
    try {
      const json = JSON.parse(text);
      onApply(json);
      setErr(null);
    } catch (e: any) {
      setErr(e?.message || 'Invalid JSON');
    }
  }

  return (
    <div className={styles.ctxRoot}>
      <Textarea className={styles.ctxText} value={text} onChange={(e) => setText(e.target.value)} />
      <div className={styles.ctxActions}>
        <Button size="sm" onClick={apply} disabled={!valid}>Apply</Button>
        <span className={err ? styles.warn : styles.muted}>{err ? `Error: ${err}` : 'Context affects evaluation of conditions & variables.'}</span>
      </div>
    </div>
  );
}
