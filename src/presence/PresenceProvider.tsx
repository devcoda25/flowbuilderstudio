'use client'

import React, { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { hashHsl } from './color'
import type { AwarenessState, UserIdentity } from './types'

type Ctx = {
  ydoc: Y.Doc
  provider: WebsocketProvider | null
  awareness: WebsocketProvider['awareness'] | null
  self: UserIdentity
  updateSelf: (patch: Partial<UserIdentity>) => void
}

const PresenceContext = createContext<Ctx | null>(null)

export function PresenceProvider({
  children,
  roomId = 'flow-room',
  serverUrl = process.env.NEXT_PUBLIC_YJS_WS_URL || 'wss://y-webrtc-signaling-eu.herokuapp.com',
  identity,
}: {
  children: React.ReactNode
  roomId?: string
  serverUrl?: string
  identity?: Partial<UserIdentity>
}) {
  const self = useMemo<UserIdentity>(() => {
    const id = (identity?.id) || (typeof window !== 'undefined' ? crypto.randomUUID().slice(0, 6) : 'server-user')
    const name = identity?.name || `User-${id}`
    const color = identity?.color || hashHsl(id + name)
    return { id, name, color, avatarUrl: identity?.avatarUrl }
  }, [identity])

  const ydoc = useMemo(() => new Y.Doc(), [])
  const provider = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return new WebsocketProvider(serverUrl, roomId, ydoc, { connect: true })
  }, [serverUrl, roomId, ydoc])
  
  const awareness = provider?.awareness ?? null;

  useEffect(() => {
    if (!awareness) return;
    const current = awareness.getLocalState() as AwarenessState | null
    awareness.setLocalState({ ...(current || {}), user: self })

    const clear = () => {
      const st = (awareness.getLocalState() as AwarenessState) || {}
      awareness.setLocalState({ ...st, cursor: undefined, selection: undefined, editing: undefined, publishInProgress: false })
    }
    window.addEventListener('beforeunload', clear)
    return () => {
      clear()
      provider?.destroy()
      window.removeEventListener('beforeunload', clear)
    }
  }, [awareness, provider, self])

  const updateSelf = (patch: Partial<UserIdentity>) => {
    if (!awareness) return;
    const st = (awareness.getLocalState() as AwarenessState) || {}
    const next = { ...(st.user || self), ...patch }
    awareness.setLocalState({ ...st, user: next })
  }

  return (
    <PresenceContext.Provider value={{ ydoc, provider, awareness, self, updateSelf }}>
      {children}
    </PresenceContext.Provider>
  )
}

export function usePresence() {
  const ctx = useContext(PresenceContext)
  if (!ctx) throw new Error('PresenceProvider missing')
  return ctx
}

export function useAwarenessStates<T = AwarenessState>(mapFn?: (s: AwarenessState) => T | null): T[] {
  const { awareness } = usePresence()
  const [states, setStates] = useState<T[]>([])
  
  const stableMapFn = useCallback(mapFn || ((s: AwarenessState) => s as unknown as T), []);

  useEffect(() => {
    if (!awareness) return;
    const pull = () => {
      const arr = [...awareness.getStates().values()] as AwarenessState[]
      const mapped = stableMapFn ? arr.map(stableMapFn).filter(Boolean) as T[] : (arr as unknown as T[])
      setStates(mapped)
    }
    pull()
    awareness.on('change', pull)
    return () => awareness.off('change', pull)
  }, [awareness, stableMapFn])

  return states
}
