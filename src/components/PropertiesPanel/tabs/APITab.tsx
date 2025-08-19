import React from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import styles from '../properties-panel.module.css'

export default function APITab() {
  const { register, control, formState: { errors } } = useFormContext()
  const { fields, append, remove } = useFieldArray({ control, name: 'headers' })

  return (
    <div className={styles.tabBody}>
      <div className={styles.row}>
        <label className={styles.fieldNarrow}>
          <span className={styles.label}>Method</span>
          <select {...register('method')} className={styles.select}>
            <option>GET</option><option>POST</option><option>PUT</option><option>PATCH</option><option>DELETE</option>
          </select>
        </label>
        <label className={styles.field}>
          <span className={styles.label}>URL</span>
          <input {...register('url')} className={styles.input}/>
          {errors.url && <span className={styles.err}>{String(errors.url.message)}</span>}
        </label>
      </div>

      <div className={styles.rowHeader}>
        <h4 className={styles.subhead}>Headers</h4>
        <button type="button" className={styles.addBtn} onClick={() => append({ key: '', value: '' })}>+ Add</button>
      </div>
      <ul className={styles.list}>
        {fields.map((f, i) => (
          <li key={f.id} className={styles.listItemTwo}>
            <input {...register(`headers.${i}.key` as const)} placeholder="Key" className={styles.input}/>
            <input {...register(`headers.${i}.value` as const)} placeholder="Value" className={styles.input}/>
            <button type="button" className={styles.removeBtn} onClick={() => remove(i)}>✕</button>
          </li>
        ))}
      </ul>

      <label className={styles.field}>
        <span className={styles.label}>Body (JSON)</span>
        <textarea {...register('body')} rows={6} className={styles.textarea} placeholder='{"foo":"bar"}'/>
        {errors.body && <span className={styles.err}>{String(errors.body.message)}</span>}
      </label>
    </div>
  )
}
