import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, Eye, ShoppingBag, Zap, Wand2, GitCompare } from 'lucide-react'
import type { Product } from '../types'
import { Garment } from './Garment'
import { Stars, Price, ColorDots, StockBadge } from './ui/bits'
import { useWishlist } from '../store/wishlist'
import { useI18n } from '../i18n'
import { useAddToCart } from '../hooks/useAddToCart'
import { useUI } from '../store/ui'
import { discountPct } from '../lib/format'

interface Props {
  product: Product
  onQuickView?: (p: Product) => void
  index?: number
  reason?: string
}

export function ProductCard({ product, onQuickView, index = 0, reason }: Props) {
  const { t } = useI18n()
  const navigate = useNavigate()
  const wishlist = useWishlist()
  const addToCart = useAddToCart()
  const { pushToast } = useUI()
  const [colorIdx, setColorIdx] = useState(0)
  const [styleIdx, setStyleIdx] = useState(0)
  const [hover, setHover] = useState(false)
  const artRef = useRef<HTMLDivElement>(null)

  const wished = wishlist.has(product.id)
  const inCompare = wishlist.inCompare(product.id)
  const color = product.colors[colorIdx]
  const style = product.styles[styleIdx]
  const pct = discountPct(product.price, product.compareAt)
  const isNew = product.collections.includes('new')
  const soldOut = product.stock === 'out_of_stock'

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    const rect = artRef.current?.getBoundingClientRect()
    addToCart(product, {
      styleId: style.id,
      colorIdx,
      origin: rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : undefined,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.04, 0.3), ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="group relative"
    >
      <Link to={`/product/${product.slug}`} className="block">
        <div className="relative glass-card overflow-hidden rounded-3xl">
          {/* Badges */}
          <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5">
            {isNew && <span className="chip bg-cyber-400/20 text-cyber-200 border-cyber-400/30 !py-1">{t('misc.new')}</span>}
            {pct && <span className="chip bg-aurora-500/25 text-aurora-100 border-aurora-400/40 !py-1">-{pct}% {t('misc.off')}</span>}
            {product.collections.includes('limited') && <span className="chip bg-gold-500/20 text-gold-300 border-gold-500/30 !py-1">Limited</span>}
          </div>

          {/* Wishlist + compare */}
          <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5">
            <button
              onClick={(e) => { e.preventDefault(); wishlist.toggle(product.id); pushToast({ kind: wished ? 'info' : 'success', title: wished ? t('action.remove') : t('action.addToWishlist'), desc: product.name }) }}
              className={`grid place-items-center h-9 w-9 rounded-full backdrop-blur-md border transition-all ${
                wished ? 'bg-rose-500/20 border-rose-400/40 text-rose-300' : 'bg-void-900/50 border-white/15 text-slate-300 hover:text-rose-300'
              }`}
              aria-label={t('action.addToWishlist')}
            >
              <motion.span animate={wished ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.35 }}>
                <Heart size={16} fill={wished ? 'currentColor' : 'none'} />
              </motion.span>
            </button>
            <motion.button
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: hover ? 1 : 0, x: hover ? 0 : 10 }}
              onClick={(e) => { e.preventDefault(); wishlist.toggleCompare(product.id) }}
              className={`grid place-items-center h-9 w-9 rounded-full backdrop-blur-md border transition-colors ${
                inCompare ? 'bg-cyber-400/20 border-cyber-400/40 text-cyber-200' : 'bg-void-900/50 border-white/15 text-slate-300'
              }`}
              aria-label={t('action.compare')}
            >
              <GitCompare size={15} />
            </motion.button>
          </div>

          {/* Art */}
          <div ref={artRef} className="relative aspect-[4/5] overflow-hidden" style={{ background: `radial-gradient(120% 90% at 50% 10%, ${product.palette[0]}22, transparent 60%), radial-gradient(100% 80% at 80% 90%, ${product.palette[1]}18, transparent 55%)` }}>
            <motion.div
              key={styleIdx}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35 }}
              className="absolute inset-0 grid place-items-center p-6"
            >
              <Garment
                kind={product.kind}
                color={color.hex}
                color2={color.hex2}
                accent={style.accent}
                className={`h-full w-full drop-shadow-2xl transition-transform duration-500 ${hover ? 'scale-105 -rotate-1' : ''}`}
              />
            </motion.div>

            {soldOut && (
              <div className="absolute inset-0 grid place-items-center bg-void-950/40 backdrop-blur-[1px]">
                <span className="chip bg-void-900/80 text-rose-300 border-rose-400/30">{t('product.outOfStock')}</span>
              </div>
            )}

            {/* Hover quick actions */}
            <motion.div
              initial={false}
              animate={{ opacity: hover ? 1 : 0, y: hover ? 0 : 12 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-x-3 bottom-3 z-10 flex gap-2"
            >
              <button onClick={handleAdd} disabled={soldOut} className="btn-primary btn-sm flex-1 !rounded-xl">
                <ShoppingBag size={15} /> {t('action.addToCart')}
              </button>
              {onQuickView && (
                <button
                  onClick={(e) => { e.preventDefault(); onQuickView(product) }}
                  className="grid place-items-center h-9 w-9 rounded-xl glass-strong text-white shrink-0"
                  aria-label={t('action.quickView')}
                >
                  <Eye size={16} />
                </button>
              )}
              {product.customizable && (
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/customize?product=${product.slug}`) }}
                  className="grid place-items-center h-9 w-9 rounded-xl glass-strong text-aurora-300 shrink-0"
                  aria-label={t('product.customizeThis')}
                >
                  <Wand2 size={16} />
                </button>
              )}
            </motion.div>
          </div>

          {/* Info */}
          <div className="p-4">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <Stars rating={product.rating} size={12} />
              <span className="text-[11px] text-slate-500">{t('product.reviewCount', { n: product.reviewCount })}</span>
            </div>
            <h3 className="font-medium text-sm text-white truncate">{product.name}</h3>
            {reason && <p className="text-[11px] text-cyber-300/90 mt-0.5 truncate">✦ {reason}</p>}
            <div className="mt-2 flex items-center justify-between gap-2">
              <Price price={product.price} compareAt={product.compareAt} size="sm" />
            </div>

            {/* Style pills + colors */}
            <div className="mt-3 flex items-center justify-between gap-2">
              <ColorDots colors={product.colors} activeIdx={colorIdx} onPick={setColorIdx} />
              <div className="flex items-center gap-1">
                {product.styles.slice(0, 5).map((s, i) => (
                  <button
                    key={s.id}
                    onClick={(e) => { e.preventDefault(); setStyleIdx(i) }}
                    title={s.name}
                    className={`h-1.5 rounded-full transition-all ${styleIdx === i ? 'w-4 bg-aurora-gradient' : 'w-1.5 bg-white/20 hover:bg-white/40'}`}
                    aria-label={s.name}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Buy now (flies out on hover) */}
      <motion.div initial={false} animate={{ opacity: hover ? 1 : 0 }} className="pointer-events-none absolute -bottom-3 inset-x-4 z-0">
        <div className="h-6 rounded-b-3xl bg-aurora-500/10 blur-md" />
      </motion.div>
    </motion.div>
  )
}
