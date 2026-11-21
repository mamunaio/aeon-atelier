import { Link } from 'react-router-dom'
import { Instagram, Twitter, Youtube, Facebook, Sparkles, Send } from 'lucide-react'
import { useI18n } from '../../i18n'
import { LanguageSelector } from './LanguageSelector'
import { useUI } from '../../store/ui'
import { useState } from 'react'

export function Footer() {
  const { t } = useI18n()
  const { pushToast } = useUI()
  const [email, setEmail] = useState('')

  const cols = [
    {
      title: t('footer.company'),
      links: [
        { label: t('footer.about'), to: '/page/about' },
        { label: t('footer.events'), to: '/events' },
        { label: t('footer.customization'), to: '/customize' },
        { label: t('nav.survey'), to: '/survey' },
      ],
    },
    {
      title: t('footer.shop'),
      links: [
        { label: t('nav.newArrivals'), to: '/shop?collection=new' },
        { label: t('nav.bestSellers'), to: '/shop?collection=best' },
        { label: t('nav.premium'), to: '/shop?collection=premium' },
        { label: t('footer.categories'), to: '/shop' },
      ],
    },
    {
      title: t('footer.help'),
      links: [
        { label: t('footer.delivery'), to: '/page/delivery' },
        { label: t('footer.returns'), to: '/page/returns' },
        { label: t('footer.faq'), to: '/page/faq' },
        { label: t('footer.support'), to: '/page/contact' },
      ],
    },
  ]

  return (
    <footer className="relative mt-24 border-t border-white/10 bg-void-950/60">
      <div className="container-max section-pad py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          {/* Brand + newsletter */}
          <div>
            <Link to="/" className="flex items-center gap-2.5 mb-4 group inline-flex">
              <span className="grid place-items-center h-10 w-10 rounded-xl overflow-hidden ring-1 ring-white/20 shadow-glow bg-void-900/60 p-0.5 shrink-0 transition-transform group-hover:scale-105">
                <img
                  src="/禅TaioMei.png"
                  alt="TaioMei"
                  className="h-full w-full object-contain rounded-lg"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/logo.png' }}
                />
              </span>
              <span className="font-display font-semibold text-lg">Taio<span className="text-gradient">Mei</span></span>
            </Link>
            <p className="text-sm text-slate-400 max-w-xs">{t('footer.tagline')}</p>
            <p className="text-xs text-slate-500 mt-1">{t('brand.country')}</p>

            <div className="mt-5">
              <div className="text-sm font-medium text-white flex items-center gap-1.5"><Sparkles size={14} className="text-cyber-300" /> {t('footer.newsletter')}</div>
              <p className="text-xs text-slate-400 mt-1">{t('footer.newsletterSub')}</p>
              <form
                onSubmit={(e) => { e.preventDefault(); if (email) { pushToast({ kind: 'success', title: t('footer.subscribe'), desc: email }); setEmail('') } }}
                className="mt-3 flex gap-2 max-w-sm"
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="input flex-1"
                />
                <button type="submit" className="btn-primary btn-sm shrink-0" aria-label={t('footer.subscribe')}><Send size={16} /></button>
              </form>
            </div>
          </div>

          {cols.map((col) => (
            <div key={col.title}>
              <div className="text-sm font-semibold text-white mb-3">{col.title}</div>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-sm text-slate-400 hover:text-white transition-colors">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-500">© 2026 TaioMei. {t('footer.rights')}</span>
            <Link to="/page/privacy" className="text-xs text-slate-500 hover:text-white">{t('footer.privacy')}</Link>
            <Link to="/page/terms" className="text-xs text-slate-500 hover:text-white">{t('footer.terms')}</Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-slate-400">
              {[Instagram, Twitter, Youtube, Facebook].map((Icon, i) => (
                <a key={i} href="#" className="hover:text-white transition-colors" aria-label="social"><Icon size={18} /></a>
              ))}
            </div>
            <LanguageSelector />
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <Link to="/admin" className="text-[11px] text-slate-600 hover:text-slate-400 transition-colors">{t('nav.admin')} →</Link>
        </div>
      </div>
    </footer>
  )
}
