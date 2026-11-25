'use client'

import { Star } from 'lucide-react'
import type { ColorOption, StockStatus } from '../../types'
import { formatMoney, discountPct } from '../../lib/format'
import { useCurrency } from '../../store/currency'

export function Stars({ rating, count, size = 14 }: { rating: number; count?: number; size?: number }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex" aria-label={`${rating} out of 5`}>
        {[0, 1, 2, 3, 4].map((i) => {
          const fill = Math.max(0, Math.min(1, rating - i))
          return (
            <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
              <Star size={size} className="absolute inset-0 text-white/15" fill="currentColor" />
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Star size={size} className="text-gold-400" fill="currentColor" />
              </span>
            </span>
          )
        })}
      </div>
      {count != null && <span className="text-xs text-slate-400">({count})</span>}
    </div>
  )
}

export function Price({ price, compareAt, size = 'md' }: { price: number; compareAt?: number; symbol?: string; size?: 'sm' | 'md' | 'lg' }) {
  const code = useCurrency((s) => s.code)
  const pct = discountPct(price, compareAt)
  const cls = size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-sm' : 'text-base'
  return (
    <div className="flex items-baseline gap-2 tabular-nums">
      <span className={`font-display font-semibold ${cls}`}>{formatMoney(price, code)}</span>
      {pct && (
        <>
          <span className="text-sm text-slate-500 line-through">{formatMoney(compareAt!, code)}</span>
          <span className="text-xs font-semibold text-[#E03E36]">-{pct}%</span>
        </>
      )}
    </div>
  )
}

export function ColorDots({ colors, max = 5, activeIdx, onPick }: { colors: ColorOption[]; max?: number; activeIdx?: number; onPick?: (i: number) => void }) {
  const shown = colors.slice(0, max)
  const extra = colors.length - shown.length
  return (
    <div className="flex items-center gap-1.5">
      {shown.map((c, i) => (
        <button
          key={c.name + i}
          type="button"
          title={c.name}
          onClick={onPick ? (e) => { e.preventDefault(); e.stopPropagation(); onPick(i) } : undefined}
          className={`h-4 w-4 rounded-full border transition-transform ${activeIdx === i ? 'ring-2 ring-white ring-offset-1 ring-offset-void-900 scale-110' : 'border-white/25'} ${onPick ? 'cursor-pointer hover:scale-125' : ''}`}
          style={{ background: c.hex2 ? `linear-gradient(135deg, ${c.hex}, ${c.hex2})` : c.hex }}
          aria-label={c.name}
        />
      ))}
      {extra > 0 && <span className="text-[10px] text-slate-400">+{extra}</span>}
    </div>
  )
}

export function StockBadge({ stock, t }: { stock: StockStatus; t: (k: string) => string }) {
  const map = {
    in_stock: { label: t('product.inStock'), cls: 'text-emerald-300 border-emerald-400/30 bg-emerald-400/10', dot: 'bg-emerald-400' },
    made_on_request: { label: t('product.madeOnRequest'), cls: 'text-amber-300 border-amber-400/30 bg-amber-400/10', dot: 'bg-amber-400' },
    out_of_stock: { label: t('product.outOfStock'), cls: 'text-rose-300 border-rose-400/30 bg-rose-400/10', dot: 'bg-rose-400' },
  }[stock]
  return (
    <span className={`chip ${map.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${map.dot}`} />
      {map.label}
    </span>
  )
}
