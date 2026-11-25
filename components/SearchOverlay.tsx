'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from '../lib/router'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, X, TrendingUp, Clock, Tag, Palette, Layers } from 'lucide-react'
import { useUI } from '../store/ui'
import { useI18n } from '../i18n'
import { search, suggestions, POPULAR_SEARCHES } from '../lib/search'
import { Garment } from './Garment'
import { formatMoney } from '../lib/format'

export function SearchOverlay() {
  const { searchOpen, setSearchOpen, searchHistory, addSearch } = useUI()
  const { t } = useI18n()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (searchOpen) {
      setQ('')
      setTimeout(() => inputRef.current?.focus(), 60)
    }
  }, [searchOpen])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSearchOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setSearchOpen])

  const sugg = useMemo(() => suggestions(q, 6), [q])
  const results = useMemo(() => search(q, 6), [q])

  const go = (query: string) => {
    addSearch(query)
    setSearchOpen(false)
    navigate(`/shop?q=${encodeURIComponent(query)}`)
  }

  const typeIcon = { product: Layers, category: Tag, color: Palette, query: Search }

  return (
    <AnimatePresence>
      {searchOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSearchOpen(false)}
            className="fixed inset-0 z-[65] bg-void-950/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-x-0 top-0 z-[66] px-4 pt-4 sm:pt-10"
          >
            <div className="container-max max-w-2xl mx-auto">
              <div className="glass-strong rounded-3xl overflow-hidden shadow-glass">
                <form onSubmit={(e) => { e.preventDefault(); if (q.trim()) go(q.trim()) }} className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
                  <Search size={20} className="text-cyber-300 shrink-0" />
                  <input
                    ref={inputRef}
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder={t('search.placeholder')}
                    className="flex-1 bg-transparent outline-none text-lg text-white placeholder:text-slate-500"
                  />
                  <button type="button" onClick={() => setSearchOpen(false)} className="text-slate-400 hover:text-white p-1" aria-label={t('action.close')}>
                    <X size={20} />
                  </button>
                </form>

                <div className="max-h-[60vh] overflow-y-auto p-3">
                  {!q && (
                    <div className="space-y-4">
                      {searchHistory.length > 0 && (
                        <div>
                          <div className="px-2 mb-1.5 text-xs uppercase tracking-widest text-slate-500 flex items-center gap-1.5"><Clock size={12} /> {t('search.recent')}</div>
                          <div className="flex flex-wrap gap-2 px-2">
                            {searchHistory.map((h) => (
                              <button key={h} onClick={() => go(h)} className="chip hover:border-white/30">{h}</button>
                            ))}
                          </div>
                        </div>
                      )}
                      <div>
                        <div className="px-2 mb-1.5 text-xs uppercase tracking-widest text-slate-500 flex items-center gap-1.5"><TrendingUp size={12} /> {t('search.popular')}</div>
                        <div className="flex flex-wrap gap-2 px-2">
                          {POPULAR_SEARCHES.map((h) => (
                            <button key={h} onClick={() => go(h)} className="chip hover:border-white/30">{h}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {q && sugg.length > 0 && (
                    <div className="mb-2">
                      <div className="px-2 mb-1 text-xs uppercase tracking-widest text-slate-500">{t('search.suggestions')}</div>
                      {sugg.map((s, i) => {
                        const Icon = typeIcon[s.type]
                        return (
                          <button
                            key={i}
                            onClick={() => { setSearchOpen(false); if (s.slug) navigate(`/product/${s.slug}`); else go(s.label) }}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 text-left transition-colors"
                          >
                            <Icon size={15} className="text-slate-400 shrink-0" />
                            <span className="text-sm text-slate-200">{s.label}</span>
                            <span className="ml-auto text-[10px] uppercase text-slate-500">{s.type}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {q && results.length > 0 && (
                    <div>
                      <div className="px-2 mb-1 text-xs uppercase tracking-widest text-slate-500">{t('search.results', { q })}</div>
                      <div className="grid gap-1">
                        {results.map(({ product }) => (
                          <button
                            key={product.id}
                            onClick={() => { setSearchOpen(false); navigate(`/product/${product.slug}`) }}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 text-left transition-colors"
                          >
                            <div className="h-12 w-12 rounded-xl glass grid place-items-center shrink-0 p-1">
                              <Garment kind={product.kind} color={product.colors[0].hex} className="h-full w-full" showDetail={false} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm text-white truncate">{product.name}</div>
                              <div className="text-xs text-slate-400">{formatMoney(product.price)}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {q && sugg.length === 0 && results.length === 0 && (
                    <div className="py-10 text-center">
                      <p className="text-slate-400">{t('search.noResults', { q })}</p>
                      <div className="mt-3 flex flex-wrap gap-2 justify-center">
                        {POPULAR_SEARCHES.slice(0, 4).map((h) => (
                          <button key={h} onClick={() => go(h)} className="chip hover:border-white/30">{h}</button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
