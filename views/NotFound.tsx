'use client'

import { Link } from '../lib/router'
import { motion } from 'framer-motion'
import { Home, Search, ShoppingBag } from 'lucide-react'
import { useI18n } from '../i18n'
import { useHead } from '../lib/seo'
import { useUI } from '../store/ui'
import { NovaMascot } from '../components/assistant/NovaMascot'

export default function NotFound() {
  const { t } = useI18n()
  const { setSearchOpen } = useUI()
  useHead({ title: 'Page not found — TaioMei', description: 'The page you were looking for has drifted off into the void.', path: '/404' })

  return (
    <div className="container-max section-pad">
      <div className="relative overflow-hidden glass-strong rounded-3xl p-8 sm:p-16 max-w-2xl mx-auto text-center">
        <div className="absolute inset-0 -z-10 opacity-50" style={{ background: 'radial-gradient(70% 70% at 50% 0%, rgba(123,77,255,0.22), transparent 60%)' }} />
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="nova-float mb-2 flex justify-center">
          <NovaMascot mood="think" size={130} />
        </motion.div>
        <div className="font-display text-7xl sm:text-8xl font-bold text-gradient">404</div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold mt-2">This piece isn't in the collection</h1>
        <p className="text-slate-400 mt-3 max-w-md mx-auto">The page you were looking for has drifted off into the void. Let's get you back to something beautiful.</p>
        <div className="mt-7 flex flex-wrap gap-2.5 justify-center">
          <Link to="/" className="btn-primary"><Home size={16} /> {t('nav.home')}</Link>
          <Link to="/shop" className="btn-ghost"><ShoppingBag size={15} /> {t('nav.shop')}</Link>
          <button onClick={() => setSearchOpen(true)} className="btn-ghost"><Search size={15} /> {t('action.search')}</button>
        </div>
      </div>
    </div>
  )
}
