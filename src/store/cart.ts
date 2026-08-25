import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem } from '../types'

interface CartState {
  items: CartItem[]
  add: (item: Omit<CartItem, 'id'>) => void
  remove: (id: string) => void
  setQty: (id: string, qty: number) => void
  clear: () => void
  count: () => number
  subtotal: () => number
}

// Two lines merge only when every variant dimension matches AND neither is customized.
function sameLine(a: Omit<CartItem, 'id'>, b: CartItem) {
  return (
    a.productId === b.productId &&
    a.styleId === b.styleId &&
    a.colorName === b.colorName &&
    a.size === b.size &&
    a.fabric === b.fabric &&
    !a.customization &&
    !b.customization
  )
}

let lineId = 0
const nextId = () => `line-${Date.now().toString(36)}-${++lineId}`

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item) =>
        set((s) => {
          const existing = s.items.find((i) => sameLine(item, i))
          if (existing) {
            return { items: s.items.map((i) => (i.id === existing.id ? { ...i, qty: i.qty + item.qty } : i)) }
          }
          return { items: [...s.items, { ...item, id: nextId() }] }
        }),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      setQty: (id, qty) =>
        set((s) => ({
          items: s.items.map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i)),
        })),
      clear: () => set({ items: [] }),
      count: () => get().items.reduce((n, i) => n + i.qty, 0),
      subtotal: () => get().items.reduce((n, i) => n + i.price * i.qty, 0),
    }),
    { name: 'aeon.cart' }
  )
)
