import { useEffect } from 'react'

export function useKeybind(key: string, handler: (e: KeyboardEvent) => void) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key.toLowerCase() === key.toLowerCase()) handler(e)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [key, handler])
}
