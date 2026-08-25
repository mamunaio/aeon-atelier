import { useState, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Package, CheckCircle2, Cog, Box, Truck, MapPin, Home, XCircle, Clock, Sparkles, ChevronRight } from 'lucide-react'
import { useOrders, ORDER_FLOW } from '../store/orders'
import { useI18n } from '../i18n'
import { useHead } from '../lib/seo'
import { Garment } from '../components/Garment'
import { NovaMascot } from '../components/assistant/NovaMascot'
import { formatMoney, estDeliveryDate } from '../lib/format'
import type { OrderStatus, Order } from '../types'

const STATUS_ICON: Record<OrderStatus, typeof Package> = {
  placed: Package, confirmed: CheckCircle2, processing: Cog, packed: Box,
  shipped: Truck, out_for_delivery: MapPin, delivered: Home, cancelled: XCircle,
}

export default function OrderTracking() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useI18n()
  const { orders, advance } = useOrders()
  const [query, setQuery] = useState(id ?? '')

  const order = useMemo(() => (id ? orders.find((o) => o.id.toLowerCase() === id.toLowerCase()) : undefined), [id, orders])

  useHead({ title: `${t('action.trackOrder')} — AEON`, description: t('delivery.tracking'), path: id ? `/track/${id}` : '/track' })

  const lookup = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) navigate(`/track/${query.trim().toUpperCase()}`)
  }

  // ---- Order found: full timeline ----
  if (order) return <OrderTimeline order={order} onAdvance={() => advance(order.id)} />

  // ---- Lookup / not found ----
  return (
    <div className="container-max section-pad">
      <div className="max-w-xl mx-auto text-center">
        <div className="nova-float mb-3 flex justify-center"><NovaMascot mood="point" size={92} /></div>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold">{t('action.trackOrder')}</h1>
        <p className="text-slate-400 mt-2">{t('delivery.tracking')}</p>

        <form onSubmit={lookup} className="mt-6 flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Enter order number e.g. AE-100001" className="input !pl-10" />
          </div>
          <button type="submit" className="btn-primary">Track</button>
        </form>

        {id && !order && (
          <div className="mt-4 glass rounded-xl p-4 text-sm text-rose-300">No order found for “{id}”. Check the number and try again.</div>
        )}
      </div>

      {/* Recent orders shortcut */}
      {orders.length > 0 && (
        <div className="max-w-xl mx-auto mt-10">
          <h2 className="text-sm text-slate-400 mb-3">Your recent orders</h2>
          <div className="space-y-2">
            {orders.slice(0, 5).map((o) => (
              <Link key={o.id} to={`/track/${o.id}`} className="glass-card rounded-xl p-3.5 flex items-center gap-3 hover:border-white/25 transition-colors">
                <div className="h-10 w-10 rounded-lg bg-aurora-500/15 grid place-items-center shrink-0"><Package size={18} className="text-aurora-300" /></div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white">{o.id}</div>
                  <div className="text-xs text-slate-500">{o.items.length} {o.items.length === 1 ? t('cart.item') : t('cart.items')} · {formatMoney(o.total)}</div>
                </div>
                <span className="chip text-xs">{t(`status.${o.status}`)}</span>
                <ChevronRight size={16} className="text-slate-500" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function OrderTimeline({ order, onAdvance }: { order: Order; onAdvance: () => void }) {
  const { t } = useI18n()
  const cancelled = order.status === 'cancelled'
  const currentIdx = ORDER_FLOW.indexOf(order.status)
  const eventAt = (s: OrderStatus) => order.timeline.find((e) => e.status === s)?.at
  const isDelivered = order.status === 'delivered'

  return (
    <div className="container-max section-pad">
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
        <Link to="/" className="hover:text-white">{t('nav.home')}</Link><span>/</span>
        <Link to="/track" className="hover:text-white">{t('action.trackOrder')}</Link><span>/</span>
        <span className="text-slate-300">{order.id}</span>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">
        <div>
          {/* Header */}
          <div className="glass-strong rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute inset-0 -z-10 opacity-40" style={{ background: 'radial-gradient(70% 80% at 100% 0%, rgba(18,211,224,0.18), transparent 60%)' }} />
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider">{t('checkout.orderNumber')}</div>
                <div className="font-display text-2xl font-semibold text-gradient">{order.id}</div>
                <div className="text-sm text-slate-400 mt-1">Placed {new Date(order.placedAt).toLocaleDateString('en-MY', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              </div>
              <div className="text-right">
                <span className={`chip ${cancelled ? 'text-rose-300 border-rose-400/30 bg-rose-400/10' : isDelivered ? 'text-emerald-300 border-emerald-400/30 bg-emerald-400/10' : 'text-cyber-300 border-cyber-400/30 bg-cyber-400/10'}`}>
                  {t(`status.${order.status}`)}
                </span>
                {!cancelled && !isDelivered && (
                  <div className="text-xs text-slate-400 mt-2 flex items-center gap-1.5 justify-end"><Clock size={12} className="text-cyber-300" /> Est. {estDeliveryDate(order.estDeliveryMax)}</div>
                )}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="glass-card rounded-3xl p-6 mt-4">
            <h2 className="font-display text-lg font-semibold mb-5">Delivery progress</h2>
            {cancelled ? (
              <div className="flex items-center gap-3 text-rose-300"><XCircle size={22} /> This order was cancelled.</div>
            ) : (
              <div className="relative">
                {ORDER_FLOW.map((status, i) => {
                  const Icon = STATUS_ICON[status]
                  const done = i < currentIdx
                  const active = i === currentIdx
                  const at = eventAt(status)
                  return (
                    <div key={status} className="relative flex gap-4 pb-7 last:pb-0">
                      {/* connector */}
                      {i < ORDER_FLOW.length - 1 && (
                        <div className={`absolute left-[19px] top-10 bottom-0 w-0.5 ${done ? 'bg-aurora-gradient' : 'bg-white/10'}`} />
                      )}
                      <motion.div
                        initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.06 }}
                        className={`relative z-10 h-10 w-10 rounded-full grid place-items-center shrink-0 border ${
                          done ? 'bg-aurora-500/20 border-aurora-400/40 text-aurora-200'
                          : active ? 'bg-cyber-400/20 border-cyber-400/50 text-cyber-200 shadow-glow-cyan' : 'bg-white/5 border-white/10 text-slate-600'
                        }`}
                      >
                        {active && <span className="absolute inset-0 rounded-full border border-cyber-400/50 animate-ping" />}
                        <Icon size={18} />
                      </motion.div>
                      <div className="pt-1.5">
                        <div className={`font-medium ${done || active ? 'text-white' : 'text-slate-500'}`}>{t(`status.${status}`)}</div>
                        {at
                          ? <div className="text-xs text-slate-400 mt-0.5">{new Date(at).toLocaleString('en-MY', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                          : active ? <div className="text-xs text-cyber-300 mt-0.5">In progress…</div> : null}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {!cancelled && !isDelivered && (
              <button onClick={onAdvance} className="btn-ghost btn-sm mt-2"><Sparkles size={14} /> Simulate next update</button>
            )}
            {isDelivered && (
              <div className="mt-3 glass rounded-xl p-4 flex items-center gap-3 text-emerald-300"><CheckCircle2 size={20} /> Delivered — we hope you love it!</div>
            )}
          </div>
        </div>

        {/* Sidebar: items + address + summary */}
        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-5">
            <h3 className="font-medium mb-3">{order.items.length} {order.items.length === 1 ? t('cart.item') : t('cart.items')}</h3>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="h-12 w-12 rounded-lg glass grid place-items-center shrink-0 p-1.5"><Garment kind={item.kind} color={item.colorHex} className="h-full w-full" showDetail={false} /></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">{item.name}</div>
                    <div className="text-xs text-slate-500 truncate">{item.colorName} · {item.size} · ×{item.qty}</div>
                  </div>
                  <div className="text-sm text-slate-300">{formatMoney(item.price * item.qty)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5">
            <h3 className="font-medium mb-2 flex items-center gap-2"><MapPin size={15} className="text-cyber-300" /> Delivery to</h3>
            <p className="text-sm text-slate-300">{order.customer.name}</p>
            <p className="text-sm text-slate-400">{order.customer.address}, {order.customer.city} {order.customer.postal}</p>
            <p className="text-sm text-slate-400">{order.customer.country}</p>
          </div>

          <div className="glass-strong rounded-2xl p-5">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-400">{t('cart.subtotal')}</span><span className="text-slate-200">{formatMoney(order.subtotal)}</span></div>
              {order.discount > 0 && <div className="flex justify-between"><span className="text-slate-400">{t('cart.discount')}</span><span className="text-emerald-300">− {formatMoney(order.discount)}</span></div>}
              <div className="flex justify-between"><span className="text-slate-400">{t('cart.shipping')}</span><span className="text-slate-200">{order.shipping === 0 ? t('cart.free') : formatMoney(order.shipping)}</span></div>
              <div className="flex justify-between pt-2 border-t border-white/10"><span className="font-medium">{t('cart.total')}</span><span className="font-display text-lg font-semibold text-gradient">{formatMoney(order.total)}</span></div>
            </div>
            <div className="text-xs text-slate-500 mt-3">Paid via {order.payment}</div>
          </div>

          <Link to="/shop" className="btn-ghost w-full">{t('checkout.continueShopping')}</Link>
        </div>
      </div>
    </div>
  )
}
