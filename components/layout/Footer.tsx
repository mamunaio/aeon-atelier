'use client'

import { Link } from '../../lib/router'
import { Instagram, Twitter, Youtube, Facebook, Send } from 'lucide-react'
import { motion } from 'framer-motion'
import { useI18n } from '../../i18n'
import { LanguageSelector } from './LanguageSelector'
import { useUI } from '../../store/ui'
import { useState } from 'react'

export function Footer() {
  const { t } = useI18n()
  const { pushToast } = useUI()
  const [email, setEmail] = useState('')
  const [markPos, setMarkPos] = useState<{ x: number; y: number } | null>(null)

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
    <footer className="relative mt-20 border-t border-white/10 bg-[#070709] overflow-hidden">
      <div className="container-max section-pad py-14 pb-0">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          {/* Brand + newsletter */}
          <div>
            <Link to="/" className="inline-flex items-center mb-4 group">
              <img
                src="/logo-white-text.png"
                alt="TaioMei"
                className="h-9 w-auto max-w-[160px] object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                onError={(e) => {
                  ;(e.currentTarget as HTMLImageElement).src = '/logo.png'
                }}
              />
            </Link>
            <p className="text-sm text-[#9E988E] max-w-xs leading-relaxed">{t('footer.tagline')}</p>
            <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#9E988E]/70 mt-1.5">
              {t('brand.country')}
            </p>

            <div className="mt-6">
              <div className="text-xs font-mono uppercase tracking-[0.18em] text-[#F2EFE9] flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#E03E36]" />
                {t('footer.newsletter')}
              </div>
              <p className="text-xs text-[#9E988E] mt-1">{t('footer.newsletterSub')}</p>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (email) {
                    pushToast({ kind: 'success', title: t('footer.subscribe'), desc: email })
                    setEmail('')
                  }
                }}
                className="mt-3 flex gap-2 max-w-sm"
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="input flex-1 !bg-[#0E0E12] !border-white/12 focus:!border-white/30"
                />
                <button type="submit" className="group/send btn-primary btn-sm shrink-0" aria-label={t('footer.subscribe')}>
                  <Send size={15} className="transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/send:translate-x-0.5 group-hover/send:-translate-y-0.5" />
                </button>
              </form>
            </div>
          </div>

          {cols.map((col) => (
            <div key={col.title}>
              <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#F2EFE9] mb-4">
                {col.title}
              </div>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="group/flink relative inline-flex items-center gap-1.5 py-0.5 text-sm text-[#9E988E] hover:text-[#F2EFE9] transition-[color,transform] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:translate-x-1"
                    >
                      <span className="h-1 w-1 rounded-full bg-[#E03E36] opacity-0 scale-50 group-hover/flink:opacity-100 group-hover/flink:scale-100 transition-[opacity,transform] duration-200" />
                      <span className="relative after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-full after:origin-left after:scale-x-0 group-hover/flink:after:scale-x-100 after:bg-[#E03E36]/80 after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.16,1,0.3,1)]">
                        {l.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Legal + Social + Language */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <span className="text-xs text-[#9E988E]">© 2026 TaioMei. {t('footer.rights')}</span>
            <Link to="/page/privacy" className="relative text-xs text-[#9E988E] hover:text-[#F2EFE9] transition-colors after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-full after:origin-left after:scale-x-0 hover:after:scale-x-100 after:bg-white/50 after:transition-transform after:duration-200">
              {t('footer.privacy')}
            </Link>
            <Link to="/page/terms" className="relative text-xs text-[#9E988E] hover:text-[#F2EFE9] transition-colors after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-full after:origin-left after:scale-x-0 hover:after:scale-x-100 after:bg-white/50 after:transition-transform after:duration-200">
              {t('footer.terms')}
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-[#9E988E]">
              {[
                { Icon: Instagram, label: 'Instagram', hover: 'hover:bg-[#E1306C] hover:border-[#E1306C] hover:text-white' },
                { Icon: Twitter, label: 'Twitter', hover: 'hover:bg-[#1DA1F2] hover:border-[#1DA1F2] hover:text-white' },
                { Icon: Youtube, label: 'YouTube', hover: 'hover:bg-[#FF0000] hover:border-[#FF0000] hover:text-white' },
                { Icon: Facebook, label: 'Facebook', hover: 'hover:bg-[#1877F2] hover:border-[#1877F2] hover:text-white' },
              ].map(({ Icon, label, hover }) => (
                <a
                  key={label}
                  href="#"
                  className={`h-8 w-8 rounded-full border border-white/10 bg-[#0E0E12] ${hover} hover:-translate-y-0.5 active:scale-[0.94] grid place-items-center transition-[background-color,border-color,color,transform] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]`}
                  aria-label={label}
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
            <LanguageSelector direction="up" />
          </div>
        </div>

        {/* Couture Calligraphic TaioMei Signature + Hanko Seal */}
        <div className="mt-10 flex flex-col items-center gap-2.5">
          <div className="flex items-center gap-4">
            <span
              className="inline-flex h-7 w-7 items-center justify-center rounded-sm border border-[#E03E36]/60 bg-[#E03E36]/90 text-xs font-semibold text-[#F2EFE9] shadow-[0_0_0_1px_rgba(224,62,54,0.2)] select-none"
              title="TaioMei Seal"
            >
              禅
            </span>
            <motion.span
              initial={{ clipPath: "inset(0 100% 0 0)", opacity: 0.4 }}
              whileInView={{ clipPath: "inset(0 0% 0 0)", opacity: 1 }}
              viewport={{ once: true, margin: "-20px" }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
              style={{ fontFamily: "var(--font-signature), Georgia, serif" }}
              className="text-4xl sm:text-5xl tracking-wide bg-gradient-to-r from-[#F2EFE9] via-[#E5C99B] to-[#C6A87C] bg-clip-text text-transparent select-none pr-2"
            >
              TaioMei
            </motion.span>
          </div>
          <div className="flex items-center gap-3 text-[9px] font-mono uppercase tracking-[0.28em] text-[#9E988E]/70">
            <span>Signed Edition</span>
            <span className="h-1 w-1 rounded-full bg-[#E03E36]" />
            <span>Est. 2026</span>
          </div>
        </div>

        {/* Monumental Architectural Wordmark Sign-off (Full-Width Spaced + Cursor Spotlight) */}
        <div
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect()
            setMarkPos({ x: e.clientX - r.left, y: e.clientY - r.top })
          }}
          onMouseLeave={() => setMarkPos(null)}
          className="relative mt-8 pt-2 pb-4 select-none overflow-hidden w-full"
        >
          <div
            className="w-full flex items-center justify-between font-display text-[13vw] sm:text-[11vw] lg:text-[11.5rem] xl:text-[13rem] font-semibold leading-[0.84] bg-clip-text text-transparent transition-all duration-300"
            style={{
              backgroundImage: markPos
                ? `radial-gradient(280px circle at ${markPos.x}px ${markPos.y}px, rgba(242,239,233,0.36), rgba(224,62,54,0.18) 45%, rgba(255,255,255,0.06) 75%)`
                : 'linear-gradient(180deg, rgba(242,239,233,0.16) 0%, rgba(242,239,233,0.03) 100%)',
            }}
          >
            {['T', 'A', 'I', 'O', 'M', 'E', 'I'].map((ch, idx) => (
              <span key={idx} className="inline-block">
                {ch}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
