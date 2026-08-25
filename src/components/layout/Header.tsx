import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ShoppingBag, Heart, User, Menu, Sparkles, Zap, ZapOff, Wand2, CalendarHeart } from 'lucide-react'
import { useI18n } from '../../i18n'
import { useCart } from '../../store/cart'
import { useWishlist } from '../../store/wishlist'
import { useUI } from '../../store/ui'
import { useAuth } from '../../store/auth'
import { LanguageSelector } from './LanguageSelector'
import { CATEGORIES, COLLECTIONS } from '../../data/categories'

const GROUP_LABELS: Record<string, string> = {
  apparel: 'Apparel',
  footwear: 'Footwear',
  accessories: 'Accessories',
  custom: 'Custom & Events',
}

export function Header() {
  const { t } = useI18n()
  const location = useLocation()
  const navigate = useNavigate()
  const count = useCart((s) => s.count())
  const wishCount = useWishlist((s) => s.ids.length)
  const { setSearchOpen, setMobileMenu, reduceMotion, toggleReduceMotion } = useUI()
  const user = useAuth((s) => s.user)
  const [scrolled, setScrolled] = useState(false)
  const [megaOpen, setMegaOpen] = useState<string | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMegaOpen(null) }, [location.pathname])

  const navLink = (to: string, label: string) => (
    <Link
      to={to}
      className={`px-3 py-2 text-sm rounded-full transition-colors hover:text-white ${
        location.pathname === to ? 'text-white' : 'text-slate-300'
      }`}
    >
      {label}
    </Link>
  )

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-aurora-gradient text-void-950 text-center text-xs font-medium py-1.5 px-4">
        <Sparkles size={12} className="inline mb-0.5 mr-1" />
        {t('home.trustFast')} · {t('delivery.request')} · <span className="font-semibold">WELCOME</span> −15%
      </div>

      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled ? 'glass-strong shadow-glass' : 'bg-transparent'
        }`}
        onMouseLeave={() => setMegaOpen(null)}
      >
        <div className="container-max section-pad">
          <div className="flex items-center justify-between h-16 gap-2">
            {/* Left: logo + mobile menu */}
            <div className="flex items-center gap-2">
              <button className="lg:hidden p-2 -ml-2 text-slate-200" onClick={() => setMobileMenu(true)} aria-label={t('a11y.menu')}>
                <Menu size={22} />
              </button>
              <Link to="/" className="flex items-center gap-2 group">
                <span className="relative grid place-items-center h-9 w-9 rounded-xl bg-aurora-gradient shadow-glow">
                  <span className="font-display font-bold text-void-950 text-lg">A</span>
                  <span className="absolute inset-0 rounded-xl ring-1 ring-white/30" />
                </span>
                <span className="hidden sm:block font-display font-semibold text-lg tracking-tight">
                  AEON <span className="text-gradient">Atelier</span>
                </span>
              </Link>
            </div>

            {/* Center: nav */}
            <nav className="hidden lg:flex items-center gap-0.5">
              <button
                className="px-3 py-2 text-sm rounded-full text-slate-300 hover:text-white transition-colors"
                onMouseEnter={() => setMegaOpen('shop')}
              >
                {t('nav.shop')}
              </button>
              <button
                className="px-3 py-2 text-sm rounded-full text-slate-300 hover:text-white transition-colors"
                onMouseEnter={() => setMegaOpen('collections')}
              >
                {t('nav.collections')}
              </button>
              {navLink('/customize', t('nav.customize'))}
              {navLink('/events', t('nav.events'))}
              {navLink('/survey', t('nav.survey'))}
            </nav>

            {/* Right: actions */}
            <div className="flex items-center gap-0.5 sm:gap-1">
              <button
                onClick={toggleReduceMotion}
                className="hidden sm:grid place-items-center h-9 w-9 rounded-full text-slate-300 hover:bg-white/5 transition-colors"
                title={reduceMotion ? t('a11y.motionOff') : t('a11y.motionOn')}
                aria-label={t('a11y.reduceMotion')}
              >
                {reduceMotion ? <ZapOff size={17} /> : <Zap size={17} />}
              </button>
              <button
                onClick={() => setSearchOpen(true)}
                className="grid place-items-center h-9 w-9 rounded-full text-slate-300 hover:bg-white/5 transition-colors"
                aria-label={t('action.search')}
              >
                <Search size={19} />
              </button>
              <div className="hidden sm:block"><LanguageSelector /></div>
              <Link to="/wishlist" className="relative grid place-items-center h-9 w-9 rounded-full text-slate-300 hover:bg-white/5 transition-colors" aria-label={t('nav.wishlist')}>
                <Heart size={19} />
                {wishCount > 0 && <Badge>{wishCount}</Badge>}
              </Link>
              <Link to={user ? '/account' : '/account/signin'} className="grid place-items-center h-9 w-9 rounded-full text-slate-300 hover:bg-white/5 transition-colors" aria-label={t('nav.account')}>
                <User size={19} />
              </Link>
              <Link id="cart-target" to="/cart" className="relative grid place-items-center h-9 w-9 rounded-full text-slate-300 hover:bg-white/5 transition-colors" aria-label={t('nav.cart')}>
                <ShoppingBag size={19} />
                <AnimatePresence>
                  {count > 0 && (
                    <motion.span
                      key={count}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                    >
                      <Badge accent>{count}</Badge>
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </div>
          </div>
        </div>

        {/* Mega menu */}
        <AnimatePresence>
          {megaOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="absolute inset-x-0 top-full hidden lg:block"
              onMouseEnter={() => setMegaOpen(megaOpen)}
            >
              <div className="container-max section-pad pb-6">
                <div className="glass-strong rounded-3xl p-6 shadow-glass">
                  {megaOpen === 'shop' ? (
                    <div className="grid grid-cols-4 gap-6">
                      {(['apparel', 'footwear', 'accessories', 'custom'] as const).map((group) => (
                        <div key={group}>
                          <div className="text-xs uppercase tracking-widest text-cyber-300 mb-3">{GROUP_LABELS[group]}</div>
                          <ul className="space-y-1.5">
                            {CATEGORIES.filter((c) => c.group === group).map((c) => (
                              <li key={c.id}>
                                <Link to={`/shop?category=${c.id}`} className="text-sm text-slate-300 hover:text-white transition-colors">
                                  {c.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      {COLLECTIONS.map((col) => (
                        <Link
                          key={col.id}
                          to={`/shop?collection=${col.id}`}
                          className="group flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition-colors"
                        >
                          <span className="h-10 w-10 rounded-xl shrink-0" style={{ background: `linear-gradient(135deg, ${col.accent}, ${col.accent}66)` }} />
                          <span>
                            <span className="block text-sm font-medium text-white">{col.name}</span>
                            <span className="block text-xs text-slate-400">{col.blurb}</span>
                          </span>
                        </Link>
                      ))}
                      <Link to="/customize" className="flex items-center gap-3 p-3 rounded-2xl bg-aurora-500/10 hover:bg-aurora-500/20 transition-colors">
                        <Wand2 size={20} className="text-aurora-300" />
                        <span className="text-sm font-medium text-white">{t('nav.customize')}</span>
                      </Link>
                      <Link to="/events" className="flex items-center gap-3 p-3 rounded-2xl bg-cyber-500/10 hover:bg-cyber-500/20 transition-colors">
                        <CalendarHeart size={20} className="text-cyber-300" />
                        <span className="text-sm font-medium text-white">{t('nav.events')}</span>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  )
}

function Badge({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span
      className={`absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 grid place-items-center rounded-full text-[10px] font-bold ${
        accent ? 'bg-aurora-gradient text-void-950' : 'bg-cyber-400 text-void-950'
      }`}
    >
      {children}
    </span>
  )
}
