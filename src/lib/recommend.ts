import type { Product, StyleProfile } from '../types'
import { PRODUCTS, PRODUCT_BY_ID } from '../data/products'

// ============================================================
// Lightweight, explainable recommendation engine.
// Scores products against a signal bundle (style profile,
// wishlist, recently viewed, cart). Fully client-side and
// deterministic — a stand-in for a server-side model with an
// identical interface.
// ============================================================

export interface RecoSignals {
  profile?: StyleProfile
  wishlistIds?: string[]
  recentIds?: string[]
  cartProductIds?: string[]
}

const VIBE_TAGS: Record<string, string[]> = {
  Streetwear: ['streetwear', 'oversized', 'graphic', 'hoodie', 'cargo', 'sneaker'],
  Minimalist: ['minimal', 'premium', 'slim', 'tailored'],
  Classic: ['classic', 'shirt', 'polo', 'formal'],
  Luxe: ['premium', 'leather', 'watch', 'gold'],
  Athleisure: ['tech', 'sweatshirt', 'shorts', 'sneaker', 'runner'],
  Bold: ['graphic', 'colorblock', 'ember', 'aurora'],
}

function scoreProduct(p: Product, signals: RecoSignals, seedBoost: Set<string>): { score: number; reasons: string[] } {
  let score = p.rating * 4 + Math.min(p.popularity / 200, 12)
  const reasons: string[] = []
  const prof = signals.profile

  if (prof) {
    const vibeTags = VIBE_TAGS[prof.vibe] ?? []
    const hay = (p.tags.join(' ') + ' ' + p.kind + ' ' + p.collections.join(' ') + ' ' + p.styles.map((s) => s.fit).join(' ')).toLowerCase()
    if (vibeTags.some((t) => hay.includes(t))) { score += 22; reasons.push(`matches your ${prof.vibe} vibe`) }

    if (prof.categories.includes(p.category)) { score += 18; reasons.push('a category you love') }

    if (prof.colors.some((c) => p.colors.some((pc) => pc.name.toLowerCase().includes(c.toLowerCase()) || colorFamily(pc.hex) === c.toLowerCase()))) {
      score += 12; reasons.push('in your favorite colors')
    }
    if (prof.fabrics.some((f) => p.fabrics.some((pf) => pf.toLowerCase().includes(f.toLowerCase())))) {
      score += 8; reasons.push('your preferred fabric')
    }
    if (prof.fits.some((f) => p.styles.some((s) => s.fit === f))) { score += 8 }
    if (p.price >= prof.priceRange[0] && p.price <= prof.priceRange[1]) { score += 10; reasons.push('within your budget') }
    else score -= 6
    if (prof.formality === 'Formal' && ['shirt', 'pants'].includes(p.kind)) score += 8
    if (prof.formality === 'Casual' && ['tshirt', 'hoodie', 'shorts', 'sneaker'].includes(p.kind)) score += 8
    if (prof.boldness === 'Bold' && p.collections.includes('limited')) score += 6
  }

  // Behavior signals
  if (signals.wishlistIds?.length) {
    const catsLiked = new Set(signals.wishlistIds.map((id) => PRODUCT_BY_ID[id]?.category).filter(Boolean))
    if (catsLiked.has(p.category)) { score += 10; reasons.push('like items you saved') }
  }
  if (signals.recentIds?.length) {
    const kindsSeen = new Set(signals.recentIds.map((id) => PRODUCT_BY_ID[id]?.kind).filter(Boolean))
    if (kindsSeen.has(p.kind)) score += 6
  }
  if (seedBoost.has(p.id)) score += 30

  // Freshness + de-noise
  if (p.collections.includes('new')) score += 4
  if (p.stock === 'out_of_stock') score -= 20

  return { score, reasons: [...new Set(reasons)].slice(0, 2) }
}

// crude hue → family for color-name matching
function colorFamily(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  if (max - min < 24) return max < 60 ? 'black' : max > 200 ? 'white' : 'grey'
  if (r >= g && r >= b) return b > 120 ? 'violet' : 'red'
  if (g >= r && g >= b) return 'green'
  return b > 150 && g > 120 ? 'teal' : 'blue'
}

export interface Reco {
  product: Product
  reasons: string[]
}

export function recommend(signals: RecoSignals, limit = 8, excludeIds: string[] = []): Reco[] {
  const exclude = new Set(excludeIds)
  const seedBoost = new Set<string>()
  // Boost products that share a category with wishlist/recent seeds
  ;[...(signals.wishlistIds ?? []), ...(signals.recentIds ?? [])].forEach((id) => {
    const seed = PRODUCT_BY_ID[id]
    if (seed) PRODUCTS.filter((p) => p.category === seed.category && p.id !== id).slice(0, 3).forEach((p) => seedBoost.add(p.id))
  })

  return PRODUCTS.filter((p) => !exclude.has(p.id))
    .map((p) => ({ product: p, ...scoreProduct(p, signals, seedBoost) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ product, reasons }) => ({ product, reasons }))
}

/** "Frequently bought together" — same/adjacent category, complementary kind. */
export function boughtTogether(product: Product, limit = 3): Product[] {
  const complement: Record<string, string[]> = {
    tshirt: ['jeans', 'sneaker', 'cap'], polo: ['pants', 'belt', 'shoe'], shirt: ['pants', 'belt', 'watch'],
    hoodie: ['cargo', 'sneaker', 'cap'], jeans: ['tshirt', 'sneaker', 'belt'], sneaker: ['socks', 'tshirt', 'cap'],
    watch: ['wallet', 'sunglasses', 'belt'], bag: ['wallet', 'sunglasses', 'cap'],
  }
  const wants = complement[product.kind] ?? ['tshirt', 'sneaker', 'cap']
  const out: Product[] = []
  for (const kind of wants) {
    const match = PRODUCTS.find((p) => p.kind === (kind as any) && p.id !== product.id && !out.includes(p))
    if (match) out.push(match)
  }
  return out.slice(0, limit)
}

export function relatedProducts(product: Product, limit = 4): Product[] {
  return PRODUCTS.filter((p) => p.id !== product.id && (p.category === product.category || p.collections.some((c) => product.collections.includes(c))))
    .sort((a, b) => Math.abs(a.price - product.price) - Math.abs(b.price - product.price))
    .slice(0, limit)
}
