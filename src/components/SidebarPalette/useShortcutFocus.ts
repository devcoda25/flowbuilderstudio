import { RefObject, useEffect } from 'react'

/** Focus the ref when any of the keys are pressed (unless modifier keys are down). */
export function useShortcutFocus(ref: RefObject<HTMLElement | null>, keys: string[] = ['f', '/']) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
          return;
      }

      const k = e.key.toLowerCase()
      if (keys.includes(k)) {
        e.preventDefault()
        ref.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [ref, keys])
}
