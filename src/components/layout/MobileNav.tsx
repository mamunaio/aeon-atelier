import { Link, useLocation } from 'react-router-dom'
import { Home, Grid3x3, Search, ShoppingBag, User } from 'lucide-react'
import { motion } from 'framer-motion'
import { useI18n } from '../../i18n'
import { useCart } from '../../store/cart'
import { useUI } from '../../store/ui'
import { useAuth } from '../../store/auth'

export function MobileNav() {
  const { t } = useI18n()
  const location = useLocation()
  const count = useCart((s) => s.count())
  const { setSearchOpen } = useUI()
  const user = useAuth((s) => s.user)

  const items = [
    { to: '/', icon: Home, label: t('nav.home') },
    { to: '/shop', icon: Grid3x3, label: t('nav.categories') },
    { action: () => setSearchOpen(true), icon: Search, label: t('nav.search') },
    { to: '/cart', icon: ShoppingBag, label: t('nav.cart'), badge: count },
    { to: user ? '/account' : '/account/signin', icon: User, label: t('nav.account') },
  ]

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 glass-strong border-t border-white/10 pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5">
        {items.map((it, i) => {
          const active = it.to && location.pathname === it.to
          const Icon = it.icon
          const inner = (
            <span className="relative flex flex-col items-center gap-1 py-2.5">
              <span className="relative">
                <Icon size={21} className={active ? 'text-cyber-300' : 'text-slate-400'} />
                {it.badge != null && it.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 grid place-items-center rounded-full text-[9px] font-bold bg-aurora-gradient text-void-950">
                    {it.badge}
                  </span>
                )}
                {active && (
                  <motion.span layoutId="mobilenav-dot" className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-cyber-300" />
                )}
              </span>
              <span className={`text-[10px] ${active ? 'text-white' : 'text-slate-500'}`}>{it.label}</span>
            </span>
          )
          return it.to ? (
            <Link key={i} to={it.to}>{inner}</Link>
          ) : (
            <button key={i} onClick={it.action}>{inner}</button>
          )
        })}
      </div>
    </nav>
  )
}
