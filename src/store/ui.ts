import { create } from 'zustand'

interface UIState {
  isTestConsoleOpen: boolean
  toggleTestConsole: () => void
}

export const useUIStore = create<UIState>((set, get) => ({
  isTestConsoleOpen: false,
  toggleTestConsole: () => set({ isTestConsoleOpen: !get().isTestConsoleOpen }),
}))
