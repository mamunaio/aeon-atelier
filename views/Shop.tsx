'use client'

import { useMemo, useState, useEffect } from 'react'
import { useSearchParams, Link } from '../lib/router'
import { motion, AnimatePresence } from 'framer-motion'
import { SlidersHorizontal, X, Check, ChevronDown, Search as SearchIcon } from 'lucide-react'
import { useI18n } from '../i18n'
import { useHead, breadcrumbJsonLd } from '../lib/seo'
import { ProductCard } from '../components/ProductCard'
import { QuickView } from '../components/QuickView'
import { PRODUCTS } from '../data/products'
import { CATEGORIES, COLLECTIONS, FABRICS } from '../data/categories'
import { search as runSearch } from '../lib/search'
import type { Product, StockStatus } from '../types'

const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '39', '40', '41', '42', '43', '44', '45', 'One Size']
const SWATCHES = [
  { name: 'Obsidian', hex: '#0e0e12' },
  { name: 'Arctic White', hex: '#f5f6fa' },
  { name: 'Storm Grey', hex: '#6b7280' },
  { name: 'Aurora Violet', hex: '#7b4dff' },
  { name: 'Cyber Teal', hex: '#12d3e0' },
  { name: 'Ember Red', hex: '#e0463e' },
  { name: 'Cobalt Blue', hex: '#2b5cff' },
  { name: 'Champagne Gold', hex: '#d4af37' },
  { name: 'Forest Moss', hex: '#3f5e42' },
  { name: 'Rose Quartz', hex: '#f2a7c4' },
]
const PRICE_MAX = 900

type Sort = 'newest' | 'popular' | 'priceLow' | 'priceHigh' | 'rating'

