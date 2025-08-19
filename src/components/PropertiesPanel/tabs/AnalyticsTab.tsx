import React from 'react'
import { useFormContext } from 'react-hook-form'
import styles from '../properties-panel.module.css'

export default function AnalyticsTab() {
  const { register, formState: { errors } } = useFormContext()
  return (
    <div className={styles.tabBody}>
      <label className={styles.field}>
        <span className={styles.label}>Event Name</span>
        <input {...register('eventName')} className={styles.input}/>
      </label>
      <label className={styles.field}>
        <span className={styles.label}>Properties (JSON)</span>
        <textarea {...register('propertiesJson')} rows={6} className={styles.textarea}/>
        {errors.propertiesJson && <span className={styles.err}>{String(errors.propertiesJson.message)}</span>}
      </label>
    </div>
  )
}
