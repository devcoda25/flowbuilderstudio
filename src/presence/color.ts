export function hashHsl(seed: string) {
  // Simple string hash -> hue
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  const hue = h % 360
  return `hsl(${hue}, 70%, 55%)`
}

export function initials(name: string) {
  return name.split(/\s+/).map(n => n[0]?.toUpperCase() ?? '').slice(0, 2).join('')
}