export default function Shop() {
  const { t } = useI18n()
  const [params, setParams] = useSearchParams()
  const [quick, setQuick] = useState<Product | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const q = params.get('q') ?? ''
  const [cats, setCats] = useState<string[]>(() => (params.get('category') ? [params.get('category')!] : []))
  const [colls, setColls] = useState<string[]>(() => (params.get('collection') ? [params.get('collection')!] : []))
  const [sizes, setSizes] = useState<string[]>([])
  const [colors, setColors] = useState<string[]>([])
  const [fabrics, setFabrics] = useState<string[]>([])
  const [avail, setAvail] = useState<StockStatus[]>([])
  const [minRating, setMinRating] = useState(0)
  const [maxPrice, setMaxPrice] = useState(PRICE_MAX)
  const [sort, setSort] = useState<Sort>((params.get('sort') as Sort) || 'newest')

  // Sync when nav changes the category/collection query (e.g. from mega-menu)
  useEffect(() => {
    const c = params.get('category')
    const col = params.get('collection')
    setCats(c ? [c] : [])
    setColls(col ? [col] : [])
    if (params.get('sort')) setSort(params.get('sort') as Sort)
  }, [params])

  const toggle = <T,>(list: T[], set: (v: T[]) => void, val: T) =>
    set(list.includes(val) ? list.filter((x) => x !== val) : [...list, val])

  const searchIds = useMemo(() => (q ? new Set(runSearch(q, 200).map((h) => h.product.id)) : null), [q])

  const filtered = useMemo(() => {
    let list = PRODUCTS.filter((p) => {
      if (searchIds && !searchIds.has(p.id)) return false
      if (cats.length && !cats.includes(p.category)) return false
      if (colls.length && !colls.some((c) => p.collections.includes(c))) return false
      if (sizes.length && !sizes.some((s) => p.sizes.includes(s))) return false
      if (colors.length && !colors.some((c) => p.colors.some((pc) => pc.name === c))) return false
      if (fabrics.length && !fabrics.some((f) => p.fabrics.includes(f))) return false
      if (avail.length && !avail.includes(p.stock)) return false
      if (minRating && p.rating < minRating) return false
      if (p.price > maxPrice) return false
      return true
    })
    const sorters: Record<Sort, (a: Product, b: Product) => number> = {
      newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
      popular: (a, b) => b.popularity - a.popularity,
      priceLow: (a, b) => a.price - b.price,
      priceHigh: (a, b) => b.price - a.price,
      rating: (a, b) => b.rating - a.rating,
    }
    return [...list].sort(sorters[sort])
  }, [searchIds, cats, colls, sizes, colors, fabrics, avail, minRating, maxPrice, sort])

  const activeCount = cats.length + colls.length + sizes.length + colors.length + fabrics.length + avail.length + (minRating ? 1 : 0) + (maxPrice < PRICE_MAX ? 1 : 0)

  const clearAll = () => {
    setCats([]); setColls([]); setSizes([]); setColors([]); setFabrics([]); setAvail([]); setMinRating(0); setMaxPrice(PRICE_MAX)
    setParams((p) => { p.delete('category'); p.delete('collection'); return p }, { replace: true })
  }

  useHead({
    title: q ? `${t('search.results', { q })} — TaioMei` : 'Shop All — TaioMei',
    description: 'Browse premium apparel, footwear and accessories with intelligent filtering.',
    path: '/shop',
    jsonLd: breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Shop', path: '/shop' }]),
  })

  const FilterBody = (
    <div className="space-y-6">
      <FilterGroup title={t('filter.category')}>
        {CATEGORIES.map((c) => (
          <CheckRow key={c.id} label={c.name} checked={cats.includes(c.id)} onClick={() => toggle(cats, setCats, c.id)} />
        ))}
      </FilterGroup>

      <FilterGroup title={t('filter.collection')}>
        {COLLECTIONS.map((c) => (
          <CheckRow key={c.id} label={c.name} checked={colls.includes(c.id)} onClick={() => toggle(colls, setColls, c.id)} />
        ))}
      </FilterGroup>

      <FilterGroup title={t('filter.price')}>
        <div className="px-1">
          <input type="range" min={50} max={PRICE_MAX} step={10} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full accent-aurora-500" />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>RM 50</span>
            <span className="text-white">≤ RM {maxPrice}</span>
          </div>
        </div>
      </FilterGroup>

      <FilterGroup title={t('filter.size')}>
        <div className="flex flex-wrap gap-1.5">
          {ALL_SIZES.map((s) => (
            <button key={s} onClick={() => toggle(sizes, setSizes, s)} className={`min-w-[38px] px-2.5 py-1.5 rounded-lg text-xs border transition-all ${sizes.includes(s) ? 'border-aurora-400 bg-aurora-500/15 text-white' : 'border-white/12 text-slate-300 hover:border-white/30'}`}>{s}</button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title={t('filter.color')}>
        <div className="flex flex-wrap gap-2">
          {SWATCHES.map((c) => (
            <button key={c.name} title={c.name} onClick={() => toggle(colors, setColors, c.name)} className={`h-7 w-7 rounded-full border transition-all ${colors.includes(c.name) ? 'ring-2 ring-white ring-offset-2 ring-offset-void-900' : 'border-white/20'}`} style={{ background: c.hex }} />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title={t('filter.fabric')}>
        {FABRICS.map((f) => (
          <CheckRow key={f} label={f} checked={fabrics.includes(f)} onClick={() => toggle(fabrics, setFabrics, f)} />
        ))}
      </FilterGroup>

      <FilterGroup title={t('filter.availability')}>
        {(['in_stock', 'made_on_request', 'out_of_stock'] as StockStatus[]).map((s) => (
          <CheckRow key={s} label={t(`product.${s === 'in_stock' ? 'inStock' : s === 'made_on_request' ? 'madeOnRequest' : 'outOfStock'}`)} checked={avail.includes(s)} onClick={() => toggle(avail, setAvail, s)} />
        ))}
      </FilterGroup>

      <FilterGroup title={t('filter.rating')}>
        {[4, 3, 0].map((r) => (
          <CheckRow key={r} label={r === 0 ? t('filter.all') : `${r} ★ ${t('filter.andUp')}`} checked={minRating === r} onClick={() => setMinRating(r)} radio />
        ))}
      </FilterGroup>
    </div>
  )

  return (
    <div className="container-max section-pad">
      <nav className="text-xs text-slate-500 mb-4">
        <Link to="/" className="hover:text-white">{t('nav.home')}</Link> <span className="mx-1.5">/</span> <span className="text-slate-300">{t('nav.shop')}</span>
      </nav>

      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold">
            {q ? <>{t('search.results', { q })}</> : cats.length === 1 ? CATEGORIES.find((c) => c.id === cats[0])?.name : t('nav.shop')}
          </h1>
          <p className="text-slate-400 mt-1">{t('filter.results', { n: filtered.length })}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setDrawerOpen(true)} className="lg:hidden btn-ghost btn-sm">
            <SlidersHorizontal size={15} /> {t('filter.title')} {activeCount > 0 && <span className="ml-1 h-4 w-4 grid place-items-center rounded-full bg-aurora-500 text-[10px] text-white">{activeCount}</span>}
          </button>
          <SortSelect sort={sort} onChange={setSort} t={t} />
        </div>
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 glass-card rounded-2xl p-5 max-h-[calc(100vh-7rem)] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between mb-4">
              <span className="font-display font-semibold flex items-center gap-2"><SlidersHorizontal size={16} /> {t('filter.title')}</span>
              {activeCount > 0 && <button onClick={clearAll} className="text-xs text-cyber-300 hover:underline">{t('filter.clearAll')}</button>}
            </div>
            {FilterBody}
          </div>
        </aside>

        {/* Grid */}
        <div>
          {filtered.length === 0 ? (
            <div className="glass-card rounded-3xl py-20 text-center">
              <SearchIcon className="mx-auto text-slate-600 mb-3" size={40} />
              <p className="text-slate-300 text-lg">{t('filter.noResults')}</p>
              <button onClick={clearAll} className="btn-ghost btn-sm mt-4">{t('filter.clearAll')}</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
              {filtered.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} onQuickView={setQuick} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDrawerOpen(false)} className="fixed inset-0 z-[60] bg-void-950/80 backdrop-blur-sm lg:hidden" />
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              className="fixed inset-y-0 left-0 z-[61] w-[85%] max-w-sm glass-strong p-5 overflow-y-auto lg:hidden"
            >
              <div className="flex items-center justify-between mb-5">
                <span className="font-display text-lg font-semibold">{t('filter.title')}</span>
                <button onClick={() => setDrawerOpen(false)} className="grid place-items-center h-9 w-9 rounded-full glass"><X size={18} /></button>
              </div>
              {FilterBody}
              <div className="sticky bottom-0 -mx-5 mt-6 p-4 bg-void-950/80 backdrop-blur-md border-t border-white/10 flex gap-2">
                {activeCount > 0 && <button onClick={clearAll} className="btn-ghost btn-sm flex-1">{t('filter.clearAll')}</button>}
                <button onClick={() => setDrawerOpen(false)} className="btn-primary btn-sm flex-1">{t('filter.results', { n: filtered.length })}</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <QuickView product={quick} onClose={() => setQuick(null)} />
    </div>
  )
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="border-b border-white/8 pb-4 last:border-0">
      <button onClick={() => setOpen((o) => !o)} className="flex items-center justify-between w-full text-sm font-medium text-slate-200 mb-3">
        {title}
        <ChevronDown size={15} className={`transition-transform ${open ? '' : '-rotate-90'} text-slate-500`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="space-y-1.5 max-h-56 overflow-y-auto no-scrollbar pr-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function CheckRow({ label, checked, onClick, radio }: { label: string; checked: boolean; onClick: () => void; radio?: boolean }) {
  return (
    <button onClick={onClick} className="flex items-center gap-2.5 w-full text-left group">
      <span className={`grid place-items-center h-4 w-4 ${radio ? 'rounded-full' : 'rounded'} border transition-all shrink-0 ${checked ? 'bg-aurora-500 border-aurora-400' : 'border-white/25 group-hover:border-white/50'}`}>
        {checked && <Check size={11} className="text-white" strokeWidth={3} />}
      </span>
      <span className={`text-sm ${checked ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>{label}</span>
    </button>
  )
}

function SortSelect({ sort, onChange, t }: { sort: Sort; onChange: (s: Sort) => void; t: (k: string) => string }) {
  const opts: { v: Sort; label: string }[] = [
    { v: 'newest', label: t('filter.sortNewest') },
    { v: 'popular', label: t('filter.sortPopular') },
    { v: 'priceLow', label: t('filter.sortPriceLow') },
    { v: 'priceHigh', label: t('filter.sortPriceHigh') },
    { v: 'rating', label: t('filter.sortRating') },
  ]
  return (
    <div className="relative">
      <select
        value={sort}
        onChange={(e) => onChange(e.target.value as Sort)}
        className="appearance-none input !py-2 !pr-9 !pl-3 text-sm cursor-pointer"
        aria-label={t('filter.sort')}
      >
        {opts.map((o) => <option key={o.v} value={o.v} className="bg-void-900">{o.label}</option>)}
      </select>
      <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
  )
}
