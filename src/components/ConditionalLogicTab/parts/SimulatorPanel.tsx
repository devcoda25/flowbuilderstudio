import React, { useMemo, useState } from 'react'
import styles from '../conditional-logic.module.css'
import type { Branch } from '../types'
import { safeEval, defaultHelpers } from '@/components/ExpressionBuilder/evaluator/safeEval'

export default function SimulatorPanel({
  branches,
  initial,
  onMatch
}: {
  branches: Branch[]
  initial?: Record<string, unknown>
  onMatch?: (idx: number | null) => void
}) {
  const [json, setJson] = useState<string>(() => JSON.stringify(initial ?? {}, null, 2))
  const [result, setResult] = useState<string>('')

  const elseIndex = useMemo(() => branches.findIndex(b => b.isElse), [branches])

  function run() {
    try {
      const ctx = json.trim() ? JSON.parse(json) : {}
      const lib = defaultHelpers()
      let matched: number | null = null
      for (let i = 0; i < branches.length; i++) {
        const b = branches[i]
        if (b.disabled) continue
        if (b.isElse) { matched = matched ?? i; break }
        const ok = Boolean(safeEval(b.condition || 'false', ctx, lib as any))
        if (ok) { matched = i; break }
      }
      if (matched == null && elseIndex >= 0 && !branches[elseIndex].disabled) {
        matched = elseIndex;
      }
      setResult(matched == null ? 'No branch matched' : `Matched: #${matched + 1} — ${branches[matched].label || (branches[matched].isElse ? 'ELSE' : '')}`)
      onMatch?.(matched)
    } catch (e: any) {
      setResult(`Error: ${e?.message ?? String(e)}`)
      onMatch?.(null)
    }
  }

  return (
    <div className={styles.simRoot}>
      <textarea
        className={styles.simJson}
        value={json}
        onChange={(e) => setJson(e.target.value)}
        placeholder='{"country":"US","age":21,"message":"refund please"}'
      />
      <div className={styles.simActions}>
        <button className={styles.btn} onClick={run}>Test</button>
        <div className={styles.simResult} aria-live="polite">{result || 'Result will appear here'}</div>
      </div>
    </div>
  )
}
