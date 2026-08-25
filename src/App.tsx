import { Suspense, lazy, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { MobileNav } from './components/layout/MobileNav'
import { MobileMenu } from './components/layout/MobileMenu'
import { FashionAssistant } from './components/assistant/FashionAssistant'
import { Toaster } from './components/ui/Toaster'
import { FlyToCart } from './components/ui/FlyToCart'
import { SearchOverlay } from './components/SearchOverlay'
import { useUI } from './store/ui'
import { PageLoader } from './components/ui/PageLoader'

const Home = lazy(() => import('./pages/Home'))
const Shop = lazy(() => import('./pages/Shop'))
const ProductPage = lazy(() => import('./pages/ProductPage'))
const Cart = lazy(() => import('./pages/Cart'))
const Checkout = lazy(() => import('./pages/Checkout'))
const Customize = lazy(() => import('./pages/Customize'))
const Events = lazy(() => import('./pages/Events'))
const Survey = lazy(() => import('./pages/Survey'))
const Wishlist = lazy(() => import('./pages/Wishlist'))
const Account = lazy(() => import('./pages/Account'))
const SignIn = lazy(() => import('./pages/SignIn'))
const Admin = lazy(() => import('./pages/Admin'))
const OrderTracking = lazy(() => import('./pages/OrderTracking'))
const StaticPage = lazy(() => import('./pages/StaticPage'))
const NotFound = lazy(() => import('./pages/NotFound'))

function ScrollToTop() {
  const { pathname, search } = useLocation()
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'auto' }) }, [pathname, search])
  return null
}

function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  return (
    <div className="min-h-screen flex flex-col noise-overlay">
      {!isAdmin && <Header />}
      <main className="flex-1">{children}</main>
      {!isAdmin && <Footer />}
      {!isAdmin && <MobileNav />}
      {!isAdmin && <MobileMenu />}
      {!isAdmin && <FashionAssistant />}
      <SearchOverlay />
      <Toaster />
      <FlyToCart />
      {!isAdmin && <div className="h-16 lg:hidden" />}
    </div>
  )
}

export default function App() {
  const reduceMotion = useUI((s) => s.reduceMotion)

  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', reduceMotion)
  }, [reduceMotion])

  return (
    <>
      <ScrollToTop />
      <AppShell>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:slug" element={<ProductPage />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/customize" element={<Customize />} />
            <Route path="/events" element={<Events />} />
            <Route path="/survey" element={<Survey />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/account" element={<Account />} />
            <Route path="/account/signin" element={<SignIn />} />
            <Route path="/track/:id" element={<OrderTracking />} />
            <Route path="/track" element={<OrderTracking />} />
            <Route path="/admin/*" element={<Admin />} />
            <Route path="/page/:slug" element={<StaticPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AppShell>
    </>
  )
}
