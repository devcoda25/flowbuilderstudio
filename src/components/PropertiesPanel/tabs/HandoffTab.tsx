import React from 'react'
import { useFormContext } from 'react-hook-form'
import styles from '../properties-panel.module.css'

export default function HandoffTab() {
  const { register } = useFormContext()
  return (
    <div className={styles.tabBody}>
      <label className={styles.field}>
        <span className={styles.label}>Queue</span>
        <input {...register('queue')} className={styles.input}/>
      </label>
      <label className={styles.field}>
        <span className={styles.label}>Priority (0–10)</span>
        <input type="number" min={0} max={10} {...register('priority', { valueAsNumber: true })} className={styles.input}/>
      </label>
      <label className={styles.field}>
        <span className={styles.label}>Note</span>
        <textarea {...register('note')} rows={4} className={styles.textarea}/>
      </label>
    </div>
  )
}
