import { useEffect } from 'react'
import { useHistoryStore } from '@/store/history'

export function useUndoRedo() {
  const { canUndo, canRedo, undo, redo, setCanRedo, setCanUndo } = useHistoryStore()
  
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isMac = navigator.platform.toUpperCase().includes('MAC')
      const mod = isMac ? e.metaKey : e.ctrlKey
      if (mod && e.key.toLowerCase() === 'z') { 
        e.preventDefault()
        e.shiftKey ? redo() : undo() 
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo, redo])

  // Reset on mount for simplicity in this example
  useEffect(() => { 
    setCanUndo(false)
    setCanRedo(false)
  }, [setCanUndo, setCanRedo])

  return { canUndo, canRedo, undo, redo }
}
