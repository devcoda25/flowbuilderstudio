import React from 'react'
import styles from '../conditional-logic.module.css'
import type { Branch } from '../types'
import { humanDelay } from '../utils'

function cn(...xs: Array<string | false | undefined>) { return xs.filter(Boolean).join(' ') }

export default function BranchRow({
  branch,
  idx,
  selected,
  onSelect,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onRemove,
  onToggleDisabled
}: {
  branch: Branch
  idx: number
  selected: boolean
  onSelect: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onDuplicate: () => void
  onRemove: () => void
  onToggleDisabled: () => void
}) {
  return (
    <div
      className={cn(styles.row, selected && styles.rowActive, branch.disabled && styles.rowDisabled)}
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => { if (e.key === 'Enter') onSelect() }}
      data-branch-id={branch.id}
      title="Click to edit"
    >
      <div className={styles.rowLeft}>
        <div className={styles.rowTitle}>
          <span className={styles.badge}>{branch.isElse ? 'ELSE' : (idx === 0 ? 'IF' : 'ELSE IF')}</span>
          <span className={styles.rowLabel}>{branch.label || '(unnamed)'}</span>
        </div>
        <div className={styles.rowMeta}>
          {!branch.isElse && <span className={styles.metaItem} title={branch.condition}>{branch.condition || '—'}</span>}
          <span className={styles.metaItem}>Delay: {humanDelay(branch.delay)}</span>
          {branch.target && <span className={styles.metaItem}>→ {branch.target}</span>}
        </div>
      </div>

      <div className={styles.rowActions}>
        <button className={styles.mini} onClick={(e) => { e.stopPropagation(); onMoveUp() }} title="Move up" aria-label="Move up">↑</button>
        <button className={styles.mini} onClick={(e) => { e.stopPropagation(); onMoveDown() }} title="Move down" aria-label="Move down">↓</button>
        <button className={styles.mini} onClick={(e) => { e.stopPropagation(); onDuplicate() }} title="Duplicate" aria-label="Duplicate">⎘</button>
        <button className={styles.mini} onClick={(e) => { e.stopPropagation(); onToggleDisabled() }} title={branch.disabled ? 'Enable' : 'Disable'} aria-label="Toggle">
          {branch.disabled ? 'Enable' : 'Disable'}
        </button>
        <button className={styles.removeBtn} onClick={(e) => { e.stopPropagation(); onRemove() }} title="Remove" aria-label="Remove">✕</button>
      </div>
    </div>
  )
}
