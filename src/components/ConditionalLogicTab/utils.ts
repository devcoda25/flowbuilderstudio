import type { Branch, DelayUnit } from './types'

export function uid() {
  return (crypto?.randomUUID?.() ?? `b_${Date.now()}_${Math.random().toString(16).slice(2)}`)
}

export function toMs(value: number, unit: DelayUnit) {
  switch (unit) {
    case 's': return value * 1000
    case 'm': return value * 60_000
    case 'h': return value * 3_600_000
    case 'd': return value * 86_400_000
  }
}

export function humanDelay(d?: Branch['delay']) {
  if (!d) return '—'
  return `${d.value} ${d.unit}`
}

export function clampIndex(i: number, len: number) {
  return Math.max(0, Math.min(i, len - 1))
}

/** Basic unreachable detection: a prior branch has literal `true`. */
export function unreachableIndices(branches: Branch[]) {
  const out: number[] = []
  let trueSeen = false
  branches.forEach((b, i) => {
    if (trueSeen) out.push(i)
    if (!b.isElse && b.condition.trim() === 'true') trueSeen = true
    if (b.isElse) trueSeen = true
  })
  return out
}

/** Ensure at most one ELSE and it stays last. Returns [normalizedBranches, changed] */
export function normalizeElse(branches: Branch[]): [Branch[], boolean] {
  const elses = branches.filter(b => b.isElse)
  if (elses.length <= 1) {
    if (branches.length && branches[branches.length - 1]?.isElse !== true) return [branches, false]
    return [branches, false]
  }
  // keep the last ELSE, convert previous ones to normal
  let changed = false
  const lastIdx = branches.map((b, i) => [b.isElse, i] as const).filter(([x]) => x).pop()?.[1] ?? -1
  const next = branches.map((b, i) => i !== lastIdx && b.isElse ? { ...b, isElse: false, condition: b.condition || '' } : b)
  changed = true
  return [next, changed]
}
