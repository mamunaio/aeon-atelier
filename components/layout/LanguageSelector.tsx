'use client'

import { useState, useRef, useEffect } from 'react'
import { Globe, Check, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useI18n, LOCALES } from '../../i18n'

export function LanguageSelector({
  variant = 'compact',
  direction = 'down',
}: {
  variant?: 'compact' | 'inline'
  direction?: 'down' | 'up'
}) {
  const { locale, setLocale } = useI18n()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cancelClose = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }

  const scheduleClose = () => {
    cancelClose()
    closeTimerRef.current = setTimeout(() => setOpen(false), 120)
  }

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    window.addEventListener('keydown', onEsc)
    return () => {
      cancelClose()
      document.removeEventListener('mousedown', onClick)
      window.removeEventListener('keydown', onEsc)
    }
  }, [])

  if (variant === 'inline') {
    return (
      <div className="flex flex-wrap items-center gap-1.5">
        {LOCALES.map((l) => (
          <button
            key={l.code}
            type="button"
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
    <div
      className="relative"
      ref={ref}
      onMouseEnter={() => {
        cancelClose()
        setOpen(true)
      }}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        onClick={() => {
          cancelClose()
          setOpen((o) => !o)
        }}
        className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm text-[#F2EFE9] hover:bg-white/5 border border-white/10 active:scale-[0.97] transition-[background-color,transform] duration-150"
        aria-label="Select language"
        aria-expanded={open}
      >
        <Globe size={15} className="text-[#B4AEA4]" />
        <span className="font-medium">{current.short}</span>
        <ChevronDown
          size={13}
          className={`text-[#B4AEA4] transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: direction === 'up' ? 8 : -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: direction === 'up' ? 8 : -8, scale: 0.96 }}
            transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
            style={{ transformOrigin: direction === 'up' ? 'bottom right' : 'top right' }}
            onMouseEnter={cancelClose}
            className={`absolute right-0 w-52 z-50 ${
              direction === 'up' ? 'bottom-full pb-2' : 'top-full pt-2'
            }`}
          >
            <div className="bg-[#0E0E12] border border-white/15 rounded-2xl p-1.5 shadow-2xl">
              {LOCALES.map((l) => {
                const selected = locale === l.code
                return (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => {
                      setLocale(l.code)
                      setOpen(false)
                    }}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-sm transition-colors duration-150 active:scale-[0.98] ${
                      selected
                        ? 'bg-white/10 text-[#F2EFE9]'
                        : 'text-[#B4AEA4] hover:bg-white/5 hover:text-[#F2EFE9]'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="inline-flex h-6 w-9 items-center justify-center rounded-md bg-white/[0.06] border border-white/10 text-[11px] font-semibold text-[#F2EFE9]">
                        {l.short}
                      </span>
                      <span>{l.label}</span>
                    </span>
                    {selected && <Check size={15} className="text-[#E03E36] shrink-0" />}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
