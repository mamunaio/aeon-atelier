// ============================================================
// AEON Atelier — Core domain types
// A single source of truth for the whole platform.
// ============================================================

export type Locale = 'en' | 'ms' | 'vi' | 'zh' | 'bn'

export type StockStatus = 'in_stock' | 'made_on_request' | 'out_of_stock'

export type Gender = 'men' | 'women' | 'unisex'

/** A named color swatch shown on cards and the PDP */
export interface ColorOption {
  name: string
  hex: string
  /** secondary hex for gradient/heather fabrics */
  hex2?: string
}

/** One of the (minimum) 5 visual styles every product ships with */
export interface ProductStyle {
  id: string
  /** i18n key OR literal label */
  name: string
  /** short descriptor */
  tagline: string
  /** silhouette preset used by the procedural garment renderer */
  silhouette: GarmentKind
  /** style-specific accent used in the render */
  accent: string
  fit: 'classic' | 'oversized' | 'slim' | 'relaxed' | 'tailored'
}

export interface Review {
  id: string
  author: string
  rating: number
  date: string
  title: string
  body: string
  verified: boolean
}

/** Which procedural silhouette the SVG renderer should draw */
export type GarmentKind =
  | 'tshirt'
  | 'polo'
  | 'shirt'
  | 'hoodie'
  | 'sweatshirt'
  | 'jacket'
  | 'jeans'
  | 'pants'
  | 'cargo'
  | 'shorts'
  | 'shoe'
  | 'sneaker'
  | 'sandal'
  | 'cap'
  | 'hat'
  | 'belt'
  | 'bag'
  | 'wallet'
  | 'watch'
  | 'sunglasses'
  | 'socks'
  | 'accessory'

/** Where customization art can be placed on a given product */
export type PrintLocation =
  | 'front'
  | 'back'
  | 'left_chest'
  | 'right_chest'
  | 'sleeve'
  | 'cap_front'
  | 'bag'

export interface Product {
  id: string
  slug: string
  name: string
  brand: string
  /** category id */
  category: string
  collections: string[]
  gender: Gender
  kind: GarmentKind
  description: string
  price: number
  /** original price before discount */
  compareAt?: number
  currency: 'MYR'
  rating: number
  reviewCount: number
  colors: ColorOption[]
  sizes: string[]
  fabrics: string[]
  styles: ProductStyle[]
  stock: StockStatus
  stockCount: number
  customizable: boolean
  printLocations?: PrintLocation[]
  tags: string[]
  reviews: Review[]
  /** ISO date the product was added — powers "New Arrivals" */
  createdAt: string
  popularity: number
  /** hero gradient stops for cinematic cards */
  palette: [string, string]
  hasVideo?: boolean
  has360?: boolean
}

export interface Category {
  id: string
  name: string
  kind: GarmentKind
  group: 'apparel' | 'footwear' | 'accessories' | 'custom'
  icon: string
}

export interface Collection {
  id: string
  name: string
  blurb: string
  accent: string
}

// ---------- Customization ----------
export interface DesignElement {
  id: string
  type: 'text' | 'image'
  location: PrintLocation
  // normalized coordinates 0..1 within the print area
  x: number
  y: number
  scale: number
  rotation: number
  // text props
  text?: string
  font?: string
  color?: string
  // image props (data URL)
  src?: string
}

export interface SavedDesign {
  id: string
  productId: string
  name: string
  elements: DesignElement[]
  colorName: string
  createdAt: string
  thumbnail?: string
}

// ---------- Cart & Orders ----------
export interface CartItem {
  id: string // unique line id
  productId: string
  name: string
  price: number
  qty: number
  styleId: string
  styleName: string
  colorName: string
  colorHex: string
  size: string
  fabric: string
  kind: GarmentKind
  customization?: DesignElement[]
  customizationLabel?: string
  stock: StockStatus
}

export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'

export interface OrderEvent {
  status: OrderStatus
  at: string
  note?: string
}

export interface Order {
  id: string
  items: CartItem[]
  subtotal: number
  shipping: number
  discount: number
  total: number
  currency: 'MYR'
  status: OrderStatus
  timeline: OrderEvent[]
  customer: {
    name: string
    phone: string
    email?: string
    address: string
    city: string
    postal: string
    country: string
    notes?: string
  }
  payment: string
  couponCode?: string
  estDeliveryMin: number
  estDeliveryMax: number
  placedAt: string
  guest: boolean
}

// ---------- Accounts ----------
export interface Address {
  id: string
  label: string
  line: string
  city: string
  postal: string
  country: string
  isDefault?: boolean
}

export interface StyleProfile {
  vibe: string
  colors: string[]
  formality: string
  boldness: string
  fits: string[]
  categories: string[]
  patterns: string[]
  fabrics: string[]
  priceRange: [number, number]
  eventType: string
  completedAt: string
}

export interface User {
  id: string
  name: string
  email?: string
  phone: string
  createdAt: string
  addresses: Address[]
  styleProfile?: StyleProfile
  rewardPoints: number
  tier: 'Explorer' | 'Insider' | 'Icon'
}

// ---------- Marketing ----------
export interface Coupon {
  code: string
  type: 'percent' | 'fixed' | 'shipping'
  value: number
  minSpend: number
  label: string
  active: boolean
}

// ---------- Configurable business rules (admin-owned) ----------
export interface BusinessConfig {
  currency: 'MYR'
  currencySymbol: string
  // Guest / account rules
  guestOrderMaxValue: number // orders above this require an account
  maxGuestOrders: number
  maxOrdersPerCustomer: number
  requireOtp: boolean
  fraudCheckEnabled: boolean
  // Delivery
  inStockMinDays: number
  inStockMaxDays: number
  requestMinDays: number
  requestMaxDays: number
  freeShippingThreshold: number
  flatShipping: number
  // Payments (order matters => display order)
  payments: PaymentMethodConfig[]
}

export interface PaymentMethodConfig {
  id: string
  label: string
  enabled: boolean
  kind: 'card' | 'ewallet' | 'bank' | 'cod' | 'gateway'
}

// ---------- Event / bulk order ----------
export interface EventQuoteRequest {
  id: string
  eventType: string
  eventDate: string
  quantity: number
  productType: string
  colors: string
  sizeDistribution: string
  location: string
  notes: string
  logoName?: string
  contactName: string
  contactPhone: string
  contactEmail: string
  createdAt: string
  status: 'new' | 'reviewing' | 'quoted' | 'won'
}
