'use client'
import React, { useCallback, useMemo } from 'react'
import styles from './presence.module.css'
import { useAwarenessStates, usePresence } from '@/presence/PresenceProvider'
import type { AwarenessState } from '@/presence/types'
import { initials } from '@/presence/color'

export default function NodeAvatars({ nodeId, max = 3 }: { nodeId: string; max?: number }) {
  const { self } = usePresence()
  
  const mapFn = useCallback((s: AwarenessState) => {
    if (!s.user) return null
    if (s.user.id === self.id) return null
    if (s.selection?.nodeId !== nodeId) return null
    return { id: s.user.id, name: s.user.name, color: s.user.color }
  }, [self.id, nodeId]);

  const users = useAwarenessStates<{ id: string; name: string; color: string }>(mapFn)

  const stack = useMemo(() => users.slice(0, max), [users, max])
  const more = Math.max(0, users.length - stack.length)

  if (users.length === 0) return null
  return (
    <div className={styles.stack}>
      {stack.map((u) => (
        <div key={u.id} className={styles.av} style={{ background: u.color }} title={u.name}>
          {initials(u.name)}
        </div>
      ))}
      {more > 0 && <div className={`${styles.av} ${styles.more}`} title={`${more} more`}>+{more}</div>}
    </div>
  )
}
