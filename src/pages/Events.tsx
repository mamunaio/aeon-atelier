import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Users, Palette, MapPin, Upload, Check, Sparkles, TrendingDown, Headphones, Truck, Building2, PartyPopper, Shirt, Trophy, Heart } from 'lucide-react'
import { useI18n } from '../i18n'
import { useHead } from '../lib/seo'
import { useOrders } from '../store/orders'
import { NovaMascot } from '../components/assistant/NovaMascot'

const EVENT_TYPES = [
  { id: 'corporate', label: 'Corporate / Branding', icon: Building2 },
  { id: 'wedding', label: 'Wedding', icon: Heart },
  { id: 'team', label: 'Team / Sports', icon: Trophy },
  { id: 'festival', label: 'Festival / Concert', icon: PartyPopper },
  { id: 'school', label: 'School / University', icon: Users },
  { id: 'other', label: 'Other', icon: Shirt },
]
const PRODUCT_TYPES = ['T-Shirts', 'Polo Shirts', 'Hoodies', 'Caps', 'Jackets', 'Tote Bags', 'Uniforms', 'Mixed']

export default function Events() {
  const { t } = useI18n()
  const { addQuote } = useOrders()
  const [done, setDone] = useState<string | null>(null)
  const [form, setForm] = useState({
    eventType: 'corporate', eventDate: '', quantity: 50, productType: 'T-Shirts',
    colors: '', sizeDistribution: '', location: '', notes: '',
    logoName: '', contactName: '', contactPhone: '', contactEmail: '',
  })

  useHead({ title: `${t('event.title')} — TaioMei`, description: t('event.sub'), path: '/events' })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = addQuote(form)
    setDone(q.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const perks = [
    { icon: TrendingDown, title: t('event.perks1'), desc: 'The bigger the order, the better the rate.' },
    { icon: Headphones, title: t('event.perks2'), desc: 'A dedicated designer from concept to delivery.' },
    { icon: Truck, title: t('event.perks3'), desc: 'Guaranteed timelines for your event date.' },
  ]

  if (done) {
    return (
      <div className="container-max section-pad">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-strong rounded-3xl p-8 sm:p-12 max-w-lg mx-auto text-center">
          <div className="nova-float mb-3 flex justify-center"><NovaMascot mood="celebrate" size={100} /></div>
          <div className="h-14 w-14 rounded-full bg-emerald-500/15 grid place-items-center mx-auto mb-4"><Check size={30} className="text-emerald-400" /></div>
          <h1 className="font-display text-3xl font-bold">{t('event.success')}</h1>
          <p className="text-slate-400 mt-2">{t('event.successSub')}</p>
          <div className="glass rounded-2xl p-4 mt-6">
            <div className="text-xs text-slate-500 uppercase tracking-wider">Quote reference</div>
            <div className="font-display text-2xl font-semibold text-gradient mt-1">{done}</div>
          </div>
          <div className="mt-6 flex gap-2.5 justify-center">
            <Link to="/shop" className="btn-primary">{t('action.shopNow')}</Link>
            <button onClick={() => { setDone(null); setForm({ ...form, notes: '' }) }} className="btn-ghost">New request</button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-void-radial" />
        <div className="absolute inset-0 -z-10 opacity-40" style={{ background: 'radial-gradient(70% 60% at 80% 0%, rgba(255,179,71,0.28), transparent 60%)' }} />
        <div className="container-max pt-14 pb-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 chip glass text-gold-300 border-gold-500/30 mb-5">
            <Sparkles size={13} /> Events & Bulk Orders
          </motion.div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold max-w-3xl mx-auto text-balance">{t('event.title')}</h1>
          <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto">{t('event.sub')}</p>
        </div>
      </section>

      {/* Perks */}
      <section className="container-max grid sm:grid-cols-3 gap-4 -mt-2 mb-10">
        {perks.map((p) => (
          <div key={p.title} className="glass-card rounded-2xl p-6">
            <p.icon className="text-gold-400 mb-3" size={26} />
            <h3 className="font-display text-lg font-semibold">{p.title}</h3>
            <p className="text-sm text-slate-400 mt-1">{p.desc}</p>
          </div>
        ))}
      </section>

      {/* Form */}
      <section className="container-max section-pad pt-0">
        <form onSubmit={submit} className="grid lg:grid-cols-[1fr_340px] gap-8 items-start">
          <div className="space-y-5">
            <Card title={t('event.eventType')} icon={Calendar}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {EVENT_TYPES.map((et) => (
                  <button type="button" key={et.id} onClick={() => setForm({ ...form, eventType: et.id })}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${form.eventType === et.id ? 'border-gold-500/50 bg-gold-500/10' : 'border-white/12 hover:border-white/30'}`}>
                    <et.icon size={22} className={form.eventType === et.id ? 'text-gold-300' : 'text-slate-400'} />
                    <span className={`text-xs text-center ${form.eventType === et.id ? 'text-white' : 'text-slate-400'}`}>{et.label}</span>
                  </button>
                ))}
              </div>
            </Card>

            <Card title="Order details" icon={Users}>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="label">{t('event.eventDate')}</label>
                  <input type="date" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} className="input" required />
                </div>
                <div>
                  <label className="label">{t('event.quantity')}</label>
                  <input type="number" min={10} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} className="input" required />
                </div>
                <div>
                  <label className="label">{t('event.productType')}</label>
                  <select value={form.productType} onChange={(e) => setForm({ ...form, productType: e.target.value })} className="input cursor-pointer">
                    {PRODUCT_TYPES.map((p) => <option key={p} className="bg-void-900">{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label flex items-center gap-1.5"><Palette size={13} /> {t('event.colors')}</label>
                  <input value={form.colors} onChange={(e) => setForm({ ...form, colors: e.target.value })} placeholder="e.g. Black, Gold" className="input" />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">{t('event.sizes')}</label>
                  <input value={form.sizeDistribution} onChange={(e) => setForm({ ...form, sizeDistribution: e.target.value })} placeholder="e.g. 10×S, 20×M, 15×L, 5×XL" className="input" />
                </div>
                <div className="sm:col-span-2">
                  <label className="label flex items-center gap-1.5"><MapPin size={13} /> {t('event.location')}</label>
                  <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="City / delivery address" className="input" />
                </div>
              </div>
            </Card>

            <Card title={t('event.logo')} icon={Upload}>
              <label className="btn-ghost btn-sm border-dashed cursor-pointer inline-flex">
                <Upload size={15} /> {form.logoName || t('event.logo')}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setForm({ ...form, logoName: e.target.files?.[0]?.name ?? '' })} />
              </label>
              <label className="label mt-4">{t('event.notes')}</label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} placeholder="Tell us about your vision, deadlines, print requirements…" className="input" />
            </Card>
          </div>

          {/* Contact + submit */}
          <div className="lg:sticky lg:top-24 space-y-4">
            <Card title="Contact" icon={Headphones}>
              <div className="space-y-3">
                <div><label className="label">{t('event.contactName')}</label><input value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} className="input" required /></div>
                <div><label className="label">{t('event.contactPhone')}</label><input value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} className="input" required /></div>
                <div><label className="label">{t('event.contactEmail')}</label><input type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} className="input" required /></div>
              </div>
              <button type="submit" className="btn-gold w-full mt-4">{t('event.submit')}</button>
              <p className="text-[11px] text-slate-500 mt-2 text-center">No obligation. Response within 24 hours.</p>
            </Card>
          </div>
        </form>
      </section>
    </div>
  )
}

function Card({ title, icon: Icon, children }: { title: string; icon: typeof Calendar; children: React.ReactNode }) {
  return (
    <div className="glass-card rounded-2xl p-5 sm:p-6">
      <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2"><Icon size={18} className="text-gold-400" /> {title}</h2>
      {children}
    </div>
  )
}
