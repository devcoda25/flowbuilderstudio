import React from 'react'
import { useFormContext } from 'react-hook-form'
import styles from '../properties-panel.module.css'

export default function AITab() {
  const { register } = useFormContext()
  return (
    <div className={styles.tabBody}>
      <label className={styles.field}>
        <span className={styles.label}>Model</span>
        <input {...register('model')} placeholder="e.g., gpt-4o-mini or internal-model" className={styles.input}/>
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Temperature</span>
        <input type="number" step="0.1" min={0} max={1} {...register('temperature', { valueAsNumber: true })} className={styles.input}/>
      </label>

      <label className={styles.field}>
        <span className={styles.label}>System Prompt</span>
        <textarea {...register('systemPrompt')} rows={5} className={styles.textarea}/>
      </label>
    </div>
  )
}
