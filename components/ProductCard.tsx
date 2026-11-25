'use client'

import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from '../lib/router'
import { motion } from 'framer-motion'
import { Heart, Eye, ShoppingBag, Wand2, GitCompare } from 'lucide-react'
import type { Product } from '../types'
import { Garment } from './Garment'
import { getProductDemoPhotos } from '../data/productImages'
import { Price, ColorDots } from './ui/bits'
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
  const { pushToast, reduceMotion } = useUI()
  const [colorIdx, setColorIdx] = useState(0)
  const [styleIdx, setStyleIdx] = useState(0)
  const [hover, setHover] = useState(false)
  const [imgFailed, setImgFailed] = useState(false)
  const artRef = useRef<HTMLDivElement>(null)

  // Gently auto-cycle garment colorways when idle (staggered per card, paused on hover)
  useEffect(() => {
    if (hover || reduceMotion || (product.colors.length <= 1 && product.styles.length <= 1)) return
    const delay = 5500 + (index % 5) * 900
    const id = setInterval(() => {
      if (product.colors.length > 1) {
        setColorIdx((prev) => (prev + 1) % product.colors.length)
      }
      if (product.styles.length > 1) {
        setStyleIdx((prev) => (prev + 1) % product.styles.length)
      }
    }, delay)
    return () => clearInterval(id)
  }, [hover, reduceMotion, product.colors.length, product.styles.length, index])

  const wished = wishlist.has(product.id)
  const inCompare = wishlist.inCompare(product.id)
  const color = product.colors[colorIdx]
  const style = product.styles[styleIdx]
  const pct = discountPct(product.price, product.compareAt)
  const photos = getProductDemoPhotos(product.kind, index)
  const activePhoto = photos[(colorIdx + styleIdx) % photos.length]
  const isNew = product.collections.includes('new')
  const isLimited = product.collections.includes('limited')
  const soldOut = product.stock === 'out_of_stock'

  // Single restrained editorial tag (no stacked discount pills)
  const editorialTag = pct
    ? { label: `−${pct}%`, accent: true }
    : isLimited
      ? { label: 'Limited', accent: false }
      : isNew
        ? { label: t('misc.new'), accent: false }
        : null

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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.04, 0.28), ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="group relative"
    >
      <Link to={`/product/${product.slug}`} className="block">
        <div className="relative overflow-hidden rounded-2xl bg-[#0D0D10] border border-white/10 hover:border-white/25 transition-[border-color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.65)]">
          {/* Top-left single editorial tag */}
          {editorialTag && (
            <div className="absolute top-3.5 left-3.5 z-20 inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.18em]">
              <span className={`h-1 w-1 rounded-full ${editorialTag.accent ? 'bg-[#E03E36]' : 'bg-[#9E988E]'}`} />
              <span className={editorialTag.accent ? 'text-[#E03E36] font-semibold' : 'text-[#C7C1B8]'}>
                {editorialTag.label}
              </span>
            </div>
          )}

          {/* Top-right Wishlist + Compare */}
          <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                wishlist.toggle(product.id)
                pushToast({
                  kind: wished ? 'info' : 'success',
                  title: wished ? t('action.remove') : t('action.addToWishlist'),
                  desc: product.name,
                })
              }}
              className={`grid place-items-center h-8 w-8 rounded-full border backdrop-blur-md transition-[background-color,border-color,color,transform] duration-200 active:scale-[0.94] ${wished
                  ? 'bg-[#E03E36]/15 border-[#E03E36]/40 text-[#E03E36]'
                  : 'bg-black/45 border-white/10 text-[#B4AEA4] hover:text-[#F2EFE9] hover:border-white/25'
                }`}
              aria-label={t('action.addToWishlist')}
            >
              <Heart size={14} fill={wished ? 'currentColor' : 'none'} />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                wishlist.toggleCompare(product.id)
              }}
              className={`grid place-items-center h-8 w-8 rounded-full border backdrop-blur-md transition-[opacity,transform,background-color,border-color,color] duration-200 active:scale-[0.94] ${hover || inCompare ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 pointer-events-none'
                } ${inCompare
                  ? 'bg-white/15 border-white/35 text-[#F2EFE9]'
                  : 'bg-black/45 border-white/10 text-[#B4AEA4] hover:text-[#F2EFE9] hover:border-white/25'
                }`}
              aria-label={t('action.compare')}
            >
              <GitCompare size={13} />
            </button>
          </div>

          {/* Studio Garment Frame */}
          <div
            ref={artRef}
            className="relative aspect-[4/5] overflow-hidden bg-gradient-to-b from-white/[0.025] via-transparent to-black/30"
          >
            <motion.div
              key={`${styleIdx}-${colorIdx}`}
              initial={{ opacity: 0.35, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 bg-[#16161B]"
            >
              {!imgFailed ? (
                <img
                  src={activePhoto}
                  alt={`${product.name} — ${color.name}`}
                  loading="lazy"
                  onError={() => setImgFailed(true)}
                  className="h-full w-full object-cover object-center brightness-95 group-hover:brightness-100 group-hover:scale-[1.04] transition-[filter,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                />
              ) : (
                <div className="h-full w-full grid place-items-center p-7">
                  <Garment
                    kind={product.kind}
                    color={color.hex}
                    color2={color.hex2}
                    accent={style.accent}
                    className="h-full w-full drop-shadow-[0_18px_32px_rgba(0,0,0,0.65)] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                  />
                </div>
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0D0D10]/80 via-transparent to-black/25" />
            </motion.div>

            {soldOut && (
              <div className="absolute inset-0 grid place-items-center bg-black/55 backdrop-blur-[2px]">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C7C1B8] border border-white/20 bg-[#0D0D10]/90 px-3 py-1 rounded-full">
                  {t('product.outOfStock')}
                </span>
              </div>
            )}

            {/* Hover quick actions */}
            <div
              className={`absolute inset-x-3 bottom-3 z-10 flex gap-2 transition-[opacity,transform] duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] ${hover ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
                }`}
            >
              <button
                type="button"
                onClick={handleAdd}
                disabled={soldOut}
                className="flex-1 inline-flex items-center justify-center gap-2 h-9 px-3 rounded-xl bg-[#F2EFE9] text-[#09090B] hover:bg-[#E03E36] hover:text-white text-xs font-semibold active:scale-[0.98] transition-[background-color,color,transform] duration-200 disabled:opacity-40"
              >
                <ShoppingBag size={14} />
                {t('action.addToCart')}
              </button>
              {onQuickView && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    onQuickView(product)
                  }}
                  className="grid place-items-center h-9 w-9 rounded-xl bg-[#0E0E12]/90 border border-white/15 hover:border-white/35 text-[#F2EFE9] shrink-0 active:scale-[0.96] transition-[border-color,transform] duration-150"
                  aria-label={t('action.quickView')}
                >
                  <Eye size={15} />
                </button>
              )}
              {product.customizable && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    navigate(`/customize?product=${product.slug}`)
                  }}
                  className="grid place-items-center h-9 w-9 rounded-xl bg-[#0E0E12]/90 border border-white/15 hover:border-[#C6A87C]/60 text-[#C6A87C] shrink-0 active:scale-[0.96] transition-[border-color,transform] duration-150"
                  aria-label={t('product.customizeThis')}
                >
                  <Wand2 size={15} />
                </button>
              )}
            </div>
          </div>

          {/* Info Footer */}
          <div className="p-4 border-t border-white/[0.06]">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium text-sm text-[#F2EFE9] truncate">{product.name}</h3>
              <span className="text-[11px] font-mono text-[#9E988E] tabular-nums shrink-0">
                ★ {product.rating.toFixed(1)}
              </span>
            </div>

            {reason && (
              <p className="text-[11px] text-[#9E988E] mt-0.5 truncate">{reason}</p>
            )}

            <div className="mt-1.5 flex items-center justify-between gap-2">
              <Price price={product.price} compareAt={product.compareAt} size="sm" />
            </div>

            {/* Swatches + Minimal Style Hairlines */}
            <div className="mt-3 flex items-center justify-between gap-2">
              <ColorDots colors={product.colors} activeIdx={colorIdx} onPick={setColorIdx} />
              {product.styles.length > 1 && (
                <div className="flex items-center gap-1">
                  {product.styles.slice(0, 5).map((s, i) => (
                    <button
                      key={s.id}
                      type="button"
                      onMouseEnter={() => setStyleIdx(i)}
                      onClick={(e) => {
                        e.preventDefault()
                        setStyleIdx(i)
                      }}
                      title={s.name}
                      className={`h-1 rounded-full transition-[width,background-color] duration-200 ${styleIdx === i ? 'w-3.5 bg-[#E03E36]' : 'w-1.5 bg-white/15 hover:bg-white/35'
                        }`}
                      aria-label={s.name}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
