/// <reference lib="webworker" />
import type { LayoutRequest, LayoutResponse } from './protocol'
import { layoutDagre, layoutElkRadial, layoutNaiveGrid } from './algorithms'
import { alignToGrid, translateToPositive } from './utils'

declare const self: DedicatedWorkerGlobalScope
export {}

self.onmessage = async (ev: MessageEvent<LayoutRequest>) => {
  const msg = ev.data
  if (!msg || msg.type !== 'layout') return
  const t0 = performance.now()

  try {
    const { nodes, edges, mode, runId, gridSize, respectLocked = true } = msg

    // Filter movable nodes if requested
    const movable = respectLocked ? nodes.filter((n) => !n.locked) : nodes

    let raw: Record<string, { x: number; y: number }> = {}
    let algo = 'naive'

    if (mode === 'RADIAL') {
      try { raw = await layoutElkRadial(movable, edges); algo = 'elk:radial' }
      catch { raw = layoutNaiveGrid(movable); algo = 'naive' }
    } else {
      try { raw = await layoutDagre(movable, edges, mode); algo = `dagre:${mode}` }
      catch { raw = layoutNaiveGrid(movable); algo = 'naive' }
    }

    // Snap to grid + translate to positive space
    for (const id of Object.keys(raw)) {
      raw[id].x = alignToGrid(raw[id].x, gridSize)
      raw[id].y = alignToGrid(raw[id].y, gridSize)
    }
    raw = translateToPositive(raw)

    // Keep locked nodes unchanged
    if (respectLocked) for (const n of nodes) if (n.locked) delete raw[n.id]

    const t1 = performance.now()
    const ok: LayoutResponse = {
      type: 'layout:done',
      runId,
      positions: raw,
      stats: { algo, durationMs: Math.round(t1 - t0), nodeCount: nodes.length, edgeCount: edges.length }
    }
    self.postMessage(ok)
  } catch (e: any) {
    const err: LayoutResponse = { type: 'layout:error', runId: msg.runId, message: e?.message || String(e) }
    self.postMessage(err)
  }
}
