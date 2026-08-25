import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Plus, Minus, ShoppingBag, Tag, ArrowRight, Truck, Wand2, X, Check } from 'lucide-react'
import { useCart } from '../store/cart'
import { useConfig, evaluateCoupon } from '../store/config'
import { useI18n } from '../i18n'
import { useHead } from '../lib/seo'
import { Garment } from '../components/Garment'
import { formatMoney } from '../lib/format'
import { PRODUCT_BY_ID } from '../data/products'
import { ProductCard } from '../components/ProductCard'
import { QuickView } from '../components/QuickView'
import { SectionHeader } from '../components/Section'
import { recommend } from '../lib/recommend'
import type { Product } from '../types'

export default function Cart() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { items, setQty, remove, subtotal } = useCart()
  const { config, coupons } = useConfig()
  const [code, setCode] = useState('')
  const [applied, setApplied] = useState<{ code: string; discount: number; freeShip: boolean } | null>(null)
  const [couponError, setCouponError] = useState('')
  const [quick, setQuick] = useState<Product | null>(null)

  const sub = subtotal()
  const hasRequestItem = items.some((i) => i.stock === 'made_on_request')

  const discount = applied?.discount ?? 0
  const freeShipCoupon = applied?.freeShip ?? false
  const shipping = sub === 0 ? 0 : freeShipCoupon || sub - discount >= config.freeShippingThreshold ? 0 : config.flatShipping
  const total = Math.max(0, sub - discount) + shipping

  const recos = useMemo(
    () => recommend({ cartProductIds: items.map((i) => i.productId) }, 4, items.map((i) => i.productId)),
    [items]
  )

  const applyCoupon = () => {
    setCouponError('')
    const res = evaluateCoupon(code, sub, coupons)
    if (!res.ok) {
      setApplied(null)
      setCouponError(res.reason === 'minSpend' ? t('cart.couponInvalid') + ` (min ${formatMoney(res.min!)})` : t('cart.couponInvalid'))
      return
    }
    setApplied({ code: code.toUpperCase(), discount: res.discount ?? 0, freeShip: res.freeShip ?? false })
  }

  useHead({ title: `${t('cart.title')} — AEON`, description: 'Your shopping bag.', path: '/cart' })

  if (items.length === 0) {
    return (
      <div className="container-max section-pad">
        <div className="glass-card rounded-3xl py-20 text-center max-w-lg mx-auto">
          <div className="h-20 w-20 rounded-full bg-aurora-500/10 grid place-items-center mx-auto mb-5">
            <ShoppingBag size={34} className="text-aurora-300" />
          </div>
          <h1 className="font-display text-2xl font-semibold">{t('cart.empty')}</h1>
          <p className="text-slate-400 mt-2">{t('cart.emptySub')}</p>
          <Link to="/shop" className="btn-primary mt-6">{t('action.shopNow')} <ArrowRight size={16} /></Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container-max section-pad">
      <h1 className="font-display text-3xl sm:text-4xl font-semibold mb-1">{t('cart.title')}</h1>
      <p className="text-slate-400 mb-8">{items.reduce((n, i) => n + i.qty, 0)} {items.length === 1 ? t('cart.item') : t('cart.items')}</p>

      <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">
        {/* Lines */}
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {items.map((item) => {
              const p = PRODUCT_BY_ID[item.productId]
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -30, height: 0, marginBottom: 0 }}
                  className="glass-card rounded-2xl p-4 flex gap-4"
                >
                  <Link to={p ? `/product/${p.slug}` : '/shop'} className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-xl glass grid place-items-center shrink-0 p-2" style={{ background: `radial-gradient(90% 80% at 50% 20%, ${item.colorHex}22, transparent)` }}>
                    <Garment kind={item.kind} color={item.colorHex} className="h-full w-full" />
                    {item.customization && <span className="absolute -top-1.5 -right-1.5 h-6 w-6 grid place-items-center rounded-full bg-aurora-gradient text-white"><Wand2 size={12} /></span>}
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link to={p ? `/product/${p.slug}` : '/shop'} className="font-medium text-white hover:text-aurora-200 truncate block">{item.name}</Link>
                        <div className="text-xs text-slate-400 mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                          <span>{item.styleName}</span>
                          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full border border-white/20" style={{ background: item.colorHex }} /> {item.colorName}</span>
                          <span>{t('product.size')}: {item.size}</span>
                          <span>{item.fabric}</span>
                        </div>
                        {item.customizationLabel && <div className="mt-1 text-xs text-aurora-300 flex items-center gap-1"><Wand2 size={11} /> {item.customizationLabel}</div>}
                      </div>
                      <button onClick={() => remove(item.id)} className="text-slate-500 hover:text-rose-400 p-1 shrink-0" aria-label={t('cart.removeItem')}><Trash2 size={16} /></button>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center glass rounded-lg">
                        <button onClick={() => setQty(item.id, item.qty - 1)} className="h-8 w-8 grid place-items-center text-slate-300 hover:text-white"><Minus size={14} /></button>
                        <span className="w-7 text-center text-sm text-white tabular-nums">{item.qty}</span>
                        <button onClick={() => setQty(item.id, item.qty + 1)} className="h-8 w-8 grid place-items-center text-slate-300 hover:text-white"><Plus size={14} /></button>
                      </div>
                      <div className="text-right">
                        <div className="font-display font-semibold">{formatMoney(item.price * item.qty)}</div>
                        {item.qty > 1 && <div className="text-[11px] text-slate-500">{formatMoney(item.price)} {t('misc.each')}</div>}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>

          <Link to="/shop" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white mt-2">← {t('checkout.continueShopping')}</Link>
        </div>

        {/* Summary */}
        <div className="lg:sticky lg:top-24 space-y-4">
          <div className="glass-strong rounded-2xl p-5">
            <h2 className="font-display text-lg font-semibold mb-4">{t('checkout.orderSummary')}</h2>

            {/* Coupon */}
            <div className="mb-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input value={code} onChange={(e) => setCode(e.target.value)} placeholder={t('cart.coupon')} className="input !pl-9 !py-2.5 text-sm uppercase" />
                </div>
                <button onClick={applyCoupon} className="btn-ghost btn-sm">{t('action.apply')}</button>
              </div>
              {applied && (
                <div className="mt-2 flex items-center justify-between text-xs text-emerald-300">
                  <span className="flex items-center gap-1"><Check size={12} /> {applied.code} — {t('cart.couponApplied')}</span>
                  <button onClick={() => { setApplied(null); setCode('') }} className="text-slate-500 hover:text-rose-400"><X size={13} /></button>
                </div>
              )}
              {couponError && <p className="mt-2 text-xs text-rose-400">{couponError}</p>}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {coupons.filter((c) => c.active).slice(0, 3).map((c) => (
                  <button key={c.code} onClick={() => setCode(c.code)} className="chip !text-[10px] hover:border-white/30">{c.code}</button>
                ))}
              </div>
            </div>

            <div className="space-y-2.5 text-sm border-t border-white/10 pt-4">
              <Row label={t('cart.subtotal')} value={formatMoney(sub)} />
              {discount > 0 && <Row label={t('cart.discount')} value={`− ${formatMoney(discount)}`} accent="text-emerald-300" />}
              <Row label={t('cart.shipping')} value={shipping === 0 ? t('cart.free') : formatMoney(shipping)} accent={shipping === 0 ? 'text-emerald-300' : undefined} />
            </div>

            {sub < config.freeShippingThreshold && !freeShipCoupon && (
              <div className="mt-3 text-xs text-slate-400">
                <div className="flex items-center gap-1.5 mb-1.5"><Truck size={13} className="text-cyber-300" /> Add {formatMoney(config.freeShippingThreshold - sub)} for free shipping</div>
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden"><div className="h-full bg-cyber-gradient rounded-full transition-all" style={{ width: `${Math.min(100, (sub / config.freeShippingThreshold) * 100)}%`, background: 'linear-gradient(90deg,#12d3e0,#7b4dff)' }} /></div>
              </div>
            )}

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
              <span className="font-medium">{t('cart.total')}</span>
              <span className="font-display text-2xl font-semibold text-gradient">{formatMoney(total)}</span>
            </div>

            <div className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
              <Truck size={13} className="text-cyber-300" />
              {t('cart.estDelivery')}: {hasRequestItem ? `${config.requestMinDays}–${config.requestMaxDays}` : `${config.inStockMinDays}–${config.inStockMaxDays}`} {t('product.days')}
            </div>

            <button onClick={() => navigate('/checkout', { state: applied ? { coupon: applied } : undefined })} className="btn-primary w-full mt-5 !py-3.5">
              {t('cart.proceed')} <ArrowRight size={17} />
            </button>
          </div>

          <div className="glass-card rounded-2xl p-4 text-xs text-slate-400 space-y-2">
            <p className="flex items-center gap-2"><Check size={13} className="text-emerald-400" /> {t('home.trustSecure')}</p>
            <p className="flex items-center gap-2"><Check size={13} className="text-emerald-400" /> {config.payments.filter((p) => p.enabled).length} payment methods available</p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {recos.length > 0 && (
        <section className="mt-14">
          <SectionHeader title={t('home.recommended')} sub={t('home.recommendedSub')} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recos.map(({ product, reasons }, i) => <ProductCard key={product.id} product={product} index={i} reason={reasons[0]} onQuickView={setQuick} />)}
          </div>
        </section>
      )}

      <QuickView product={quick} onClose={() => setQuick(null)} />
    </div>
  )
}

function Row({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-400">{label}</span>
      <span className={accent ?? 'text-slate-200'}>{value}</span>
    </div>
  )
}
