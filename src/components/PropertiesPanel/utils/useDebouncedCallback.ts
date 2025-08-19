import { useEffect, useRef } from 'react'

export function useDebouncedCallback<T extends (...args: any[]) => void>(fn: T, delay = 400) {
  const fnRef = useRef(fn)
  const t = useRef<number | null>(null)

  useEffect(() => { fnRef.current = fn }, [fn])
  useEffect(() => () => { if (t.current) window.clearTimeout(t.current) }, [])

  return ((...args: Parameters<T>) => {
    if (t.current) window.clearTimeout(t.current)
    t.current = window.setTimeout(() => fnRef.current(...args), delay)
  }) as T
}
