import { AnimatePresence, motion } from 'framer-motion'
import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { X, ShoppingBag, Zap, Wand2, ArrowRight } from 'lucide-react'
import type { Product } from '../types'
import { Garment } from './Garment'
import { Stars, Price, StockBadge } from './ui/bits'
import { useI18n } from '../i18n'
import { useAddToCart } from '../hooks/useAddToCart'
import { useNavigate } from 'react-router-dom'
import { useConfig } from '../store/config'
import { deliveryWindow } from '../lib/format'

export function QuickView({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const { t } = useI18n()
  const addToCart = useAddToCart()
  const navigate = useNavigate()
  const config = useConfig((s) => s.config)
  const [colorIdx, setColorIdx] = useState(0)
  const [styleIdx, setStyleIdx] = useState(0)
  const [size, setSize] = useState('')
  const artRef = useRef<HTMLDivElement>(null)

  return (
    <AnimatePresence>
      {product && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[62] bg-void-950/80 backdrop-blur-md" />
          <div className="fixed inset-0 z-[63] grid place-items-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 260, damping: 26 }}
              className="pointer-events-auto glass-strong rounded-3xl w-full max-w-3xl max-h-[88vh] overflow-y-auto shadow-glass relative"
            >
              <button onClick={onClose} className="absolute top-4 right-4 z-10 grid place-items-center h-9 w-9 rounded-full glass text-slate-300 hover:text-white" aria-label={t('action.close')}>
                <X size={18} />
              </button>
              <div className="grid md:grid-cols-2 gap-0">
                <div ref={artRef} className="relative aspect-square md:aspect-auto grid place-items-center p-8" style={{ background: `radial-gradient(120% 90% at 50% 20%, ${product.palette[0]}30, transparent 60%)` }}>
                  <Garment kind={product.kind} color={product.colors[colorIdx].hex} color2={product.colors[colorIdx].hex2} accent={product.styles[styleIdx].accent} className="w-full max-w-[280px] drop-shadow-2xl" />
                </div>
                <div className="p-6">
                  <StockBadge stock={product.stock} t={t} />
                  <h2 className="font-display text-2xl font-semibold mt-3">{product.name}</h2>
                  <div className="mt-2 flex items-center gap-3">
                    <Stars rating={product.rating} count={product.reviewCount} />
                  </div>
                  <div className="mt-3"><Price price={product.price} compareAt={product.compareAt} size="lg" /></div>

                  {/* Styles */}
                  <div className="mt-5">
                    <div className="label">{t('product.chooseStyle')}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {product.styles.map((s, i) => (
                        <button key={s.id} onClick={() => setStyleIdx(i)} className={`chip ${styleIdx === i ? 'border-aurora-400 text-white bg-aurora-500/15' : ''}`}>{s.name}</button>
                      ))}
                    </div>
                  </div>

                  {/* Colors */}
                  <div className="mt-4">
                    <div className="label">{t('product.color')}: <span className="text-slate-200 normal-case">{product.colors[colorIdx].name}</span></div>
                    <div className="flex flex-wrap gap-2">
                      {product.colors.map((c, i) => (
                        <button key={c.name} onClick={() => setColorIdx(i)} title={c.name} className={`h-8 w-8 rounded-full border transition-all ${colorIdx === i ? 'ring-2 ring-white ring-offset-2 ring-offset-void-800' : 'border-white/20'}`} style={{ background: c.hex2 ? `linear-gradient(135deg, ${c.hex}, ${c.hex2})` : c.hex }} />
                      ))}
                    </div>
                  </div>

                  {/* Sizes */}
                  <div className="mt-4">
                    <div className="label">{t('product.size')}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {product.sizes.map((s) => (
                        <button key={s} onClick={() => setSize(s)} className={`min-w-[42px] px-3 py-2 rounded-xl text-sm border transition-all ${size === s ? 'border-aurora-400 bg-aurora-500/15 text-white' : 'border-white/12 text-slate-300 hover:border-white/30'}`}>{s}</button>
                      ))}
                    </div>
                  </div>

                  <p className="mt-4 text-xs text-slate-400">{t('product.estDelivery')}: <span className="text-slate-200">{deliveryWindow(product.stock, config).label} {t('product.days')}</span></p>

                  <div className="mt-5 flex flex-col gap-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const r = artRef.current?.getBoundingClientRect()
                          addToCart(product, { styleId: product.styles[styleIdx].id, colorIdx, size, origin: r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : undefined })
                        }}
                        disabled={product.stock === 'out_of_stock'}
                        className="btn-primary flex-1"
                      >
                        <ShoppingBag size={17} /> {t('action.addToCart')}
                      </button>
                      <button
                        onClick={() => { addToCart(product, { styleId: product.styles[styleIdx].id, colorIdx, size }); navigate('/checkout') }}
                        disabled={product.stock === 'out_of_stock'}
                        className="btn-gold flex-1"
                      >
                        <Zap size={17} /> {t('action.buyNow')}
                      </button>
                    </div>
                    <div className="flex gap-2">
                      {product.customizable && (
                        <Link to={`/customize?product=${product.slug}`} onClick={onClose} className="btn-ghost btn-sm flex-1"><Wand2 size={15} /> {t('product.customizeThis')}</Link>
                      )}
                      <Link to={`/product/${product.slug}`} onClick={onClose} className="btn-ghost btn-sm flex-1">{t('action.viewProduct')} <ArrowRight size={15} /></Link>
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
