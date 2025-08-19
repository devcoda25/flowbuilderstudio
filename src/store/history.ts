import { create } from 'zustand'
import { undo as flowUndo, redo as flowRedo } from './flow';

interface HistoryState {
  canUndo: boolean
  canRedo: boolean
  undo: () => void
  redo: () => void
  setCanUndo: (b: boolean) => void
  setCanRedo: (b: boolean) => void
}

export const useHistoryStore = create<HistoryState>((set) => ({
  canUndo: false,
  canRedo: false,
  undo: () => {
    flowUndo();
  },
  redo: () => {
    flowRedo();
  },
  setCanUndo: (b) => set({ canUndo: b }),
  setCanRedo: (b) => set({ canRedo: b }),
}))
