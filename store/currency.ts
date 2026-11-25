import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'MYR' | 'SGD' | 'JPY'

export interface CurrencyMeta {
  code: CurrencyCode
  symbol: string
  /** Multiplier relative to base catalog MYR prices */
  rateFromMyr: number
  region: string
  dutyNote: string
}

export const CURRENCIES: CurrencyMeta[] = [
  { code: 'USD', symbol: '$', rateFromMyr: 0.226, region: 'United States', dutyNote: 'Complimentary Express DHL · Global DDP' },
  { code: 'EUR', symbol: '€', rateFromMyr: 0.208, region: 'European Union', dutyNote: 'DDP · VAT & customs duties included' },
  { code: 'GBP', symbol: '£', rateFromMyr: 0.179, region: 'United Kingdom', dutyNote: 'DDP · UK import duties included' },
  { code: 'MYR', symbol: 'RM', rateFromMyr: 1, region: 'Malaysia', dutyNote: 'Same-day KL courier · Free express nationwide' },
  { code: 'SGD', symbol: 'S$', rateFromMyr: 0.304, region: 'Singapore', dutyNote: 'Next-day express courier · GST included' },
  { code: 'JPY', symbol: '¥', rateFromMyr: 34.4, region: 'Japan', dutyNote: 'DDP · Express Tokyo 48h delivery' },
]

interface CurrencyState {
  code: CurrencyCode
  setCurrency: (code: CurrencyCode) => void
}

export const useCurrency = create<CurrencyState>()(
  persist(
    (set) => ({
      code: 'USD',
      setCurrency: (code) => set({ code }),
    }),
    { name: 'taiomei.currency' }
  )
)

export function getCurrencyMeta(code: CurrencyCode): CurrencyMeta {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0]
}
