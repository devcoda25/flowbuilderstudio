export function alignToGrid(n: number, grid: number) {
  return Math.round(n / grid) * grid
}

export function translateToPositive(positions: Record<string, { x: number; y: number }>) {
  let minX = Infinity, minY = Infinity
  for (const p of Object.values(positions)) {
    if (p.x < minX) minX = p.x
    if (p.y < minY) minY = p.y
  }
  if (!isFinite(minX) || !isFinite(minY)) return positions
  const dx = minX < 0 ? -minX : 0
  const dy = minY < 0 ? -minY : 0
  if (dx === 0 && dy === 0) return positions
  const out: typeof positions = {}
  for (const [id, p] of Object.entries(positions)) out[id] = { x: p.x + dx, y: p.y + dy }
  return out
}
