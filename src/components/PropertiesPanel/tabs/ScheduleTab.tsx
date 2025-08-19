import React from 'react'
import { useFormContext } from 'react-hook-form'
import styles from '../properties-panel.module.css'

export default function ScheduleTab() {
  const { register, watch, formState: { errors } } = useFormContext()
  const mode = watch('mode') ?? 'delay'

  return (
    <div className={styles.tabBody}>
      <div className={styles.row}>
        <label className={styles.fieldNarrow}>
          <span className={styles.label}>Mode</span>
          <select {...register('mode')} className={styles.select}>
            <option value="delay">Delay</option>
            <option value="datetime">Date & Time</option>
          </select>
        </label>
        {mode === 'delay' ? (
          <label className={styles.field}>
            <span className={styles.label}>Delay (minutes)</span>
            <input type="number" {...register('delayMinutes', { valueAsNumber: true })} className={styles.input}/>
          </label>
        ) : (
          <label className={styles.field}>
            <span className={styles.label}>Run at (ISO)</span>
            <input type="datetime-local" {...register('runAt')} className={styles.input}/>
          </label>
        )}
      </div>
      {errors.root && <span className={styles.err}>{String(errors.root.message)}</span>}
    </div>
  )
}
