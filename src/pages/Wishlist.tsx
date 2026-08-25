import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Trash2, GitCompare, X, ShoppingBag } from 'lucide-react'
import { useWishlist } from '../store/wishlist'
import { useI18n } from '../i18n'
import { useHead } from '../lib/seo'
import { useAddToCart } from '../hooks/useAddToCart'
import { PRODUCT_BY_ID } from '../data/products'
import { ProductCard } from '../components/ProductCard'
import { QuickView } from '../components/QuickView'
import { SectionHeader } from '../components/Section'
import { Garment } from '../components/Garment'
import { Stars } from '../components/ui/bits'
import { formatMoney } from '../lib/format'
import { recommend } from '../lib/recommend'
import type { Product } from '../types'

export default function Wishlist() {
  const { t } = useI18n()
  const { ids, clear, compareIds, toggleCompare, clearCompare } = useWishlist()
  const addToCart = useAddToCart()
  const [quick, setQuick] = useState<Product | null>(null)
  const [showCompare, setShowCompare] = useState(false)

  const products = useMemo(() => ids.map((id) => PRODUCT_BY_ID[id]).filter(Boolean) as Product[], [ids])
  const compareProducts = useMemo(() => compareIds.map((id) => PRODUCT_BY_ID[id]).filter(Boolean) as Product[], [compareIds])
  const recos = useMemo(() => recommend({ wishlistIds: ids }, 4, ids), [ids])

  useHead({ title: `${t('wishlist.title')} — AEON`, description: t('wishlist.emptySub'), path: '/wishlist' })

  if (products.length === 0) {
    return (
      <div className="container-max section-pad">
        <div className="glass-card rounded-3xl py-20 text-center max-w-lg mx-auto">
          <div className="h-20 w-20 rounded-full bg-rose-500/10 grid place-items-center mx-auto mb-5"><Heart size={34} className="text-rose-300" /></div>
          <h1 className="font-display text-2xl font-semibold">{t('wishlist.empty')}</h1>
          <p className="text-slate-400 mt-2">{t('wishlist.emptySub')}</p>
          <Link to="/shop" className="btn-primary mt-6">{t('action.shopNow')}</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container-max section-pad">
      <div className="flex items-end justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold flex items-center gap-3"><Heart className="text-rose-400" fill="currentColor" size={30} /> {t('wishlist.title')}</h1>
          <p className="text-slate-400 mt-1">{products.length} {products.length === 1 ? t('cart.item') : t('cart.items')} saved</p>
        </div>
        <div className="flex gap-2">
          {compareProducts.length >= 2 && (
            <button onClick={() => setShowCompare((v) => !v)} className="btn-ghost btn-sm"><GitCompare size={15} /> {t('action.compare')} ({compareProducts.length})</button>
          )}
          <button onClick={clear} className="btn-ghost btn-sm text-slate-400 hover:text-rose-300"><Trash2 size={15} /> {t('action.clear')}</button>
        </div>
      </div>

      {/* Compare table */}
      <AnimatePresence>
        {showCompare && compareProducts.length >= 2 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-8">
            <div className="glass-strong rounded-3xl p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-semibold flex items-center gap-2"><GitCompare size={18} className="text-cyber-300" /> Compare {compareProducts.length} items</h2>
                <button onClick={() => { clearCompare(); setShowCompare(false) }} className="text-slate-500 hover:text-rose-300 text-sm flex items-center gap-1"><X size={14} /> {t('action.clear')}</button>
              </div>
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full min-w-[560px] text-sm">
                  <tbody>
                    <tr>
                      <th className="text-left text-xs text-slate-500 font-normal w-32 align-bottom pb-3"></th>
                      {compareProducts.map((p) => (
                        <td key={p.id} className="p-2 align-bottom">
                          <div className="relative glass rounded-2xl p-3">
                            <button onClick={() => toggleCompare(p.id)} className="absolute top-1.5 right-1.5 text-slate-500 hover:text-rose-300"><X size={13} /></button>
                            <Link to={`/product/${p.slug}`}><Garment kind={p.kind} color={p.colors[0].hex} color2={p.colors[0].hex2} accent={p.styles[0].accent} className="h-20 w-full" /></Link>
                            <Link to={`/product/${p.slug}`} className="text-xs text-white hover:text-aurora-200 line-clamp-2 mt-2 block">{p.name}</Link>
                          </div>
                        </td>
                      ))}
                    </tr>
                    <CompareRow label={t('filter.price')} cells={compareProducts.map((p) => <span key={p.id} className="font-display font-semibold text-gradient">{formatMoney(p.price)}</span>)} />
                    <CompareRow label={t('product.rating')} cells={compareProducts.map((p) => <div key={p.id} className="flex items-center gap-1.5"><Stars rating={p.rating} size={11} /><span className="text-xs text-slate-500">{p.rating}</span></div>)} />
                    <CompareRow label={t('filter.color')} cells={compareProducts.map((p) => <span key={p.id} className="text-slate-300">{p.colors.length} colors</span>)} />
                    <CompareRow label={t('product.fabric')} cells={compareProducts.map((p) => <span key={p.id} className="text-slate-300 text-xs">{p.fabrics.join(', ')}</span>)} />
                    <CompareRow label={t('filter.style')} cells={compareProducts.map((p) => <span key={p.id} className="text-slate-300">{p.styles.length} styles</span>)} />
                    <CompareRow label={t('filter.availability')} cells={compareProducts.map((p) => (
                      <span key={p.id} className={p.stock === 'in_stock' ? 'text-emerald-300' : p.stock === 'made_on_request' ? 'text-amber-300' : 'text-rose-300'}>
                        {p.stock === 'in_stock' ? t('product.inStock') : p.stock === 'made_on_request' ? t('product.madeOnRequest') : t('product.outOfStock')}
                      </span>
                    ))} />
                    <tr>
                      <th className="text-left text-xs text-slate-500 font-normal align-middle py-3">Action</th>
                      {compareProducts.map((p) => (
                        <td key={p.id} className="p-2">
                          <button onClick={() => addToCart(p)} disabled={p.stock === 'out_of_stock'} className="btn-primary btn-sm w-full disabled:opacity-40"><ShoppingBag size={13} /> {t('action.addToCart')}</button>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wishlist grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((p, i) => (
          <div key={p.id} className="relative">
            <ProductCard product={p} index={i} onQuickView={setQuick} />
            <button
              onClick={() => addToCart(p)}
              disabled={p.stock === 'out_of_stock'}
              className="btn-ghost btn-sm w-full mt-2 disabled:opacity-40"
            >
              <ShoppingBag size={14} /> {t('wishlist.moveToCart')}
            </button>
          </div>
        ))}
      </div>

      {/* You may also like */}
      {recos.length > 0 && (
        <section className="mt-14">
          <SectionHeader title={t('product.related')} sub={t('home.recommendedSub')} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recos.map(({ product, reasons }, i) => <ProductCard key={product.id} product={product} index={i} reason={reasons[0]} onQuickView={setQuick} />)}
          </div>
        </section>
      )}

      <QuickView product={quick} onClose={() => setQuick(null)} />
    </div>
  )
}

function CompareRow({ label, cells }: { label: string; cells: React.ReactNode[] }) {
  return (
    <tr className="border-t border-white/8">
      <th className="text-left text-xs text-slate-500 font-normal align-middle py-3 pr-2">{label}</th>
      {cells.map((c, i) => <td key={i} className="p-2 py-3 align-middle">{c}</td>)}
    </tr>
  )
}
