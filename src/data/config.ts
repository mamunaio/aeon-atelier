import type { BusinessConfig, Coupon } from '../types'

// ============================================================
// Default configurable business rules.
// These are the DEFAULTS; the admin console can override every
// value at runtime (persisted via the config store). Nothing
// here is hard-coded into checkout/delivery logic — the store
// is always the source of truth.
// ============================================================

export const DEFAULT_CONFIG: BusinessConfig = {
  currency: 'MYR',
  currencySymbol: 'RM',

  // Guest / account rules — fully admin-editable
  guestOrderMaxValue: 200, // orders above RM 200 require a verified account
  maxGuestOrders: 3,
  maxOrdersPerCustomer: 50,
  requireOtp: true,
  fraudCheckEnabled: true,

  // Delivery windows (days)
  inStockMinDays: 1,
  inStockMaxDays: 3,
  requestMinDays: 5,
  requestMaxDays: 7,
  freeShippingThreshold: 250,
  flatShipping: 12,

  payments: [
    { id: 'card', label: 'Credit / Debit Card', enabled: true, kind: 'card' },
    { id: 'fpx', label: 'FPX Online Banking', enabled: true, kind: 'bank' },
    { id: 'grabpay', label: 'GrabPay', enabled: true, kind: 'ewallet' },
    { id: 'tng', label: "Touch 'n Go eWallet", enabled: true, kind: 'ewallet' },
    { id: 'boost', label: 'Boost', enabled: false, kind: 'ewallet' },
    { id: 'cod', label: 'Cash on Delivery', enabled: true, kind: 'cod' },
  ],
}

export const DEFAULT_COUPONS: Coupon[] = [
  { code: 'TAIOMEI10', type: 'percent', value: 10, minSpend: 0, label: '10% off your order', active: true },
  { code: 'AEON10', type: 'percent', value: 10, minSpend: 0, label: '10% off your order (legacy)', active: true },
  { code: 'FREESHIP', type: 'shipping', value: 0, minSpend: 120, label: 'Free shipping over RM 120', active: true },
  { code: 'STYLE25', type: 'fixed', value: 25, minSpend: 200, label: 'RM 25 off over RM 200', active: true },
  { code: 'WELCOME', type: 'percent', value: 15, minSpend: 0, label: 'New member 15% off', active: true },
]
