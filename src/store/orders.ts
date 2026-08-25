import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Order, OrderStatus, CartItem, EventQuoteRequest } from '../types'

const FLOW: OrderStatus[] = ['placed', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered']

interface OrderState {
  orders: Order[]
  quotes: EventQuoteRequest[]
  guestOrderCount: number

  createOrder: (o: Omit<Order, 'id' | 'status' | 'timeline' | 'placedAt'>) => Order
  advance: (id: string) => void
  setStatus: (id: string, status: OrderStatus) => void
  cancel: (id: string) => void
  addQuote: (q: Omit<EventQuoteRequest, 'id' | 'createdAt' | 'status'>) => EventQuoteRequest
  setQuoteStatus: (id: string, status: EventQuoteRequest['status']) => void
}

function orderNumber(seq: number): string {
  return `AE-${(100000 + seq).toString()}`
}

export const useOrders = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],
      quotes: [],
      guestOrderCount: 0,

      createOrder: (o) => {
        const seq = get().orders.length + 1
        const now = new Date().toISOString()
        const order: Order = {
          ...o,
          id: orderNumber(seq),
          status: 'placed',
          placedAt: now,
          timeline: [{ status: 'placed', at: now, note: 'Order received' }],
        }
        set((s) => ({
          orders: [order, ...s.orders],
          guestOrderCount: o.guest ? s.guestOrderCount + 1 : s.guestOrderCount,
        }))
        return order
      },
      advance: (id) =>
        set((s) => ({
          orders: s.orders.map((o) => {
            if (o.id !== id) return o
            const idx = FLOW.indexOf(o.status)
            if (idx < 0 || idx >= FLOW.length - 1) return o
            const next = FLOW[idx + 1]
            return { ...o, status: next, timeline: [...o.timeline, { status: next, at: new Date().toISOString() }] }
          }),
        })),
      setStatus: (id, status) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === id
              ? { ...o, status, timeline: [...o.timeline, { status, at: new Date().toISOString() }] }
              : o
          ),
        })),
      cancel: (id) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === id
              ? { ...o, status: 'cancelled', timeline: [...o.timeline, { status: 'cancelled', at: new Date().toISOString(), note: 'Order cancelled' }] }
              : o
          ),
        })),
      addQuote: (q) => {
        const quote: EventQuoteRequest = {
          ...q,
          id: `Q-${(1000 + get().quotes.length + 1).toString()}`,
          createdAt: new Date().toISOString(),
          status: 'new',
        }
        set((s) => ({ quotes: [quote, ...s.quotes] }))
        return quote
      },
      setQuoteStatus: (id, status) =>
        set((s) => ({ quotes: s.quotes.map((q) => (q.id === id ? { ...q, status } : q)) })),
    }),
    { name: 'aeon.orders' }
  )
)

export { FLOW as ORDER_FLOW }
