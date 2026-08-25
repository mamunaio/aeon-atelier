import { Link } from 'react-router-dom'
import { useRef, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { Garment } from './Garment'
import type { Category } from '../types'

export function SectionHeader({
  eyebrow,
  title,
  sub,
  to,
  linkLabel,
}: {
  eyebrow?: string
  title: string
  sub?: string
  to?: string
  linkLabel?: string
}) {
  return (
    <div className="flex items-end justify-between gap-4 mb-6">
      <div>
        {eyebrow && <div className="text-xs uppercase tracking-[0.25em] text-cyber-300/80 mb-2">{eyebrow}</div>}
        <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">{title}</h2>
        {sub && <p className="text-slate-400 mt-1.5 text-sm sm:text-base">{sub}</p>}
      </div>
      {to && linkLabel && (
        <Link to={to} className="hidden sm:inline-flex items-center gap-1.5 text-sm text-slate-300 hover:text-white shrink-0 group">
          {linkLabel}
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  )
}

/** Horizontal, snap-scrolling rail with arrow controls (desktop). */
export function Rail({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const scroll = (dir: number) => {
    ref.current?.scrollBy({ left: dir * (ref.current.clientWidth * 0.8), behavior: 'smooth' })
  }
  return (
    <div className="relative group/rail">
      <div ref={ref} className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2 -mx-1 px-1">
        {children}
      </div>
      <button
        onClick={() => scroll(-1)}
        className="hidden lg:grid place-items-center absolute -left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full glass-strong text-white opacity-0 group-hover/rail:opacity-100 transition-opacity"
        aria-label="Previous"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={() => scroll(1)}
        className="hidden lg:grid place-items-center absolute -right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full glass-strong text-white opacity-0 group-hover/rail:opacity-100 transition-opacity"
        aria-label="Next"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  )
}

export function CategoryCard({ category, index = 0 }: { category: Category; index?: number }) {
  return (
    <Link
      to={`/shop?category=${category.id}`}
      className="group relative glass-card rounded-2xl p-4 flex flex-col items-center text-center overflow-hidden"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-aurora-gradient/10" style={{ background: 'radial-gradient(80% 60% at 50% 0%, rgba(123,77,255,0.18), transparent 70%)' }} />
      <div className="relative h-24 w-24 grid place-items-center transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3">
        <Garment kind={category.kind} color="#2a2a3a" color2="#3a3a52" accent="#7b4dff" className="h-full w-full" showDetail={false} />
      </div>
      <div className="relative mt-3 text-sm font-medium text-slate-200 group-hover:text-white">{category.name}</div>
    </Link>
  )
}
