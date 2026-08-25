import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type StepKey = 'discover' | 'style' | 'color' | 'size' | 'customize' | 'cart' | 'checkout' | 'delivery'

export interface Toast {
  id: number
  title: string
  desc?: string
  kind: 'success' | 'info' | 'error' | 'cart'
}

// Coordinates for the "fly to cart" animation
export interface FlyPayload {
  id: number
  from: { x: number; y: number }
  color: string
  kind: string
}

interface UIState {
  reduceMotion: boolean
  toggleReduceMotion: () => void
  setReduceMotion: (v: boolean) => void

  mobileMenu: boolean
  setMobileMenu: (v: boolean) => void

  searchOpen: boolean
  setSearchOpen: (v: boolean) => void

  // Fashion assistant
  assistantOpen: boolean
  assistantStep: StepKey
  setAssistantOpen: (v: boolean) => void
  setStep: (s: StepKey) => void
  assistantMood: 'idle' | 'wave' | 'point' | 'celebrate' | 'think'
  setMood: (m: UIState['assistantMood']) => void

  // Toasts
  toasts: Toast[]
  pushToast: (t: Omit<Toast, 'id'>) => void
  removeToast: (id: number) => void

  // Fly-to-cart queue
  flights: FlyPayload[]
  fly: (p: Omit<FlyPayload, 'id'>) => void
  clearFlight: (id: number) => void

  // History
  recentlyViewed: string[]
  addRecent: (id: string) => void
  searchHistory: string[]
  addSearch: (q: string) => void
}

let toastId = 0
let flyId = 0

export const useUI = create<UIState>()(
  persist(
    (set) => ({
      reduceMotion: false,
      toggleReduceMotion: () => set((s) => ({ reduceMotion: !s.reduceMotion })),
      setReduceMotion: (v) => set({ reduceMotion: v }),

      mobileMenu: false,
      setMobileMenu: (v) => set({ mobileMenu: v }),

      searchOpen: false,
      setSearchOpen: (v) => set({ searchOpen: v }),

      assistantOpen: false,
      assistantStep: 'discover',
      setAssistantOpen: (v) => set({ assistantOpen: v }),
      setStep: (s) => set({ assistantStep: s }),
      assistantMood: 'idle',
      setMood: (m) => set({ assistantMood: m }),

      toasts: [],
      pushToast: (t) => {
        const id = ++toastId
        set((s) => ({ toasts: [...s.toasts, { ...t, id }] }))
        setTimeout(() => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })), 3200)
      },
      removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),

      flights: [],
      fly: (p) => {
        const id = ++flyId
        set((s) => ({ flights: [...s.flights, { ...p, id }] }))
      },
      clearFlight: (id) => set((s) => ({ flights: s.flights.filter((f) => f.id !== id) })),

      recentlyViewed: [],
      addRecent: (id) =>
        set((s) => ({ recentlyViewed: [id, ...s.recentlyViewed.filter((x) => x !== id)].slice(0, 12) })),
      searchHistory: [],
      addSearch: (q) =>
        set((s) => {
          const v = q.trim()
          if (!v) return s
          return { searchHistory: [v, ...s.searchHistory.filter((x) => x !== v)].slice(0, 8) }
        }),
    }),
    {
      name: 'aeon.ui',
      partialize: (s) => ({
        reduceMotion: s.reduceMotion,
        recentlyViewed: s.recentlyViewed,
        searchHistory: s.searchHistory,
      }),
    }
  )
)
