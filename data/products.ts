import type { Product, ProductStyle, ColorOption, GarmentKind, Review, Gender, StockStatus } from '../types'
import { CATEGORIES, SIZE_SETS, FABRICS } from './categories'

// ============================================================
// Deterministic catalog generator.
// A seeded RNG keeps the catalog stable across reloads (no
// hydration flicker) while still feeling hand-curated. Admins
// can append products at runtime via the admin store; this is
// the seed set.
// ============================================================

function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const NAMES = [
  'Nebula', 'Vortex', 'Eclipse', 'Zenith', 'Flux', 'Aether', 'Onyx', 'Halo', 'Pulse', 'Vector',
  'Prism', 'Nova', 'Apex', 'Drift', 'Cipher', 'Lumen', 'Strata', 'Vantage', 'Meridian', 'Quartz',
  'Cobalt', 'Ember', 'Solstice', 'Nimbus', 'Rift', 'Echo', 'Zephyr', 'Aurora', 'Titan', 'Helix',
  'Mirage', 'Cascade', 'Phantom', 'Quantum', 'Cinder', 'Vertex', 'Astra', 'Kismet', 'Lattice', 'Obsidian',
]

const COLOR_POOL: ColorOption[] = [
  { name: 'Obsidian', hex: '#0e0e12' },
  { name: 'Arctic White', hex: '#f5f6fa' },
  { name: 'Storm Grey', hex: '#6b7280' },
  { name: 'Aurora Violet', hex: '#7b4dff' },
  { name: 'Cyber Teal', hex: '#12d3e0' },
  { name: 'Ember Red', hex: '#e0463e' },
  { name: 'Sand Dune', hex: '#d9c6a5' },
  { name: 'Forest Moss', hex: '#3f5e42' },
  { name: 'Cobalt Blue', hex: '#2b5cff' },
  { name: 'Rose Quartz', hex: '#f2a7c4' },
  { name: 'Champagne Gold', hex: '#d4af37' },
  { name: 'Midnight Navy', hex: '#1c2541' },
  { name: 'Heather Grey', hex: '#9aa0aa', hex2: '#c7ccd4' },
  { name: 'Olive Field', hex: '#6b6b3a' },
  { name: 'Terracotta', hex: '#c96f44' },
]

const PALETTES: [string, string][] = [
  ['#7b4dff', '#12d3e0'],
  ['#ff5da2', '#7b4dff'],
  ['#12d3e0', '#3f5e42'],
  ['#d4af37', '#b8942a'],
  ['#2b5cff', '#7df9ff'],
  ['#e0463e', '#ffb347'],
  ['#1c2541', '#7b4dff'],
  ['#3f5e42', '#d9c6a5'],
  ['#c96f44', '#f2a7c4'],
  ['#6b7280', '#12121d'],
]

// Style presets by garment group — every product ships ≥5 styles.
const STYLE_SETS: Record<string, Omit<ProductStyle, 'id' | 'accent'>[]> = {
  top: [
    { name: 'Classic', tagline: 'Timeless everyday cut', silhouette: 'tshirt', fit: 'classic' },
    { name: 'Oversized', tagline: 'Relaxed street silhouette', silhouette: 'tshirt', fit: 'oversized' },
    { name: 'Slim Fit', tagline: 'Sharp, tailored lines', silhouette: 'tshirt', fit: 'slim' },
    { name: 'Streetwear', tagline: 'Bold graphic energy', silhouette: 'tshirt', fit: 'relaxed' },
    { name: 'Premium Minimal', tagline: 'Elevated, logo-free', silhouette: 'tshirt', fit: 'tailored' },
  ],
  bottom: [
    { name: 'Straight', tagline: 'Clean straight leg', silhouette: 'pants', fit: 'classic' },
    { name: 'Slim', tagline: 'Modern slim taper', silhouette: 'pants', fit: 'slim' },
    { name: 'Relaxed', tagline: 'Easy relaxed fit', silhouette: 'pants', fit: 'relaxed' },
    { name: 'Tapered', tagline: 'Tapered ankle', silhouette: 'pants', fit: 'tailored' },
    { name: 'Wide Leg', tagline: 'Fluid wide silhouette', silhouette: 'pants', fit: 'oversized' },
  ],
  footwear: [
    { name: 'Low Top', tagline: 'Everyday low profile', silhouette: 'sneaker', fit: 'classic' },
    { name: 'High Top', tagline: 'Statement ankle height', silhouette: 'sneaker', fit: 'relaxed' },
    { name: 'Runner', tagline: 'Performance-ready', silhouette: 'sneaker', fit: 'slim' },
    { name: 'Chunky', tagline: 'Bold sculpted sole', silhouette: 'sneaker', fit: 'oversized' },
    { name: 'Minimal', tagline: 'Clean, refined lines', silhouette: 'sneaker', fit: 'tailored' },
  ],
  accessory: [
    { name: 'Classic', tagline: 'Signature look', silhouette: 'accessory', fit: 'classic' },
    { name: 'Bold', tagline: 'Statement finish', silhouette: 'accessory', fit: 'relaxed' },
    { name: 'Minimal', tagline: 'Understated luxe', silhouette: 'accessory', fit: 'tailored' },
    { name: 'Heritage', tagline: 'Timeless craft', silhouette: 'accessory', fit: 'classic' },
    { name: 'Tech', tagline: 'Modern engineered', silhouette: 'accessory', fit: 'slim' },
  ],
}

