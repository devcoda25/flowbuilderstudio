import type { EdgeIn, NodeIn } from './protocol'

// This file dynamically imports its dependencies, so they are only loaded in the worker if needed.
// You might need to install them: `npm install dagre elkjs`

// Dagre: TB / LR
export async function layoutDagre(
  nodes: NodeIn[],
  edges: EdgeIn[],
  direction: 'TB' | 'LR'
): Promise<Record<string, { x: number; y: number }>> {
  const dagre = await import('dagre')
  const g = new dagre.graphlib.Graph()
  g.setGraph({ rankdir: direction, nodesep: 50, ranksep: 50, acyclicer: 'greedy' })
  g.setDefaultEdgeLabel(() => ({}))

  nodes.forEach((n) => g.setNode(n.id, { width: n.width ?? 180, height: n.height ?? 60 }))
  edges.forEach((e) => g.setEdge(e.source, e.target))

  dagre.layout(g)

  const out: Record<string, { x: number; y: number }> = {}
  nodes.forEach((n) => {
    const pos = g.node(n.id)
    out[n.id] = { x: pos.x, y: pos.y }
  })
  return out
}

// ELK radial
export async function layoutElkRadial(
  nodes: NodeIn[],
  edges: EdgeIn[]
): Promise<Record<string, { x: number; y: number }>> {
  const { default: ELK } = await import('elkjs')
  const elk = new ELK()
  const graph = {
    id: 'root',
    layoutOptions: { 'elk.algorithm': 'radial' },
    children: nodes.map((n) => ({ id: n.id, width: n.width ?? 180, height: n.height ?? 60 })),
    edges: edges.map((e, i) => ({ id: e.id ?? `e${i}`, sources: [e.source], targets: [e.target] }))
  }
  const res = await elk.layout(graph as any)
  const out: Record<string, { x: number; y: number }> = {}
  for (const c of res.children ?? []) out[c.id] = { x: c.x ?? 0, y: c.y ?? 0 }
  return out
}

// Fallback grid (no deps)
export function layoutNaiveGrid(nodes: NodeIn[], cols = 6, gapX = 220, gapY = 120) {
  const out: Record<string, { x: number; y: number }> = {}
  nodes.forEach((n, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    out[n.id] = { x: col * gapX, y: row * gapY }
  })
  return out
}
