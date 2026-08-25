import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WishlistState {
  ids: string[]
  compareIds: string[]
  toggle: (id: string) => void
  has: (id: string) => boolean
  clear: () => void
  toggleCompare: (id: string) => void
  inCompare: (id: string) => boolean
  clearCompare: () => void
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      compareIds: [],
      toggle: (id) =>
        set((s) => ({ ids: s.ids.includes(id) ? s.ids.filter((x) => x !== id) : [id, ...s.ids] })),
      has: (id) => get().ids.includes(id),
      clear: () => set({ ids: [] }),
      toggleCompare: (id) =>
        set((s) => ({
          compareIds: s.compareIds.includes(id)
            ? s.compareIds.filter((x) => x !== id)
            : [...s.compareIds, id].slice(-4),
        })),
      inCompare: (id) => get().compareIds.includes(id),
      clearCompare: () => set({ compareIds: [] }),
    }),
    { name: 'aeon.wishlist' }
  )
)
