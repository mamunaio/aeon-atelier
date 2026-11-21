import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X, ChevronRight } from 'lucide-react'
import { useI18n } from '../../i18n'
import { useUI } from '../../store/ui'
import { LanguageSelector } from './LanguageSelector'
import { CATEGORIES } from '../../data/categories'

const LINKS = [
  { to: '/shop', key: 'nav.shop' },
  { to: '/shop?collection=new', key: 'nav.newArrivals' },
  { to: '/shop?collection=best', key: 'nav.bestSellers' },
  { to: '/customize', key: 'nav.customize' },
  { to: '/events', key: 'nav.events' },
  { to: '/survey', key: 'nav.survey' },
  { to: '/wishlist', key: 'nav.wishlist' },
  { to: '/account', key: 'nav.account' },
]

export function MobileMenu() {
  const { t } = useI18n()
  const { mobileMenu, setMobileMenu } = useUI()

  return (
    <AnimatePresence>
      {mobileMenu && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenu(false)}
            className="fixed inset-0 z-[55] bg-void-950/70 backdrop-blur-sm lg:hidden"
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 32 }}
            className="fixed inset-y-0 left-0 z-[56] w-[85%] max-w-sm glass-strong lg:hidden overflow-y-auto"
          >
            <div className="p-5">
              <div className="flex items-center justify-between mb-6">
                <Link to="/" onClick={() => setMobileMenu(false)} className="flex items-center">
                  <img
                    src="/logo.png"
                    alt="TaioMei"
                    className="h-8 w-auto max-w-[130px] object-contain rounded-md"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/logo-white-text.png' }}
                  />
                </Link>
                <button onClick={() => setMobileMenu(false)} className="p-2 text-slate-300" aria-label={t('action.close')}>
                  <X size={22} />
                </button>
              </div>

              <nav className="space-y-1">
                {LINKS.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setMobileMenu(false)}
                    className="flex items-center justify-between px-3 py-3 rounded-xl text-slate-200 hover:bg-white/5 transition-colors"
                  >
                    <span className="font-medium">{t(l.key)}</span>
                    <ChevronRight size={16} className="text-slate-500" />
                  </Link>
                ))}
              </nav>

              <div className="mt-6">
                <div className="text-xs uppercase tracking-widest text-cyber-300 mb-2 px-3">{t('nav.categories')}</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {CATEGORIES.slice(0, 12).map((c) => (
                    <Link
                      key={c.id}
                      to={`/shop?category=${c.id}`}
                      onClick={() => setMobileMenu(false)}
                      className="px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="text-xs uppercase tracking-widest text-slate-500 mb-3 px-1">{t('footer.language')}</div>
                <LanguageSelector variant="inline" />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
