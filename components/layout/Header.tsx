'use client'

import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from '../../lib/router'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  Globe,
  Wand2,
  CalendarHeart,
  ArrowUpRight,
} from 'lucide-react'
import { useI18n } from '../../i18n'
import { useCart } from '../../store/cart'
import { formatMoney } from '../../lib/format'
import { useWishlist } from '../../store/wishlist'
import { useUI } from '../../store/ui'
import { useAuth } from '../../store/auth'
import { getCurrencyMeta, useCurrency } from '../../store/currency'
import { LanguageSelector } from './LanguageSelector'
import { CurrencySelector } from './CurrencySelector'
import { BagDrawer } from './BagDrawer'
import { CATEGORIES, COLLECTIONS } from '../../data/categories'

const GROUP_LABELS: Record<'apparel' | 'footwear' | 'accessories' | 'custom', string> = {
  apparel: 'Apparel',
  footwear: 'Footwear',
  accessories: 'Objects',
  custom: 'Bespoke & Events',
}

function LookbookCard({
  to,
  src,
  title,
  tag,
  subtitle,
  onSelect,
}: {
  to: string
  src: string
  title: string
  tag: string
  subtitle: string
  onSelect: () => void
}) {
  return (
    <Link
      to={to}
      onClick={onSelect}
      className="group/card relative h-56 rounded-xl overflow-hidden border border-white/10 hover:border-white/25 bg-[#08080A] flex flex-col justify-between p-3.5 active:scale-[0.985] transition-[border-color,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
    >
      <img
        src={src}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover opacity-80 brightness-90 saturate-[0.9] group-hover/card:opacity-100 group-hover/card:brightness-100 group-hover/card:saturate-100 group-hover/card:scale-[1.03] transition-[opacity,filter,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30" />

      <div className="relative z-10 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.18em] text-[#C7C1B8] group-hover/card:text-[#F2EFE9] transition-colors duration-300">
          <span className="h-1 w-1 rounded-full bg-[#E03E36]" />
          {tag}
        </span>
      </div>

      <div className="relative z-10 flex items-end justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#9E988E] group-hover/card:text-[#C7C1B8] transition-colors duration-300">
            {subtitle}
          </div>
          <div className="relative overflow-hidden h-5 mt-0.5">
            <span className="block text-xs font-medium text-[#F2EFE9] truncate transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/card:-translate-y-full">
              {title}
            </span>
            <span
              aria-hidden="true"
              className="block text-xs font-medium text-[#F2EFE9] truncate transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/card:-translate-y-full"
            >
              {title}
            </span>
          </div>
        </div>
        <ArrowUpRight
          size={14}
          className="text-[#C7C1B8] group-hover/card:text-[#F2EFE9] group-hover/card:translate-x-0.5 group-hover/card:-translate-y-0.5 transition-[color,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shrink-0"
        />
      </div>
    </Link>
  )
}

export function Header() {
  const { t } = useI18n()
  const location = useLocation()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const rawCount = useCart((s) => s.count())
  const rawSubtotal = useCart((s) => s.subtotal())
  const rawWishCount = useWishlist((s) => s.ids.length)
  const count = mounted ? rawCount : 0
  const subtotal = mounted ? rawSubtotal : 0
  const wishCount = mounted ? rawWishCount : 0
  const { setSearchOpen, setMobileMenu } = useUI()
  const rawUser = useAuth((s) => s.user)
  const user = mounted ? rawUser : null
  const { code: rawCurrencyCode } = useCurrency()
  const currencyCode = mounted ? rawCurrencyCode : 'USD'
  const currencyMeta = getCurrencyMeta(currencyCode)

  const [bagOpen, setBagOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [megaOpen, setMegaOpen] = useState<'shop' | 'collections' | null>(null)
  const [activeGroup, setActiveGroup] = useState<'apparel' | 'footwear' | 'accessories' | 'custom'>('apparel')
  const [hoveredNav, setHoveredNav] = useState<string | null>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cancelClose = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }

  const scheduleClose = () => {
    cancelClose()
    closeTimerRef.current = setTimeout(() => {
      setMegaOpen(null)
      setHoveredNav(null)
    }, 120)
  }

  useEffect(() => () => cancelClose(), [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMegaOpen(null)
    setHoveredNav(null)
  }, [location.pathname])

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMegaOpen(null)
        setHoveredNav(null)
      }
    }
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [])

  const links = [
    { id: 'shop', label: t('nav.shop'), to: '/shop', mega: 'shop' as const },
    { id: 'collections', label: t('nav.collections'), to: '/shop?view=collections', mega: 'collections' as const },
    { id: 'customize', label: t('nav.customize'), to: '/customize' },
    { id: 'events', label: t('nav.events'), to: '/events' },
    { id: 'survey', label: t('nav.survey'), to: '/survey' },
  ]

  const activeId =
    megaOpen ??
    hoveredNav ??
    (location.pathname === '/customize'
      ? 'customize'
      : location.pathname === '/events'
      ? 'events'
      : location.pathname === '/survey'
      ? 'survey'
      : location.pathname.startsWith('/shop')
      ? 'shop'
      : null)

  return (
    <>
      {/* Top Dispatch Bar (36px standard luxury height, 0.75rem / 12px) */}
      <div className="h-9 bg-[#050507] border-b border-white/[0.08] text-xs text-[#C7C1B8]">
        <div className="max-w-[1480px] mx-auto px-5 sm:px-8 lg:px-12 h-full flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 truncate">
            <span className="h-1.5 w-1.5 rounded-full bg-[#E03E36] shrink-0" />
            <span className="truncate">
              <strong className="font-medium text-[#F2EFE9]">{currencyMeta.region}</strong> · {currencyMeta.dutyNote}
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-5 shrink-0">
            <Link to="/track" className="hover:text-[#F2EFE9] transition-colors duration-150">
              {t('action.trackOrder')}
            </Link>
            <span className="h-3 w-px bg-white/15" />
            <span className="text-[#F2EFE9]">
              Welcome <span className="text-[#E03E36] font-semibold">−15%</span> · Code{' '}
              <span className="font-mono tracking-wider">WELCOME</span>
            </span>
          </div>
        </div>
      </div>

      {/* Page-dimming backdrop scrim when Showcase mega menu is open */}
      <AnimatePresence>
        {megaOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            onClick={() => setMegaOpen(null)}
            className="fixed inset-0 top-[104px] z-40 bg-black/60 backdrop-blur-[2px]"
          />
        )}
      </AnimatePresence>

      {/* Monolith Navbar (68px desktop, 64px mobile) */}
      <header
        className={`sticky top-0 z-50 border-b transition-[background-color,border-color,box-shadow] duration-200 ${
          scrolled
            ? 'bg-[#09090B]/95 backdrop-blur-2xl border-white/[0.12] shadow-[0_12px_36px_rgba(0,0,0,0.65)]'
            : 'bg-[#09090B]/90 backdrop-blur-xl border-white/[0.08]'
        }`}
        onMouseEnter={cancelClose}
        onMouseLeave={scheduleClose}
      >
        <div className="max-w-[1480px] mx-auto px-5 sm:px-8 lg:px-12 h-16 lg:h-[68px] flex items-center justify-between gap-6">
          {/* Left: Mobile Trigger + Brand Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setMobileMenu(true)}
              className="lg:hidden p-1.5 -ml-1.5 text-[#F2EFE9] active:scale-[0.95] transition-transform duration-150"
              aria-label={t('a11y.menu')}
            >
              <Menu size={20} />
            </button>
            <Link to="/" className="flex items-center group">
              <img
                src="/logo-white-text.png"
                alt="TaioMei"
                className="h-8 sm:h-9 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.03]"
                onError={(e) => {
                  ;(e.currentTarget as HTMLImageElement).src = '/logo.png'
                }}
              />
            </Link>
          </div>

          {/* Center: Sentence-Case Links (14px) + 4px Crimson Dot */}
          <nav className="hidden lg:flex items-center gap-8" aria-label="Main navigation">
            {links.map((l) => {
              const isAct = activeId === l.id
              return (
                <Link
                  key={l.id}
                  to={l.to}
                  onMouseEnter={() => {
                    cancelClose()
                    setHoveredNav(l.id)
                    setMegaOpen(l.mega ?? null)
                  }}
                  onClick={() => setMegaOpen(null)}
                  className={`relative py-2 text-sm font-medium tracking-wide transition-colors duration-150 ${
                    isAct ? 'text-[#F2EFE9]' : 'text-[#B4AEA4] hover:text-[#F2EFE9]'
                  }`}
                >
                  {l.label}
                  {isAct && (
                    <motion.span
                      layoutId="monolith-dot"
                      transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                      className="absolute left-1/2 -translate-x-1/2 -bottom-0.5 h-1 w-1 rounded-full bg-[#E03E36]"
                    />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Right: Minimal Utility + Bone Bag Pill */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <CurrencySelector />

            <div className="hidden md:block">
              <LanguageSelector />
            </div>

            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="p-2 text-[#B4AEA4] hover:text-[#F2EFE9] active:scale-[0.95] transition-colors duration-150"
              aria-label={t('action.search')}
            >
              <Search size={18} />
            </button>

            <Link
              to="/wishlist"
              className="relative hidden sm:grid place-items-center p-2 text-[#B4AEA4] hover:text-[#F2EFE9] active:scale-[0.95] transition-colors duration-150"
              aria-label={t('nav.wishlist')}
            >
              <Heart size={18} />
              {wishCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-[#E03E36]" />
              )}
            </Link>

            <Link
              to={user ? '/account' : '/account/signin'}
              className="hidden sm:grid place-items-center p-2 text-[#B4AEA4] hover:text-[#F2EFE9] active:scale-[0.95] transition-colors duration-150"
              aria-label={t('nav.account')}
            >
              <User size={18} />
            </Link>

            <button
              id="cart-target"
              type="button"
              onClick={() => setBagOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-[#F2EFE9] text-[#09090B] px-4 py-2 text-xs font-semibold hover:bg-[#E03E36] hover:text-white active:scale-[0.97] transition-[background-color,color,transform] duration-150"
              aria-label={t('nav.cart')}
            >
              <ShoppingBag size={14} />
              <AnimatePresence mode="wait">
                <motion.span
                  key={count}
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.85, opacity: 0 }}
                  transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
                  className="tabular-nums"
                >
                  {count}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Contained Solid Showcase Mega Menu (NOT full-width) */}
        <AnimatePresence>
          {megaOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.985 }}
              transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
              style={{ transformOrigin: 'top center' }}
              className="absolute inset-x-0 top-full hidden lg:flex justify-center px-6 pointer-events-none"
            >
              <div
                onMouseEnter={cancelClose}
                className="pointer-events-auto w-full max-w-5xl pt-2.5"
              >
                <div className="rounded-2xl bg-[#0B0B0E] border border-white/15 p-6 shadow-[0_32px_80px_rgba(0,0,0,0.92)]">
                {megaOpen === 'shop' ? (
                  <div className="grid grid-cols-12 gap-6">
                    {/* Left: Group Selector */}
                    <div className="col-span-3 border-r border-white/10 pr-4 space-y-1">
                      <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#9E988E] px-3 mb-2">
                        Departments
                      </div>
                      {(['apparel', 'footwear', 'accessories', 'custom'] as const).map((g) => {
                        const active = activeGroup === g
                        return (
                          <button
                            key={g}
                            type="button"
                            onMouseEnter={() => setActiveGroup(g)}
                            onClick={() => setActiveGroup(g)}
                            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm flex items-center justify-between transition-[background-color,color,transform] duration-150 active:scale-[0.98] ${
                              active
                                ? 'bg-white/[0.08] text-[#F2EFE9] font-medium'
                                : 'text-[#9E988E] hover:bg-white/[0.04] hover:text-[#F2EFE9]'
                            }`}
                          >
                            <span>{GROUP_LABELS[g]}</span>
                            <span
                              className={`text-xs font-mono transition-transform duration-150 ${
                                active ? 'text-[#E03E36] translate-x-0.5' : 'opacity-40'
                              }`}
                            >
                              →
                            </span>
                          </button>
                        )
                      })}
                    </div>

                    {/* Middle: Sub-Category Links with Hover Micro-Interaction */}
                    <div className="col-span-4">
                      <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#E03E36] px-2.5 mb-2.5">
                        {GROUP_LABELS[activeGroup]}
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        {CATEGORIES.filter((c) => c.group === activeGroup).map((c) => (
                          <Link
                            key={c.id}
                            to={`/shop?category=${c.id}`}
                            onClick={() => setMegaOpen(null)}
                            className="group/item flex items-center justify-between px-2.5 py-2 rounded-lg text-sm text-[#B4AEA4] hover:text-[#F2EFE9] hover:bg-white/[0.06] active:scale-[0.98] transition-[background-color,color,transform] duration-150"
                          >
                            <span className="truncate">{c.name}</span>
                            <ArrowUpRight
                              size={13}
                              className="text-[#E03E36] opacity-0 -translate-x-1 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-[opacity,transform] duration-150 shrink-0"
                            />
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Right: Dual Campaign Lookbook Cards */}
                    <div className="col-span-5 grid grid-cols-2 gap-3.5">
                      <LookbookCard
                        to="/shop?collection=new"
                        src="/campaign/hero-editorial.jpg"
                        title="FW26 Outerwear"
                        tag="FW26"
                        subtitle="Explore Edit"
                        onSelect={() => setMegaOpen(null)}
                      />
                      <LookbookCard
                        to="/shop?collection=premium"
                        src="/campaign/look-cashmere.jpg"
                        title="Grade-A Cashmere"
                        tag="Knitwear"
                        subtitle="Shop Knitwear"
                        onSelect={() => setMegaOpen(null)}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-7 grid grid-cols-2 gap-2.5">
                      {COLLECTIONS.slice(0, 6).map((col) => (
                        <Link
                          key={col.id}
                          to={`/shop?collection=${col.id}`}
                          onClick={() => setMegaOpen(null)}
                          className="group/col flex items-center justify-between p-3 rounded-xl bg-[#131318] border border-white/10 hover:border-white/25 hover:bg-[#191920] active:scale-[0.98] transition-[background-color,border-color,transform] duration-150"
                        >
                          <div>
                            <div className="text-sm font-medium text-[#F2EFE9]">{col.name}</div>
                            <div className="text-xs text-[#9E988E] mt-0.5">{col.blurb}</div>
                          </div>
                          <ArrowUpRight
                            size={14}
                            className="text-[#9E988E] group-hover/col:text-[#E03E36] group-hover/col:translate-x-0.5 group-hover/col:-translate-y-0.5 transition-[color,transform] duration-150 shrink-0"
                          />
                        </Link>
                      ))}
                      <Link
                        to="/customize"
                        onClick={() => setMegaOpen(null)}
                        className="flex items-center gap-2.5 p-3 rounded-xl bg-[#E03E36]/15 border border-[#E03E36]/30 hover:bg-[#E03E36]/25 active:scale-[0.98] transition-[background-color,transform] duration-150"
                      >
                        <Wand2 size={16} className="text-[#E03E36]" />
                        <span className="text-sm font-medium text-[#F2EFE9]">{t('nav.customize')}</span>
                      </Link>
                      <Link
                        to="/events"
                        onClick={() => setMegaOpen(null)}
                        className="flex items-center gap-2.5 p-3 rounded-xl bg-[#131318] border border-white/10 hover:border-white/25 active:scale-[0.98] transition-[border-color,transform] duration-150"
                      >
                        <CalendarHeart size={16} className="text-[#F2EFE9]" />
                        <span className="text-sm font-medium text-[#F2EFE9]">{t('nav.events')}</span>
                      </Link>
                    </div>

                    <div className="col-span-5 grid grid-cols-2 gap-3.5">
                      <LookbookCard
                        to="/shop?collection=premium"
                        src="/campaign/look-obsidian.jpg"
                        title="Obsidian Runway"
                        tag="Runway"
                        subtitle="View Capsule"
                        onSelect={() => setMegaOpen(null)}
                      />
                      <LookbookCard
                        to="/shop?collection=accessories"
                        src="/campaign/look-object.jpg"
                        title="Bridle Objects"
                        tag="Objects"
                        subtitle="Leather & Craft"
                        onSelect={() => setMegaOpen(null)}
                      />
                    </div>
                  </div>
                )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      {/* Bespoke TaioMei Floating Bag Dock (appears only when items > 0 & drawer is closed) */}
      <AnimatePresence>
        {count > 0 && !bagOpen && (
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => setBagOpen(true)}
            className="group fixed bottom-5 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-40 flex items-center justify-between gap-4 rounded-full bg-[#0B0B0E] border border-white/15 hover:border-white/30 pl-4 pr-2 py-2 shadow-[0_24px_60px_rgba(0,0,0,0.9)] active:scale-[0.98] transition-[border-color,transform] duration-200"
            aria-label="Open shopping bag"
          >
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-[#E03E36]" />
              <ShoppingBag size={15} className="text-[#F2EFE9]" />
              <span className="text-xs font-mono uppercase tracking-[0.14em] text-[#C7C1B8] tabular-nums">
                {count} {count === 1 ? 'Piece' : 'Pieces'}
              </span>
              <span className="h-3 w-px bg-white/15" />
              <span className="text-xs font-semibold text-[#F2EFE9] tabular-nums">
                {formatMoney(subtotal)}
              </span>
            </div>
            <span className="rounded-full bg-[#F2EFE9] text-[#09090B] group-hover:bg-[#E03E36] group-hover:text-white px-3.5 py-1.5 text-[11px] font-semibold tracking-wider uppercase transition-[background-color,color] duration-200">
              Bag →
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <BagDrawer open={bagOpen} onClose={() => setBagOpen(false)} />
    </>
  )
}
