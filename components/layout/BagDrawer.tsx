'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { X, Plus, Minus, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react'
import { Link } from '../../lib/router'
import { useCart } from '../../store/cart'
import { useConfig } from '../../store/config'
import { useCurrency, getCurrencyMeta } from '../../store/currency'
import { formatMoney } from '../../lib/format'
import { Garment } from '../Garment'
import { useI18n } from '../../i18n'

interface BagDrawerProps {
  open: boolean
  onClose: () => void
}

export function BagDrawer({ open, onClose }: BagDrawerProps) {
  const { t } = useI18n()
  const { items, setQty, remove, subtotal } = useCart()
  const { config } = useConfig()
  const code = useCurrency((s) => s.code)
  const meta = getCurrencyMeta(code)

  const sub = subtotal()
  const threshold = config.freeShippingThreshold
  const pct = Math.min(100, Math.round((sub / threshold) * 100))
  const totalCount = items.reduce((s, i) => s + i.qty, 0)

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.34, ease: [0.32, 0.72, 0, 1] }}
            aria-label="Shopping Bag"
            className="relative w-full max-w-md bg-[#0E0E12] border-l border-white/15 h-full flex flex-col shadow-2xl"
          >
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShoppingBag size={18} className="text-[#E03E36]" />
                <span className="font-display font-semibold tracking-tight text-[#F2EFE9]">
                  {t('nav.cart')} ({totalCount})
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full text-[#9E988E] hover:text-white hover:bg-white/5 active:scale-[0.95] transition-colors"
                aria-label={t('action.close')}
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-5 py-3 bg-white/[0.03] border-b border-white/10">
              <div className="flex justify-between text-xs text-[#9E988E] mb-1.5">
                <span>
                  {sub >= threshold
                    ? 'Complimentary Express Courier Unlocked'
                    : `Add ${formatMoney(threshold - sub, code)} for Free Express`}
                </span>
                <span className="tabular-nums text-[#F2EFE9]">{pct}%</span>
              </div>
              <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full bg-[#E03E36]"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <ShoppingBag size={36} className="text-[#9E988E]/40 mb-3" />
                  <p className="text-sm text-[#9E988E]">{t('cart.empty')}</p>
                  <Link to="/shop" onClick={onClose} className="btn-primary btn-sm mt-4">
                    {t('action.shopNow')}
                  </Link>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 24 }}
                      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                      className="flex gap-3.5 p-3 rounded-xl bg-white/[0.03] border border-white/10"
                    >
                      <div className="w-16 h-20 rounded-lg bg-[#09090B] p-1.5 grid place-items-center shrink-0">
                        <Garment kind={item.kind} color={item.colorHex} className="w-12" />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div className="flex justify-between gap-2">
                          <div className="min-w-0">
                            <Link to="/shop" onClick={onClose} className="text-sm font-medium text-[#F2EFE9] hover:text-[#E03E36] truncate block">
                              {item.name}
                            </Link>
                            <div className="text-[11px] text-[#9E988E]">
                              {item.colorName} · {item.size}
                            </div>
                          </div>
                          <span className="text-sm font-medium tabular-nums shrink-0 text-[#F2EFE9]">
                            {formatMoney(item.price * item.qty, code)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setQty(item.id, item.qty - 1)}
                              className="rounded border border-white/15 p-1 hover:border-white/40 active:scale-[0.95]"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={11} />
                            </button>
                            <span className="text-xs tabular-nums px-1.5">{item.qty}</span>
                            <button
                              type="button"
                              onClick={() => setQty(item.id, item.qty + 1)}
                              className="rounded border border-white/15 p-1 hover:border-white/40 active:scale-[0.95]"
                              aria-label="Increase quantity"
                            >
                              <Plus size={11} />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => remove(item.id)}
                            className="p-1 text-[#9E988E] hover:text-[#E03E36] transition-colors"
                            aria-label={t('action.remove')}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {items.length > 0 && (
              <div className="p-5 border-t border-white/10 bg-[#09090B] space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[#9E988E]">Subtotal ({meta.code})</span>
                  <span className="font-semibold tabular-nums text-[#F2EFE9]">{formatMoney(sub, code)}</span>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <Link to="/cart" onClick={onClose} className="btn-ghost btn-sm text-center justify-center">
                    View Bag
                  </Link>
                  <Link
                    to="/checkout"
                    onClick={onClose}
                    className="btn-primary btn-sm text-center justify-center !bg-[#E03E36] !text-white hover:!bg-[#c8322b]"
                  >
                    Checkout <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  )
}
