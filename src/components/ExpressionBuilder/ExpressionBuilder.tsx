import React, { useEffect, useMemo, useRef, useState } from 'react';
import styles from './expression-builder.module.css';
import type { ExpressionBuilderProps, VariableSpec, HelperSpec } from './types';
import { SNIPPETS } from './snippets';

import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { autocompletion, CompletionContext } from '@codemirror/autocomplete';

import { safeEval, defaultHelpers } from './evaluator/safeEval';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';

/** join class names without pulling in a dep */
function cn(...xs: Array<string | false | null | undefined>) { return xs.filter(Boolean).join(' ') }

const BASE_HELPERS: HelperSpec[] = [
  { name: 'len',         signature: 'len(text|array)', doc: 'Length of string or array' },
  { name: 'includes',    signature: 'includes(text, part)', doc: 'Substring check' },
  { name: 'startsWith',  signature: 'startsWith(text, part)' },
  { name: 'endsWith',    signature: 'endsWith(text, part)' },
  { name: 'regex',       signature: 'regex(pattern, flags)', doc: 'Build a RegExp' },
  { name: 'inList',      signature: 'inList(x, list)' },
  { name: 'minutesSince',signature: 'minutesSince(isoDate)' },
  { name: 'toLower',     signature: 'toLower(text)' },
  { name: 'toUpper',     signature: 'toUpper(text)' }
]

export default function ExpressionBuilder({
  value,
  onChange,
  variables = [],
  initialTestContext,
  helpers = [],
  height = 160,
  readOnly = false,
  className
}: ExpressionBuilderProps) {
  const allHelpers = useMemo<HelperSpec[]>(() => [...BASE_HELPERS, ...helpers], [helpers]);

  const completions = useMemo(() => {
    return (context: CompletionContext) => {
      let word = context.matchBefore(/\w*/);
      if (word && word.from === word.to && !context.explicit) return null;
      
      const variableOptions = variables.map(v => ({ label: v.name, type: 'variable', detail: v.label, info: v.type }));
      const helperOptions = allHelpers.map(h => ({ label: h.name, type: 'function', detail: h.signature, info: h.doc }));
      const snippetOptions = SNIPPETS.map(s => ({ label: s.label, type: 'snippet', apply: s.apply, detail: 'snippet' }));

      return {
        from: word ? word.from : context.pos,
        options: [...variableOptions, ...helperOptions, ...snippetOptions]
      };
    };
  }, [variables, allHelpers]);

  // ---------- Toolbar state ----------
  const [testOpen, setTestOpen] = useState<boolean>(false);
  const [testJson, setTestJson] = useState<string>(() => JSON.stringify(initialTestContext ?? {}, null, 2));
  const [testResult, setTestResult] = useState<string>('');

  function insert(text: string) {
    onChange(value + text);
  }

  function onInsertVariable(name: string) {
    if (!name) return;
    insert(name);
  }

  function onInsertSnippet(code: string) {
    if (!code) return;
    insert(code);
  }

  function onTest() {
    try {
      const ctx = testJson.trim() ? JSON.parse(testJson) : {};
      const lib = defaultHelpers();
      const result = safeEval(value || 'null', ctx, lib as any);
      setTestResult(String(result));
    } catch (e: any) {
      setTestResult(`Error: ${e?.message || String(e)}`);
    }
  }

  // Cmd/Ctrl+Enter to test
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (mod && e.key.toLowerCase() === 'enter') {
        e.preventDefault();
        setTestOpen(true);
        onTest();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [value, testJson]);

  return (
    <div className={cn(styles.root, className)}>
      <div className={styles.toolbar}>
        <div className={styles.group}>
          <span className={styles.label}>Variable</span>
          <Select onValueChange={onInsertVariable}>
            <SelectTrigger className="w-[180px] h-8 text-xs"><SelectValue placeholder="Insert..." /></SelectTrigger>
            <SelectContent>
              {variables.map(v => <SelectItem key={v.name} value={v.name}>{v.label ? `${v.label} — ` : ''}{v.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className={styles.group}>
          <span className={styles.label}>Snippet</span>
            <Select onValueChange={onInsertSnippet}>
                <SelectTrigger className="w-[180px] h-8 text-xs"><SelectValue placeholder="Choose..." /></SelectTrigger>
                <SelectContent>
                    {SNIPPETS.map(s => <SelectItem key={s.label} value={s.apply}>{s.label}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>

        <div className={styles.group}>
          <Button size="sm" variant="outline" onClick={() => { setTestOpen((o) => !o) }}>{testOpen ? 'Hide Test' : 'Test (⌘/Ctrl+Enter)'}</Button>
        </div>
      </div>

      <div className={styles.editor} style={{ '--editor-height': `${height}px` } as React.CSSProperties}>
        <CodeMirror
          value={value}
          height={`${height}px`}
          extensions={[javascript(), autocompletion({ override: [completions] })]}
          onChange={(val) => onChange(val)}
          theme={oneDark}
          readOnly={readOnly}
        />
      </div>

       <div className={styles.footer}>
        <span className={styles.muted}>Ctrl+Space for suggestions</span>
      </div>

      {testOpen && (
        <div className={styles.testRow}>
          <Textarea
            className={styles.testJson}
            value={testJson}
            onChange={(e) => setTestJson(e.target.value)}
            placeholder='{"country":"US","age":19,"message":"hello"}'
          />
          <div style={{ display: 'grid', gap: 8 }}>
            <Button onClick={onTest}>Run Test</Button>
            <div className={styles.result}>{testResult || 'Result will appear here'}</div>
          </div>
        </div>
      )}
    </div>
  )
}
