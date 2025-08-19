import React from 'react'
import { useFormContext } from 'react-hook-form'
import styles from '../properties-panel.module.css'

export default function SubflowTab() {
  const { register } = useFormContext()
  return (
    <div className={styles.tabBody}>
      <label className={styles.field}>
        <span className={styles.label}>Target Sub‑flow ID</span>
        <input {...register('targetFlowId')} className={styles.input}/>
      </label>

      <details className={styles.details}>
        <summary>Variable Mapping</summary>
        <p className={styles.muted}>Map variables to pass into the sub‑flow (coming soon).</p>
      </details>
    </div>
  )
}
