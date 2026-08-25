import { useState, useRef, useEffect } from 'react'
import { Globe, Check, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useI18n, LOCALES } from '../../i18n'

export function LanguageSelector({ variant = 'compact' }: { variant?: 'compact' | 'inline' }) {
  const { locale, setLocale } = useI18n()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  if (variant === 'inline') {
    return (
      <div className="flex flex-wrap items-center gap-1.5">
        {LOCALES.map((l) => (
          <button
            key={l.code}
            onClick={() => setLocale(l.code)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
              locale === l.code ? 'bg-aurora-gradient text-void-950' : 'text-slate-400 hover:text-white border border-white/10'
            }`}
          >
            {l.short}
          </button>
        ))}
      </div>
    )
  }

  const current = LOCALES.find((l) => l.code === locale)!

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm text-slate-200 hover:bg-white/5 border border-white/10 transition-colors"
        aria-label="Select language"
        aria-expanded={open}
      >
        <Globe size={15} />
        <span className="font-medium">{current.short}</span>
        <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 mt-2 w-52 glass-strong rounded-2xl p-1.5 z-50 shadow-glass"
          >
            {LOCALES.map((l) => (
              <button
                key={l.code}
                onClick={() => { setLocale(l.code); setOpen(false) }}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                  locale === l.code ? 'bg-white/8 text-white' : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <span className="inline-flex h-6 w-9 items-center justify-center rounded-md bg-void-700 text-[11px] font-semibold">{l.short}</span>
                  {l.label}
                </span>
                {locale === l.code && <Check size={15} className="text-cyber-300" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
