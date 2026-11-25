'use client'

import { useState, useEffect } from 'react'
import { Link, useNavigate } from '../lib/router'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User as UserIcon, Package, Heart, Wand2, MapPin, Sparkles, Award, LogOut, Plus, Trash2,
  ChevronRight, Check, Star, Gift, Clock, ShoppingBag, Eye,
} from 'lucide-react'
import { useAuth } from '../store/auth'
import { useOrders } from '../store/orders'
import { useWishlist } from '../store/wishlist'
import { useConfig } from '../store/config'
import { useUI } from '../store/ui'
import { useI18n } from '../i18n'
import { useHead } from '../lib/seo'
import { PRODUCT_BY_ID } from '../data/products'
import { Garment } from '../components/Garment'
import { NovaMascot } from '../components/assistant/NovaMascot'
import { formatMoney, initials } from '../lib/format'
import type { Product } from '../types'

type TabKey = 'profile' | 'orders' | 'designs' | 'wishlist' | 'addresses' | 'style' | 'rewards'

const TIERS = ['Explorer', 'Insider', 'Icon'] as const
const TIER_THRESHOLD: Record<string, number> = { Explorer: 0, Insider: 500, Icon: 1500 }

export default function Account() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { user, designs, signOut, removeDesign } = useAuth()
  const [tab, setTab] = useState<TabKey>('profile')

  useEffect(() => { if (!user) navigate('/account/signin', { replace: true }) }, [user, navigate])
  useHead({ title: `${t('account.title')} — TaioMei`, description: 'Your TaioMei account.', path: '/account' })

  if (!user) return null

  const tabs: { key: TabKey; label: string; icon: typeof UserIcon }[] = [
    { key: 'profile', label: t('account.profile'), icon: UserIcon },
    { key: 'orders', label: t('account.orders'), icon: Package },
    { key: 'designs', label: t('account.designs'), icon: Wand2 },
    { key: 'wishlist', label: t('account.wishlist'), icon: Heart },
    { key: 'addresses', label: t('account.addresses'), icon: MapPin },
    { key: 'style', label: t('account.styleProfile'), icon: Sparkles },
    { key: 'rewards', label: t('account.rewards'), icon: Award },
  ]

  return (
    <div className="container-max section-pad">
      {/* Header */}
      <div className="glass-strong rounded-3xl p-6 sm:p-7 mb-6 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-40" style={{ background: 'radial-gradient(60% 90% at 90% 0%, rgba(123,77,255,0.22), transparent 60%)' }} />
        <div className="flex items-center gap-4 flex-wrap">
          <div className="h-16 w-16 rounded-2xl bg-aurora-gradient grid place-items-center text-xl font-display font-bold text-white shrink-0">{initials(user.name)}</div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-slate-400">{t('account.welcome')},</div>
            <h1 className="font-display text-2xl font-semibold">{user.name}</h1>
            <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 flex-wrap">
              <span className="flex items-center gap-1"><Award size={13} className="text-gold-400" /> {user.tier}</span>
              <span className="flex items-center gap-1"><Star size={13} className="text-cyber-300" /> {user.rewardPoints} {t('account.points')}</span>
              {user.phone && <span>{user.phone}</span>}
              {user.email && <span className="truncate">{user.email}</span>}
            </div>
          </div>
          <button onClick={() => { signOut(); navigate('/') }} className="btn-ghost btn-sm text-slate-400 hover:text-rose-300"><LogOut size={15} /> {t('action.signOut')}</button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[240px_1fr] gap-6 items-start">
        {/* Tabs */}
        <nav className="flex lg:flex-col gap-1.5 overflow-x-auto no-scrollbar lg:sticky lg:top-24 -mx-1 px-1">
          {tabs.map((tb) => (
            <button key={tb.key} onClick={() => setTab(tb.key)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm whitespace-nowrap transition-all ${tab === tb.key ? 'bg-aurora-500/15 text-white border border-aurora-400/30' : 'text-slate-400 hover:bg-white/5 border border-transparent'}`}>
              <tb.icon size={16} /> {tb.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="min-h-[300px]">
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              {tab === 'profile' && <ProfileTab />}
              {tab === 'orders' && <OrdersTab />}
              {tab === 'designs' && <DesignsTab designs={designs} onRemove={removeDesign} />}
              {tab === 'wishlist' && <WishlistTab />}
              {tab === 'addresses' && <AddressesTab />}
              {tab === 'style' && <StyleTab />}
              {tab === 'rewards' && <RewardsTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

// ---------------- Profile ----------------
function ProfileTab() {
  const { t } = useI18n()
  const { user } = useAuth()
  const { recentlyViewed } = useUI()
  if (!user) return null
  const recent = recentlyViewed.map((id) => PRODUCT_BY_ID[id]).filter(Boolean).slice(0, 6) as Product[]

  return (
    <div className="space-y-5">
      <Panel title={t('account.profile')}>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <Info label={t('checkout.name')} value={user.name} />
          <Info label={t('checkout.phone')} value={user.phone || '—'} />
          <Info label={t('checkout.email')} value={user.email || '—'} />
          <Info label={t('account.memberSince')} value={new Date(user.createdAt).toLocaleDateString('en-MY', { month: 'long', year: 'numeric' })} />
          <Info label={t('account.tier')} value={user.tier} />
          <Info label={t('account.points')} value={`${user.rewardPoints}`} />
        </div>
      </Panel>

      {recent.length > 0 && (
        <Panel title={t('account.recent')} icon={Eye}>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {recent.map((p) => (
              <Link key={p.id} to={`/product/${p.slug}`} className="glass rounded-xl p-2 hover:border-white/25 transition-colors">
                <Garment kind={p.kind} color={p.colors[0].hex} accent={p.styles[0].accent} className="w-full h-16" showDetail={false} />
                <div className="text-[11px] text-slate-400 truncate mt-1">{p.name}</div>
              </Link>
            ))}
          </div>
        </Panel>
      )}
    </div>
  )
}

// ---------------- Orders ----------------
function OrdersTab() {
  const { t } = useI18n()
  const { orders } = useOrders()
  if (orders.length === 0) return <Empty icon={Package} title={t('account.noOrders')} cta />
  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <div key={o.id} className="glass-card rounded-2xl p-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <div className="font-medium text-white">{o.id}</div>
              <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><Clock size={11} /> {new Date(o.placedAt).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
            </div>
            <span className={`chip text-xs ${o.status === 'delivered' ? 'text-emerald-300 border-emerald-400/30' : o.status === 'cancelled' ? 'text-rose-300 border-rose-400/30' : 'text-cyber-300 border-cyber-400/30'}`}>{t(`status.${o.status}`)}</span>
          </div>
          <div className="flex items-center gap-2 mt-3">
            {o.items.slice(0, 4).map((item) => (
              <div key={item.id} className="h-11 w-11 rounded-lg glass grid place-items-center p-1.5"><Garment kind={item.kind} color={item.colorHex} className="h-full w-full" showDetail={false} /></div>
            ))}
            {o.items.length > 4 && <span className="text-xs text-slate-500">+{o.items.length - 4}</span>}
            <div className="ml-auto text-right">
              <div className="font-display font-semibold">{formatMoney(o.total)}</div>
              <Link to={`/track/${o.id}`} className="text-xs text-cyber-300 hover:underline flex items-center gap-0.5 justify-end">{t('action.trackOrder')} <ChevronRight size={12} /></Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ---------------- Designs ----------------
function DesignsTab({ designs, onRemove }: { designs: ReturnType<typeof useAuth.getState>['designs']; onRemove: (id: string) => void }) {
  const { t } = useI18n()
  if (designs.length === 0) return <Empty icon={Wand2} title={t('account.noDesigns')} ctaLabel={t('nav.customize')} ctaTo="/customize" />
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {designs.map((d) => {
        const product = PRODUCT_BY_ID[d.productId]
        return (
          <div key={d.id} className="glass-card rounded-2xl p-4">
            <div className="relative aspect-square rounded-xl glass grid place-items-center p-4 mb-3">
              {product && <Garment kind={product.kind} color={product.colors[0].hex} accent={product.styles[0].accent} className="w-full h-full" />}
              <span className="absolute top-2 right-2 h-6 w-6 grid place-items-center rounded-full bg-aurora-gradient text-white"><Wand2 size={12} /></span>
            </div>
            <div className="font-medium text-sm truncate">{d.name}</div>
            <div className="text-xs text-slate-500">{d.elements.length} elements · {d.colorName}</div>
            <div className="flex gap-2 mt-3">
              {product && <Link to={`/customize?product=${product.slug}`} className="btn-primary btn-sm flex-1">Edit</Link>}
              <button onClick={() => onRemove(d.id)} className="btn-ghost btn-sm px-3 text-slate-400 hover:text-rose-300"><Trash2 size={14} /></button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ---------------- Wishlist ----------------
function WishlistTab() {
  const { t } = useI18n()
  const { ids } = useWishlist()
  const products = ids.map((id) => PRODUCT_BY_ID[id]).filter(Boolean).slice(0, 8) as Product[]
  if (products.length === 0) return <Empty icon={Heart} title={t('wishlist.empty')} ctaLabel={t('action.shopNow')} ctaTo="/shop" />
  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {products.map((p) => (
          <Link key={p.id} to={`/product/${p.slug}`} className="glass-card rounded-2xl p-3 hover:border-white/25 transition-colors">
            <Garment kind={p.kind} color={p.colors[0].hex} color2={p.colors[0].hex2} accent={p.styles[0].accent} className="w-full h-24" />
            <div className="text-sm text-white truncate mt-2">{p.name}</div>
            <div className="font-display font-semibold text-sm mt-0.5">{formatMoney(p.price)}</div>
          </Link>
        ))}
      </div>
      <Link to="/wishlist" className="btn-ghost btn-sm mt-4"><Heart size={14} /> {t('account.wishlist')} <ChevronRight size={14} /></Link>
    </>
  )
}

// ---------------- Addresses ----------------
function AddressesTab() {
  const { t } = useI18n()
  const { user, addAddress, removeAddress } = useAuth()
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ label: 'Home', line: '', city: '', postal: '', country: 'Malaysia' })
  if (!user) return null

  const save = (e: React.FormEvent) => {
    e.preventDefault()
    addAddress({ ...form, isDefault: user.addresses.length === 0 })
    setForm({ label: 'Home', line: '', city: '', postal: '', country: 'Malaysia' }); setAdding(false)
  }

  return (
    <div className="space-y-4">
      {user.addresses.length === 0 && !adding && <Empty icon={MapPin} title="No saved addresses" />}
      <div className="grid sm:grid-cols-2 gap-3">
        {user.addresses.map((a) => (
          <div key={a.id} className="glass-card rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <span className="font-medium flex items-center gap-2">{a.label} {a.isDefault && <span className="chip text-[10px] text-cyber-300 border-cyber-400/30">Default</span>}</span>
              <button onClick={() => removeAddress(a.id)} className="text-slate-500 hover:text-rose-300"><Trash2 size={14} /></button>
            </div>
            <p className="text-sm text-slate-400 mt-1">{a.line}</p>
            <p className="text-sm text-slate-400">{a.city} {a.postal}, {a.country}</p>
          </div>
        ))}
      </div>

      {adding ? (
        <form onSubmit={save} className="glass-card rounded-2xl p-5 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div><label className="label">Label</label><input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className="input" /></div>
            <div><label className="label">{t('checkout.city')}</label><input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input" required /></div>
            <div className="sm:col-span-2"><label className="label">{t('checkout.address')}</label><input value={form.line} onChange={(e) => setForm({ ...form, line: e.target.value })} className="input" required /></div>
            <div><label className="label">{t('checkout.postal')}</label><input value={form.postal} onChange={(e) => setForm({ ...form, postal: e.target.value })} className="input" required /></div>
            <div><label className="label">{t('checkout.country')}</label><input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="input" /></div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary btn-sm"><Check size={14} /> {t('action.save')}</button>
            <button type="button" onClick={() => setAdding(false)} className="btn-ghost btn-sm">{t('action.close')}</button>
          </div>
        </form>
      ) : (
        <button onClick={() => setAdding(true)} className="btn-ghost btn-sm"><Plus size={15} /> Add address</button>
      )}
    </div>
  )
}

// ---------------- Style profile ----------------
function StyleTab() {
  const { t } = useI18n()
  const { user } = useAuth()
  if (!user?.styleProfile) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center">
        <div className="nova-float mb-3 flex justify-center"><NovaMascot mood="wave" size={90} /></div>
        <h3 className="font-display text-xl font-semibold">{t('survey.title')}</h3>
        <p className="text-slate-400 mt-1 max-w-sm mx-auto">{t('survey.sub')}</p>
        <Link to="/survey" className="btn-primary mt-5"><Sparkles size={16} /> {t('survey.start')}</Link>
      </div>
    )
  }
  const p = user.styleProfile
  return (
    <Panel title={t('survey.profileTitle')} icon={Sparkles}>
      <div className="flex items-center gap-4 pb-4 border-b border-white/10 mb-4">
        <div className="h-14 w-14 rounded-2xl bg-aurora-gradient grid place-items-center shrink-0"><Sparkles size={24} className="text-white" /></div>
        <div><div className="text-xs uppercase tracking-widest text-cyber-300">Style signature</div><div className="font-display text-xl font-semibold">{p.vibe} · {p.boldness}</div></div>
      </div>
      <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
        <Info label="Dress style" value={p.formality} />
        <Info label="Budget" value={`RM ${p.priceRange[0]}–${p.priceRange[1]}`} />
        <Info label="Fits" value={p.fits.join(', ') || 'Flexible'} />
        <Info label="Colors" value={p.colors.join(', ') || 'Open'} />
      </div>
      <div className="flex gap-2 mt-5">
        <Link to="/shop" className="btn-primary btn-sm"><ShoppingBag size={14} /> {t('survey.shopProfile')}</Link>
        <Link to="/survey" className="btn-ghost btn-sm">{t('survey.retake')}</Link>
      </div>
    </Panel>
  )
}

// ---------------- Rewards ----------------
function RewardsTab() {
  const { t } = useI18n()
  const { user } = useAuth()
  const { coupons } = useConfig()
  if (!user) return null
  const tierIdx = TIERS.indexOf(user.tier)
  const nextTier = TIERS[tierIdx + 1]
  const nextThreshold = nextTier ? TIER_THRESHOLD[nextTier] : TIER_THRESHOLD.Icon
  const progress = Math.min(100, (user.rewardPoints / nextThreshold) * 100)

  return (
    <div className="space-y-5">
      <Panel title={t('account.rewards')} icon={Award}>
        <div className="flex items-end justify-between mb-2">
          <div><div className="font-display text-4xl font-bold text-gold-gradient">{user.rewardPoints}</div><div className="text-xs text-slate-500">{t('account.points')}</div></div>
          <div className="text-right text-sm"><div className="text-gold-300 flex items-center gap-1 justify-end"><Award size={15} /> {user.tier}</div>{nextTier && <div className="text-xs text-slate-500 mt-0.5">{nextThreshold - user.rewardPoints} pts to {nextTier}</div>}</div>
        </div>
        <div className="h-2 rounded-full bg-white/10 overflow-hidden"><div className="h-full bg-gold-gradient rounded-full transition-all" style={{ width: `${progress}%` }} /></div>
        <div className="flex justify-between text-[11px] text-slate-500 mt-1.5">{TIERS.map((tier) => <span key={tier} className={user.tier === tier ? 'text-gold-300' : ''}>{tier}</span>)}</div>
      </Panel>

      <Panel title={t('account.coupons')} icon={Gift}>
        <div className="grid sm:grid-cols-2 gap-3">
          {coupons.filter((c) => c.active).map((c) => (
            <div key={c.code} className="relative glass rounded-xl p-4 border-dashed border-white/20 overflow-hidden">
              <div className="absolute -left-2 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-void-950" />
              <div className="absolute -right-2 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-void-950" />
              <div className="font-display font-bold text-gradient tracking-wider">{c.code}</div>
              <div className="text-xs text-slate-400 mt-0.5">{c.label}</div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}

// ---------------- shared bits ----------------
function Panel({ title, icon: Icon, children }: { title: string; icon?: typeof UserIcon; children: React.ReactNode }) {
  return (
    <div className="glass-card rounded-2xl p-5 sm:p-6">
      <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">{Icon && <Icon size={18} className="text-cyber-300" />} {title}</h2>
      {children}
    </div>
  )
}
function Info({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between sm:block border-b sm:border-0 border-white/5 pb-2 sm:pb-0"><span className="text-slate-500 text-xs">{label}</span><div className="text-slate-100 sm:mt-0.5">{value}</div></div>
}
function Empty({ icon: Icon, title, cta, ctaLabel, ctaTo }: { icon: typeof Package; title: string; cta?: boolean; ctaLabel?: string; ctaTo?: string }) {
  const { t } = useI18n()
  return (
    <div className="glass-card rounded-2xl py-16 text-center">
      <div className="h-16 w-16 rounded-full bg-white/5 grid place-items-center mx-auto mb-4"><Icon size={28} className="text-slate-500" /></div>
      <p className="text-slate-300">{title}</p>
      {(cta || ctaTo) && <Link to={ctaTo ?? '/shop'} className="btn-primary btn-sm mt-4">{ctaLabel ?? t('action.shopNow')}</Link>}
    </div>
  )
}