function groupForKind(kind: GarmentKind): 'top' | 'bottom' | 'footwear' | 'accessory' {
  if (['tshirt', 'polo', 'shirt', 'hoodie', 'sweatshirt', 'jacket'].includes(kind)) return 'top'
  if (['jeans', 'pants', 'cargo', 'shorts'].includes(kind)) return 'bottom'
  if (['shoe', 'sneaker', 'sandal'].includes(kind)) return 'footwear'
  return 'accessory'
}

const REVIEW_AUTHORS = ['Aisha R.', 'Wei L.', 'Daniel T.', 'Nurul A.', 'Minh Q.', 'Sofia K.', 'Arjun P.', 'Chloe W.', 'Farah S.', 'Kenji M.']
const REVIEW_TITLES = ['Absolutely love it', 'Premium quality', 'Perfect fit', 'Exceeded expectations', 'My new favorite', 'Worth every ringgit', 'Incredible fabric', 'So comfortable']
const REVIEW_BODIES = [
  'The fabric feels genuinely premium and the fit is spot on. Delivery was quick too.',
  'Stitching and finish are excellent. Looks even better in person.',
  'Great weight and drape. The color is exactly as shown on the site.',
  'Customized mine with a logo — the print quality is superb.',
  'Comfortable all day, breathable, and holds its shape after washing.',
  'Fast delivery and beautiful packaging. Definitely ordering again.',
]

function priceForKind(kind: GarmentKind, rng: () => number): number {
  const base: Record<string, [number, number]> = {
    tshirt: [55, 120], polo: [79, 149], shirt: [99, 199], hoodie: [129, 249], sweatshirt: [109, 199],
    jacket: [199, 499], jeans: [149, 299], pants: [119, 239], cargo: [139, 259], shorts: [79, 149],
    shoe: [199, 449], sneaker: [229, 549], sandal: [89, 179], cap: [59, 119], hat: [69, 139],
    belt: [89, 179], bag: [149, 399], wallet: [89, 199], watch: [299, 899], sunglasses: [149, 349],
    socks: [29, 59], accessory: [49, 149],
  }
  const [lo, hi] = base[kind] ?? [59, 149]
  return Math.round((lo + rng() * (hi - lo)) / 5) * 5 - 1 // .99-ish → RM x9
}

function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)]
}
function sample<T>(arr: T[], n: number, rng: () => number): T[] {
  const copy = [...arr]
  const out: T[] = []
  while (out.length < n && copy.length) out.push(copy.splice(Math.floor(rng() * copy.length), 1)[0])
  return out
}

function buildDescription(kind: GarmentKind, name: string, fabric: string, gender: Gender): string {
  const g = gender === 'women' ? "women's" : gender === 'men' ? "men's" : 'unisex'
  const kindWord = kind.replace('_', ' ')
  return `The ${name} is a ${g} ${kindWord} crafted from premium ${fabric.toLowerCase()}, engineered for a next-generation wardrobe. Precision-cut with reinforced seams, a refined hand-feel, and a silhouette that moves with you. Finished to global quality standards and available in multiple styles, colors and fabrics — with live customization for a piece that's unmistakably yours.`
}

function makeReviews(count: number, rating: number, rng: () => number): Review[] {
  const n = Math.min(count, 6)
  const out: Review[] = []
  for (let i = 0; i < n; i++) {
    const r = Math.max(3, Math.min(5, Math.round(rating + (rng() - 0.4))))
    out.push({
      id: `r${i}`,
      author: pick(REVIEW_AUTHORS, rng),
      rating: r,
      date: `2026-0${1 + Math.floor(rng() * 7)}-${(10 + Math.floor(rng() * 18)).toString().padStart(2, '0')}`,
      title: pick(REVIEW_TITLES, rng),
      body: pick(REVIEW_BODIES, rng),
      verified: rng() > 0.2,
    })
  }
  return out
}

// How many seed products per category
const COUNT_PER_CATEGORY: Record<string, number> = {
  tshirts: 4, polos: 3, shirts: 3, hoodies: 3, sweatshirts: 2, jackets: 3,
  jeans: 3, 'casual-pants': 2, 'formal-pants': 2, 'cargo-pants': 2, shorts: 2,
  shoes: 2, sneakers: 3, sandals: 2, caps: 2, hats: 2, belts: 2, bags: 3,
  wallets: 2, watches: 2, sunglasses: 2, socks: 2, accessories: 2,
  'custom-apparel': 2, 'event-merch': 2, promo: 2, uniforms: 2,
}

function genderForIndex(i: number): Gender {
  const mod = i % 3
  return mod === 0 ? 'unisex' : mod === 1 ? 'men' : 'women'
}

