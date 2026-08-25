import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { BusinessConfig, Coupon } from '../types'
import { DEFAULT_CONFIG, DEFAULT_COUPONS } from '../data/config'

interface ConfigState {
  config: BusinessConfig
  coupons: Coupon[]
  setConfig: (patch: Partial<BusinessConfig>) => void
  setPayment: (id: string, enabled: boolean) => void
  addCoupon: (c: Coupon) => void
  toggleCoupon: (code: string) => void
  reset: () => void
}

export const useConfig = create<ConfigState>()(
  persist(
    (set) => ({
      config: DEFAULT_CONFIG,
      coupons: DEFAULT_COUPONS,
      setConfig: (patch) => set((s) => ({ config: { ...s.config, ...patch } })),
      setPayment: (id, enabled) =>
        set((s) => ({
          config: {
            ...s.config,
            payments: s.config.payments.map((p) => (p.id === id ? { ...p, enabled } : p)),
          },
        })),
      addCoupon: (c) => set((s) => ({ coupons: [c, ...s.coupons.filter((x) => x.code !== c.code)] })),
      toggleCoupon: (code) =>
        set((s) => ({ coupons: s.coupons.map((c) => (c.code === code ? { ...c, active: !c.active } : c)) })),
      reset: () => set({ config: DEFAULT_CONFIG, coupons: DEFAULT_COUPONS }),
    }),
    { name: 'aeon.config' }
  )
)

/** Resolve an active coupon against a subtotal. Returns discount + free-ship flag. */
export function evaluateCoupon(code: string, subtotal: number, coupons: Coupon[]) {
  const c = coupons.find((x) => x.code.toUpperCase() === code.trim().toUpperCase() && x.active)
  if (!c) return { ok: false as const }
  if (subtotal < c.minSpend) return { ok: false as const, reason: 'minSpend' as const, min: c.minSpend }
  let discount = 0
  let freeShip = false
  if (c.type === 'percent') discount = Math.round(subtotal * (c.value / 100))
  else if (c.type === 'fixed') discount = c.value
  else if (c.type === 'shipping') freeShip = true
  return { ok: true as const, discount, freeShip, coupon: c }
}
