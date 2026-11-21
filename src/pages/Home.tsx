import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingBag, Compass, Wand2, ArrowRight, Truck, ShieldCheck, Sparkles, Globe, Calendar, ChevronRight } from 'lucide-react'
import { useI18n } from '../i18n'
import { useHead, organizationJsonLd } from '../lib/seo'
import { ProductCard } from '../components/ProductCard'
import { QuickView } from '../components/QuickView'
import { SectionHeader, Rail, CategoryCard } from '../components/Section'
import { Reveal } from '../components/ui/Reveal'
import { Garment } from '../components/Garment'
import { NovaMascot } from '../components/assistant/NovaMascot'
import { newArrivals, bestSellers, productsIn } from '../data/products'
import { CATEGORIES } from '../data/categories'
import { recommend } from '../lib/recommend'
import { useWishlist } from '../store/wishlist'
import { useUI } from '../store/ui'
import { useAuth } from '../store/auth'
import type { Product, GarmentKind } from '../types'

const HERO_PIECES: { kind: GarmentKind; color: string; color2?: string; accent: string; className: string; delay: number }[] = [
  { kind: 'hoodie', color: '#12121d', color2: '#1c1c2e', accent: '#7b4dff', className: 'w-44 sm:w-56', delay: 0 },
  { kind: 'sneaker', color: '#f5f6fa', accent: '#12d3e0', className: 'w-32 sm:w-40', delay: 0.6 },
  { kind: 'watch', color: '#1c2541', accent: '#d4af37', className: 'w-28 sm:w-36', delay: 1.1 },
  { kind: 'jacket', color: '#3f5e42', color2: '#4a6b4d', accent: '#12d3e0', className: 'w-40 sm:w-48', delay: 0.3 },
]

