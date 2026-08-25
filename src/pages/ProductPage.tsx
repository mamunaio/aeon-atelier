import { useState, useRef, useMemo, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart, ShoppingBag, Zap, Wand2, Share2, GitCompare, RotateCw, ZoomIn, Check,
  Truck, ShieldCheck, RefreshCw, ChevronRight, Star, Plus, Minus,
} from 'lucide-react'
import { PRODUCT_BY_SLUG } from '../data/products'
import { boughtTogether, relatedProducts } from '../lib/recommend'
import { useI18n } from '../i18n'
import { useHead, productJsonLd, breadcrumbJsonLd } from '../lib/seo'
import { useConfig } from '../store/config'
import { useWishlist } from '../store/wishlist'
import { useUI } from '../store/ui'
import { useAddToCart } from '../hooks/useAddToCart'
import { Garment } from '../components/Garment'
import { Stars, Price, StockBadge } from '../components/ui/bits'
import { ProductCard } from '../components/ProductCard'
import { QuickView } from '../components/QuickView'
import { SectionHeader } from '../components/Section'
import { deliveryWindow, estDeliveryDate, formatMoney, timeAgo } from '../lib/format'
import { CATEGORIES } from '../data/categories'
import type { Product } from '../types'

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
  const [size, setSize] = useState('')
  const [fabricIdx, setFabricIdx] = useState(0)
  const [qty, setQty] = useState(1)
  const [tab, setTab] = useState<'description' | 'details' | 'shipping' | 'reviews'>('description')
  const [quick, setQuick] = useState<Product | null>(null)

  useEffect(() => {
    if (product) { addRecent(product.id); setStep('style') }
    setStyleIdx(0); setColorIdx(0); setSize(''); setFabricIdx(0); setQty(1); setTab('description')
  }, [product?.id])

  useHead({
    title: product ? `${product.name} — AEON Atelier` : 'Product — AEON',
    description: product?.description,
    path: product ? `/product/${product.slug}` : '/shop',
    jsonLd: product ? productJsonLd(product) : null,
  })

  if (!product) {
    return (
      <div className="container-max section-pad text-center">
        <p className="text-slate-300 text-lg">Product not found.</p>
        <Link to="/shop" className="btn-primary mt-4">{t('nav.shop')}</Link>
      </div>
    )
  }

  const style = product.styles[styleIdx]
  const color = product.colors[colorIdx]
  const dw = deliveryWindow(product.stock, config)
  const wished = wishlist.has(product.id)
  const inCompare = wishlist.inCompare(product.id)
  const cat = CATEGORIES.find((c) => c.id === product.category)
  const related = relatedProducts(product, 4)
  const fbt = boughtTogether(product, 3)
  const artRef = useRef<HTMLDivElement>(null)

  const handleAdd = (buyNow = false) => {
    const r = artRef.current?.getBoundingClientRect()
    addToCart(product, {
      styleId: style.id, colorIdx, size, fabric: product.fabrics[fabricIdx], qty,
      origin: buyNow ? undefined : r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : undefined,
    })
    if (buyNow) navigate('/checkout')
  }

  const share = async () => {
    const url = window.location.href
    try {
      if (navigator.share) await navigator.share({ title: product.name, url })
      else { await navigator.clipboard.writeText(url); pushToast({ kind: 'info', title: 'Link copied', desc: product.name }) }
    } catch { /* dismissed */ }
  }

  return (
    <div className="container-max section-pad">
      {/* Breadcrumb */}
      <nav className="text-xs text-slate-500 mb-5 flex items-center gap-1.5 flex-wrap">
        <Link to="/" className="hover:text-white">{t('nav.home')}</Link> <ChevronRight size={12} />
        <Link to="/shop" className="hover:text-white">{t('nav.shop')}</Link> <ChevronRight size={12} />
        {cat && <><Link to={`/shop?category=${cat.id}`} className="hover:text-white">{cat.name}</Link> <ChevronRight size={12} /></>}
        <span className="text-slate-300 truncate">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-8 xl:gap-14">
        {/* Gallery */}
        <Gallery product={product} styleIdx={styleIdx} colorIdx={colorIdx} artRef={artRef} onStyle={setStyleIdx} />

        {/* Details */}
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <StockBadge stock={product.stock} t={t} />
            {product.collections.includes('limited') && <span className="chip bg-gold-500/15 text-gold-300 border-gold-500/30">Limited Edition</span>}
            {product.collections.includes('new') && <span className="chip bg-cyber-400/15 text-cyber-200 border-cyber-400/30">{t('misc.new')}</span>}
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-semibold mt-3">{product.name}</h1>
          <div className="mt-2 flex items-center gap-4">
            <button onClick={() => setTab('reviews')} className="flex items-center gap-2 hover:opacity-80">
              <Stars rating={product.rating} />
              <span className="text-sm text-slate-400 underline-offset-2 hover:underline">{t('product.reviewCount', { n: product.reviewCount })}</span>
            </button>
          </div>

          <div className="mt-4"><Price price={product.price} compareAt={product.compareAt} size="lg" /></div>
          {product.stock === 'in_stock' && product.stockCount <= 12 && (
            <p className="mt-2 text-sm text-amber-300">{t('product.lowStock', { n: product.stockCount })}</p>
          )}

          {/* Styles — horizontal selector (≥5) */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="label !mb-0">{t('product.chooseStyle')}</span>
              <span className="text-xs text-slate-500">{product.styles.length} {t('product.styles')}</span>
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {product.styles.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setStyleIdx(i)}
                  className={`shrink-0 rounded-2xl border p-2 w-24 text-center transition-all ${styleIdx === i ? 'border-aurora-400 bg-aurora-500/10 shadow-glow' : 'border-white/12 hover:border-white/30'}`}
                >
                  <div className="h-16 grid place-items-center">
                    <Garment kind={product.kind} color={color.hex} color2={color.hex2} accent={s.accent} className="h-full" showDetail={false} />
                  </div>
                  <div className={`text-[11px] mt-1 truncate ${styleIdx === i ? 'text-white' : 'text-slate-400'}`}>{s.name}</div>
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-1.5">{style.tagline} · {style.fit}</p>
          </div>

          {/* Colors */}
          <div className="mt-5">
            <div className="label">{t('product.color')}: <span className="text-slate-200 normal-case tracking-normal">{color.name}</span></div>
            <div className="flex flex-wrap gap-2.5">
              {product.colors.map((c, i) => (
                <button key={c.name} onClick={() => setColorIdx(i)} title={c.name}
                  className={`h-9 w-9 rounded-full border transition-all ${colorIdx === i ? 'ring-2 ring-white ring-offset-2 ring-offset-void-900' : 'border-white/20 hover:scale-110'}`}
                  style={{ background: c.hex2 ? `linear-gradient(135deg, ${c.hex}, ${c.hex2})` : c.hex }} />
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div className="mt-5">
            <div className="flex items-center justify-between">
              <span className="label">{t('product.size')}</span>
              <button className="text-xs text-cyber-300 hover:underline">{t('product.sizeGuide')}</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button key={s} onClick={() => setSize(s)}
                  className={`min-w-[48px] px-3.5 py-2.5 rounded-xl text-sm border transition-all ${size === s ? 'border-aurora-400 bg-aurora-500/15 text-white' : 'border-white/12 text-slate-300 hover:border-white/30'}`}>{s}</button>
              ))}
            </div>
          </div>

          {/* Fabric */}
          {product.fabrics.length > 1 && (
            <div className="mt-5">
              <div className="label">{t('product.fabric')}</div>
              <div className="flex flex-wrap gap-2">
                {product.fabrics.map((f, i) => (
                  <button key={f} onClick={() => setFabricIdx(i)} className={`chip ${fabricIdx === i ? 'border-aurora-400 text-white bg-aurora-500/15' : ''}`}>{f}</button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity + delivery */}
          <div className="mt-6 flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="label !mb-0">{t('product.quantity')}</span>
              <div className="flex items-center glass rounded-xl">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="h-10 w-10 grid place-items-center text-slate-300 hover:text-white"><Minus size={15} /></button>
                <span className="w-8 text-center text-white tabular-nums">{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} className="h-10 w-10 grid place-items-center text-slate-300 hover:text-white"><Plus size={15} /></button>
              </div>
            </div>
          </div>

          <div className="mt-4 glass-card rounded-2xl p-4 flex items-start gap-3">
            <Truck size={18} className="text-cyber-300 mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="text-slate-200">{t('product.estDelivery')}: </span>
              <span className="text-white font-medium">{dw.label} {t('product.days')}</span>
              <span className="text-slate-400"> · {product.stock === 'in_stock' ? t('delivery.fast') : t('delivery.request')}</span>
              <div className="text-xs text-slate-500 mt-0.5">Arrives around {estDeliveryDate(dw.max)}</div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-2.5">
            <div className="flex gap-2.5">
              <button onClick={() => handleAdd(false)} disabled={product.stock === 'out_of_stock'} className="btn-primary flex-1 !py-3.5">
                <ShoppingBag size={18} /> {t('action.addToCart')}
              </button>
              <button onClick={() => handleAdd(true)} disabled={product.stock === 'out_of_stock'} className="btn-gold flex-1 !py-3.5">
                <Zap size={18} /> {t('action.buyNow')}
              </button>
            </div>
            <div className="flex gap-2.5">
              <button onClick={() => { wishlist.toggle(product.id); pushToast({ kind: wished ? 'info' : 'success', title: wished ? t('action.remove') : t('action.addToWishlist'), desc: product.name }) }}
                className={`btn-ghost btn-sm flex-1 ${wished ? '!border-rose-400/40 !text-rose-300' : ''}`}>
                <Heart size={15} fill={wished ? 'currentColor' : 'none'} /> {wished ? t('action.remove') : t('action.addToWishlist')}
              </button>
              <button onClick={() => wishlist.toggleCompare(product.id)} className={`btn-ghost btn-sm flex-1 ${inCompare ? '!border-cyber-400/40 !text-cyber-200' : ''}`}>
                <GitCompare size={15} /> {t('action.compare')}
              </button>
              <button onClick={share} className="btn-ghost btn-sm px-3" aria-label={t('action.share')}><Share2 size={15} /></button>
            </div>
            {product.customizable && (
              <Link to={`/customize?product=${product.slug}`} className="btn bg-aurora-500/15 border border-aurora-400/30 text-aurora-100 hover:bg-aurora-500/25">
                <Wand2 size={17} /> {t('product.customizeThis')}
              </Link>
            )}
          </div>

          {/* Trust icons */}
          <div className="mt-6 grid grid-cols-3 gap-2 text-center">
            {[{ i: ShieldCheck, l: t('home.trustSecure') }, { i: Truck, l: t('home.trustFast') }, { i: RefreshCw, l: t('footer.returns') }].map((it, k) => (
              <div key={k} className="glass rounded-xl py-3 flex flex-col items-center gap-1">
                <it.i size={17} className="text-cyber-300" />
                <span className="text-[11px] text-slate-400">{it.l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-14">
        <div className="flex gap-1 border-b border-white/10 overflow-x-auto no-scrollbar">
          {([['description', t('product.description')], ['details', t('product.details')], ['shipping', t('product.shipping')], ['reviews', `${t('product.reviews')} (${product.reviewCount})`]] as const).map(([k, label]) => (
            <button key={k} onClick={() => setTab(k)} className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${tab === k ? 'border-aurora-400 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>{label}</button>
          ))}
        </div>

        <div className="py-6 max-w-3xl">
          {tab === 'description' && <p className="text-slate-300 leading-relaxed">{product.description}</p>}
          {tab === 'details' && (
            <ul className="grid sm:grid-cols-2 gap-3">
              {[
                ['Brand', product.brand], ['Category', cat?.name ?? ''], ['Gender', product.gender],
                ['Fabrics', product.fabrics.join(', ')], ['Available styles', product.styles.map((s) => s.name).join(', ')],
                ['Colors', product.colors.map((c) => c.name).join(', ')],
              ].map(([k, v]) => (
                <li key={k} className="glass rounded-xl px-4 py-3 flex justify-between gap-3">
                  <span className="text-slate-400 text-sm">{k}</span><span className="text-slate-200 text-sm text-right capitalize">{v}</span>
                </li>
              ))}
            </ul>
          )}
          {tab === 'shipping' && (
            <div className="space-y-3 text-slate-300">
              <p className="flex items-start gap-2"><Check size={16} className="text-emerald-400 mt-1 shrink-0" /> {t('delivery.fast')} — dispatched within 24 hours.</p>
              <p className="flex items-start gap-2"><Check size={16} className="text-emerald-400 mt-1 shrink-0" /> {t('delivery.request')} — hand-finished to order.</p>
              <p className="flex items-start gap-2"><Check size={16} className="text-emerald-400 mt-1 shrink-0" /> Free shipping over {formatMoney(config.freeShippingThreshold)}. Flat {formatMoney(config.flatShipping)} otherwise.</p>
              <p className="flex items-start gap-2"><Check size={16} className="text-emerald-400 mt-1 shrink-0" /> 14-day easy returns on unworn items.</p>
            </div>
          )}
          {tab === 'reviews' && <Reviews product={product} />}
        </div>
      </div>

      {/* Frequently bought together */}
      {fbt.length > 0 && (
        <section className="mt-12">
          <SectionHeader title={t('product.boughtTogether')} />
          <div className="glass-card rounded-3xl p-5 sm:p-6 flex flex-col lg:flex-row items-center gap-6">
            <div className="flex items-center gap-3 flex-wrap justify-center">
              {[product, ...fbt].map((p, i) => (
                <div key={p.id} className="flex items-center gap-3">
                  <Link to={`/product/${p.slug}`} className="glass rounded-2xl p-3 w-28 hover:scale-105 transition-transform">
                    <Garment kind={p.kind} color={p.colors[0].hex} color2={p.colors[0].hex2} accent={p.styles[0].accent} className="w-full" />
                    <div className="text-[11px] text-slate-300 truncate mt-1">{p.name}</div>
                    <div className="text-[11px] text-white font-medium">{formatMoney(p.price)}</div>
                  </Link>
                  {i < fbt.length && <Plus size={18} className="text-slate-500 shrink-0" />}
                </div>
              ))}
            </div>
            <div className="lg:ml-auto text-center lg:text-right">
              <div className="text-sm text-slate-400">{t('product.total')}</div>
              <div className="font-display text-2xl font-semibold">{formatMoney([product, ...fbt].reduce((n, p) => n + p.price, 0))}</div>
              <button
                onClick={() => { [product, ...fbt].forEach((p) => addToCart(p, {})); pushToast({ kind: 'cart', title: t('product.addAll'), desc: `${fbt.length + 1} ${t('cart.items')}` }) }}
                className="btn-primary btn-sm mt-3"
              >
                <ShoppingBag size={15} /> {t('product.addAll')}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-14">
          <SectionHeader title={t('product.related')} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} onQuickView={setQuick} />)}
          </div>
        </section>
      )}

      <QuickView product={quick} onClose={() => setQuick(null)} />
    </div>
  )
}

// ---------- Gallery with 360° + zoom ----------
function Gallery({ product, styleIdx, colorIdx, artRef, onStyle }: {
  product: Product; styleIdx: number; colorIdx: number; artRef: React.RefObject<HTMLDivElement>; onStyle: (i: number) => void
}) {
  const { t } = useI18n()
  const [mode, setMode] = useState<'view' | '360'>('view')
  const [rot, setRot] = useState(0)
  const [zoom, setZoom] = useState(false)
  const [origin, setOrigin] = useState({ x: 50, y: 50 })
  const color = product.colors[colorIdx]
  const style = product.styles[styleIdx]

  const onMove = (e: React.MouseEvent) => {
    if (!zoom || mode === '360') return
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setOrigin({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 })
  }

  return (
    <div>
      <div
        ref={artRef}
        onMouseMove={onMove}
        onMouseLeave={() => setZoom(false)}
        className="relative aspect-square rounded-3xl overflow-hidden glass-card cursor-zoom-in"
        style={{ background: `radial-gradient(120% 90% at 50% 15%, ${product.palette[0]}2e, transparent 60%), radial-gradient(90% 80% at 80% 90%, ${product.palette[1]}22, transparent 55%)` }}
        onClick={() => mode === 'view' && setZoom((z) => !z)}
      >
        <motion.div
          key={`${styleIdx}-${colorIdx}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0 grid place-items-center p-10"
          style={{
            transform: mode === '360'
              ? `rotateY(${rot}deg)`
              : zoom ? 'scale(1.9)' : 'scale(1)',
            transformOrigin: `${origin.x}% ${origin.y}%`,
            transition: 'transform 0.25s ease-out',
          }}
        >
          <Garment kind={product.kind} color={color.hex} color2={color.hex2} accent={style.accent} className="w-full max-w-md drop-shadow-2xl" />
        </motion.div>

        {/* Controls */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {product.has360 && (
            <button
              onClick={(e) => { e.stopPropagation(); setMode((m) => (m === '360' ? 'view' : '360')); setZoom(false) }}
              className={`grid place-items-center h-10 w-10 rounded-full glass-strong transition-colors ${mode === '360' ? 'text-cyber-300' : 'text-slate-300'}`}
              title={t('product.view360')}
            ><RotateCw size={17} /></button>
          )}
          <div className="grid place-items-center h-10 w-10 rounded-full glass-strong text-slate-300" title={t('product.zoom')}><ZoomIn size={17} /></div>
        </div>

        {mode === '360' && (
          <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-void-950/80 to-transparent">
            <div className="flex items-center gap-2 text-xs text-cyber-300 mb-1.5"><RotateCw size={12} /> {t('product.view360')} — drag to rotate</div>
            <input type="range" min={-180} max={180} value={rot} onChange={(e) => setRot(Number(e.target.value))} className="w-full accent-cyber-500" />
          </div>
        )}
      </div>

      {/* Thumbnails = styles */}
      <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
        {product.styles.map((s, i) => (
          <button key={s.id} onClick={() => onStyle(i)}
            className={`shrink-0 h-20 w-20 rounded-2xl border grid place-items-center p-2 transition-all ${styleIdx === i ? 'border-aurora-400 bg-aurora-500/10' : 'border-white/12 hover:border-white/30'}`}>
            <Garment kind={product.kind} color={color.hex} color2={color.hex2} accent={s.accent} className="h-full" showDetail={false} />
          </button>
        ))}
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

  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: product.reviews.filter((r) => Math.round(r.rating) === star).length,
  }))
  const totalShown = product.reviews.length || 1

  return (
    <div>
      <div className="grid sm:grid-cols-[240px_1fr] gap-8 mb-8">
        <div className="text-center sm:text-left">
          <div className="font-display text-5xl font-bold">{product.rating.toFixed(1)}</div>
          <div className="mt-2 flex justify-center sm:justify-start"><Stars rating={product.rating} /></div>
          <div className="text-sm text-slate-400 mt-1">{t('product.reviewCount', { n: product.reviewCount })}</div>
          <button onClick={() => setShowForm((s) => !s)} className="btn-ghost btn-sm mt-4"><Star size={14} /> {t('product.writeReview')}</button>
        </div>
        <div className="space-y-1.5">
          {dist.map(({ star, count }) => (
            <div key={star} className="flex items-center gap-3 text-sm">
              <span className="w-10 text-slate-400 shrink-0">{star} ★</span>
              <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-gold-gradient rounded-full" style={{ width: `${(count / totalShown) * 100}%` }} />
              </div>
              <span className="w-8 text-right text-slate-500 text-xs">{count}</span>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            onSubmit={(e) => { e.preventDefault(); setShowForm(false); setTitle(''); setBody(''); pushToast({ kind: 'success', title: 'Thank you!', desc: 'Your review was submitted.' }) }}
            className="overflow-hidden mb-8"
          >
            <div className="glass-card rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button type="button" key={n} onClick={() => setRating(n)}><Star size={22} className={n <= rating ? 'text-gold-400' : 'text-white/20'} fill="currentColor" /></button>
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
        {product.reviews.map((r) => (
          <div key={r.id} className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-aurora-gradient grid place-items-center text-xs font-semibold text-white">{r.author.split(' ').map((s) => s[0]).join('')}</div>
                <div>
                  <div className="text-sm text-white flex items-center gap-2">{r.author} {r.verified && <span className="text-[10px] text-emerald-300 flex items-center gap-0.5"><Check size={10} /> {t('product.verified')}</span>}</div>
                  <Stars rating={r.rating} size={12} />
                </div>
              </div>
              <span className="text-xs text-slate-500">{r.date}</span>
            </div>
            <h4 className="mt-3 text-sm font-medium text-slate-100">{r.title}</h4>
            <p className="mt-1 text-sm text-slate-400 leading-relaxed">{r.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
