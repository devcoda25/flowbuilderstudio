'use client'
import React, { useCallback } from 'react'
import styles from './presence.module.css'
import { useAwarenessStates } from '@/presence/PresenceProvider'
import type { AwarenessState } from '@/presence/types'

export default function PublishBanner() {
  const mapFn = useCallback((s: AwarenessState) => (s.publishInProgress ? s : null), []);
  const states = useAwarenessStates(mapFn);
  
  if (states.length === 0) return null;

  const names = states.map((s) => s.user?.name).filter(Boolean) as string[]
  const label = names.length === 1 ? `${names[0]} is publishing… 🕒` : `${names[0]} and ${names.length - 1} more are publishing… 🕒`
  return <div className={styles.banner}>{label}</div>
}