export default function Home() {
  const { t } = useI18n()
  const [quick, setQuick] = useState<Product | null>(null)
  const wishlist = useWishlist()
  const recentlyViewed = useUI((s) => s.recentlyViewed)
  const user = useAuth((s) => s.user)

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
  const recos = recommend(
    { profile: user?.styleProfile, wishlistIds: wishlist.ids, recentIds: recentlyViewed },
    10
  )

  const trust = [
    { icon: Truck, label: t('home.trustFast') },
    { icon: ShieldCheck, label: t('home.trustSecure') },
    { icon: Wand2, label: t('home.trustCustom') },
    { icon: Globe, label: t('home.trustGlobal') },
  ]

  return (
    <div>
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden">
        {/* Ambient background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-void-radial" />
          <motion.div
            className="absolute -top-40 -left-32 h-[36rem] w-[36rem] rounded-full blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(123,77,255,0.28), transparent 65%)' }}
            animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-20 -right-32 h-[32rem] w-[32rem] rounded-full blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(18,211,224,0.22), transparent 65%)' }}
            animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
            transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="absolute inset-0 bg-mesh opacity-[0.15]" />
        </div>

        <div className="container-max grid lg:grid-cols-2 gap-10 items-center pt-14 pb-16 sm:pt-20 sm:pb-24">
          {/* Copy */}
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 chip glass border-aurora-400/30 text-aurora-100 mb-6"
            >
              <Sparkles size={13} className="text-cyber-300" /> {t('home.heroBadge')}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05 }}
              className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold leading-[1.02] tracking-tight text-balance"
            >
              <span className="text-gradient">Wear Your Style.</span>
              <br />
              Create Your Identity.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-5 text-lg text-slate-300 max-w-lg mx-auto lg:mx-0"
            >
              {t('brand.sub')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.32 }}
              className="mt-8 flex flex-wrap gap-3 justify-center lg:justify-start"
            >
              <Link to="/shop" className="btn-primary">
                <ShoppingBag size={18} /> {t('action.shopNow')}
              </Link>
              <Link to="/shop?view=collections" className="btn-ghost">
                <Compass size={18} /> {t('action.explore')}
              </Link>
              <Link to="/customize" className="btn-gold">
                <Wand2 size={18} /> {t('action.customize')}
              </Link>
            </motion.div>

            {/* Trust bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto lg:mx-0"
            >
              {trust.map((it) => (
                <div key={it.label} className="flex items-center gap-2 text-xs text-slate-400">
                  <it.icon size={16} className="text-cyber-300 shrink-0" />
                  <span>{it.label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Floating showcase */}
          <div className="relative h-[380px] sm:h-[460px] lg:h-[560px]">
            <div className="absolute inset-0 grid place-items-center">
              <motion.div
                className="relative h-72 w-72 sm:h-96 sm:w-96 rounded-full"
                style={{ background: 'conic-gradient(from 180deg, rgba(123,77,255,0.25), rgba(18,211,224,0.2), rgba(212,175,55,0.18), rgba(123,77,255,0.25))' }}
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
              >
                <div className="absolute inset-6 rounded-full bg-void-950/70 backdrop-blur-xl border border-white/10" />
              </motion.div>
            </div>

            {HERO_PIECES.map((p, i) => {
              const positions = [
                'left-[6%] top-[8%]',
                'right-[4%] top-[22%]',
                'left-[14%] bottom-[10%]',
                'right-[10%] bottom-[6%]',
              ]
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1, y: [0, -14, 0] }}
                  transition={{
                    opacity: { duration: 0.6, delay: 0.3 + i * 0.15 },
                    scale: { duration: 0.6, delay: 0.3 + i * 0.15 },
                    y: { duration: 5 + i, repeat: Infinity, ease: 'easeInOut', delay: p.delay },
                  }}
                  className={`absolute ${positions[i]} glass-card rounded-3xl p-4 shadow-glow`}
                >
                  <Garment kind={p.kind} color={p.color} color2={p.color2} accent={p.accent} className={p.className} />
                </motion.div>
              )
            })}

            {/* NOVA peeking */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="absolute left-1/2 -translate-x-1/2 bottom-0 nova-float"
            >
              <NovaMascot mood="wave" size={92} />
            </motion.div>
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

      {/* ===== SHOP BY CATEGORY ===== */}
      <section className="section-pad pt-0">
        <div className="container-max">
          <SectionHeader eyebrow="Explore" title={t('home.shopByCategory')} sub={t('home.shopByCategorySub')} to="/shop" linkLabel={t('action.viewAll')} />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {CATEGORIES.slice(0, 12).map((c, i) => (
              <Reveal key={c.id} delay={i * 30}>
                <CategoryCard category={c} index={i} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CUSTOMIZE CTA ===== */}
      <section className="section-pad pt-0">
        <div className="container-max">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl glass-strong p-8 sm:p-12">
              <div className="absolute inset-0 -z-10 opacity-60" style={{ background: 'radial-gradient(90% 120% at 100% 0%, rgba(123,77,255,0.35), transparent 60%)' }} />
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="text-xs uppercase tracking-[0.25em] text-aurora-300 mb-3">{t('nav.customize')}</div>
                  <h3 className="font-display text-3xl sm:text-4xl font-semibold">{t('home.customizeCta')}</h3>
                  <p className="mt-3 text-slate-300 max-w-md">{t('home.customizeCtaSub')}</p>
                  <Link to="/customize" className="btn-gold mt-6"><Wand2 size={18} /> {t('action.customize')}</Link>
                </div>
                <div className="flex justify-center gap-4">
                  {(['tshirt', 'cap', 'bag'] as GarmentKind[]).map((k, i) => (
                    <motion.div key={k} animate={{ y: [0, -10, 0] }} transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }} className="glass-card rounded-2xl p-4">
                      <Garment kind={k} color="#1a1a28" accent="#d4af37" className="w-24 sm:w-28">
                        <div className="grid place-items-center h-full w-full">
                          <span className="text-gold-400 text-xl font-display font-bold">A</span>
                        </div>
                      </Garment>
                    </motion.div>
                  ))}
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
        <div className="container-max grid md:grid-cols-2 gap-4">
          <Reveal>
            <Link to="/events" className="group block relative overflow-hidden rounded-3xl glass-card p-8 h-full">
              <div className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'radial-gradient(80% 100% at 0% 100%, rgba(255,179,71,0.25), transparent 60%)' }} />
              <Calendar className="text-gold-400 mb-4" size={28} />
              <h3 className="font-display text-2xl font-semibold">{t('home.eventCta')}</h3>
              <p className="mt-2 text-slate-300 text-sm max-w-sm">{t('home.eventCtaSub')}</p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm text-gold-300 group-hover:gap-2.5 transition-all">{t('action.requestQuote')} <ArrowRight size={15} /></span>
            </Link>
          </Reveal>
          <Reveal delay={80}>
            <Link to="/survey" className="group block relative overflow-hidden rounded-3xl glass-card p-8 h-full">
              <div className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'radial-gradient(80% 100% at 100% 100%, rgba(18,211,224,0.22), transparent 60%)' }} />
              <div className="flex items-start justify-between">
                <div>
                  <Sparkles className="text-cyber-300 mb-4" size={28} />
                  <h3 className="font-display text-2xl font-semibold">{t('home.surveyCta')}</h3>
                  <p className="mt-2 text-slate-300 text-sm max-w-sm">{t('home.surveyCtaSub')}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm text-cyber-300 group-hover:gap-2.5 transition-all">{t('action.startSurvey')} <ArrowRight size={15} /></span>
                </div>
                <div className="hidden sm:block nova-float shrink-0"><NovaMascot mood="point" size={72} /></div>
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

      {/* ===== FINAL CTA ===== */}
      <section className="section-pad pt-0">
        <div className="container-max">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 p-10 sm:p-16 text-center">
            <div className="absolute inset-0 -z-10 bg-aurora-gradient opacity-90" />
            <div className="absolute inset-0 -z-10 bg-void-950/40" />
            <h3 className="font-display text-3xl sm:text-5xl font-bold text-white">Your identity, engineered.</h3>
            <p className="mt-3 text-white/80 max-w-xl mx-auto">Join the TaioMei community and wear fashion that's unmistakably yours.</p>
            <div className="mt-7 flex flex-wrap gap-3 justify-center">
              <Link to="/shop" className="btn bg-white text-void-950 hover:bg-white/90">{t('action.shopNow')} <ChevronRight size={16} /></Link>
              <Link to="/account/signin" className="btn-ghost !border-white/40 text-white">{t('action.register')}</Link>
            </div>
          </div>
        </div>
      </section>

      <QuickView product={quick} onClose={() => setQuick(null)} />
    </div>
  )
}
