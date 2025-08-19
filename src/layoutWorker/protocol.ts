// Message protocol between main thread and worker

export type LayoutMode = 'TB' | 'LR' | 'RADIAL'

export type NodeIn = {
  id: string
  width?: number
  height?: number
  position?: { x: number; y: number }
  locked?: boolean
}

export type EdgeIn = {
  id?: string
  source: string
  target: string
}

export type LayoutRequest = {
  type: 'layout'
  runId: number
  mode: LayoutMode
  gridSize: number
  nodes: NodeIn[]
  edges: EdgeIn[]
  respectLocked?: boolean
}

export type LayoutResponse =
  | {
      type: 'layout:done'
      runId: number
      positions: Record<string, { x: number; y: number }>
      stats: { algo: string; durationMs: number; nodeCount: number; edgeCount: number }
    }
  | {
      type: 'layout:error'
      runId: number
      message: string
    }
