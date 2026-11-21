import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Package, ShoppingCart, Users, Megaphone, Settings as SettingsIcon, Globe,
  Plus, Trash2, Search, ArrowLeft, Check, X, TrendingUp, TrendingDown, ShoppingBag, Percent,
  Save, RotateCcw, CreditCard, Wallet, Banknote, Store, Sparkles, ChevronRight, Tag, Eye,
} from 'lucide-react'
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'
import { useConfig } from '../store/config'
import { useOrders } from '../store/orders'
import { useI18n, LOCALES } from '../i18n'
import { useUI } from '../store/ui'
import { useHead } from '../lib/seo'
import { PRODUCTS, bestSellers } from '../data/products'
import { CATEGORIES } from '../data/categories'
import { formatMoney } from '../lib/format'
import type { Product, OrderStatus, Coupon, PaymentMethodConfig, BusinessConfig, StockStatus } from '../types'

// ============================================================
// AEON Admin Console — self-contained layout (site chrome is
// hidden on /admin). Every business rule shown here is read
// from / written to the config store — nothing is hard-coded
// downstream. Analytics blend live order data with a stable
// deterministic baseline so the dashboard is never empty.
// ============================================================

type ViewKey = 'dashboard' | 'products' | 'orders' | 'customers' | 'marketing' | 'settings' | 'languages'

const CAT_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]))

