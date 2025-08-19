import React from 'react'
import { NodeResizer } from 'reactflow'
import styles from '../canvas-layout.module.css'

export default function GroupBoxNode({ selected }: { selected: boolean }) {
  return (
    <div className={styles.groupBox}>
      <NodeResizer isVisible={selected} minWidth={240} minHeight={120} />
      <div className={styles.groupHeader}>Group</div>
    </div>
  )
}
