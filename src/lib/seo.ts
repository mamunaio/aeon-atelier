import { useEffect } from 'react'
import type { Product } from '../types'

const BASE = 'https://taiomei.com'

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setJsonLd(id: string, data: object | null) {
  let el = document.getElementById(id) as HTMLScriptElement | null
  if (!data) { el?.remove(); return }
  if (!el) {
    el = document.createElement('script')
    el.id = id
    el.type = 'application/ld+json'
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(data)
}

export interface HeadOptions {
  title: string
  description?: string
  path?: string
  image?: string
  jsonLd?: object | null
}

/** Manage document head per route (title, meta, canonical, OG, JSON-LD). */
export function useHead({ title, description, path, jsonLd }: HeadOptions) {
  useEffect(() => {
    const fullTitle = title.includes('TaioMei') ? title : `${title} — TaioMei`
    document.title = fullTitle
    if (description) {
      setMeta('name', 'description', description)
      setMeta('property', 'og:description', description)
    }
    setMeta('property', 'og:title', fullTitle)
    setMeta('property', 'og:type', 'website')
    if (path) {
      const url = `${BASE}${path}`
      let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
      if (!link) { link = document.createElement('link'); link.rel = 'canonical'; document.head.appendChild(link) }
      link.href = url
      setMeta('property', 'og:url', url)
    }
    setJsonLd('route-jsonld', jsonLd ?? null)
    return () => setJsonLd('route-jsonld', null)
  }, [title, description, path, jsonLd])
}

export function productJsonLd(p: Product): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.description,
    brand: { '@type': 'Brand', name: p.brand },
    sku: p.id,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: p.rating,
      reviewCount: p.reviewCount,
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'MYR',
      price: p.price,
      availability: p.stock === 'out_of_stock' ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      url: `${BASE}/product/${p.slug}`,
    },
  }
}

export function organizationJsonLd(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'TaioMei',
    url: BASE,
    slogan: 'Wear Your Style. Create Your Identity.',
    areaServed: 'MY',
    description: 'Premium futuristic fashion and custom apparel platform based in Malaysia.',
  }
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: `${BASE}${it.path}`,
    })),
  }
}
