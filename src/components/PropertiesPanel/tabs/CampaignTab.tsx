import React from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import styles from '../properties-panel.module.css'

export default function CampaignTab() {
  const { register, control } = useFormContext()
  const { fields, append, remove } = useFieldArray({ control, name: 'tags' })

  return (
    <div className={styles.tabBody}>
      <label className={styles.field}>
        <span className={styles.label}>Campaign Name</span>
        <input {...register('name')} className={styles.input}/>
      </label>

      <div className={styles.rowHeader}>
        <h4 className={styles.subhead}>Tags</h4>
        <button className={styles.addBtn} type="button" onClick={() => append('')}>+ Add</button>
      </div>
      <ul className={styles.list}>
        {fields.map((f, i) => (
          <li key={f.id} className={styles.listItemTwo}>
            <input {...register(`tags.${i}` as const)} className={styles.input}/>
            <button className={styles.removeBtn} type="button" onClick={() => remove(i)}>✕</button>
          </li>
        ))}
      </ul>

      <label className={styles.field}>
        <span className={styles.label}>Window (hours)</span>
        <input type="number" {...register('windowHours', { valueAsNumber: true })} className={styles.input}/>
      </label>
    </div>
  )
}
