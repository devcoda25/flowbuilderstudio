export type UserIdentity = {
  id: string
  name: string
  color: string
  avatarUrl?: string
}

export type CursorState = { x: number; y: number; ts: number } // world coords (ReactFlow space)
export type SelectionState = { nodeId?: string; ts: number }
export type EditingState = { path?: string | null; ts: number }

export type AwarenessExtras = {
  publishInProgress?: boolean
}

export type AwarenessState = {
  user?: UserIdentity
  cursor?: CursorState
  selection?: SelectionState
  editing?: EditingState
} & AwarenessExtras
