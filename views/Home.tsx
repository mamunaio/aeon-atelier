'use client'

import { useState, useEffect } from 'react'
import { Link } from '../lib/router'
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion'
import { ShoppingBag, Compass, Wand2, ArrowRight, Truck, ShieldCheck, Globe, Calendar, ChevronRight } from 'lucide-react'
import { useI18n } from '../i18n'
import { useHead, organizationJsonLd } from '../lib/seo'
import { ProductCard } from '../components/ProductCard'
import { QuickView } from '../components/QuickView'
import { SectionHeader, Rail } from '../components/Section'
import { Reveal } from '../components/ui/Reveal'
import { Magnetic } from '../components/ui/MagneticButton'
import { Garment } from '../components/Garment'
import { newArrivals, bestSellers, productsIn } from '../data/products'
import { getProductDemoPhotos } from '../data/productImages'
import { CATEGORIES } from '../data/categories'
import { recommend } from '../lib/recommend'
import { useWishlist } from '../store/wishlist'
import { useUI } from '../store/ui'
import { useAuth } from '../store/auth'
import type { Product, GarmentKind } from '../types'

const RUNWAY_CHAPTERS = [
  { id: '01', title: 'KARASU OVERCOAT', sub: 'Obsidian technical wool · Crimson silk lining', image: '/campaign/look-obsidian.jpg', to: '/shop?collection=premium' },
  { id: '02', title: 'KUROGANE TRENCH', sub: '540gsm Biella virgin wool · Travertine gallery', image: '/campaign/hero-editorial.jpg', to: '/shop?collection=new' },
  { id: '03', title: 'SABI CASHMERE', sub: '7-gauge Mongolian knitwear in alabaster bone', image: '/campaign/look-cashmere.jpg', to: '/shop?collection=best' },
  { id: '04', title: 'KANSO ARCHIVE', sub: 'Bridle leather & Goodyear-welted footwear', image: '/campaign/look-object.jpg', to: '/shop?collection=trending' },
]

const CATEGORY_PILLARS = [
  {
    id: '01',
    title: 'Outerwear & Tailoring',
    to: '/shop?category=jackets',
    image: '/campaign/look-obsidian.jpg',
    subs: [
      { label: 'Jackets', to: '/shop?category=jackets' },
      { label: 'Formal Pants', to: '/shop?category=formal-pants' },
      { label: 'Shirts', to: '/shop?category=shirts' },
    ],
  },
  {
    id: '02',
    title: 'Knitwear & Jersey',
    to: '/shop?category=hoodies',
    image: '/campaign/look-cashmere.jpg',
    subs: [
      { label: 'Hoodies', to: '/shop?category=hoodies' },
      { label: 'Sweatshirts', to: '/shop?category=sweatshirts' },
      { label: 'T-Shirts', to: '/shop?category=t-shirts' },
    ],
  },
  {
    id: '03',
    title: 'Denim & Utility',
    to: '/shop?category=jeans',
    image: '/campaign/hero-editorial.jpg',
    subs: [
      { label: 'Jeans', to: '/shop?category=jeans' },
      { label: 'Cargo Pants', to: '/shop?category=cargo-pants' },
      { label: 'Shorts', to: '/shop?category=shorts' },
    ],
  },
  {
    id: '04',
    title: 'Footwear & Objects',
    to: '/shop?category=shoes',
    image: '/campaign/look-object.jpg',
    subs: [
      { label: 'Shoes', to: '/shop?category=shoes' },
      { label: 'Bags', to: '/shop?category=bags' },
      { label: 'Watches', to: '/shop?category=watches' },
    ],
  },
]

function KineticLabel({ text }: { text: string }) {
  return (
    <span className="relative inline-block overflow-hidden h-[1.25em] leading-[1.25em]">
      <span className="block transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/btn:-translate-y-full">
        {text}
      </span>
      <span
        aria-hidden="true"
        className="block transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/btn:-translate-y-full"
      >
        {text}
      </span>
    </span>
  )
}

