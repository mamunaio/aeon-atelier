'use client'

import { Link } from '../lib/router'
import { useRef, useState, useEffect, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight, ArrowRight, ArrowUpRight } from 'lucide-react'
import { Garment } from './Garment'
import { getProductDemoPhotos } from '../data/productImages'
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
    <div className="flex items-end justify-between gap-4 mb-7">
      <div>
        {eyebrow && (
          <div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.22em] text-[#9E988E] mb-2">
            <span className="h-1 w-1 rounded-full bg-[#E03E36]" />
            {eyebrow}
          </div>
        )}
        <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-[-0.02em] text-[#F2EFE9]">
          {title}
        </h2>
        {sub && <p className="text-[#9E988E] mt-1.5 text-sm sm:text-base">{sub}</p>}
      </div>
      {to && linkLabel && (
        <Link
          to={to}
          className="hidden sm:inline-flex items-center gap-2.5 rounded-full bg-[#0E0E12] border border-white/15 hover:border-white/35 hover:bg-white/[0.06] pl-4 pr-2 py-1.5 text-xs font-medium tracking-wide text-[#F2EFE9] shrink-0 group active:scale-[0.97] transition-[background-color,border-color,transform] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]"
        >
          <span>{linkLabel}</span>
          <span className="h-6 w-6 rounded-full bg-white/10 group-hover:bg-[#E03E36] grid place-items-center transition-colors duration-200">
            <ArrowRight
              size={12}
              className="text-[#F2EFE9] transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5"
            />
          </span>
        </Link>
      )}
    </div>
  )
}

/** Horizontal, snap-scrolling rail with smart arrow controls & hairline progress track. */
export function Rail({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(true)
  const [progress, setProgress] = useState(0)

  const syncScroll = () => {
    const el = ref.current
    if (!el) return
    const max = Math.max(0, el.scrollWidth - el.clientWidth)
    setCanPrev(el.scrollLeft > 4)
    setCanNext(el.scrollLeft < max - 4)
    setProgress(max > 0 ? Math.min(1, Math.max(0, el.scrollLeft / max)) : 0)
  }

  useEffect(() => {
    syncScroll()
    window.addEventListener('resize', syncScroll)
    return () => window.removeEventListener('resize', syncScroll)
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return
      const max = el.scrollWidth - el.clientWidth
      if (max <= 0) return
      const atStart = el.scrollLeft <= 1
      const atEnd = el.scrollLeft >= max - 1
      if ((e.deltaY > 0 && !atEnd) || (e.deltaY < 0 && !atStart)) {
        e.preventDefault()
        el.scrollLeft += e.deltaY
      }
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  const scroll = (dir: number) => {
    ref.current?.scrollBy({ left: dir * (ref.current.clientWidth * 0.8), behavior: 'smooth' })
  }

  return (
    <div className="relative group/rail">
      <div
        ref={ref}
        onScroll={syncScroll}
        className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-3 -mx-1 px-1"
      >
        {children}
      </div>

      {/* Subtle architectural scroll-progress hairline */}
      <div className="mt-2 h-[2px] w-full rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className="h-full rounded-full bg-[#E03E36] transition-[width] duration-150 ease-out"
          style={{ width: `${Math.max(18, progress * 100)}%` }}
        />
      </div>

      {canPrev && (
        <button
          type="button"
          onClick={() => scroll(-1)}
          className="hidden lg:grid place-items-center absolute -left-4 top-[46%] -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-[#0E0E12] border border-white/15 hover:border-[#E03E36] hover:bg-[#E03E36] text-[#F2EFE9] opacity-0 group-hover/rail:opacity-100 active:scale-[0.94] transition-[opacity,background-color,border-color,transform] duration-200 shadow-2xl"
          aria-label="Previous"
        >
          <ChevronLeft size={18} />
        </button>
      )}
      {canNext && (
        <button
          type="button"
          onClick={() => scroll(1)}
          className="hidden lg:grid place-items-center absolute -right-4 top-[46%] -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-[#0E0E12] border border-white/15 hover:border-[#E03E36] hover:bg-[#E03E36] text-[#F2EFE9] opacity-0 group-hover/rail:opacity-100 active:scale-[0.94] transition-[opacity,background-color,border-color,transform] duration-200 shadow-2xl"
          aria-label="Next"
        >
          <ChevronRight size={18} />
        </button>
      )}
    </div>
  )
}

export function CategoryCard({ category, index = 0 }: { category: Category; index?: number }) {
  const [imgFailed, setImgFailed] = useState(false)
  const photo = getProductDemoPhotos(category.kind, index)[0]
  const num = String(index + 1).padStart(2, '0')

  return (
    <Link
      to={`/shop?category=${category.id}`}
      className="group relative rounded-2xl bg-[#0D0D10] border border-white/10 hover:border-white/25 hover:shadow-[0_14px_34px_rgba(0,0,0,0.65)] overflow-hidden flex flex-col active:scale-[0.985] transition-[border-color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
    >
      <div className="relative aspect-square w-full bg-[#151519] overflow-hidden">
        <span className="pointer-events-none absolute top-2.5 left-3 z-10 text-[10px] font-mono tracking-[0.16em] text-[#9E988E]/80 group-hover:text-[#E03E36] transition-colors duration-200 tabular-nums">
          {num}
        </span>

        {!imgFailed && photo ? (
          <img
            src={photo}
            alt={category.name}
            loading="lazy"
            onError={() => setImgFailed(true)}
            className="h-full w-full object-cover object-top brightness-90 saturate-[0.92] group-hover:brightness-100 group-hover:saturate-100 group-hover:scale-[1.05] transition-[filter,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          />
        ) : (
          <div className="h-full w-full grid place-items-center p-4">
            <Garment kind={category.kind} color="#24242C" color2="#32323D" accent="#E03E36" className="h-full w-full" showDetail={false} />
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0D0D10] via-transparent to-black/25" />
      </div>

      <div className="px-3.5 py-3 flex items-center justify-between gap-2 border-t border-white/[0.06]">
        <span className="text-xs font-medium tracking-wide text-[#C7C1B8] group-hover:text-[#F2EFE9] truncate transition-colors duration-200">
          {category.name}
        </span>
        <ArrowUpRight
          size={13}
          className="text-[#9E988E] group-hover:text-[#E03E36] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-[color,transform] duration-200 shrink-0"
        />
      </div>
    </Link>
  )
}