function generate(): Product[] {
  const products: Product[] = []
  let globalIdx = 0

  for (const cat of CATEGORIES) {
    const count = COUNT_PER_CATEGORY[cat.id] ?? 2
    for (let c = 0; c < count; c++) {
      const rng = mulberry32(1000 + globalIdx * 97)
      const name = `${NAMES[globalIdx % NAMES.length]} ${cat.name.replace(/s$/, '').replace('Premium ', '')}`
      const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${globalIdx}`
      const gender = genderForIndex(globalIdx)
      const group = groupForKind(cat.kind)
      const sizeKey =
        cat.group === 'footwear' ? 'footwear'
        : cat.kind === 'belt' ? 'belt'
        : cat.kind === 'hat' || cat.kind === 'cap' ? 'hat'
        : cat.kind === 'socks' ? 'socks'
        : cat.group === 'accessories' ? 'accessories'
        : 'apparel'

      const colors = sample(COLOR_POOL, 4 + Math.floor(rng() * 3), rng)
      const fabrics = sample(FABRICS, 2 + Math.floor(rng() * 2), rng)
      const rating = Math.round((3.9 + rng() * 1.1) * 10) / 10
      const reviewCount = 12 + Math.floor(rng() * 480)
      const price = priceForKind(cat.kind, rng)
      const hasDiscount = rng() > 0.55
      const compareAt = hasDiscount ? Math.round(price * (1.15 + rng() * 0.35)) : undefined
      const stockRoll = rng()
      const stock: StockStatus = stockRoll > 0.75 ? 'made_on_request' : stockRoll > 0.06 ? 'in_stock' : 'out_of_stock'
      const stockCount = stock === 'in_stock' ? 3 + Math.floor(rng() * 60) : stock === 'made_on_request' ? 0 : 0

      const styleBase = STYLE_SETS[group]
      const styles: ProductStyle[] = styleBase.map((s, si) => ({
        ...s,
        id: `style-${si}`,
        silhouette: cat.kind, // render this product's true silhouette
        accent: colors[si % colors.length].hex,
      }))

      const collections: string[] = []
      if (globalIdx % 4 === 0) collections.push('new')
      if (rating >= 4.5 && reviewCount > 200) collections.push('best')
      if (rng() > 0.6) collections.push('trending')
      if (price > 200 || cat.group === 'accessories') collections.push('premium')
      if (gender === 'men') collections.push('men')
      if (gender === 'women') collections.push('women')
      if (gender === 'unisex') collections.push('unisex')
      if (cat.group === 'accessories') collections.push('accessories')
      if (cat.group === 'custom') { collections.push('custom'); collections.push('event'); collections.push('promo') }
      if (rng() > 0.85) collections.push('limited')

      const customizable = cat.group === 'custom' || ['tshirt', 'polo', 'hoodie', 'sweatshirt', 'cap', 'bag'].includes(cat.kind)
      const printLocations = customizable
        ? (cat.kind === 'cap' ? (['cap_front'] as const)
          : cat.kind === 'bag' ? (['bag'] as const)
          : (['front', 'back', 'left_chest', 'right_chest', 'sleeve'] as const)).slice()
        : undefined

      const createdDay = 28 - (globalIdx % 28)
      const product: Product = {
        id: `p${globalIdx}`,
        slug,
        name,
        brand: 'TaioMei',
        category: cat.id,
        collections: [...new Set(collections)],
        gender,
        kind: cat.kind,
        description: buildDescription(cat.kind, name, fabrics[0], gender),
        price,
        compareAt,
        currency: 'MYR',
        rating,
        reviewCount,
        colors,
        sizes: SIZE_SETS[sizeKey] ?? SIZE_SETS.apparel,
        fabrics,
        styles,
        stock,
        stockCount,
        customizable,
        printLocations: printLocations as any,
        tags: [cat.name, gender, ...fabrics, name.split(' ')[0]],
        reviews: makeReviews(reviewCount, rating, rng),
        createdAt: `2026-08-${createdDay.toString().padStart(2, '0')}`,
        popularity: Math.round(reviewCount * rating + (collections.includes('trending') ? 500 : 0)),
        palette: PALETTES[globalIdx % PALETTES.length],
        hasVideo: rng() > 0.6,
        has360: group !== 'accessory' || rng() > 0.5,
      }
      products.push(product)
      globalIdx++
    }
  }
  return products
}

export const PRODUCTS: Product[] = generate()

export const PRODUCT_BY_SLUG: Record<string, Product> = Object.fromEntries(PRODUCTS.map((p) => [p.slug, p]))
export const PRODUCT_BY_ID: Record<string, Product> = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]))

export function productsIn(collectionId: string, limit?: number): Product[] {
  const list = PRODUCTS.filter((p) => p.collections.includes(collectionId))
  return limit ? list.slice(0, limit) : list
}

export function newArrivals(limit = 8): Product[] {
  return [...PRODUCTS].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit)
}
export function bestSellers(limit = 8): Product[] {
  return [...PRODUCTS].sort((a, b) => b.popularity - a.popularity).slice(0, limit)
}
