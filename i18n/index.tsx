'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { en, type Dict } from './en'
import { ms } from './ms'
import { vi } from './vi'
import { zh } from './zh'
import { bn } from './bn'
import type { Locale } from '../types'

type Translatable<T> = T extends string ? string : { [K in keyof T]?: Translatable<T[K]> }

// Every non-English locale is a partial; missing keys resolve to English.
const DICTS: Record<Locale, Translatable<Dict>> = { en, ms, vi, zh, bn }

export const LOCALES: { code: Locale; short: string; label: string }[] = [
  { code: 'en', short: 'EN', label: 'English' },
  { code: 'ms', short: 'BM', label: 'Bahasa Melayu' },
  { code: 'vi', short: 'VI', label: 'Tiếng Việt' },
  { code: 'zh', short: '中文', label: '简体中文' },
  { code: 'bn', short: 'বাংলা', label: 'বাংলা' },
]

function walk(obj: any, path: string[]): string | undefined {
  let cur = obj
  for (const p of path) {
    if (cur == null) return undefined
    cur = cur[p]
  }
  return typeof cur === 'string' ? cur : undefined
}

function interpolate(str: string, vars?: Record<string, string | number>): string {
  if (!vars) return str
  return str.replace(/\{(\w+)\}/g, (_, k) => (vars[k] != null ? String(vars[k]) : `{${k}}`))
}

interface I18nCtx {
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: string, vars?: Record<string, string | number>) => string
}

const Ctx = createContext<I18nCtx | null>(null)
const STORAGE_KEY = 'aeon.locale'

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = (typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY)) as Locale | null
    return saved && DICTS[saved] ? saved : 'en'
  })

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
    try { localStorage.setItem(STORAGE_KEY, l) } catch {}
    // Track for admin "language usage" analytics
    try {
      const raw = localStorage.getItem('aeon.langUsage')
      const usage = raw ? JSON.parse(raw) : {}
      usage[l] = (usage[l] || 0) + 1
      localStorage.setItem('aeon.langUsage', JSON.stringify(usage))
    } catch {}
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const t = useCallback((key: string, vars?: Record<string, string | number>) => {
    const path = key.split('.')
    const primary = walk(DICTS[locale], path)
    const fallback = walk(en, path)
    return interpolate(primary ?? fallback ?? key, vars)
  }, [locale])

  return <Ctx.Provider value={{ locale, setLocale, t }}>{children}</Ctx.Provider>
}

export function useI18n() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}

/** Convenience hook returning just the translator. */
export function useT() {
  return useI18n().t
}