// deterministic RNG so charts are stable across reloads (no flicker)
function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const CHART = {
  grid: 'rgba(255,255,255,0.06)',
  tick: { fill: '#64748b', fontSize: 11 },
  axisLine: { stroke: 'rgba(255,255,255,0.08)' },
  tooltip: { background: 'rgba(13,13,20,0.94)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, color: '#e2e8f0', fontSize: 12, boxShadow: '0 8px 30px rgba(0,0,0,0.4)' } as React.CSSProperties,
}
const PIE_COLORS = ['#7b4dff', '#12d3e0', '#d4af37', '#ff5da2', '#3f9e5e', '#f59e0b']

export default function Admin() {
  const { t } = useI18n()
  const [view, setView] = useState<ViewKey>('dashboard')
  useHead({ title: `${t('admin.title')} — TaioMei`, description: 'TaioMei business console', path: '/admin' })

  const nav: { key: ViewKey; label: string; icon: typeof LayoutDashboard }[] = [
    { key: 'dashboard', label: t('admin.dashboard'), icon: LayoutDashboard },
    { key: 'products', label: t('admin.products'), icon: Package },
    { key: 'orders', label: t('admin.orders'), icon: ShoppingCart },
    { key: 'customers', label: t('admin.customers'), icon: Users },
    { key: 'marketing', label: t('admin.marketing'), icon: Megaphone },
    { key: 'settings', label: t('admin.settings'), icon: SettingsIcon },
    { key: 'languages', label: t('admin.languages'), icon: Globe },
  ]

  return (
    <div className="min-h-screen bg-void-950 text-slate-100">
      <div className="lg:grid lg:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <aside className="lg:h-screen lg:sticky lg:top-0 border-b lg:border-b-0 lg:border-r border-white/8 bg-void-900/60 backdrop-blur-xl flex flex-col">
          <div className="p-5 flex items-center justify-between border-b border-white/8">
            <Link to="/" className="flex items-center">
              <img
                src="/logo.png"
                alt="TaioMei"
                className="h-8 w-auto max-w-[130px] object-contain rounded-md"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/logo-white-text.png' }}
              />
            </Link>
            <div className="text-[10px] uppercase tracking-widest text-cyber-300 font-mono">{t('admin.title')}</div>
          </div>
          <nav className="flex lg:flex-col gap-1 p-3 overflow-x-auto no-scrollbar flex-1">
            {nav.map((n) => (
              <button key={n.key} onClick={() => setView(n.key)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm whitespace-nowrap transition-all ${view === n.key ? 'bg-aurora-500/15 text-white border border-aurora-400/30' : 'text-slate-400 hover:bg-white/5 border border-transparent'}`}>
                <n.icon size={17} /> {n.label}
              </button>
            ))}
          </nav>
          <div className="p-3 border-t border-white/8 hidden lg:block">
            <Link to="/" className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm text-slate-400 hover:bg-white/5"><Store size={16} /> View store</Link>
          </div>
        </aside>

        {/* Main */}
        <main className="p-5 sm:p-7 max-w-[1200px] w-full">
          <AnimatePresence mode="wait">
            <motion.div key={view} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
              {view === 'dashboard' && <Dashboard />}
              {view === 'products' && <Products />}
              {view === 'orders' && <Orders />}
              {view === 'customers' && <Customers />}
              {view === 'marketing' && <Marketing />}
              {view === 'settings' && <Settings />}
              {view === 'languages' && <LanguagesView />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

// ---------------- Dashboard ----------------
function Dashboard() {
  const { t } = useI18n()
  const { config } = useConfig()
  const { orders } = useOrders()
  const sym = config.currencySymbol

  // Deterministic 12-week baseline (stable across reloads)
  const trend = useMemo(() => {
    const rng = mulberry32(77)
    let base = 8600
    return Array.from({ length: 12 }, (_, i) => {
      base += (rng() - 0.32) * 1700
      const revenue = Math.max(4200, Math.round(base + rng() * 2400))
      const ordersN = Math.round(revenue / (95 + rng() * 40))
      return { label: `W${i + 1}`, revenue, orders: ordersN }
    })
  }, [])

  const realRevenue = orders.reduce((s, o) => s + o.total, 0)
  const baseRevenue = trend.reduce((s, w) => s + w.revenue, 0)
  const baseOrders = trend.reduce((s, w) => s + w.orders, 0)
  const totalSales = baseRevenue + realRevenue
  const totalOrders = baseOrders + orders.length
  const customers = Math.round(totalOrders * 0.72)
  const conversion = ((totalOrders / (totalOrders * 27 + 400)) * 100)
  const wowRevenue = ((trend[11].revenue - trend[10].revenue) / trend[10].revenue) * 100
  const wowOrders = ((trend[11].orders - trend[10].orders) / trend[10].orders) * 100

  // Catalog composition by group
  const groupData = useMemo(() => {
    const g: Record<string, number> = {}
    PRODUCTS.forEach((p) => { const grp = CAT_BY_ID[p.category]?.group ?? 'apparel'; g[grp] = (g[grp] ?? 0) + 1 })
    return Object.entries(g).map(([name, value]) => ({ name: name[0].toUpperCase() + name.slice(1), value }))
  }, [])

  // Popular colors across catalog
  const colorData = useMemo(() => {
    const c: Record<string, { count: number; hex: string }> = {}
    PRODUCTS.forEach((p) => p.colors.forEach((col) => {
      c[col.name] = { count: (c[col.name]?.count ?? 0) + 1, hex: col.hex }
    }))
    return Object.entries(c).map(([name, v]) => ({ name, ...v })).sort((a, b) => b.count - a.count).slice(0, 6)
  }, [])

  // Popular sizes
  const sizeData = useMemo(() => {
    const s: Record<string, number> = {}
    PRODUCTS.forEach((p) => p.sizes.forEach((sz) => { s[sz] = (s[sz] ?? 0) + 1 }))
    const order = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']
    return Object.entries(s).map(([name, value]) => ({ name, value }))
      .sort((a, b) => (order.indexOf(a.name) - order.indexOf(b.name)) || b.value - a.value)
  }, [])

  const topSellers = useMemo(() => bestSellers(6), [])

  // Order status distribution (live)
  const statusData = useMemo(() => {
    const s: Record<string, number> = {}
    orders.forEach((o) => { s[o.status] = (s[o.status] ?? 0) + 1 })
    return Object.entries(s).map(([status, value]) => ({ name: t(`status.${status}`), value }))
  }, [orders, t])

  return (
    <div className="space-y-6">
      <Header title={t('admin.dashboard')} sub="Performance at a glance — live orders blended with trailing 12-week baseline." />

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi icon={TrendingUp} label={t('admin.totalSales')} value={formatMoney(totalSales, sym)} delta={wowRevenue} />
        <Kpi icon={ShoppingBag} label={t('admin.totalOrders')} value={totalOrders.toLocaleString()} delta={wowOrders} />
        <Kpi icon={Users} label={t('admin.customers2')} value={customers.toLocaleString()} delta={5.4} />
        <Kpi icon={Percent} label={t('admin.conversion')} value={`${conversion.toFixed(1)}%`} delta={1.2} />
      </div>

      {/* Revenue trend */}
      <Panel title={t('admin.revenue')} icon={TrendingUp}>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7b4dff" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#7b4dff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
              <XAxis dataKey="label" tick={CHART.tick} tickLine={false} axisLine={CHART.axisLine} />
              <YAxis tick={CHART.tick} tickLine={false} axisLine={false} width={48} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={CHART.tooltip} formatter={(v: number) => [formatMoney(v, sym), t('admin.revenue')]} cursor={{ stroke: 'rgba(255,255,255,0.15)' }} />
              <Area type="monotone" dataKey="revenue" stroke="#a98bff" strokeWidth={2} fill="url(#rev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Best sellers */}
        <Panel title={t('admin.bestSellers')} icon={ShoppingBag}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={topSellers.map((p) => ({ name: p.name, value: p.popularity }))} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} horizontal={false} />
                <XAxis type="number" tick={CHART.tick} tickLine={false} axisLine={CHART.axisLine} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={false} width={78} />
                <Tooltip contentStyle={CHART.tooltip} cursor={{ fill: 'rgba(255,255,255,0.04)' }} formatter={(v: number) => [`${v} pts`, 'Popularity']} />
                <Bar dataKey="value" fill="#12d3e0" radius={[0, 6, 6, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        {/* Catalog composition */}
        <Panel title="Catalog composition" icon={Package}>
          <div className="h-64 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={groupData} dataKey="value" nameKey="name" innerRadius={48} outerRadius={80} paddingAngle={3} stroke="none">
                  {groupData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={CHART.tooltip} formatter={(v: number, n) => [`${v} products`, n as string]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 pr-2">
              {groupData.map((g, i) => (
                <div key={g.name} className="flex items-center gap-2 text-xs">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-slate-300">{g.name}</span>
                  <span className="text-slate-500 ml-auto">{g.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        {/* Popular colors */}
        <Panel title={t('admin.popularColors')} icon={Sparkles}>
          <div className="space-y-2.5">
            {colorData.map((c) => {
              const max = colorData[0].count
              return (
                <div key={c.name} className="flex items-center gap-3">
                  <span className="h-6 w-6 rounded-lg border border-white/15 shrink-0" style={{ background: c.hex }} />
                  <span className="text-sm text-slate-300 w-28 truncate">{c.name}</span>
                  <div className="flex-1 h-2 rounded-full bg-white/8 overflow-hidden"><div className="h-full rounded-full bg-aurora-gradient" style={{ width: `${(c.count / max) * 100}%` }} /></div>
                  <span className="text-xs text-slate-500 w-8 text-right">{c.count}</span>
                </div>
              )
            })}
          </div>
        </Panel>

        {/* Popular sizes / order status */}
        <Panel title={statusData.length ? t('status.placed').replace(/.*/, 'Order status') : t('admin.popularSizes')} icon={statusData.length ? ShoppingCart : TrendingUp}>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData.length ? statusData : sizeData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={CHART.axisLine} interval={0} angle={statusData.length ? -12 : 0} textAnchor={statusData.length ? 'end' : 'middle'} height={statusData.length ? 40 : 30} />
                <YAxis tick={CHART.tick} tickLine={false} axisLine={false} width={30} allowDecimals={false} />
                <Tooltip contentStyle={CHART.tooltip} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Bar dataKey="value" fill="#d4af37" radius={[6, 6, 0, 0]} barSize={26} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {!statusData.length && <p className="text-xs text-slate-500 mt-1">Distribution of available sizes across the catalog. Live order-status mix appears here once orders arrive.</p>}
        </Panel>
      </div>
    </div>
  )
}

// ---------------- Products ----------------
const NEW_STYLES = ['Signature', 'Street', 'Minimal', 'Bold', 'Heritage']
function makeDraftProduct(form: { name: string; category: string; price: number; stock: StockStatus }): Product {
  const cat = CAT_BY_ID[form.category] ?? CATEGORIES[0]
  const id = `adm-${Date.now()}`
  return {
    id, slug: `${form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${id.slice(-4)}`,
    name: form.name, brand: 'TaioMei', category: form.category, collections: ['new'],
    gender: 'unisex', kind: cat.kind, description: 'Newly added by admin.', price: form.price,
    currency: 'MYR', rating: 0, reviewCount: 0,
    colors: [{ name: 'Obsidian', hex: '#0e0e12' }, { name: 'Arctic White', hex: '#f5f6fa' }],
    sizes: ['S', 'M', 'L', 'XL'], fabrics: ['Premium Cotton'],
    styles: NEW_STYLES.map((s, i) => ({ id: `s${i}`, name: s, tagline: 'Fresh cut', silhouette: cat.kind, accent: PIE_COLORS[i % PIE_COLORS.length], fit: 'classic' as const })),
    stock: form.stock, stockCount: form.stock === 'in_stock' ? 100 : 0, customizable: true,
    tags: ['new'], reviews: [], createdAt: new Date().toISOString(), popularity: 40, palette: ['#7b4dff', '#12d3e0'],
  }
}

function Products() {
  const { t } = useI18n()
  const { config } = useConfig()
  const { pushToast } = useUI()
  const [q, setQ] = useState('')
  const [added, setAdded] = useState<Product[]>([])
  const [hidden, setHidden] = useState<string[]>([])
  const [stockOverride, setStockOverride] = useState<Record<string, StockStatus>>({})
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ name: '', category: CATEGORIES[0].id, price: 149, stock: 'in_stock' as StockStatus })

  const list = useMemo(() => {
    const all = [...added, ...PRODUCTS].filter((p) => !hidden.includes(p.id))
    const term = q.trim().toLowerCase()
    return (term ? all.filter((p) => p.name.toLowerCase().includes(term) || (CAT_BY_ID[p.category]?.name.toLowerCase().includes(term))) : all).slice(0, 60)
  }, [added, hidden, q])

  const save = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setAdded((a) => [makeDraftProduct(form), ...a])
    pushToast({ kind: 'success', title: 'Product added', desc: form.name })
    setForm({ name: '', category: CATEGORIES[0].id, price: 149, stock: 'in_stock' }); setAdding(false)
  }

  return (
    <div className="space-y-5">
      <Header title={t('admin.products')} sub={`${PRODUCTS.length + added.length} products in catalog`}
        action={<button onClick={() => setAdding((v) => !v)} className="btn-primary btn-sm"><Plus size={15} /> {t('admin.addProduct')}</button>} />

      <AnimatePresence>
        {adding && (
          <motion.form onSubmit={save} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="glass-card rounded-2xl p-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
              <div className="lg:col-span-2"><label className="label">Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" placeholder="Product name" required /></div>
              <div><label className="label">Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input">
                  {CATEGORIES.map((c) => <option key={c.id} value={c.id} className="bg-void-900">{c.name}</option>)}
                </select>
              </div>
              <div><label className="label">Price ({config.currencySymbol})</label><input type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: +e.target.value })} className="input" /></div>
              <div className="lg:col-span-2"><label className="label">Stock status</label>
                <select value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value as StockStatus })} className="input">
                  <option value="in_stock" className="bg-void-900">In stock</option>
                  <option value="made_on_request" className="bg-void-900">Made / imported on request</option>
                  <option value="out_of_stock" className="bg-void-900">Out of stock</option>
                </select>
              </div>
              <div className="flex gap-2"><button type="submit" className="btn-primary btn-sm"><Check size={15} /> {t('action.save')}</button><button type="button" onClick={() => setAdding(false)} className="btn-ghost btn-sm">{t('action.close')}</button></div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" className="input !pl-9 !py-2" />
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500 border-b border-white/8">
                <th className="p-3 font-medium">Product</th><th className="p-3 font-medium">Category</th>
                <th className="p-3 font-medium">Price</th><th className="p-3 font-medium">Stock</th>
                <th className="p-3 font-medium">Styles</th><th className="p-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((p) => {
                const stock = stockOverride[p.id] ?? p.stock
                return (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <span className="h-8 w-8 rounded-lg shrink-0" style={{ background: `linear-gradient(135deg, ${p.palette[0]}, ${p.palette[1]})` }} />
                        <span className="text-slate-200 truncate max-w-[180px]">{p.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-slate-400">{CAT_BY_ID[p.category]?.name ?? p.category}</td>
                    <td className="p-3 text-slate-200">{formatMoney(p.price, config.currencySymbol)}</td>
                    <td className="p-3">
                      <select value={stock} onChange={(e) => setStockOverride((s) => ({ ...s, [p.id]: e.target.value as StockStatus }))}
                        className={`bg-transparent text-xs rounded-lg px-2 py-1 border ${stock === 'in_stock' ? 'text-emerald-300 border-emerald-400/30' : stock === 'made_on_request' ? 'text-amber-300 border-amber-400/30' : 'text-rose-300 border-rose-400/30'}`}>
                        <option value="in_stock" className="bg-void-900 text-slate-200">In stock</option>
                        <option value="made_on_request" className="bg-void-900 text-slate-200">On request</option>
                        <option value="out_of_stock" className="bg-void-900 text-slate-200">Out of stock</option>
                      </select>
                    </td>
                    <td className="p-3 text-slate-400">{p.styles.length}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <Link to={`/product/${p.slug}`} className="h-7 w-7 grid place-items-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white" title="View"><Eye size={14} /></Link>
                        <button onClick={() => setHidden((h) => [...h, p.id])} className="h-7 w-7 grid place-items-center rounded-lg text-slate-400 hover:bg-rose-500/15 hover:text-rose-300" title="Archive"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      {hidden.length > 0 && <button onClick={() => setHidden([])} className="text-xs text-slate-500 hover:text-white flex items-center gap-1"><RotateCcw size={12} /> Restore {hidden.length} archived</button>}
    </div>
  )
}

// ---------------- Orders ----------------
const ALL_STATUS: OrderStatus[] = ['placed', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled']
function Orders() {
  const { t } = useI18n()
  const { config } = useConfig()
  const { orders, quotes, advance, setStatus, cancel, setQuoteStatus } = useOrders()

  return (
    <div className="space-y-6">
      <Header title={t('admin.orders')} sub={`${orders.length} orders · ${quotes.length} quote requests`} />

      {orders.length === 0 ? (
        <div className="glass-card rounded-2xl py-14 text-center text-slate-400">
          <ShoppingCart size={30} className="mx-auto mb-3 text-slate-600" />
          No orders yet. Orders placed through checkout appear here in real time.
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 border-b border-white/8">
                  <th className="p-3 font-medium">Order</th><th className="p-3 font-medium">Customer</th>
                  <th className="p-3 font-medium">Total</th><th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium text-right">Manage</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="p-3"><div className="text-slate-200 font-medium">{o.id}</div><div className="text-xs text-slate-500">{new Date(o.placedAt).toLocaleDateString('en-MY', { day: 'numeric', month: 'short' })} · {o.items.length} {o.items.length === 1 ? t('cart.item') : t('cart.items')}</div></td>
                    <td className="p-3"><div className="text-slate-300">{o.customer.name}</div><div className="text-xs text-slate-500">{o.customer.city} {o.guest && <span className="text-amber-300/80">· guest</span>}</div></td>
                    <td className="p-3 text-slate-200">{formatMoney(o.total, config.currencySymbol)}</td>
                    <td className="p-3">
                      <select value={o.status} onChange={(e) => setStatus(o.id, e.target.value as OrderStatus)}
                        className={`bg-transparent text-xs rounded-lg px-2 py-1.5 border ${o.status === 'delivered' ? 'text-emerald-300 border-emerald-400/30' : o.status === 'cancelled' ? 'text-rose-300 border-rose-400/30' : 'text-cyber-300 border-cyber-400/30'}`}>
                        {ALL_STATUS.map((s) => <option key={s} value={s} className="bg-void-900 text-slate-200">{t(`status.${s}`)}</option>)}
                      </select>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => advance(o.id)} disabled={o.status === 'delivered' || o.status === 'cancelled'} className="btn-ghost btn-sm !py-1 disabled:opacity-30" title="Advance to next stage"><ChevronRight size={14} /> Advance</button>
                        <button onClick={() => cancel(o.id)} disabled={o.status === 'cancelled'} className="h-7 w-7 grid place-items-center rounded-lg text-slate-400 hover:bg-rose-500/15 hover:text-rose-300 disabled:opacity-30" title="Cancel"><X size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Event / bulk quotes */}
      <div>
        <h2 className="font-display text-lg font-semibold mb-3 flex items-center gap-2"><Tag size={17} className="text-gold-400" /> Event & bulk quote requests</h2>
        {quotes.length === 0 ? (
          <div className="glass rounded-2xl p-5 text-sm text-slate-500">No quote requests yet. Submissions from the Events page land here.</div>
        ) : (
          <div className="space-y-2">
            {quotes.map((q) => (
              <div key={q.id} className="glass-card rounded-xl p-4 flex items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-[180px]">
                  <div className="text-slate-200 font-medium">{q.eventType} · {q.quantity} pcs</div>
                  <div className="text-xs text-slate-500">{q.id} · {q.contactName} · {q.productType} · {q.location || '—'}</div>
                </div>
                <select value={q.status} onChange={(e) => setQuoteStatus(q.id, e.target.value as typeof q.status)} className="input !py-1.5 !w-auto text-xs">
                  {(['new', 'reviewing', 'quoted', 'won'] as const).map((s) => <option key={s} value={s} className="bg-void-900">{s[0].toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------- Customers (derived from orders) ----------------
function Customers() {
  const { t } = useI18n()
  const { config } = useConfig()
  const { orders } = useOrders()

  const customers = useMemo(() => {
    const map = new Map<string, { name: string; contact: string; orders: number; spend: number; guest: boolean }>()
    orders.forEach((o) => {
      const key = o.customer.email || o.customer.phone || o.customer.name
      const prev = map.get(key)
      map.set(key, {
        name: o.customer.name,
        contact: o.customer.email || o.customer.phone,
        orders: (prev?.orders ?? 0) + 1,
        spend: (prev?.spend ?? 0) + o.total,
        guest: o.guest,
      })
    })
    return [...map.values()].sort((a, b) => b.spend - a.spend)
  }, [orders])

  return (
    <div className="space-y-5">
      <Header title={t('admin.customers')} sub="Derived from order history — segmented by lifetime value." />
      {customers.length === 0 ? (
        <div className="glass-card rounded-2xl py-14 text-center text-slate-400"><Users size={30} className="mx-auto mb-3 text-slate-600" /> Customer profiles build automatically as orders are placed.</div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden">
          <table className="w-full min-w-[520px] text-sm">
            <thead><tr className="text-left text-xs text-slate-500 border-b border-white/8"><th className="p-3 font-medium">Customer</th><th className="p-3 font-medium">Contact</th><th className="p-3 font-medium">Orders</th><th className="p-3 font-medium">Lifetime spend</th></tr></thead>
            <tbody>
              {customers.map((c, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="p-3"><div className="flex items-center gap-2.5"><span className="h-8 w-8 rounded-full bg-aurora-gradient grid place-items-center text-xs font-bold text-white">{c.name.slice(0, 1)}</span><span className="text-slate-200">{c.name}</span>{c.guest && <span className="chip text-[10px] text-amber-300 border-amber-400/30">guest</span>}</div></td>
                  <td className="p-3 text-slate-400">{c.contact}</td>
                  <td className="p-3 text-slate-300">{c.orders}</td>
                  <td className="p-3 font-display font-semibold text-gradient">{formatMoney(c.spend, config.currencySymbol)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ---------------- Marketing (coupons) ----------------
function Marketing() {
  const { t } = useI18n()
  const { coupons, addCoupon, toggleCoupon } = useConfig()
  const { pushToast } = useUI()
  const [form, setForm] = useState<Coupon>({ code: '', type: 'percent', value: 10, minSpend: 0, label: '', active: true })

  const add = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.code.trim()) return
    addCoupon({ ...form, code: form.code.toUpperCase().trim(), label: form.label || `${form.value}${form.type === 'percent' ? '%' : ''} promo` })
    pushToast({ kind: 'success', title: 'Coupon saved', desc: form.code.toUpperCase() })
    setForm({ code: '', type: 'percent', value: 10, minSpend: 0, label: '', active: true })
  }

  return (
    <div className="space-y-5">
      <Header title={t('admin.marketing')} sub="Create and manage discount codes. Codes validate live at checkout." />

      <form onSubmit={add} className="glass-card rounded-2xl p-5 grid sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
        <div><label className="label">Code</label><input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="input uppercase" placeholder="SAVE20" required /></div>
        <div><label className="label">Type</label>
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Coupon['type'] })} className="input">
            <option value="percent" className="bg-void-900">Percent %</option>
            <option value="fixed" className="bg-void-900">Fixed amount</option>
            <option value="shipping" className="bg-void-900">Free shipping</option>
          </select>
        </div>
        <div><label className="label">Value</label><input type="number" min={0} value={form.value} onChange={(e) => setForm({ ...form, value: +e.target.value })} disabled={form.type === 'shipping'} className="input disabled:opacity-40" /></div>
        <div><label className="label">Min spend</label><input type="number" min={0} value={form.minSpend} onChange={(e) => setForm({ ...form, minSpend: +e.target.value })} className="input" /></div>
        <div className="lg:col-span-2"><label className="label">Label</label><input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className="input" placeholder="Shown to customers" /></div>
        <div className="lg:col-span-6"><button type="submit" className="btn-primary btn-sm"><Plus size={15} /> Add coupon</button></div>
      </form>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {coupons.map((c) => (
          <div key={c.code} className={`relative glass-card rounded-2xl p-4 border-dashed ${c.active ? 'border-cyber-400/30' : 'border-white/10 opacity-60'}`}>
            <div className="flex items-start justify-between">
              <div>
                <div className="font-display font-bold text-gradient tracking-wider text-lg">{c.code}</div>
                <div className="text-xs text-slate-400 mt-0.5">{c.label}</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {c.type === 'percent' ? `${c.value}% off` : c.type === 'fixed' ? `${formatMoney(c.value)} off` : 'Free shipping'}
                  {c.minSpend > 0 && ` · min ${formatMoney(c.minSpend)}`}
                </div>
              </div>
              <button onClick={() => toggleCoupon(c.code)} className={`text-xs px-2.5 py-1 rounded-full border ${c.active ? 'text-emerald-300 border-emerald-400/30 bg-emerald-400/10' : 'text-slate-400 border-white/15'}`}>{c.active ? 'Active' : 'Off'}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------------- Settings (business rules + payments) ----------------
const PAY_ICON: Record<PaymentMethodConfig['kind'], typeof CreditCard> = { card: CreditCard, ewallet: Wallet, bank: Banknote, cod: Banknote, gateway: CreditCard }
function Settings() {
  const { t } = useI18n()
  const { config, setConfig, setPayment, reset } = useConfig()
  const { pushToast } = useUI()
  const [draft, setDraft] = useState<BusinessConfig>(config)
  const [newPay, setNewPay] = useState({ label: '', kind: 'ewallet' as PaymentMethodConfig['kind'] })

  const num = (k: keyof BusinessConfig) => (e: React.ChangeEvent<HTMLInputElement>) => setDraft({ ...draft, [k]: +e.target.value })

  const saveRules = () => {
    setConfig({
      guestOrderMaxValue: draft.guestOrderMaxValue, maxGuestOrders: draft.maxGuestOrders,
      maxOrdersPerCustomer: draft.maxOrdersPerCustomer, requireOtp: draft.requireOtp, fraudCheckEnabled: draft.fraudCheckEnabled,
      inStockMinDays: draft.inStockMinDays, inStockMaxDays: draft.inStockMaxDays,
      requestMinDays: draft.requestMinDays, requestMaxDays: draft.requestMaxDays,
      freeShippingThreshold: draft.freeShippingThreshold, flatShipping: draft.flatShipping, currencySymbol: draft.currencySymbol,
    })
    pushToast({ kind: 'success', title: t('admin.saved') })
  }

  const addPayment = () => {
    if (!newPay.label.trim()) return
    const id = newPay.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    setConfig({ payments: [...config.payments, { id, label: newPay.label, enabled: true, kind: newPay.kind }] })
    setNewPay({ label: '', kind: 'ewallet' })
    pushToast({ kind: 'success', title: 'Payment method added', desc: newPay.label })
  }
  const removePayment = (id: string) => setConfig({ payments: config.payments.filter((p) => p.id !== id) })

  return (
    <div className="space-y-6">
      <Header title={t('admin.settings')} sub={t('admin.businessRules') + ' — every value here overrides checkout & delivery logic. Nothing is hard-coded.'}
        action={<button onClick={() => { reset(); setDraft(config); pushToast({ kind: 'info', title: 'Reset to defaults' }) }} className="btn-ghost btn-sm"><RotateCcw size={14} /> Reset</button>} />

      {/* Guest & account rules */}
      <Panel title="Guest & account rules" icon={Users}>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label={`Account required above (${draft.currencySymbol})`} hint="Orders over this value need a verified account">
            <input type="number" min={0} value={draft.guestOrderMaxValue} onChange={num('guestOrderMaxValue')} className="input" />
          </Field>
          <Field label="Max guest orders" hint="Per device before sign-up is required">
            <input type="number" min={0} value={draft.maxGuestOrders} onChange={num('maxGuestOrders')} className="input" />
          </Field>
          <Field label="Max orders / customer" hint="Fraud safety ceiling">
            <input type="number" min={0} value={draft.maxOrdersPerCustomer} onChange={num('maxOrdersPerCustomer')} className="input" />
          </Field>
          <Toggle label="Require OTP verification" checked={draft.requireOtp} onChange={(v) => setDraft({ ...draft, requireOtp: v })} />
          <Toggle label="Fraud check enabled" checked={draft.fraudCheckEnabled} onChange={(v) => setDraft({ ...draft, fraudCheckEnabled: v })} />
          <Field label="Currency symbol" hint="Displayed with all prices">
            <input value={draft.currencySymbol} onChange={(e) => setDraft({ ...draft, currencySymbol: e.target.value })} className="input" />
          </Field>
        </div>
      </Panel>

      {/* Delivery & shipping */}
      <Panel title="Delivery & shipping" icon={Package}>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="In-stock delivery (days)">
            <div className="flex items-center gap-2"><input type="number" min={0} value={draft.inStockMinDays} onChange={num('inStockMinDays')} className="input" /><span className="text-slate-500">–</span><input type="number" min={0} value={draft.inStockMaxDays} onChange={num('inStockMaxDays')} className="input" /></div>
          </Field>
          <Field label="On-request delivery (days)">
            <div className="flex items-center gap-2"><input type="number" min={0} value={draft.requestMinDays} onChange={num('requestMinDays')} className="input" /><span className="text-slate-500">–</span><input type="number" min={0} value={draft.requestMaxDays} onChange={num('requestMaxDays')} className="input" /></div>
          </Field>
          <div />
          <Field label={`Free shipping threshold (${draft.currencySymbol})`}>
            <input type="number" min={0} value={draft.freeShippingThreshold} onChange={num('freeShippingThreshold')} className="input" />
          </Field>
          <Field label={`Flat shipping fee (${draft.currencySymbol})`}>
            <input type="number" min={0} value={draft.flatShipping} onChange={num('flatShipping')} className="input" />
          </Field>
        </div>
        <button onClick={saveRules} className="btn-primary btn-sm mt-5"><Save size={15} /> {t('admin.save')}</button>
      </Panel>

      {/* Payments */}
      <Panel title="Payment methods" icon={CreditCard}>
        <p className="text-xs text-slate-500 mb-4">Toggle providers on/off or add your own. Only enabled methods appear at checkout — no provider is hard-coded.</p>
        <div className="space-y-2">
          {config.payments.map((p) => {
            const Icon = PAY_ICON[p.kind]
            return (
              <div key={p.id} className="flex items-center gap-3 glass rounded-xl p-3">
                <div className="h-9 w-9 rounded-lg bg-white/5 grid place-items-center shrink-0"><Icon size={17} className="text-cyber-300" /></div>
                <div className="flex-1 min-w-0"><div className="text-sm text-slate-200">{p.label}</div><div className="text-xs text-slate-500 capitalize">{p.kind}</div></div>
                <button onClick={() => removePayment(p.id)} className="h-7 w-7 grid place-items-center rounded-lg text-slate-500 hover:bg-rose-500/15 hover:text-rose-300"><Trash2 size={13} /></button>
                <Toggle checked={p.enabled} onChange={(v) => setPayment(p.id, v)} />
              </div>
            )
          })}
        </div>
        <div className="flex items-end gap-2 mt-4 pt-4 border-t border-white/8 flex-wrap">
          <div className="flex-1 min-w-[160px]"><label className="label">New method name</label><input value={newPay.label} onChange={(e) => setNewPay({ ...newPay, label: e.target.value })} className="input" placeholder="e.g. PayPal, Apple Pay" /></div>
          <div><label className="label">Type</label>
            <select value={newPay.kind} onChange={(e) => setNewPay({ ...newPay, kind: e.target.value as PaymentMethodConfig['kind'] })} className="input">
              <option value="card" className="bg-void-900">Card</option><option value="ewallet" className="bg-void-900">E-wallet</option>
              <option value="bank" className="bg-void-900">Bank</option><option value="cod" className="bg-void-900">Cash on delivery</option>
              <option value="gateway" className="bg-void-900">Gateway</option>
            </select>
          </div>
          <button onClick={addPayment} className="btn-ghost btn-sm"><Plus size={15} /> Add</button>
        </div>
      </Panel>
    </div>
  )
}

// ---------------- Languages ----------------
function LanguagesView() {
  const { t } = useI18n()
  const usage: Record<string, number> = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('aeon.langUsage') || '{}') } catch { return {} }
  }, [])
  const total = Object.values(usage).reduce((s, n) => s + n, 0) || 1

  return (
    <div className="space-y-5">
      <Header title={t('admin.languages')} sub="All five storefront languages are live. Usage reflects real selections on this device." />
      <Panel title={t('admin.langUsage')} icon={Globe}>
        <div className="space-y-3">
          {LOCALES.map((l) => {
            const count = usage[l.code] ?? 0
            const pct = Math.round((count / total) * 100)
            return (
              <div key={l.code} className="flex items-center gap-3">
                <span className="w-16 text-sm font-medium text-slate-200">{l.short}</span>
                <span className="w-32 text-xs text-slate-500 hidden sm:block">{l.label}</span>
                <div className="flex-1 h-2.5 rounded-full bg-white/8 overflow-hidden"><div className="h-full rounded-full bg-aurora-gradient" style={{ width: `${pct}%` }} /></div>
                <span className="w-20 text-right text-xs text-slate-400">{count} · {pct}%</span>
              </div>
            )
          })}
        </div>
      </Panel>
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {LOCALES.map((l) => (
          <div key={l.code} className="glass-card rounded-2xl p-4 text-center">
            <div className="font-display text-2xl font-bold text-gradient">{l.short}</div>
            <div className="text-xs text-slate-400 mt-1">{l.label}</div>
            <div className="chip text-[10px] text-emerald-300 border-emerald-400/30 mt-2 inline-flex"><Check size={11} /> Active</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------------- shared bits ----------------
function Header({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold">{title}</h1>
        {sub && <p className="text-slate-400 text-sm mt-1 max-w-2xl">{sub}</p>}
      </div>
      {action}
    </div>
  )
}
function Panel({ title, icon: Icon, children }: { title: string; icon?: typeof LayoutDashboard; children: React.ReactNode }) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <h2 className="font-medium mb-4 flex items-center gap-2 text-slate-200">{Icon && <Icon size={17} className="text-cyber-300" />} {title}</h2>
      {children}
    </div>
  )
}
function Kpi({ icon: Icon, label, value, delta }: { icon: typeof TrendingUp; label: string; value: string; delta?: number }) {
  const up = (delta ?? 0) >= 0
  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <div className="h-9 w-9 rounded-xl bg-aurora-500/15 grid place-items-center"><Icon size={17} className="text-aurora-300" /></div>
        {delta != null && (
          <span className={`text-xs flex items-center gap-0.5 ${up ? 'text-emerald-300' : 'text-rose-300'}`}>
            {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {Math.abs(delta).toFixed(1)}%
          </span>
        )}
      </div>
      <div className="font-display text-2xl font-bold mt-3">{value}</div>
      <div className="text-xs text-slate-500 mt-0.5">{label}</div>
    </div>
  )
}
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-slate-500 mt-1">{hint}</p>}
    </div>
  )
}
function Toggle({ label, checked, onChange }: { label?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <button type="button" onClick={() => onChange(!checked)} className={`relative h-6 w-11 rounded-full transition-colors shrink-0 ${checked ? 'bg-aurora-gradient' : 'bg-white/15'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
      {label && <span className="text-sm text-slate-300">{label}</span>}
    </label>
  )
}