export default function Home() {
  const { t } = useI18n()
  const [quick, setQuick] = useState<Product | null>(null)
  const [chapterIdx, setChapterIdx] = useState(0)
  const [heroPaused, setHeroPaused] = useState(false)
  const [hoveredPillar, setHoveredPillar] = useState<number | null>(null)
  const [customIdx, setCustomIdx] = useState(0)


  const wishlist = useWishlist()
  const recentlyViewed = useUI((s) => s.recentlyViewed)
  const reduceMotion = useUI((s) => s.reduceMotion)
  const user = useAuth((s) => s.user)
  const activeChapter = RUNWAY_CHAPTERS[chapterIdx]
  const heroPx = useMotionValue(0)
  const heroPy = useMotionValue(0)
  const smoothPx = useSpring(heroPx, { stiffness: 120, damping: 24 })
  const smoothPy = useSpring(heroPy, { stiffness: 120, damping: 24 })

  useEffect(() => {
    if (heroPaused || reduceMotion) return
    const id = setInterval(() => {
      setChapterIdx((prev) => (prev + 1) % RUNWAY_CHAPTERS.length)
    }, 4500)
    return () => clearInterval(id)
  }, [heroPaused, reduceMotion])

  useHead({
    title: 'TaioMei — Wear Your Style. Create Your Identity.',
    description: 'Premium futuristic fashion and live customization, designed in Malaysia. Discover apparel, footwear and accessories built for the next generation.',
    path: '/',
    jsonLd: organizationJsonLd(),
  })

  const arrivals = newArrivals(10)
  const best = bestSellers(10)
  const trending = productsIn('trending', 10)
  const premium = productsIn('premium', 10)
  const premiumIds = new Set(premium.map((p) => p.id))
  const recos = recommend(
    { profile: user?.styleProfile, wishlistIds: wishlist.ids, recentIds: recentlyViewed },
    20
  )
    .filter(({ product }) => !premiumIds.has(product.id))
    .slice(0, 10)

  const trust = [
    { icon: Truck, label: t('home.trustFast') },
    { icon: ShieldCheck, label: t('home.trustSecure') },
    { icon: Wand2, label: t('home.trustCustom') },
    { icon: Globe, label: t('home.trustGlobal') },
  ]

  return (
    <div>
      {/* ===== ATELIER SPLIT RUNWAY HERO ===== */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="container-max section-pad pt-8 pb-16 sm:pt-12 sm:pb-20">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            {/* Left Narrative + Chapter Selector */}
            <div className="lg:col-span-5 flex flex-col justify-between py-2">
              <div>
                <div className="inline-flex items-center gap-2 text-[10px] font-mono tracking-[0.22em] uppercase text-[#9E988E] mb-5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#E03E36]" />
                  TaioMei · FW26 Archive
                </div>

                <h1 className="font-display text-4xl sm:text-5xl xl:text-6xl font-semibold leading-[0.96] tracking-[-0.03em] text-[#F2EFE9] text-balance">
                  Wear Your Style.
                  <br />
                  <span className="text-[#9E988E] font-normal">Create Your Identity.</span>
                </h1>

                <p className="mt-5 text-sm sm:text-base text-[#9E988E] max-w-md leading-relaxed">
                  {t('brand.sub')}
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <Magnetic strength={0.14}>
                    <Link to="/shop" className="btn-primary group/btn">
                      <ShoppingBag size={16} />
                      <KineticLabel text={t('action.shopNow')} />
                    </Link>
                  </Magnetic>
                  <Magnetic strength={0.14}>
                    <Link to="/shop?view=collections" className="btn-ghost group/btn">
                      <Compass size={16} />
                      <KineticLabel text={t('action.explore')} />
                    </Link>
                  </Magnetic>
                  <Magnetic strength={0.14}>
                    <Link to="/customize" className="btn-gold group/btn">
                      <Wand2 size={16} />
                      <KineticLabel text={t('action.customize')} />
                    </Link>
                  </Magnetic>
                </div>
              </div>

              {/* Runway Chapter Switcher */}
              <div
                onMouseEnter={() => setHeroPaused(true)}
                onMouseLeave={() => setHeroPaused(false)}
                className="mt-9 pt-6 border-t border-white/10 space-y-1.5"
              >
                <div className="text-[10px] tracking-[0.2em] uppercase text-[#9E988E] mb-2.5">
                  FW26 Runway Chapters
                </div>
                {RUNWAY_CHAPTERS.map((ch, idx) => {
                  const active = idx === chapterIdx
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onMouseEnter={() => setChapterIdx(idx)}
                      onFocus={() => setChapterIdx(idx)}
                      onClick={() => setChapterIdx(idx)}
                      className={`group/ch relative w-full text-left flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-colors duration-200 active:scale-[0.99] ${active
                        ? 'text-[#F2EFE9]'
                        : 'text-[#9E988E] hover:text-[#F2EFE9]'
                        }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="hero-chapter-rail"
                          transition={{ type: "spring", stiffness: 380, damping: 34 }}
                          className="absolute inset-0 rounded-xl bg-white/[0.05] border border-white/15 -z-0"
                        />
                      )}
                      <div className="relative z-10 flex items-center gap-3.5">
                        <span className={`font-mono text-xs tabular-nums transition-colors duration-200 ${active ? 'text-[#E03E36]' : 'text-[#9E988E]/50 group-hover/ch:text-[#E03E36]'}`}>
                          {ch.id}
                        </span>
                        <div>
                          <div className="text-xs font-semibold tracking-[0.14em] uppercase">{ch.title}</div>
                          <div className="text-[11px] text-[#9E988E]">{ch.sub}</div>
                        </div>
                      </div>
                      <ArrowRight size={14} className={`relative z-10 transition-[opacity,transform,color] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${active ? 'text-[#F2EFE9] translate-x-0.5 opacity-100' : 'opacity-25 group-hover/ch:opacity-75'}`} />
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Right Campaign Visual */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div
                onMouseEnter={() => setHeroPaused(true)}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const nx = (e.clientX - rect.left) / rect.width - 0.5
                  const ny = (e.clientY - rect.top) / rect.height - 0.5
                  heroPx.set(nx * -14)
                  heroPy.set(ny * -10)
                }}
                onMouseLeave={() => {
                  setHeroPaused(false)
                  heroPx.set(0)
                  heroPy.set(0)
                }}
                className="group/hero relative flex-1 min-h-[420px] sm:min-h-[500px] rounded-2xl border border-white/12 hover:border-white/25 bg-[#111114] overflow-hidden flex flex-col justify-between transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
              >
                <motion.div
                  style={{ x: smoothPx, y: smoothPy }}
                  className="absolute -inset-4"
                >
                  <AnimatePresence mode="sync">
                    <motion.img
                      key={activeChapter.id}
                      src={activeChapter.image}
                      alt={activeChapter.title}
                      initial={{ opacity: 0, scale: 1.04 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                      className="w-full h-full object-cover object-center brightness-95 saturate-[0.94] group-hover/hero:brightness-100 group-hover/hero:saturate-[1.04] group-hover/hero:scale-[1.02] transition-[filter,transform] duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    />
                  </AnimatePresence>
                </motion.div>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#09090B] via-[#09090B]/15 to-black/20" />

                {/* Top-right architectural index */}
                <div className="relative z-10 p-5 sm:p-6 flex justify-end">
                  <span className="text-[10px] font-mono tracking-[0.22em] uppercase text-[#C7C1B8]/80 group-hover/hero:text-[#F2EFE9] transition-colors duration-300 tabular-nums">
                    {activeChapter.id} / 04
                  </span>
                </div>

                <div className="relative z-10 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#E03E36]">
                      Chapter {activeChapter.id}
                    </div>
                    <div className="text-xl sm:text-2xl font-display font-semibold mt-0.5 text-[#F2EFE9]">
                      {activeChapter.title}
                    </div>
                    <div className="text-xs text-[#C7C1B8] mt-0.5">{activeChapter.sub}</div>
                  </div>
                  <Link
                    to={activeChapter.to}
                    className="group/btn rounded-full bg-[#F2EFE9] text-[#09090B] hover:bg-[#E03E36] hover:text-white px-5 py-2.5 text-xs font-semibold tracking-wider uppercase active:scale-[0.98] transition-[background-color,color,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shrink-0 inline-flex items-center gap-2"
                  >
                    <KineticLabel text={t('action.explore')} />
                    <ArrowRight size={14} className="transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/btn:translate-x-0.5" />
                  </Link>
                </div>
              </div>

              {/* Trust bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                {trust.map((it) => (
                  <div key={it.label} className="flex items-center gap-2 text-xs text-[#9E988E]">
                    <it.icon size={15} className="text-[#E03E36] shrink-0" />
                    <span>{it.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== NEW ARRIVALS ===== */}
      <section className="section-pad">
        <div className="container-max">
          <SectionHeader eyebrow={t('nav.newArrivals')} title={t('home.newArrivals')} sub={t('home.newArrivalsSub')} to="/shop?sort=newest" linkLabel={t('action.viewAll')} />
          <Rail>
            {arrivals.map((p, i) => (
              <div key={p.id} className="snap-start shrink-0 w-[220px] sm:w-[260px]">
                <ProductCard product={p} index={i} onQuickView={setQuick} />
              </div>
            ))}
          </Rail>
        </div>
      </section>

      {/* ===== SHOP BY CATEGORY (2026 Kinetic Accordion Showcase) ===== */}
      <section className="section-pad pt-0">
        <div className="container-max">
          <SectionHeader eyebrow="Explore" title={t('home.shopByCategory')} sub={t('home.shopByCategorySub')} to="/shop" linkLabel={t('action.viewAll')} />
          <div
            onMouseLeave={() => setHoveredPillar(null)}
            className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:h-[520px] gap-3"
          >
            {CATEGORY_PILLARS.map((pillar, i) => {
              const isExpanded = hoveredPillar === i
              const isDimmed = hoveredPillar !== null && hoveredPillar !== i
              return (
                <div
                  key={pillar.id}
                  onMouseEnter={() => setHoveredPillar(i)}
                  onFocus={() => setHoveredPillar(i)}
                  className={`group/pillar relative min-h-[380px] lg:min-h-0 rounded-2xl overflow-hidden bg-[#0E0E12] border transition-[flex-grow,border-color,opacity,filter] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isExpanded
                      ? 'lg:flex-[1.75] border-white/30 opacity-100'
                      : isDimmed
                        ? 'lg:flex-[0.82] border-white/10 opacity-55 saturate-50'
                        : 'lg:flex-1 border-white/12 opacity-100'
                    }`}
                >
                  <Link to={pillar.to} className="absolute inset-0 z-0">
                    <img
                      src={pillar.image}
                      alt={pillar.title}
                      loading="lazy"
                      className="h-full w-full object-cover object-center transition-[filter] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    />
                    <div
                      className={`absolute inset-0 transition-opacity duration-500 ${isExpanded
                          ? 'bg-gradient-to-t from-[#09090B] via-[#09090B]/20 to-black/15'
                          : 'bg-gradient-to-t from-[#09090B]/95 via-[#09090B]/35 to-black/30'
                        }`}
                    />
                  </Link>

                  {/* Architectural corner hairline bracket on active focus */}
                  <div
                    aria-hidden="true"
                    className={`pointer-events-none absolute inset-3 rounded-xl border transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isExpanded ? 'border-white/15 opacity-100 scale-100' : 'border-transparent opacity-0 scale-[0.98]'
                      }`}
                  />

                  <div className="relative z-10 h-full p-6 flex flex-col justify-between pointer-events-none">
                    <div className="flex items-center justify-between">
                      <span
                        className={`font-mono text-[11px] tracking-[0.22em] transition-colors duration-300 tabular-nums ${isExpanded ? 'text-[#E03E36]' : 'text-[#C7C1B8]'
                          }`}
                      >
                        {pillar.id} / 04
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.18em] transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isExpanded ? 'opacity-100 translate-x-0 text-[#F2EFE9]' : 'opacity-0 translate-x-2 text-[#9E988E]'
                          }`}
                      >
                        Enter <ArrowRight size={12} className="text-[#E03E36]" />
                      </span>
                    </div>

                    <div>
                      <Link to={pillar.to} className="pointer-events-auto block">
                        <h3 className="font-display text-xl sm:text-2xl font-semibold text-[#F2EFE9] tracking-[-0.02em] leading-tight">
                          {pillar.title}
                        </h3>
                      </Link>

                      {/* Clip-path / Mask reveal of sub-departments on expand */}
                      <div
                        className={`overflow-hidden transition-[max-height,opacity,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isExpanded
                            ? 'max-h-24 opacity-100 translate-y-0 mt-3.5'
                            : 'lg:max-h-0 lg:opacity-0 lg:translate-y-2 mt-3 lg:mt-0'
                          }`}
                      >
                        <div className="flex flex-wrap gap-1.5 pointer-events-auto">
                          {pillar.subs.map((sub) => (
                            <Link
                              key={sub.label}
                              to={sub.to}
                              className="rounded-full bg-black/70 backdrop-blur-md border border-white/15 hover:border-[#F2EFE9] hover:bg-[#F2EFE9] hover:text-[#09090B] px-3 py-1 text-[10px] font-mono uppercase tracking-[0.14em] text-[#F2EFE9] transition-[background-color,border-color,color] duration-150"
                            >
                              {sub.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ===== CUSTOMIZE CTA (Editorial Bespoke Studio) ===== */}
      <section className="section-pad pt-0">
        <div className="container-max">
          <Reveal>
            <div className="relative overflow-hidden rounded-2xl bg-[#0D0D10] border border-white/12 p-6 sm:p-10 lg:p-12">
              <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                {/* Left: Copy + Interactive Bespoke Capabilities */}
                <div className="lg:col-span-6">
                  <div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.22em] text-[#9E988E] mb-3">
                    <span className="h-1 w-1 rounded-full bg-[#E03E36]" />
                    TaioMei Bespoke Studio
                  </div>
                  <h3 className="font-display text-3xl sm:text-4xl font-semibold tracking-[-0.02em] text-[#F2EFE9]">{t('home.customizeCta')}</h3>
                  <p className="mt-3 text-[#9E988E] max-w-md text-sm sm:text-base leading-relaxed">{t('home.customizeCtaSub')}</p>

                  {/* Interactive Studio Capabilities with layoutId Spring Rail */}
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-w-lg">
                    {[
                      { id: '01', label: 'Artwork Upload', desc: 'Vector & high-DPI print' },
                      { id: '02', label: 'Monogram Type', desc: 'Silk-screen & embroidery' },
                      { id: '03', label: 'Bespoke Trim', desc: 'Crimson & champagne thread' },
                    ].map((preset, idx) => {
                      const active = customIdx === idx
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onMouseEnter={() => setCustomIdx(idx)}
                          onClick={() => setCustomIdx(idx)}
                          className={`group/pre relative text-left rounded-xl px-3.5 py-3 border transition-[border-color,transform] duration-200 active:scale-[0.98] ${active
                              ? 'border-white/30 text-[#F2EFE9]'
                              : 'border-white/10 text-[#9E988E] hover:border-white/25 hover:text-[#F2EFE9]'
                            }`}
                        >
                          {active && (
                            <motion.span
                              layoutId="studio-preset-pill"
                              transition={{ type: "spring", stiffness: 380, damping: 32 }}
                              className="absolute inset-0 rounded-xl bg-white/[0.06] -z-0"
                            />
                          )}
                          <div className="relative z-10 flex items-center justify-between">
                            <span className={`text-[10px] font-mono tabular-nums transition-colors duration-200 ${active ? 'text-[#E03E36]' : 'text-[#9E988E]/60 group-hover/pre:text-[#E03E36]'}`}>
                              {preset.id}
                            </span>
                            <ArrowRight
                              size={11}
                              className={`transition-[opacity,transform] duration-200 ${active ? 'opacity-100 translate-x-0 text-[#E03E36]' : 'opacity-0 -translate-x-1 group-hover/pre:opacity-70 group-hover/pre:translate-x-0'}`}
                            />
                          </div>
                          <div className="relative z-10 text-xs font-medium mt-1.5 truncate">{preset.label}</div>
                          <div className="relative z-10 text-[10px] text-[#9E988E] mt-0.5 truncate">{preset.desc}</div>
                        </button>
                      )
                    })}
                  </div>

                  <div className="mt-7">
                    <Magnetic strength={0.14}>
                      <Link to="/customize" className="btn-gold group/btn">
                        <Wand2 size={16} />
                        <KineticLabel text={t('action.customize')} />
                      </Link>
                    </Magnetic>
                  </div>
                </div>

                {/* Right: Clean Editorial Studio Showcase */}
                <div className="lg:col-span-6">
                  {(() => {
                    const slides = [
                      { title: 'Artwork & Print Placement', spec: '280GSM SUPIMA · FRONT / BACK / SLEEVE', image: '/campaign/hero-editorial.jpg' },
                      { title: 'Precision Monogramming', spec: 'JAPANESE SILK THREAD · CUSTOM TYPOGRAPHY', image: '/campaign/look-cashmere.jpg' },
                      { title: 'Signature Hardware & Trim', spec: 'BRIDLE LEATHER · BRUSHED METAL FINISH', image: '/campaign/look-object.jpg' },
                    ]
                    const activeSlide = slides[customIdx]
                    return (
                      <Link
                        to="/customize"
                        className="group/studio relative block h-80 sm:h-96 rounded-2xl bg-[#111115] border border-white/12 hover:border-white/30 overflow-hidden transition-[border-color,box-shadow] duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.75)]"
                      >
                        <AnimatePresence mode="sync">
                          <motion.img
                            key={activeSlide.title}
                            src={activeSlide.image}
                            alt={activeSlide.title}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            className="absolute inset-0 h-full w-full object-cover object-center brightness-90 group-hover/studio:brightness-100 transition-[filter] duration-500"
                          />
                        </AnimatePresence>
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#09090B] via-[#09090B]/25 to-black/25" />

                        <div className="relative z-10 h-full p-6 flex flex-col justify-between">
                          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.18em] text-[#C7C1B8]">
                            <span>{activeSlide.spec}</span>
                            <span className="h-1.5 w-1.5 rounded-full bg-[#E03E36]" />
                          </div>

                          <div className="flex items-end justify-between gap-4">
                            <div>
                              <div className="font-display text-xl sm:text-2xl font-semibold text-[#F2EFE9]">
                                {activeSlide.title}
                              </div>
                              <div className="text-xs text-[#C7C1B8] mt-1">Interactive 3D &amp; live fabric preview</div>
                            </div>
                            <span className="rounded-full bg-[#F2EFE9] text-[#09090B] group-hover/studio:bg-[#E03E36] group-hover/studio:text-white px-4 py-2 text-[11px] font-semibold uppercase tracking-wider shrink-0 transition-[background-color,color] duration-200">
                              Open Studio →
                            </span>
                          </div>
                        </div>
                      </Link>
                    )
                  })()}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== BEST SELLERS ===== */}
      <section className="section-pad pt-0">
        <div className="container-max">
          <SectionHeader eyebrow={t('nav.bestSellers')} title={t('home.bestSellers')} sub={t('home.bestSellersSub')} to="/shop?sort=popular" linkLabel={t('action.viewAll')} />
          <Rail>
            {best.map((p, i) => (
              <div key={p.id} className="snap-start shrink-0 w-[220px] sm:w-[260px]">
                <ProductCard product={p} index={i} onQuickView={setQuick} />
              </div>
            ))}
          </Rail>
        </div>
      </section>

      {/* ===== TRENDING ===== */}
      {trending.length > 0 && (
        <section className="section-pad pt-0">
          <div className="container-max">
            <SectionHeader eyebrow="Hot" title={t('home.trending')} sub={t('home.trendingSub')} to="/shop?collection=trending" linkLabel={t('action.viewAll')} />
            <Rail>
              {trending.map((p, i) => (
                <div key={p.id} className="snap-start shrink-0 w-[220px] sm:w-[260px]">
                  <ProductCard product={p} index={i} onQuickView={setQuick} />
                </div>
              ))}
            </Rail>
          </div>
        </section>
      )}

      {/* ===== EVENT + SURVEY CTAs ===== */}
      <section className="section-pad pt-0">
        <div className="container-max grid md:grid-cols-2 gap-4 group/dual">
          <Reveal>
            <Link
              to="/events"
              className="group/card relative flex flex-col justify-between overflow-hidden rounded-2xl bg-[#0D0D10] border border-white/12 hover:border-white/30 p-7 sm:p-9 h-full transition-[border-color,opacity,box-shadow,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/dual:opacity-60 hover:!opacity-100 hover:shadow-[0_24px_60px_rgba(0,0,0,0.8)] active:scale-[0.99]"
            >
              <div>
                <div className="flex items-center justify-between gap-4">
                  <span className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-[#9E988E]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#E03E36]" />
                    01 · Bespoke Commissions
                  </span>
                  <span className="h-9 w-9 rounded-full bg-white/[0.04] border border-white/10 group-hover/card:border-[#C6A87C]/50 grid place-items-center text-[#C6A87C] transition-colors duration-200">
                    <Calendar size={16} />
                  </span>
                </div>

                <h3 className="font-display text-2xl sm:text-3xl font-semibold tracking-[-0.02em] text-[#F2EFE9] mt-6">
                  {t('home.eventCta')}
                </h3>
                <p className="mt-2.5 text-[#9E988E] text-sm leading-relaxed max-w-md">
                  {t('home.eventCtaSub')}
                </p>
              </div>

              <div className="mt-8 pt-5 border-t border-white/10 flex items-center justify-between gap-4">
                <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#9E988E]">
                  48h Quote · Min 10 Units
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.05] border border-white/15 group-hover/card:bg-[#F2EFE9] group-hover/card:text-[#09090B] group-hover/card:border-[#F2EFE9] px-4 py-2 text-xs font-medium text-[#F2EFE9] transition-[background-color,color,border-color] duration-200">
                  {t('action.requestQuote')}
                  <ArrowRight size={13} className="transition-transform duration-200 group-hover/card:translate-x-0.5" />
                </span>
              </div>
            </Link>
          </Reveal>

          <Reveal delay={80}>
            <Link
              to="/survey"
              className="group/card relative flex flex-col justify-between overflow-hidden rounded-2xl bg-[#0D0D10] border border-white/12 hover:border-white/30 p-7 sm:p-9 h-full transition-[border-color,opacity,box-shadow,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/dual:opacity-60 hover:!opacity-100 hover:shadow-[0_24px_60px_rgba(0,0,0,0.8)] active:scale-[0.99]"
            >
              <div>
                <div className="flex items-center justify-between gap-4">
                  <span className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-[#9E988E]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#E03E36]" />
                    02 · Personal Styling
                  </span>
                  <span className="h-9 w-9 rounded-full bg-white/[0.04] border border-white/10 group-hover/card:border-[#E03E36]/50 grid place-items-center text-[#F2EFE9] group-hover/card:text-[#E03E36] transition-colors duration-200">
                    <Compass size={16} />
                  </span>
                </div>

                <h3 className="font-display text-2xl sm:text-3xl font-semibold tracking-[-0.02em] text-[#F2EFE9] mt-6">
                  {t('home.surveyCta')}
                </h3>
                <p className="mt-2.5 text-[#9E988E] text-sm leading-relaxed max-w-md">
                  {t('home.surveyCtaSub')}
                </p>
              </div>

              <div className="mt-8 pt-5 border-t border-white/10 flex items-center justify-between gap-4">
                <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#9E988E]">
                  60-Sec Silhouette Match
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.05] border border-white/15 group-hover/card:bg-[#E03E36] group-hover/card:text-white group-hover/card:border-[#E03E36] px-4 py-2 text-xs font-medium text-[#F2EFE9] transition-[background-color,color,border-color] duration-200">
                  {t('action.startSurvey')}
                  <ArrowRight size={13} className="transition-transform duration-200 group-hover/card:translate-x-0.5" />
                </span>
              </div>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ===== PREMIUM ===== */}
      {premium.length > 0 && (
        <section className="section-pad pt-0">
          <div className="container-max">
            <SectionHeader eyebrow={t('nav.premium')} title={t('home.premium')} sub={t('home.premiumSub')} to="/shop?collection=premium" linkLabel={t('action.viewAll')} />
            <Rail>
              {premium.map((p, i) => (
                <div key={p.id} className="snap-start shrink-0 w-[220px] sm:w-[260px]">
                  <ProductCard product={p} index={i} onQuickView={setQuick} />
                </div>
              ))}
            </Rail>
          </div>
        </section>
      )}

      {/* ===== RECOMMENDED ===== */}
      <section className="section-pad pt-0">
        <div className="container-max">
          <SectionHeader eyebrow="For You" title={t('home.recommended')} sub={t('home.recommendedSub')} to="/shop" linkLabel={t('action.viewAll')} />
          <Rail>
            {recos.map(({ product, reasons }, i) => (
              <div key={product.id} className="snap-start shrink-0 w-[220px] sm:w-[260px]">
                <ProductCard product={product} index={i} onQuickView={setQuick} reason={reasons[0]} />
              </div>
            ))}
          </Rail>
        </div>
      </section>

      {/* ===== FINAL CTA (Private Archive Manifesto) ===== */}
      <section className="section-pad pt-0">
        <div className="container-max">
          <Reveal>
            <div className="relative overflow-hidden rounded-2xl bg-[#0D0D10] border border-white/12 p-8 sm:p-14 lg:p-16">
              {/* Atmospheric Darkroom Lookbook Backdrop */}
              <img
                src="/campaign/hero-editorial.jpg"
                alt="TaioMei Private Archive"
                loading="lazy"
                className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center opacity-20 saturate-50"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#09090B] via-[#09090B]/90 to-[#09090B]/65" />

              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.22em] text-[#9E988E] mb-4">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#E03E36]" />
                  TaioMei Private Archive
                </div>
                <h3 className="font-display text-3xl sm:text-5xl font-semibold tracking-[-0.03em] leading-[1.02] text-[#F2EFE9] text-balance">
                  Your Identity, <span className="text-[#9E988E] font-normal">Cut to Order.</span>
                </h3>
                <p className="mt-4 text-sm sm:text-base text-[#C7C1B8] max-w-lg leading-relaxed">
                  Early access to numbered FW26 capsules, bespoke studio commissions, and complimentary global express dispatch.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Magnetic strength={0.14}>
                    <Link to="/shop" className="btn-primary group/btn">
                      <KineticLabel text={t('action.shopNow')} />
                      <ChevronRight size={16} className="transition-transform duration-200 group-hover/btn:translate-x-0.5" />
                    </Link>
                  </Magnetic>
                  <Magnetic strength={0.14}>
                    <Link to="/account/signin" className="btn-ghost group/btn">
                      <KineticLabel text={t('action.register')} />
                    </Link>
                  </Magnetic>
                </div>
              </div>

              <div className="relative z-10 mt-10 pt-6 border-t border-white/10 flex flex-wrap items-center gap-x-8 gap-y-2 text-[10px] font-mono uppercase tracking-[0.18em] text-[#9E988E]">
                <span>Numbered Capsules</span>
                <span className="text-[#E03E36]">·</span>
                <span>Global Express DDP</span>
                <span className="text-[#E03E36]">·</span>
                <span>14-Day Complimentary Returns</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <QuickView product={quick} onClose={() => setQuick(null)} />
    </div>
  )
}
