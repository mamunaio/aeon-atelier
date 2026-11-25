'use client'

import { Suspense, useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { I18nProvider } from '../../i18n'
import { Header } from './Header'
import { Footer } from './Footer'
import { MobileNav } from './MobileNav'
import { MobileMenu } from './MobileMenu'
import { FashionAssistant } from '../assistant/FashionAssistant'
import { Toaster } from '../ui/Toaster'
import { FlyToCart } from '../ui/FlyToCart'
import { SearchOverlay } from '../SearchOverlay'
import { useUI } from '../../store/ui'

function ScrollToTop() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const search = searchParams?.toString() ?? ''
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname, search])
  return null
}

function ShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/'
  const reduceMotion = useUI((s) => s.reduceMotion)
  const isAdmin = pathname.startsWith('/admin')

  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', reduceMotion)
  }, [reduceMotion])

  return (
    <div className="min-h-screen flex flex-col noise-overlay">
      <Suspense fallback={null}>
        <ScrollToTop />
        {!isAdmin && <Header />}
      </Suspense>
      <main className="flex-1">{children}</main>
      <Suspense fallback={null}>
        {!isAdmin && <Footer />}
        {!isAdmin && <MobileNav />}
        {!isAdmin && <MobileMenu />}
        {!isAdmin && <FashionAssistant />}
        <SearchOverlay />
        <Toaster />
        <FlyToCart />
      </Suspense>
      {!isAdmin && <div className="h-16 lg:hidden" />}
    </div>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <ShellInner>{children}</ShellInner>
    </I18nProvider>
  )
}
