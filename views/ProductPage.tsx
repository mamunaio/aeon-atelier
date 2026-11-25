'use client'

import { useState, useRef, useEffect } from 'react'
import { useParams, Link, useNavigate } from '../lib/router'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart, ShoppingBag, Zap, Wand2, Share2, GitCompare, RotateCw, ZoomIn, Check,
  Truck, ShieldCheck, RefreshCw, ChevronRight, Star, Plus, Minus, X, Ruler,
} from 'lucide-react'
import { PRODUCT_BY_SLUG } from '../data/products'
import { getProductDemoPhotos } from '../data/productImages'
import { boughtTogether, relatedProducts } from '../lib/recommend'
import { useI18n } from '../i18n'
import { useHead, productJsonLd } from '../lib/seo'
import { useConfig } from '../store/config'
import { useWishlist } from '../store/wishlist'
import { useUI } from '../store/ui'
import { useAddToCart } from '../hooks/useAddToCart'
import { Garment } from '../components/Garment'
import { Stars, Price, StockBadge } from '../components/ui/bits'
import { ProductCard } from '../components/ProductCard'
import { QuickView } from '../components/QuickView'
import { SectionHeader } from '../components/Section'
import { deliveryWindow, estDeliveryDate, formatMoney } from '../lib/format'
import { CATEGORIES } from '../data/categories'
import type { Product, Review } from '../types'

