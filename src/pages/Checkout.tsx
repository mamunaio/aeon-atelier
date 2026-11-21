import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CreditCard, Building2, Wallet, Banknote, Smartphone, ShieldCheck, Check, Lock, ArrowRight, Truck, Sparkles } from 'lucide-react'
import { useCart } from '../store/cart'
import { useConfig } from '../store/config'
import { useAuth } from '../store/auth'
import { useOrders } from '../store/orders'
import { useUI } from '../store/ui'
import { useI18n } from '../i18n'
import { useHead } from '../lib/seo'
import { Garment } from '../components/Garment'
import { NovaMascot } from '../components/assistant/NovaMascot'
import { formatMoney, deliveryWindow } from '../lib/format'
import type { PaymentMethodConfig } from '../types'

const PAY_ICON: Record<PaymentMethodConfig['kind'], typeof CreditCard> = {
  card: CreditCard, bank: Building2, ewallet: Wallet, cod: Banknote, gateway: Smartphone,
}

export default function Checkout() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const location = useLocation()
  const { items, subtotal, clear } = useCart()
  const { config } = useConfig()
  const { user, startOtp, verifyOtp, pendingOtp } = useAuth()
  const { createOrder, guestOrderCount } = useOrders()
  const { setStep, setMood, pushToast } = useUI()

  const coupon = (location.state as any)?.coupon as { code: string; discount: number; freeShip: boolean } | undefined

  const [form, setForm] = useState({
    name: user?.name ?? '', phone: user?.phone ?? '', email: user?.email ?? '',
    address: '', city: '', postal: '', country: 'Malaysia', notes: '',
  })
  const [payment, setPayment] = useState('')
  const [otpOpen, setOtpOpen] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [otpError, setOtpError] = useState('')
  const [placing, setPlacing] = useState(false)
  const [done, setDone] = useState<{ id: string; min: number; max: number } | null>(null)

  const enabledPayments = config.payments.filter((p) => p.enabled)
  useEffect(() => { if (!payment && enabledPayments[0]) setPayment(enabledPayments[0].id) }, [enabledPayments, payment])
  useEffect(() => { setStep('checkout') }, [setStep])

  const sub = subtotal()
  const discount = coupon?.discount ?? 0
  const shipping = sub === 0 ? 0 : coupon?.freeShip || sub - discount >= config.freeShippingThreshold ? 0 : config.flatShipping
  const total = Math.max(0, sub - discount) + shipping
  const hasRequestItem = items.some((i) => i.stock === 'made_on_request')
  const dw = deliveryWindow(hasRequestItem ? 'made_on_request' : 'in_stock', config)

  // Configurable account requirement — never hard-coded
  const accountRequired = total > config.guestOrderMaxValue
  const guestBlocked = !user && guestOrderCount >= config.maxGuestOrders
  const mustVerify = !user && config.requireOtp && (accountRequired || guestBlocked)

  const formValid = form.name && form.phone && form.address && form.city && form.postal && payment

  useHead({ title: `${t('checkout.title')} — TaioMei`, description: 'Secure checkout.', path: '/checkout' })

  const place = () => {
    if (!formValid) { pushToast({ kind: 'error', title: 'Please complete all required fields' }); return }
    if (mustVerify) { startOtp(form.phone); setOtpOpen(true); return }
    finalize()
  }

  const finalize = () => {
    setPlacing(true)
    const order = createOrder({
      items, subtotal: sub, shipping, discount, total, currency: 'MYR',
      customer: { name: form.name, phone: form.phone, email: form.email, address: form.address, city: form.city, postal: form.postal, country: form.country, notes: form.notes },
      payment: enabledPayments.find((p) => p.id === payment)?.label ?? payment,
      couponCode: coupon?.code,
      estDeliveryMin: dw.min, estDeliveryMax: dw.max,
      guest: !user,
    })
    setTimeout(() => {
      clear()
      setStep('delivery'); setMood('celebrate'); setTimeout(() => setMood('idle'), 2500)
      setDone({ id: order.id, min: dw.min, max: dw.max })
      setPlacing(false)
    }, 900)
  }

  const verify = () => {
    setOtpError('')
    const ok = verifyOtp(otpCode, { name: form.name, phone: form.phone, email: form.email })
    if (!ok) { setOtpError('Incorrect code. Try again.'); return }
    setOtpOpen(false); finalize()
  }

  // ---- success screen ----
  if (done) {
    return (
      <div className="container-max section-pad">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-strong rounded-3xl p-8 sm:p-12 max-w-lg mx-auto text-center">
          <div className="nova-float mb-4 flex justify-center"><NovaMascot mood="celebrate" size={110} /></div>
          <div className="h-14 w-14 rounded-full bg-emerald-500/15 grid place-items-center mx-auto mb-4"><Check size={30} className="text-emerald-400" /></div>
          <h1 className="font-display text-3xl font-bold">{t('checkout.success')}</h1>
          <p className="text-slate-400 mt-2">{t('checkout.successSub')}</p>
          <div className="glass rounded-2xl p-4 mt-6">
            <div className="text-xs text-slate-500 uppercase tracking-wider">{t('checkout.orderNumber')}</div>
            <div className="font-display text-2xl font-semibold text-gradient mt-1">{done.id}</div>
            <div className="mt-2 text-sm text-slate-400 flex items-center justify-center gap-1.5"><Truck size={14} className="text-cyber-300" /> {t('product.estDelivery')}: {done.min}–{done.max} {t('product.days')}</div>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row gap-2.5 justify-center">
            <Link to={`/track/${done.id}`} className="btn-primary flex-1"><Sparkles size={16} /> {t('action.trackOrder')}</Link>
            <Link to="/shop" className="btn-ghost flex-1">{t('checkout.continueShopping')}</Link>
          </div>
        </motion.div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container-max section-pad text-center">
        <p className="text-slate-300 text-lg">{t('cart.empty')}</p>
        <Link to="/shop" className="btn-primary mt-4">{t('action.shopNow')}</Link>
      </div>
    )
  }

  return (
    <div className="container-max section-pad">
      <h1 className="font-display text-3xl sm:text-4xl font-semibold mb-8 flex items-center gap-3">
        <Lock size={26} className="text-cyber-300" /> {t('checkout.title')}
      </h1>

      <div className="grid lg:grid-cols-[1fr_400px] gap-8 items-start">
        <div className="space-y-5">
          {/* Contact */}
          <Section title={t('checkout.contact')} step={1}>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label={t('checkout.name')} value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
              <Field label={t('checkout.phone')} value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required placeholder="+60 12-345 6789" />
              <div className="sm:col-span-2"><Field label={`${t('checkout.email')} (${t('misc.optional')})`} value={form.email} onChange={(v) => setForm({ ...form, email: v })} type="email" /></div>
            </div>
            {!user && (
              <p className="mt-3 text-xs text-slate-500">{t('checkout.guestNote')} · <Link to="/account/signin" className="text-cyber-300 hover:underline">{t('action.signIn')}</Link></p>
            )}
          </Section>

          {/* Delivery */}
          <Section title={t('checkout.delivery')} step={2}>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2"><Field label={t('checkout.address')} value={form.address} onChange={(v) => setForm({ ...form, address: v })} required /></div>
              <Field label={t('checkout.city')} value={form.city} onChange={(v) => setForm({ ...form, city: v })} required />
              <Field label={t('checkout.postal')} value={form.postal} onChange={(v) => setForm({ ...form, postal: v })} required />
              <div className="sm:col-span-2"><Field label={t('checkout.country')} value={form.country} onChange={(v) => setForm({ ...form, country: v })} /></div>
              <div className="sm:col-span-2">
                <label className="label">{t('checkout.notes')}</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder={t('checkout.notesPh')} rows={2} className="input" />
              </div>
            </div>
            <div className="mt-3 glass rounded-xl p-3 flex items-center gap-2 text-sm text-slate-300">
              <Truck size={16} className="text-cyber-300" /> {t('product.estDelivery')}: <span className="text-white">{dw.label} {t('product.days')}</span>
              <span className="text-slate-500">· {hasRequestItem ? t('delivery.request') : t('delivery.fast')}</span>
            </div>
          </Section>

          {/* Payment — fully admin-configured */}
          <Section title={t('checkout.payMethod')} step={3}>
            <div className="grid sm:grid-cols-2 gap-2.5">
              {enabledPayments.map((p) => {
                const Icon = PAY_ICON[p.kind]
                return (
                  <button key={p.id} onClick={() => setPayment(p.id)}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${payment === p.id ? 'border-aurora-400 bg-aurora-500/10' : 'border-white/12 hover:border-white/30'}`}>
                    <Icon size={20} className={payment === p.id ? 'text-aurora-300' : 'text-slate-400'} />
                    <span className={`text-sm ${payment === p.id ? 'text-white' : 'text-slate-300'}`}>{p.label}</span>
                    {payment === p.id && <Check size={16} className="ml-auto text-aurora-300" />}
                  </button>
                )
              })}
            </div>
            {enabledPayments.length === 0 && <p className="text-sm text-rose-400">No payment methods are currently enabled.</p>}
            <p className="mt-3 text-xs text-slate-500 flex items-center gap-1.5"><ShieldCheck size={13} className="text-emerald-400" /> Payments are encrypted. This is a demo — no real charge is made.</p>
          </Section>
        </div>

        {/* Summary */}
        <div className="lg:sticky lg:top-24 space-y-4">
          <div className="glass-strong rounded-2xl p-5">
            <h2 className="font-display text-lg font-semibold mb-4">{t('checkout.orderSummary')}</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto no-scrollbar pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="relative h-14 w-14 rounded-lg glass grid place-items-center shrink-0 p-1.5">
                    <Garment kind={item.kind} color={item.colorHex} className="h-full w-full" showDetail={false} />
                    <span className="absolute -top-1.5 -right-1.5 h-5 w-5 grid place-items-center rounded-full bg-void-800 border border-white/15 text-[10px] text-white">{item.qty}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">{item.name}</div>
                    <div className="text-xs text-slate-500 truncate">{item.styleName} · {item.colorName} · {item.size}</div>
                  </div>
                  <div className="text-sm text-slate-200">{formatMoney(item.price * item.qty)}</div>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-sm border-t border-white/10 mt-4 pt-4">
              <div className="flex justify-between"><span className="text-slate-400">{t('cart.subtotal')}</span><span className="text-slate-200">{formatMoney(sub)}</span></div>
              {discount > 0 && <div className="flex justify-between"><span className="text-slate-400">{t('cart.discount')} ({coupon?.code})</span><span className="text-emerald-300">− {formatMoney(discount)}</span></div>}
              <div className="flex justify-between"><span className="text-slate-400">{t('cart.shipping')}</span><span className={shipping === 0 ? 'text-emerald-300' : 'text-slate-200'}>{shipping === 0 ? t('cart.free') : formatMoney(shipping)}</span></div>
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
              <span className="font-medium">{t('cart.total')}</span>
              <span className="font-display text-2xl font-semibold text-gradient">{formatMoney(total)}</span>
            </div>

            {accountRequired && !user && (
              <div className="mt-4 glass rounded-xl p-3 text-xs text-amber-200 flex items-start gap-2">
                <ShieldCheck size={15} className="mt-0.5 shrink-0 text-amber-300" />
                {t('checkout.accountRequired', { amount: formatMoney(config.guestOrderMaxValue) })}
              </div>
            )}

            <button onClick={place} disabled={placing || !formValid} className="btn-primary w-full mt-5 !py-3.5 disabled:opacity-50">
              {placing ? <span className="flex items-center gap-2"><span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" /> Processing…</span>
                : <>{mustVerify ? <><ShieldCheck size={17} /> Verify & {t('checkout.placeOrder')}</> : <><Lock size={17} /> {t('checkout.placeOrder')} · {formatMoney(total)}</>}</>}
            </button>
          </div>
        </div>
      </div>

      {/* OTP modal */}
      <AnimatePresence>
        {otpOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOtpOpen(false)} className="fixed inset-0 z-[70] bg-void-950/85 backdrop-blur-md" />
            <div className="fixed inset-0 z-[71] grid place-items-center p-4">
              <motion.div initial={{ opacity: 0, y: 30, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30 }} className="glass-strong rounded-3xl p-7 w-full max-w-sm text-center">
                <div className="nova-float mb-2 flex justify-center"><NovaMascot mood="point" size={72} /></div>
                <h3 className="font-display text-xl font-semibold">{t('checkout.otpTitle')}</h3>
                <p className="text-sm text-slate-400 mt-1">{t('checkout.otpSub', { phone: form.phone || 'your phone' })}</p>
                {pendingOtp && <p className="mt-2 text-xs text-cyber-300">Demo code: <span className="font-mono font-bold tracking-widest">{pendingOtp}</span></p>}
                <input
                  value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  inputMode="numeric" placeholder="••••••"
                  className="input text-center text-2xl tracking-[0.5em] font-mono mt-4"
                />
                {otpError && <p className="mt-2 text-xs text-rose-400">{otpError}</p>}
                <button onClick={verify} disabled={otpCode.length < 6} className="btn-primary w-full mt-4 disabled:opacity-50">{t('checkout.otpVerify')}</button>
                <button onClick={() => startOtp(form.phone)} className="mt-2 text-xs text-slate-500 hover:text-slate-300">{t('checkout.otpResend')}</button>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

function Section({ title, step, children }: { title: string; step: number; children: React.ReactNode }) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2.5">
        <span className="h-7 w-7 rounded-full bg-aurora-gradient grid place-items-center text-xs font-bold text-white">{step}</span>
        {title}
      </h2>
      {children}
    </div>
  )
}

function Field({ label, value, onChange, required, type = 'text', placeholder }: {
  label: string; value: string; onChange: (v: string) => void; required?: boolean; type?: string; placeholder?: string
}) {
  return (
    <div>
      <label className="label">{label}{required && <span className="text-rose-400 ml-0.5">*</span>}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="input" required={required} />
    </div>
  )
}
