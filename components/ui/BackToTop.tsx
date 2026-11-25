'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp } from 'lucide-react'
import { useCart } from '../../store/cart'

export function BackToTop() {
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(0)
  const rawCount = useCart((s) => s.count())
  const hasBagItems = mounted && rawCount > 0

  useEffect(() => {
    setMounted(true)
    const onScroll = () => {
      const y = window.scrollY
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      setVisible(y > 420)
      setProgress(Math.min(1, Math.max(0, y / max)))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const r = 19
  const circ = 2 * Math.PI * r

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 12, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.92 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
          className={`group fixed z-30 right-4 sm:right-6 h-11 w-11 rounded-full bg-[#0B0B0E] border border-white/15 hover:border-white/35 grid place-items-center shadow-[0_14px_34px_rgba(0,0,0,0.8)] active:scale-[0.94] transition-[bottom,border-color,transform] duration-200 ${
            hasBagItems ? 'bottom-20 sm:bottom-20' : 'bottom-20 sm:bottom-6'
          }`}
        >
          <svg className="absolute inset-0 h-full w-full -rotate-90 pointer-events-none" viewBox="0 0 44 44">
            <circle cx="22" cy="22" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />
            <circle
              cx="22"
              cy="22"
              r={r}
              fill="none"
              stroke="#E03E36"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={circ * (1 - progress)}
            />
          </svg>
          <ArrowUp
            size={15}
            className="relative z-10 text-[#F2EFE9] transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-0.5"
          />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