export default function ProductPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { t } = useI18n()
  const product = slug ? PRODUCT_BY_SLUG[slug] : undefined
  const config = useConfig((s) => s.config)
  const wishlist = useWishlist()
  const addToCart = useAddToCart()
  const { pushToast, addRecent, setStep } = useUI()

  const [styleIdx, setStyleIdx] = useState(0)
  const [colorIdx, setColorIdx] = useState(0)
  const [size, setSize] = useState(product?.sizes[0] ?? '')
  const [fabricIdx, setFabricIdx] = useState(0)
  const [qty, setQty] = useState(1)
  const [tab, setTab] = useState<'description' | 'details' | 'shipping' | 'reviews'>('description')
  const [quick, setQuick] = useState<Product | null>(null)
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false)
  const [justAdded, setJustAdded] = useState(false)
  const artRef = useRef<HTMLDivElement>(null)
  const tabsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (product) {
      addRecent(product.id)
      setStep('style')
    }
    setStyleIdx(0)
    setColorIdx(0)
    setSize(product?.sizes[0] ?? '')
    setFabricIdx(0)
    setQty(1)
    setTab('description')
    setJustAdded(false)
  }, [product?.id])

  useEffect(() => {
    if (!sizeGuideOpen) return
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSizeGuideOpen(false)
    }
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [sizeGuideOpen])

  useHead({
    title: product ? `${product.name} — TaioMei` : 'Product — TaioMei',
    description: product?.description,
    path: product ? `/product/${product.slug}` : '/shop',
    jsonLd: product ? productJsonLd(product) : null,
  })

  if (!product) {
    return (
      <div className="container-max section-pad text-center">
        <p className="text-[#C7C1B8] text-lg">Product not found.</p>
        <Link to="/shop" className="btn-primary mt-4">{t('nav.shop')}</Link>
      </div>
    )
  }

  const safeStyleIdx = Math.min(styleIdx, Math.max(0, product.styles.length - 1))
  const safeColorIdx = Math.min(colorIdx, Math.max(0, product.colors.length - 1))
  const style = product.styles[safeStyleIdx]
  const color = product.colors[safeColorIdx]
  const dw = deliveryWindow(product.stock, config)
  const wished = wishlist.has(product.id)
  const inCompare = wishlist.inCompare(product.id)
  const cat = CATEGORIES.find((c) => c.id === product.category)
  const related = relatedProducts(product, 4)
  const fbt = boughtTogether(product, 3)

  const handleAdd = (buyNow = false) => {
    const r = artRef.current?.getBoundingClientRect()
    addToCart(product, {
      styleId: style.id,
      colorIdx: safeColorIdx,
      size: size || product.sizes[0],
      fabric: product.fabrics[fabricIdx],
      qty,
      origin: buyNow ? undefined : r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : undefined,
    })
    if (buyNow) {
      navigate('/checkout')
    } else {
      setJustAdded(true)
      setTimeout(() => setJustAdded(false), 1400)
    }
  }

  const jumpToReviews = () => {
    setTab('reviews')
    tabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const share = async () => {
    const url = window.location.href
    try {
      if (navigator.share) await navigator.share({ title: product.name, url })
      else {
        await navigator.clipboard.writeText(url)
        pushToast({ kind: 'info', title: 'Link copied', desc: product.name })
      }
    } catch {
      /* dismissed */
    }
  }

  return (
    <div className="container-max section-pad">
      {/* Breadcrumb */}
      <nav className="text-xs font-mono uppercase tracking-[0.14em] text-[#9E988E] mb-6 flex items-center gap-2 flex-wrap">
        <Link to="/" className="hover:text-[#F2EFE9] transition-colors">{t('nav.home')}</Link>
        <ChevronRight size={12} className="opacity-50" />
        <Link to="/shop" className="hover:text-[#F2EFE9] transition-colors">{t('nav.shop')}</Link>
        <ChevronRight size={12} className="opacity-50" />
        {cat && (
          <>
            <Link to={`/shop?category=${cat.id}`} className="hover:text-[#F2EFE9] transition-colors">{cat.name}</Link>
            <ChevronRight size={12} className="opacity-50" />
          </>
        )}
        <span className="text-[#F2EFE9] truncate">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-12 gap-8 xl:gap-14 items-start">
        {/* Left: Editorial Gallery with Hover Loupe Zoom */}
        <div className="lg:col-span-6 lg:sticky lg:top-24">
          <Gallery
            product={product}
            styleIdx={safeStyleIdx}
            colorIdx={safeColorIdx}
            artRef={artRef}
            onStyle={setStyleIdx}
          />
        </div>

        {/* Right: Product Configuration & Details */}
        <div className="lg:col-span-6">
          <div className="flex items-center gap-2.5 flex-wrap">
            <StockBadge stock={product.stock} t={t} />
            {product.collections.includes('limited') && (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.18em] text-[#C6A87C] border border-[#C6A87C]/35 bg-[#C6A87C]/10 px-2.5 py-1 rounded-full">
                Limited Edition
              </span>
            )}
            {product.collections.includes('new') && (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.18em] text-[#F2EFE9] border border-white/15 bg-white/[0.04] px-2.5 py-1 rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-[#E03E36]" />
                {t('misc.new')}
              </span>
            )}
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-[-0.02em] text-[#F2EFE9] mt-3">
            {product.name}
          </h1>

          <div className="mt-2.5 flex items-center gap-4">
            <button
              type="button"
              onClick={jumpToReviews}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Stars rating={product.rating} />
              <span className="text-xs font-mono text-[#9E988E] underline-offset-4 hover:underline">
                {t('product.reviewCount', { n: product.reviewCount })}
              </span>
            </button>
            <span className="text-xs font-mono text-[#9E988E] uppercase tracking-wider">
              · {product.brand}
            </span>
          </div>

          <div className="mt-4">
            <Price price={product.price} compareAt={product.compareAt} size="lg" />
          </div>

          {product.stock === 'in_stock' && product.stockCount <= 12 && (
            <p className="mt-2 text-xs font-mono text-[#E03E36]">
              {t('product.lowStock', { n: product.stockCount })}
            </p>
          )}

          {/* Styles */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#9E988E]">
                {t('product.chooseStyle')}
              </span>
              <span className="text-[11px] font-mono text-[#9E988E]">
                {product.styles.length} {t('product.styles')}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.styles.map((s, i) => {
                const active = safeStyleIdx === i
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStyleIdx(i)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-[background-color,border-color,color,transform] duration-150 active:scale-[0.97] ${
                      active
                        ? 'bg-[#F2EFE9] text-[#09090B] border-[#F2EFE9]'
                        : 'bg-[#0D0D10] border-white/12 text-[#C7C1B8] hover:border-white/30 hover:text-[#F2EFE9]'
                    }`}
                  >
                    {s.name}
                  </button>
                )
              })}
            </div>
            <p className="text-xs text-[#9E988E] mt-2">
              {style.tagline} · <span className="capitalize text-[#C7C1B8]">{style.fit} fit</span>
            </p>
          </div>

          {/* Colors */}
          <div className="mt-5">
            <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#9E988E] mb-2.5">
              {t('product.color')}:{' '}
              <span className="text-[#F2EFE9] normal-case font-sans text-xs ml-1">{color.name}</span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {product.colors.map((c, i) => {
                const active = safeColorIdx === i
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setColorIdx(i)}
                    title={c.name}
                    aria-label={c.name}
                    className={`h-8 w-8 rounded-full border transition-transform duration-150 active:scale-[0.92] ${
                      active
                        ? 'ring-2 ring-[#F2EFE9] ring-offset-2 ring-offset-[#09090B] border-transparent scale-105'
                        : 'border-white/20 hover:scale-105'
                    }`}
                    style={{ background: c.hex2 ? `linear-gradient(135deg, ${c.hex}, ${c.hex2})` : c.hex }}
                  />
                )
              })}
            </div>
          </div>

          {/* Sizes */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#9E988E]">
                {t('product.size')}
              </span>
              <button
                type="button"
                onClick={() => setSizeGuideOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs text-[#C7C1B8] hover:text-[#F2EFE9] underline-offset-4 hover:underline transition-colors"
              >
                <Ruler size={12} /> {t('product.sizeGuide')}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => {
                const active = size === s
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    className={`min-w-[48px] px-3.5 py-2 rounded-xl text-sm font-medium border transition-[background-color,border-color,color,transform] duration-150 active:scale-[0.97] ${
                      active
                        ? 'border-[#E03E36] bg-[#E03E36]/15 text-[#F2EFE9]'
                        : 'border-white/12 bg-[#0D0D10] text-[#C7C1B8] hover:border-white/30 hover:text-[#F2EFE9]'
                    }`}
                  >
                    {s}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Fabric */}
          {product.fabrics.length > 1 && (
            <div className="mt-5">
              <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#9E988E] mb-2.5">
                {t('product.fabric')}
              </div>
              <div className="flex flex-wrap gap-2">
                {product.fabrics.map((f, i) => {
                  const active = fabricIdx === i
                  return (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFabricIdx(i)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-[background-color,border-color,color,transform] duration-150 active:scale-[0.97] ${
                        active
                          ? 'bg-[#F2EFE9] text-[#09090B] border-[#F2EFE9]'
                          : 'bg-[#0D0D10] border-white/12 text-[#C7C1B8] hover:border-white/30 hover:text-[#F2EFE9]'
                      }`}
                    >
                      {f}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mt-6 flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#9E988E]">
                {t('product.quantity')}
              </span>
              <div className="flex items-center rounded-xl bg-[#0D0D10] border border-white/12">
                <button
                  type="button"
                  disabled={qty <= 1}
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="h-10 w-10 grid place-items-center text-[#B4AEA4] hover:text-[#F2EFE9] disabled:opacity-30 active:scale-90 transition-[color,transform,opacity] duration-150"
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center text-sm font-medium text-[#F2EFE9] tabular-nums">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((q) => q + 1)}
                  className="h-10 w-10 grid place-items-center text-[#B4AEA4] hover:text-[#F2EFE9] active:scale-90 transition-[color,transform] duration-150"
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-[#0D0D10] border border-white/10 p-4 flex items-start gap-3">
            <Truck size={17} className="text-[#E03E36] mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="text-[#C7C1B8]">{t('product.estDelivery')}: </span>
              <span className="text-[#F2EFE9] font-medium">{dw.label} {t('product.days')}</span>
              <span className="text-[#9E988E]">
                {' '}· {product.stock === 'in_stock' ? t('delivery.fast') : t('delivery.request')}
              </span>
              <div className="text-xs text-[#9E988E] mt-0.5">
                Arrives around {estDeliveryDate(dw.max)}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-2.5">
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => handleAdd(false)}
                disabled={product.stock === 'out_of_stock'}
                className="btn-primary flex-1 !py-3.5"
              >
                {justAdded ? (
                  <>
                    <Check size={17} /> Added to Bag
                  </>
                ) : (
                  <>
                    <ShoppingBag size={17} /> {t('action.addToCart')}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => handleAdd(true)}
                disabled={product.stock === 'out_of_stock'}
                className="btn-gold flex-1 !py-3.5"
              >
                <Zap size={17} /> {t('action.buyNow')}
              </button>
            </div>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => {
                  wishlist.toggle(product.id)
                  pushToast({
                    kind: wished ? 'info' : 'success',
                    title: wished ? t('action.remove') : t('action.addToWishlist'),
                    desc: product.name,
                  })
                }}
                className={`btn-ghost btn-sm flex-1 ${wished ? '!border-[#E03E36]/50 !text-[#E03E36] !bg-[#E03E36]/10' : ''}`}
              >
                <Heart size={15} fill={wished ? 'currentColor' : 'none'} />{' '}
                {wished ? t('action.remove') : t('action.addToWishlist')}
              </button>
              <button
                type="button"
                onClick={() => wishlist.toggleCompare(product.id)}
                className={`btn-ghost btn-sm flex-1 ${inCompare ? '!border-white/40 !text-[#F2EFE9] !bg-white/[0.06]' : ''}`}
              >
                <GitCompare size={15} /> {t('action.compare')}
              </button>
              <button type="button" onClick={share} className="btn-ghost btn-sm px-3.5" aria-label={t('action.share')}>
                <Share2 size={15} />
              </button>
            </div>
            {product.customizable && (
              <Link
                to={`/customize?product=${product.slug}`}
                className="btn border border-[#C6A87C]/35 bg-[#C6A87C]/10 text-[#F2EFE9] hover:bg-[#C6A87C] hover:text-[#09090B] py-3 text-sm"
              >
                <Wand2 size={16} /> {t('product.customizeThis')}
              </Link>
            )}
          </div>

          {/* Trust icons */}
          <div className="mt-6 grid grid-cols-3 gap-2.5 text-center">
            {[
              { i: ShieldCheck, l: t('home.trustSecure') },
              { i: Truck, l: t('home.trustFast') },
              { i: RefreshCw, l: t('footer.returns') },
            ].map((it, k) => (
              <div key={k} className="rounded-xl bg-[#0D0D10] border border-white/10 py-3 px-2 flex flex-col items-center gap-1.5">
                <it.i size={16} className="text-[#E03E36]" />
                <span className="text-[11px] text-[#9E988E]">{it.l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs with gliding layoutId underline + animated content transition */}
      <div ref={tabsRef} className="mt-16 scroll-mt-24">
        <div className="flex gap-2 border-b border-white/10 overflow-x-auto no-scrollbar">
          {([
            ['description', t('product.description')],
            ['details', t('product.details')],
            ['shipping', t('product.shipping')],
            ['reviews', `${t('product.reviews')} (${product.reviewCount})`],
          ] as const).map(([k, label]) => {
            const active = tab === k
            return (
              <button
                key={k}
                type="button"
                onClick={() => setTab(k)}
                className={`relative px-4 py-3 text-xs font-mono uppercase tracking-[0.16em] whitespace-nowrap transition-colors duration-200 ${
                  active ? 'text-[#F2EFE9]' : 'text-[#9E988E] hover:text-[#F2EFE9]'
                }`}
              >
                {label}
                {active && (
                  <motion.span
                    layoutId="pdp-tab-indicator"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    className="absolute inset-x-0 -bottom-px h-0.5 bg-[#E03E36]"
                  />
                )}
              </button>
            )
          })}
        </div>

        <div className="py-7 max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              {tab === 'description' && (
                <p className="text-[#C7C1B8] leading-relaxed text-sm sm:text-base">{product.description}</p>
              )}
              {tab === 'details' && (
                <ul className="grid sm:grid-cols-2 gap-3">
                  {[
                    ['Brand', product.brand],
                    ['Category', cat?.name ?? ''],
                    ['Gender', product.gender],
                    ['Fabrics', product.fabrics.join(', ')],
                    ['Available styles', product.styles.map((s) => s.name).join(', ')],
                    ['Colors', product.colors.map((c) => c.name).join(', ')],
                  ].map(([k, v]) => (
                    <li key={k} className="rounded-xl bg-[#0D0D10] border border-white/10 px-4 py-3 flex justify-between gap-3">
                      <span className="text-[#9E988E] text-sm">{k}</span>
                      <span className="text-[#F2EFE9] text-sm text-right capitalize">{v}</span>
                    </li>
                  ))}
                </ul>
              )}
              {tab === 'shipping' && (
                <div className="space-y-3 text-sm text-[#C7C1B8]">
                  <p className="flex items-start gap-2.5">
                    <Check size={16} className="text-[#E03E36] mt-0.5 shrink-0" /> {t('delivery.fast')} — dispatched within 24 hours.
                  </p>
                  <p className="flex items-start gap-2.5">
                    <Check size={16} className="text-[#E03E36] mt-0.5 shrink-0" /> {t('delivery.request')} — hand-finished to order.
                  </p>
                  <p className="flex items-start gap-2.5">
                    <Check size={16} className="text-[#E03E36] mt-0.5 shrink-0" /> Free shipping over {formatMoney(config.freeShippingThreshold)}. Flat {formatMoney(config.flatShipping)} otherwise.
                  </p>
                  <p className="flex items-start gap-2.5">
                    <Check size={16} className="text-[#E03E36] mt-0.5 shrink-0" /> 14-day easy returns on unworn items.
                  </p>
                </div>
              )}
              {tab === 'reviews' && <Reviews product={product} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Frequently bought together */}
      {fbt.length > 0 && (
        <section className="mt-14">
          <SectionHeader eyebrow="CURATED PAIRING" title={t('product.boughtTogether')} />
          <div className="rounded-2xl bg-[#0D0D10] border border-white/10 p-5 sm:p-6 flex flex-col lg:flex-row items-center gap-6">
            <div className="flex items-center gap-3 flex-wrap justify-center">
              {[product, ...fbt].map((p, i) => {
                const thumb = getProductDemoPhotos(p.kind, i)[0]
                return (
                  <div key={p.id} className="flex items-center gap-3">
                    <Link
                      to={`/product/${p.slug}`}
                      className="rounded-xl bg-[#141418] border border-white/10 hover:border-white/25 p-2.5 w-28 transition-colors group"
                    >
                      <div className="aspect-square rounded-lg overflow-hidden bg-[#191920]">
                        <img
                          src={thumb}
                          alt={p.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="text-[11px] text-[#C7C1B8] truncate mt-2">{p.name}</div>
                      <div className="text-[11px] text-[#F2EFE9] font-medium tabular-nums">{formatMoney(p.price)}</div>
                    </Link>
                    {i < fbt.length && <Plus size={16} className="text-[#9E988E] shrink-0" />}
                  </div>
                )
              })}
            </div>
            <div className="lg:ml-auto text-center lg:text-right">
              <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#9E988E]">{t('product.total')}</div>
              <div className="font-display text-2xl font-semibold text-[#F2EFE9] mt-0.5">
                {formatMoney([product, ...fbt].reduce((n, p) => n + p.price, 0))}
              </div>
              <button
                type="button"
                onClick={() => {
                  ;[product, ...fbt].forEach((p) => addToCart(p, {}))
                  pushToast({ kind: 'cart', title: t('product.addAll'), desc: `${fbt.length + 1} ${t('cart.items')}` })
                }}
                className="btn-primary btn-sm mt-3"
              >
                <ShoppingBag size={14} /> {t('product.addAll')}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-16">
          <SectionHeader eyebrow="COMPLETE THE LOOK" title={t('product.related')} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} onQuickView={setQuick} />
            ))}
          </div>
        </section>
      )}

      <QuickView product={quick} onClose={() => setQuick(null)} />

      {/* Size Guide Modal */}
      <AnimatePresence>
        {sizeGuideOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSizeGuideOpen(false)}
              className="fixed inset-0 z-[65] bg-black/75 backdrop-blur-sm"
            />
            <div className="fixed inset-0 z-[66] grid place-items-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.98 }}
                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                className="pointer-events-auto bg-[#0B0B0E] border border-white/15 rounded-2xl w-full max-w-md p-6 shadow-2xl relative"
              >
                <button
                  type="button"
                  onClick={() => setSizeGuideOpen(false)}
                  className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/5 border border-white/10 grid place-items-center text-[#C7C1B8] hover:text-[#F2EFE9]"
                  aria-label="Close size guide"
                >
                  <X size={16} />
                </button>
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#E03E36]">TaioMei Fit Guide</div>
                <h3 className="font-display text-xl font-semibold text-[#F2EFE9] mt-1">{product.name}</h3>
                <p className="text-xs text-[#9E988E] mt-1">Measurements in cm · {style.fit} silhouette</p>
                <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-white/[0.04] text-[#9E988E] font-mono uppercase">
                      <tr>
                        <th className="py-2.5 px-3">Size</th>
                        <th className="py-2.5 px-3">Chest</th>
                        <th className="py-2.5 px-3">Length</th>
                        <th className="py-2.5 px-3">Shoulder</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 text-[#F2EFE9] tabular-nums">
                      {[
                        ['XS', '98', '66', '44'],
                        ['S', '104', '68', '46'],
                        ['M', '110', '71', '48'],
                        ['L', '116', '73', '50'],
                        ['XL', '122', '75', '52'],
                      ].map(([sz, ch, len, sh]) => (
                        <tr key={sz} className={size === sz ? 'bg-[#E03E36]/10' : ''}>
                          <td className="py-2 px-3 font-medium">{sz}</td>
                          <td className="py-2 px-3">{ch}</td>
                          <td className="py-2 px-3">{len}</td>
                          <td className="py-2 px-3">{sh}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// ---------- Gallery with Hover Detail Loupe + 360° ----------
function Gallery({
  product,
  styleIdx,
  colorIdx,
  artRef,
  onStyle,
}: {
  product: Product
  styleIdx: number
  colorIdx: number
  artRef: React.RefObject<HTMLDivElement>
  onStyle: (i: number) => void
}) {
  const { t } = useI18n()
  const [mode, setMode] = useState<'view' | '360'>('view')
  const [rot, setRot] = useState(0)
  const [hoverZoom, setHoverZoom] = useState(false)
  const [zoomEnabled, setZoomEnabled] = useState(true)
  const [origin, setOrigin] = useState({ x: 50, y: 50 })
  const [imgFailed, setImgFailed] = useState(false)

  const color = product.colors[colorIdx]
  const style = product.styles[styleIdx]
  const photos = getProductDemoPhotos(product.kind, 0)
  const activePhoto = photos[(colorIdx + styleIdx) % photos.length]
  const isZoomed = mode === 'view' && zoomEnabled && hoverZoom

  useEffect(() => {
    setImgFailed(false)
  }, [product.id])

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (mode !== 'view' || !zoomEnabled) return
    const r = e.currentTarget.getBoundingClientRect()
    const x = Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100))
    const y = Math.max(0, Math.min(100, ((e.clientY - r.top) / r.height) * 100))
    setOrigin({ x, y })
    if (!hoverZoom) setHoverZoom(true)
  }

  return (
    <div>
      <div
        ref={artRef}
        onMouseEnter={() => mode === 'view' && zoomEnabled && setHoverZoom(true)}
        onMouseMove={onMove}
        onMouseLeave={() => setHoverZoom(false)}
        onClick={() => {
          if (mode === 'view') {
            setZoomEnabled((z) => !z)
            setHoverZoom((z) => !z)
          }
        }}
        className={`relative aspect-[4/5] rounded-2xl overflow-hidden bg-[#141418] border border-white/12 ${
          mode === 'view' ? (isZoomed ? 'cursor-crosshair' : 'cursor-zoom-in') : ''
        }`}
      >
        <AnimatePresence mode="sync">
          <motion.div
            key={`${styleIdx}-${colorIdx}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            <div
              className="h-full w-full"
              style={{
                transform: mode === '360' ? `rotateY(${rot}deg)` : isZoomed ? 'scale(2.05)' : 'scale(1)',
                transformOrigin: `${origin.x}% ${origin.y}%`,
                transition: isZoomed
                  ? 'transform 0.18s cubic-bezier(0.16, 1, 0.3, 1)'
                  : 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {!imgFailed && activePhoto ? (
                <img
                  src={activePhoto}
                  alt={`${product.name} — ${color.name}`}
                  onError={() => setImgFailed(true)}
                  className="h-full w-full object-cover object-center select-none"
                  draggable={false}
                />
              ) : (
                <div className="h-full w-full grid place-items-center p-10">
                  <Garment
                    kind={product.kind}
                    color={color.hex}
                    color2={color.hex2}
                    accent={style.accent}
                    className="w-full max-w-md drop-shadow-2xl"
                  />
                </div>
              )}
            </div>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#09090B]/60 via-transparent to-black/20" />
          </motion.div>
        </AnimatePresence>

        {/* Top-left subtle zoom state indicator */}
        {mode === 'view' && (
          <div className="pointer-events-none absolute top-3.5 left-3.5 z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.16em] text-[#C7C1B8]">
              <span className={`h-1.5 w-1.5 rounded-full ${isZoomed ? 'bg-[#E03E36]' : 'bg-white/40'}`} />
              {isZoomed ? '2.0x Detail' : zoomEnabled ? 'Hover to Zoom' : 'Zoom Off'}
            </span>
          </div>
        )}

        {/* Controls */}
        <div className="absolute top-3.5 right-3.5 z-10 flex flex-col gap-2">
          {product.has360 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setMode((m) => (m === '360' ? 'view' : '360'))
                setHoverZoom(false)
              }}
              className={`grid place-items-center h-9 w-9 rounded-full bg-black/60 backdrop-blur-md border transition-colors ${
                mode === '360' ? 'border-[#E03E36] text-[#E03E36]' : 'border-white/15 text-[#C7C1B8] hover:text-[#F2EFE9]'
              }`}
              title={t('product.view360')}
            >
              <RotateCw size={15} />
            </button>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              if (mode === '360') setMode('view')
              setZoomEnabled((z) => !z)
              setHoverZoom((z) => !z)
            }}
            className={`grid place-items-center h-9 w-9 rounded-full bg-black/60 backdrop-blur-md border transition-colors ${
              zoomEnabled ? 'border-white/35 text-[#F2EFE9]' : 'border-white/15 text-[#9E988E] hover:text-[#F2EFE9]'
            }`}
            title={t('product.zoom')}
          >
            <ZoomIn size={15} />
          </button>
        </div>

        {mode === '360' && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-x-0 bottom-0 z-10 p-5 bg-gradient-to-t from-black/85 to-transparent"
          >
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-[#F2EFE9] mb-2">
              <RotateCw size={12} className="text-[#E03E36]" /> {t('product.view360')} — drag to rotate
            </div>
            <input
              type="range"
              min={-180}
              max={180}
              value={rot}
              onChange={(e) => setRot(Number(e.target.value))}
              className="w-full accent-[#E03E36]"
            />
          </div>
        )}
      </div>

      {/* Thumbnails */}
      <div className="mt-3 flex gap-2.5 overflow-x-auto no-scrollbar">
        {product.styles.map((s, i) => {
          const thumb = photos[(colorIdx + i) % photos.length]
          const active = styleIdx === i
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onStyle(i)}
              className={`shrink-0 h-20 w-20 rounded-xl border overflow-hidden bg-[#141418] transition-[border-color,transform] duration-150 active:scale-[0.96] ${
                active ? 'border-[#E03E36] ring-1 ring-[#E03E36]/40' : 'border-white/12 hover:border-white/30'
              }`}
              aria-label={s.name}
            >
              {!imgFailed && thumb ? (
                <img src={thumb} alt={s.name} className="h-full w-full object-cover object-center" />
              ) : (
                <div className="h-full w-full grid place-items-center p-2">
                  <Garment kind={product.kind} color={color.hex} color2={color.hex2} accent={s.accent} className="h-full" showDetail={false} />
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ---------- Reviews ----------
function Reviews({ product }: { product: Product }) {
  const { t } = useI18n()
  const { pushToast } = useUI()
  const [showForm, setShowForm] = useState(false)
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [extraReviews, setExtraReviews] = useState<Review[]>([])

  const allReviews = [...extraReviews, ...product.reviews]

  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: allReviews.filter((r) => Math.round(r.rating) === star).length,
  }))
  const totalShown = allReviews.length || 1

  return (
    <div>
      <div className="grid sm:grid-cols-[220px_1fr] gap-8 mb-8">
        <div className="text-center sm:text-left">
          <div className="font-display text-5xl font-semibold text-[#F2EFE9]">{product.rating.toFixed(1)}</div>
          <div className="mt-2 flex justify-center sm:justify-start"><Stars rating={product.rating} /></div>
          <div className="text-xs font-mono text-[#9E988E] mt-1.5">
            {t('product.reviewCount', { n: product.reviewCount + extraReviews.length })}
          </div>
          <button type="button" onClick={() => setShowForm((s) => !s)} className="btn-ghost btn-sm mt-4">
            <Star size={14} /> {t('product.writeReview')}
          </button>
        </div>
        <div className="space-y-2">
          {dist.map(({ star, count }) => (
            <div key={star} className="flex items-center gap-3 text-xs font-mono">
              <span className="w-8 text-[#9E988E] shrink-0">{star} ★</span>
              <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-[#E03E36] rounded-full transition-[width] duration-300" style={{ width: `${(count / totalShown) * 100}%` }} />
              </div>
              <span className="w-8 text-right text-[#9E988E] tabular-nums">{count}</span>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onSubmit={(e) => {
              e.preventDefault()
              const newRev: Review = {
                id: `user-${Date.now()}`,
                author: 'You',
                rating,
                date: 'Just now',
                title: title.trim(),
                body: body.trim(),
                verified: true,
              }
              setExtraReviews((prev) => [newRev, ...prev])
              setShowForm(false)
              setTitle('')
              setBody('')
              pushToast({ kind: 'success', title: 'Thank you!', desc: 'Your review was submitted.' })
            }}
            className="overflow-hidden mb-8"
          >
            <div className="rounded-2xl bg-[#0D0D10] border border-white/10 p-5 space-y-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button type="button" key={n} onClick={() => setRating(n)}>
                    <Star size={20} className={n <= rating ? 'text-[#C6A87C]' : 'text-white/20'} fill="currentColor" />
                  </button>
                ))}
              </div>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Review title" className="input" required />
              <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Share your thoughts..." rows={3} className="input" required />
              <button type="submit" className="btn-primary btn-sm">{t('product.writeReview')}</button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {allReviews.map((r) => (
          <div key={r.id} className="rounded-2xl bg-[#0D0D10] border border-white/10 p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-white/10 border border-white/15 grid place-items-center text-xs font-semibold text-[#F2EFE9]">
                  {r.author.split(' ').map((s) => s[0]).join('')}
                </div>
                <div>
                  <div className="text-sm text-[#F2EFE9] flex items-center gap-2">
                    {r.author}
                    {r.verified && (
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#C6A87C] flex items-center gap-1">
                        <Check size={10} /> {t('product.verified')}
                      </span>
                    )}
                  </div>
                  <Stars rating={r.rating} size={12} />
                </div>
              </div>
              <span className="text-xs font-mono text-[#9E988E]">{r.date}</span>
            </div>
            <h4 className="mt-3 text-sm font-medium text-[#F2EFE9]">{r.title}</h4>
            <p className="mt-1 text-sm text-[#9E988E] leading-relaxed">{r.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
