import React, { useEffect, useMemo, useState } from 'react'
import styles from './conditional-logic.module.css'
import type { ConditionalLogicTabProps, Branch, DelayUnit, LogicValue } from './types'
import { logicSchema } from './schema'
import { clampIndex, normalizeElse, uid } from './utils'
import BranchRow from './parts/BranchRow'
import SimulatorPanel from './parts/SimulatorPanel'
import ExpressionBuilder from '@/components/ExpressionBuilder'

function cn(...xs: Array<string | false | null | undefined>) { return xs.filter(Boolean).join(' ') }

const DEFAULT_BRANCH = (): Branch => ({
  id: uid(),
  label: 'Branch',
  condition: "country === 'US'",
  delay: { value: 0, unit: 'm' },
  target: '',
  isElse: false,
  disabled: false
})
const DEFAULT_ELSE = (): Branch => ({
  id: uid(),
  label: 'Otherwise',
  condition: 'true',
  delay: { value: 0, unit: 'm' },
  isElse: true,
  target: '',
  disabled: false
})

export default function ConditionalLogicTab({
  value,
  onChange,
  variables = [],
  branchTargets = [],
  initialTestContext,
  className
}: ConditionalLogicTabProps) {
  const logic: LogicValue = useMemo(() => {
    const b = Array.isArray(value.branches) ? value.branches as Branch[] : []
    return { expression: value.expression ?? '', branches: b.length ? b : [DEFAULT_BRANCH(), DEFAULT_ELSE()] }
  }, [value])

  const [branches, setBranches] = useState<Branch[]>(logic.branches)
  const [selectedId, setSelectedId] = useState<string | undefined>(logic.branches[0]?.id)

  // normalize ELSE usage
  useEffect(() => {
    const [norm, changed] = normalizeElse(branches)
    if (changed) setBranches(norm)
  }, [branches])

  // bubble up changes
  useEffect(() => {
    onChange({ ...value, branches })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branches])

  // ----- derived -----
  const selectedIdx = useMemo(() => branches.findIndex(b => b.id === selectedId), [branches, selectedId])
  const selected = selectedIdx > -1 ? branches[selectedIdx] : undefined;

  // ----- actions -----
  function addBranch(kind: 'if' | 'else') {
    setBranches((prev) => {
      const next = [...prev];
      if (kind === 'else') {
        // ensure a single ELSE at the end
        const hasElse = next.some(b => b.isElse);
        if (!hasElse) {
          next.push(DEFAULT_ELSE());
        }
      } else {
        const insertAt = Math.max(0, next.length - (next[next.length - 1]?.isElse ? 1 : 0));
        next.splice(insertAt, 0, DEFAULT_BRANCH());
      }
      return next;
    });
  }

  function updateBranch(idx: number, patch: Partial<Branch>) {
    setBranches((prev) => prev.map((b, i) => i === idx ? { ...b, ...patch } : b))
  }

  function moveBranch(idx: number, dir: -1 | 1) {
    setBranches((prev) => {
      const to = clampIndex(idx + dir, prev.length)
      if (to === idx) return prev
      // keep ELSE as last
      if (prev[idx].isElse) return prev
      if (prev[to]?.isElse && dir === 1) return prev
      const arr = [...prev]
      const [m] = arr.splice(idx, 1)
      arr.splice(to, 0, m)
      return arr
    })
  }

  function removeBranch(idx: number) {
    setBranches((prev) => {
      const arr = prev.filter((_, i) => i !== idx)
      if (arr.length === 0) arr.push(DEFAULT_BRANCH())
      if (!arr.some(b => b.isElse)) arr.push(DEFAULT_ELSE())
      return arr
    })
  }

  function duplicateBranch(idx: number) {
    setBranches((prev) => {
      const src = prev[idx]
      const dup: Branch = { ...src, id: uid(), label: `${src.label} (copy)` }
      const arr = [...prev]; arr.splice(idx + 1, 0, dup); return arr
    })
  }

  // ----- problems summary -----
  const problems = useMemo(() => {
    const issues: string[] = []
    // schema checks
    const parsed = logicSchema.safeParse({ expression: value.expression ?? '', branches })
    if (!parsed.success) {
      for (const err of parsed.error.issues) {
        issues.push(`${err.path.join('.')} — ${err.message}`)
      }
    }
    // single ELSE rule
    const elseCount = branches.filter(b => b.isElse).length
    if (elseCount === 0) issues.push('Add a fallback ELSE branch.')
    if (elseCount > 1) issues.push('Only one ELSE branch is allowed.')

    // unreachable checks (naïve)
    let trueSeen = false
    branches.forEach((b, i) => {
      if (trueSeen && !b.isElse) issues.push(`Branch #${i + 1} (${b.label}) may be unreachable due to a prior always-true condition.`)
      if (b.isElse || b.condition.trim() === 'true') trueSeen = true
      if (!b.isElse && !b.condition.trim()) issues.push(`Branch #${i + 1} is missing a condition.`)
    })

    // duplicate labels
    const labelSet = new Set<string>()
    for (const b of branches) {
      if (labelSet.has(b.label)) { issues.push(`Duplicate branch label: "${b.label}".`); break }
      labelSet.add(b.label)
    }
    return issues
  }, [branches, value.expression])

  // ----- UI -----
  return (
    <div className={cn(styles.root, className)}>
      {/* Left: branches list */}
      <section className={styles.left}>
        <div className={styles.leftHeader}>
          <h3 className={styles.title}>Branches</h3>
          <div className={styles.headerActions}>
            <button className={styles.btn} onClick={() => addBranch('if')}>+ Add ELSE IF</button>
            <button className={styles.btn} onClick={() => addBranch('else')}>+ Add ELSE</button>
          </div>
        </div>

        <div className={styles.list}>
          {branches.map((b, i) => (
            <BranchRow
              key={b.id}
              branch={b}
              idx={i}
              selected={selectedId === b.id}
              onSelect={() => setSelectedId(b.id)}
              onMoveUp={() => moveBranch(i, -1)}
              onMoveDown={() => moveBranch(i, +1)}
              onDuplicate={() => duplicateBranch(i)}
              onRemove={() => removeBranch(i)}
              onToggleDisabled={() => updateBranch(i, { disabled: !b.disabled })}
            />
          ))}
        </div>

        {/* Problems summary */}
        <div className={styles.footer}>
          {problems.length === 0 ? (
            <span className={styles.ok}>All good ✓</span>
          ) : (
            <ul className={styles.problems} aria-live="polite">
              {problems.map((p, i) => <li key={i} className={styles.problemItem}>⚠ {p}</li>)}
            </ul>
          )}
        </div>
      </section>

      {/* Right: selected editor & simulator */}
      <section className={styles.right}>
        {!selected ? (
          <div className={styles.empty}>Select a branch to edit.</div>
        ) : (
          <>
            <div className={styles.card}>
              <div className={styles.row}>
                <label className={styles.field}>
                  <span className={styles.label}>Label</span>
                  <input
                    className={styles.input}
                    value={selected.label}
                    onChange={(e) => updateBranch(selectedIdx, { label: e.target.value })}
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Delay before next</span>
                  <div className={styles.inline}>
                    <input
                      type="number"
                      min={0}
                      className={styles.input}
                      value={selected.delay?.value ?? 0}
                      onChange={(e) => updateBranch(selectedIdx, { delay: { value: Number(e.target.value), unit: selected.delay?.unit ?? 'm' } })}
                    />
                    <select
                      className={styles.select}
                      value={selected.delay?.unit ?? 'm'}
                      onChange={(e) => updateBranch(selectedIdx, { delay: { value: selected.delay?.value ?? 0, unit: e.target.value as DelayUnit } })}
                    >
                      <option value="s">sec</option>
                      <option value="m">min</option>
                      <option value="h">hr</option>
                      <option value="d">day</option>
                    </select>
                  </div>
                </label>

                {branchTargets.length > 0 && (
                  <label className={styles.field}>
                    <span className={styles.label}>Route to</span>
                    <select
                      className={styles.select}
                      value={selected.target ?? ''}
                      onChange={(e) => updateBranch(selectedIdx, { target: e.target.value || undefined })}
                    >
                      <option value="">— default —</option>
                      {branchTargets.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
                    </select>
                  </label>
                )}
              </div>

              {!selected.isElse && (
                <>
                  <h4 className={styles.subhead}>Condition</h4>
                  <ExpressionBuilder
                    value={selected.condition}
                    onChange={(next) => updateBranch(selectedIdx, { condition: next })}
                    variables={variables}
                    initialTestContext={initialTestContext}
                    height={140}
                  />
                </>
              )}
              {selected.isElse && (
                <div className={styles.muted}>ELSE branch catches any unmatched case. No condition needed.</div>
              )}
            </div>

            <div className={styles.card}>
              <h4 className={styles.subhead}>Simulator</h4>
              <SimulatorPanel
                branches={branches}
                initial={initialTestContext}
                onMatch={(i) => { if (i != null && branches[i]) setSelectedId(branches[i].id) }}
              />
            </div>
          </>
        )}
      </section>
    </div>
  )
}
