import type { Product } from '../types'
import { PRODUCTS } from '../data/products'
import { CATEGORIES } from '../data/categories'

// Intelligent-ish search: token overlap across name, category, color,
// fabric, style, collection and tags, with light synonym expansion.

const SYNONYMS: Record<string, string[]> = {
  tee: ['tshirt', 't-shirt'],
  tshirt: ['tee', 't-shirt'],
  black: ['obsidian', 'onyx'],
  white: ['arctic'],
  purple: ['violet', 'aurora'],
  blue: ['cobalt', 'navy', 'teal'],
  gold: ['champagne'],
  kicks: ['sneaker', 'shoe'],
  pants: ['trousers'],
  jumper: ['sweatshirt', 'hoodie'],
}

function expand(tokens: string[]): string[] {
  const out = new Set(tokens)
  tokens.forEach((t) => (SYNONYMS[t] ?? []).forEach((s) => out.add(s)))
  return [...out]
}

function haystack(p: Product): string {
  const cat = CATEGORIES.find((c) => c.id === p.category)?.name ?? ''
  return [
    p.name, p.brand, cat, p.kind, p.gender,
    ...p.colors.map((c) => c.name),
    ...p.fabrics, ...p.collections, ...p.styles.map((s) => s.name), ...p.tags,
  ].join(' ').toLowerCase()
}

export interface SearchHit {
  product: Product
  score: number
}

export function search(query: string, limit = 40): SearchHit[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const tokens = expand(q.split(/\s+/).filter(Boolean))
  const hits: SearchHit[] = []
  for (const p of PRODUCTS) {
    const hay = haystack(p)
    let score = 0
    for (const t of tokens) {
      if (hay.includes(t)) score += 10
      if (p.name.toLowerCase().includes(t)) score += 8
    }
    // full-phrase bonus
    if (hay.includes(q)) score += 15
    if (score > 0) hits.push({ product: p, score: score + p.rating })
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, limit)
}

export interface Suggestion {
  label: string
  type: 'product' | 'category' | 'color' | 'query'
  slug?: string
}

const COLOR_SUGGESTIONS = ['Obsidian Black', 'Aurora Violet', 'Cyber Teal', 'Arctic White', 'Champagne Gold']
export const POPULAR_SEARCHES = ['oversized t-shirt', 'premium hoodie', 'white sneakers', 'leather watch', 'cargo pants', 'custom polo']

export function suggestions(query: string, limit = 8): Suggestion[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const out: Suggestion[] = []

  CATEGORIES.forEach((c) => {
    if (c.name.toLowerCase().includes(q)) out.push({ label: c.name, type: 'category' })
  })
  COLOR_SUGGESTIONS.forEach((c) => {
    if (c.toLowerCase().includes(q)) out.push({ label: c, type: 'color' })
  })
  search(q, 5).forEach((h) => out.push({ label: h.product.name, type: 'product', slug: h.product.slug }))

  return out.slice(0, limit)
}
