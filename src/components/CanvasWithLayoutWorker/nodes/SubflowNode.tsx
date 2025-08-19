import React from 'react'
import { Handle, Position } from 'reactflow'
import styles from '../canvas-layout.module.css'
import NodeAvatars from '@/components/Presence/NodeAvatars'

export default function SubflowNode({ id, selected }: { id: string, selected: boolean }) {
  return (
    <div className={styles.subflow} aria-selected={selected}>
      <NodeAvatars nodeId={id} />
      <div className={styles.nodeHeader}>
        <span className={styles.nodeIcon} aria-hidden>🗂️</span>
        <span className={styles.nodeTitle}>Sub‑flow</span>
      </div>
      <div className={styles.nodeBody}>Double‑click to drill‑down</div>
      <Handle type="target" position={Position.Left} className={styles.handle} />
      <Handle type="source" position={Position.Right} className={styles.handle} />
    </div>
  )
}
