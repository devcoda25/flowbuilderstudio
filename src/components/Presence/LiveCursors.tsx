'use client'
import React, { useCallback, useMemo } from 'react'
import { usePresence, useAwarenessStates } from '@/presence/PresenceProvider'
import styles from './presence.module.css'
import { useStore } from 'reactflow'
import type { AwarenessState } from '@/presence/types'

export default function LiveCursors({ staleMs = 15000 }: { staleMs?: number }) {
  const { self } = usePresence()
  const viewport = useStore((s) => s.viewport)

  const mapFn = useCallback((s: AwarenessState) => (s.user && s.user.id !== self.id ? s : null), [self.id]);
  const others = useAwarenessStates<AwarenessState>(mapFn)

  const fresh = useMemo(() => {
    const now = Date.now()
    return others.filter((s) => !!s.cursor && now - (s.cursor!.ts || 0) <= staleMs)
  }, [others, staleMs])

  if (!viewport) return null;

  return (
    <>
      {fresh.map((s) => {
        if(!s.cursor || !s.user) return null;
        const { x, y } = s.cursor!
        const sx = viewport.x + x * viewport.zoom
        const sy = viewport.y + y * viewport.zoom
        const color = s.user!.color
        return (
          <div key={s.user!.id} className={styles.cursor} style={{ transform: `translate(${sx}px, ${sy}px)` }}>
            <div className={styles.dot} style={{ background: color }} />
            <span className={styles.tag} style={{ background: color, color: '#fff' }}>
              {s.user!.name}
            </span>
          </div>
        )
      })}
    </>
  )
}
