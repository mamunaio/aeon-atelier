import type { BusinessConfig, StockStatus } from '../types'
import { getCurrencyMeta, useCurrency, type CurrencyCode } from '../store/currency'

export function formatMoney(amountMyr: number, overrideSymbolOrCode?: string): string {
  const activeCode = useCurrency.getState().code
  const meta = getCurrencyMeta(
    (overrideSymbolOrCode && ['USD', 'EUR', 'GBP', 'MYR', 'SGD', 'JPY'].includes(overrideSymbolOrCode)
      ? overrideSymbolOrCode
      : activeCode) as CurrencyCode
  )
  const converted = Math.round(amountMyr * meta.rateFromMyr)
  return `${meta.symbol}${meta.code === 'MYR' || meta.code === 'SGD' ? ' ' : ''}${converted.toLocaleString('en-US')}`
}

export function discountPct(price: number, compareAt?: number): number | null {
  if (!compareAt || compareAt <= price) return null
  return Math.round(((compareAt - price) / compareAt) * 100)
}

export interface DeliveryWindow {
  min: number
  max: number
  label: string
}

/** Delivery window derived entirely from the (admin-editable) config + stock. */
export function deliveryWindow(stock: StockStatus, config: BusinessConfig): DeliveryWindow {
  if (stock === 'in_stock') {
    return { min: config.inStockMinDays, max: config.inStockMaxDays, label: `${config.inStockMinDays}–${config.inStockMaxDays}` }
  }
  return { min: config.requestMinDays, max: config.requestMaxDays, label: `${config.requestMinDays}–${config.requestMaxDays}` }
}

export function estDeliveryDate(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toLocaleDateString('en-MY', { weekday: 'short', day: 'numeric', month: 'short' })
}

export function starString(rating: number): string {
  const full = Math.floor(rating)
  const half = rating - full >= 0.5
  return '★'.repeat(full) + (half ? '½' : '')
}

export function initials(name: string): string {
  return name.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase()
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}
