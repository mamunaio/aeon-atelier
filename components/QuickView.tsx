'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from '../lib/router'
import { X, ShoppingBag, Zap, Wand2, ArrowRight } from 'lucide-react'
import type { Product } from '../types'
import { Garment } from './Garment'
import { Price, StockBadge } from './ui/bits'
import { useI18n } from '../i18n'
import { useAddToCart } from '../hooks/useAddToCart'
import { useConfig } from '../store/config'
import { deliveryWindow } from '../lib/format'
import { getProductDemoPhotos } from '../data/productImages'

export function QuickView({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const { t } = useI18n()
  const addToCart = useAddToCart()
  const navigate = useNavigate()
  const config = useConfig((s) => s.config)
  const [colorIdx, setColorIdx] = useState(0)
  const [styleIdx, setStyleIdx] = useState(0)
  const [size, setSize] = useState('')
  const [imgFailed, setImgFailed] = useState(false)
  const artRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!product) return
    setColorIdx(0)
    setStyleIdx(0)
    setSize(product.sizes[0] ?? '')
    setImgFailed(false)
  }, [product?.id])

  useEffect(() => {
    if (!product) return
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [product, onClose])

  const safeColorIdx = product ? Math.min(colorIdx, Math.max(0, product.colors.length - 1)) : 0
  const safeStyleIdx = product ? Math.min(styleIdx, Math.max(0, product.styles.length - 1)) : 0
  const photos = product ? getProductDemoPhotos(product.kind, 0) : []
  const activePhoto = photos.length > 0 ? photos[(safeColorIdx + safeStyleIdx) % photos.length] : ''
  const selectedColor = product?.colors[safeColorIdx]
  const selectedStyle = product?.styles[safeStyleIdx]

  return (
    <AnimatePresence>
      {product && selectedColor && selectedStyle && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[62] bg-black/75 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-[63] grid place-items-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto bg-[#0B0B0E] border border-white/15 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-[0_32px_80px_rgba(0,0,0,0.92)] relative"
            >
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 z-20 grid place-items-center h-9 w-9 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[#C7C1B8] hover:text-[#F2EFE9] hover:border-white/35 active:scale-[0.95] transition-[color,border-color,transform] duration-150"
                aria-label={t('action.close')}
              >
                <X size={17} />
              </button>

              <div className="grid md:grid-cols-12 gap-0">
                {/* Left: Studio Product Photo */}
                <div
                  ref={artRef}
                  className="md:col-span-6 relative aspect-[4/5] md:aspect-auto md:min-h-[460px] bg-[#141418] overflow-hidden border-b md:border-b-0 md:border-r border-white/10"
                >
                  <AnimatePresence mode="sync">
                    <motion.div
                      key={`${safeStyleIdx}-${safeColorIdx}`}
                      initial={{ opacity: 0, scale: 1.03 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute inset-0"
                    >
                      {!imgFailed && activePhoto ? (
                        <img
                          src={activePhoto}
                          alt={`${product.name} — ${selectedColor.name}`}
                          onError={() => setImgFailed(true)}
                          className="h-full w-full object-cover object-center"
                        />
                      ) : (
                        <div className="h-full w-full grid place-items-center p-8">
                          <Garment
                            kind={product.kind}
                            color={selectedColor.hex}
                            color2={selectedColor.hex2}
                            accent={selectedStyle.accent}
                            className="w-full max-w-[260px] drop-shadow-2xl"
                          />
                        </div>
                      )}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0B0B0E]/85 via-transparent to-black/25" />
                    </motion.div>
                  </AnimatePresence>

                  {/* Bottom-left photo caption */}
                  <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.18em] text-[#C7C1B8]">
                    <span>{selectedStyle.name}</span>
                    <span className="text-[#9E988E]">★ {product.rating.toFixed(1)}</span>
                  </div>
                </div>

                {/* Right: Details & Selection */}
                <div className="md:col-span-6 p-6 sm:p-7 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2.5 pr-8">
                      <StockBadge stock={product.stock} t={t} />
                      <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#9E988E]">
                        {product.brand}
                      </span>
                    </div>

                    <h2 className="font-display text-2xl font-semibold tracking-tight text-[#F2EFE9] mt-3">
                      {product.name}
                    </h2>

                    <div className="mt-2.5">
                      <Price price={product.price} compareAt={product.compareAt} size="lg" />
                    </div>

                    {/* Styles */}
                    <div className="mt-5">
                      <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#9E988E] mb-2">
                        {t('product.chooseStyle')}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {product.styles.map((s, i) => {
                          const active = safeStyleIdx === i
                          return (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => setStyleIdx(i)}
                              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-[background-color,border-color,color,transform] duration-150 active:scale-[0.97] ${
                                active
                                  ? 'bg-[#F2EFE9] text-[#09090B] border-[#F2EFE9]'
                                  : 'bg-white/[0.03] border-white/12 text-[#C7C1B8] hover:border-white/30 hover:text-[#F2EFE9]'
                              }`}
                            >
                              {s.name}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Colors */}
                    <div className="mt-4">
                      <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#9E988E] mb-2">
                        {t('product.color')}:{' '}
                        <span className="text-[#F2EFE9] normal-case font-sans text-xs ml-1">
                          {selectedColor.name}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {product.colors.map((c, i) => {
                          const active = safeColorIdx === i
                          return (
                            <button
                              key={c.name}
                              type="button"
                              onClick={() => setColorIdx(i)}
                              title={c.name}
                              aria-label={c.name}
                              className={`h-7 w-7 rounded-full border transition-transform duration-150 active:scale-[0.92] ${
                                active
                                  ? 'ring-2 ring-[#F2EFE9] ring-offset-2 ring-offset-[#0B0B0E] border-transparent scale-105'
                                  : 'border-white/20 hover:scale-105'
                              }`}
                              style={{ background: c.hex2 ? `linear-gradient(135deg, ${c.hex}, ${c.hex2})` : c.hex }}
                            />
                          )
                        })}
                      </div>
                    </div>

                    {/* Sizes */}
                    <div className="mt-4">
                      <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#9E988E] mb-2">
                        {t('product.size')}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {product.sizes.map((s) => {
                          const active = size === s
                          return (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setSize(s)}
                              className={`min-w-[40px] px-3 py-1.5 rounded-xl text-xs font-medium border transition-[background-color,border-color,color,transform] duration-150 active:scale-[0.97] ${
                                active
                                  ? 'border-[#E03E36] bg-[#E03E36]/15 text-[#F2EFE9]'
                                  : 'border-white/12 bg-white/[0.02] text-[#C7C1B8] hover:border-white/30 hover:text-[#F2EFE9]'
                              }`}
                            >
                              {s}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <p className="mt-4 text-xs text-[#9E988E]">
                      {t('product.estDelivery')}:{' '}
                      <span className="text-[#F2EFE9] font-medium">
                        {deliveryWindow(product.stock, config).label} {t('product.days')}
                      </span>
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 pt-4 border-t border-white/10 flex flex-col gap-2">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const r = artRef.current?.getBoundingClientRect()
                          addToCart(product, {
                            styleId: selectedStyle.id,
                            colorIdx: safeColorIdx,
                            size,
                            origin: r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : undefined,
                          })
                        }}
                        disabled={product.stock === 'out_of_stock'}
                        className="btn-primary flex-1 !py-2.5 text-xs"
                      >
                        <ShoppingBag size={15} /> {t('action.addToCart')}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          addToCart(product, {
                            styleId: selectedStyle.id,
                            colorIdx: safeColorIdx,
                            size,
                          })
                          onClose()
                          navigate('/checkout')
                        }}
                        disabled={product.stock === 'out_of_stock'}
                        className="btn-gold flex-1 !py-2.5 text-xs"
                      >
                        <Zap size={15} /> {t('action.buyNow')}
                      </button>
                    </div>
                    <div className="flex gap-2">
                      {product.customizable && (
                        <Link
                          to={`/customize?product=${product.slug}`}
                          onClick={onClose}
                          className="btn-ghost !py-2 text-xs flex-1"
                        >
                          <Wand2 size={14} /> {t('product.customizeThis')}
                        </Link>
                      )}
                      <Link
                        to={`/product/${product.slug}`}
                        onClick={onClose}
                        className="btn-ghost !py-2 text-xs flex-1"
                      >
                        {t('action.viewProduct')} <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
