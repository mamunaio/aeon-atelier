'use client'

import { useState } from 'react'
import { useParams, Link } from '../lib/router'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Mail, Phone, MapPin, Clock, Send, Truck, RefreshCw, ShieldCheck, FileText, Sparkles, Check } from 'lucide-react'
import { useI18n } from '../i18n'
import { useHead } from '../lib/seo'
import { useUI } from '../store/ui'
import { NovaMascot } from '../components/assistant/NovaMascot'

// ============================================================
// Static content pages — About, Delivery, Returns, FAQ,
// Contact, Privacy, Terms. Content is data-driven so the admin
// CMS could feed it later; here it's an on-brand default set.
// ============================================================

interface Block { h?: string; p?: string; list?: string[] }
interface PageDef { title: string; intro: string; icon: typeof FileText; blocks?: Block[] }

const PAGES: Record<string, PageDef> = {
  about: {
    title: 'About TaioMei', icon: Sparkles,
    intro: 'TaioMei is a next-generation fashion house — designed in Malaysia, built for a global wardrobe. We fuse premium materials with a fully personalized shopping experience.',
    blocks: [
      { h: 'Our philosophy', p: 'We believe clothing should be an extension of identity. Every piece is engineered with precision-cut patterns, reinforced seams and a refined hand-feel — then made truly yours through live customization.' },
      { h: 'Designed in Malaysia', p: 'Our studio is rooted in Kuala Lumpur, drawing on a vibrant regional creative culture and world-class manufacturing partners to deliver global-quality craftsmanship.' },
      { h: 'What makes us different', list: [
        'Minimum five distinct visual styles on every product',
        'Live 3D-style customization with your own artwork, text and logos',
        'Fast 1–3 day delivery on in-stock pieces across Malaysia',
        'Made / imported on request in 5–7 days for special orders',
        'A personal style profile that learns what you love',
      ] },
      { h: 'Sustainability', p: 'We prioritize organic and recycled fabrics, made-to-order production to reduce waste, and packaging designed to be reused. Fashion that respects both you and the planet.' },
    ],
  },
  delivery: {
    title: 'Delivery', icon: Truck,
    intro: 'Fast, tracked delivery across Malaysia and beyond — with real-time updates from checkout to your doorstep.',
    blocks: [
      { h: 'In-stock items', p: 'Pieces marked “Available Now” are dispatched from our warehouse and delivered within 1–3 business days nationwide.' },
      { h: 'Made / imported on request', p: 'Items marked “Made / Imported on Request” are produced or sourced specially for you and arrive within 5–7 business days. Customized pieces follow the same timeline.' },
      { h: 'Shipping fees', list: [
        'Flat-rate delivery applies to standard orders',
        'Free shipping automatically unlocks once your subtotal passes the free-shipping threshold',
        'Bulk and event orders receive dedicated logistics scheduling',
      ] },
      { h: 'Order tracking', p: 'Every order moves through eight clear stages — Placed, Confirmed, Processing, Packed, Shipped, Out for Delivery and Delivered. Track it live from your account or the tracking page.' },
    ],
  },
  returns: {
    title: 'Returns & Exchanges', icon: RefreshCw,
    intro: 'Not quite right? We keep returns simple, so you can shop with total confidence.',
    blocks: [
      { h: '14-day returns', p: 'Return unworn, unwashed items with original tags within 14 days of delivery for a full refund or exchange.' },
      { h: 'How it works', list: [
        'Start a return from your account under Orders',
        'Choose refund or exchange and print the prepaid label',
        'Drop off at any partner point — we handle the rest',
      ] },
      { h: 'Customized items', p: 'Because personalized pieces are made uniquely for you, they are non-returnable unless there is a manufacturing defect — in which case we will remake or refund promptly.' },
      { h: 'Refund timing', p: 'Approved refunds are issued to your original payment method within 5–7 business days of us receiving the return.' },
    ],
  },
  faq: {
    title: 'Frequently Asked Questions', icon: FileText,
    intro: 'Everything you need to know about shopping, customizing and receiving your TaioMei pieces.',
  },
  contact: {
    title: 'Contact & Support', icon: Mail,
    intro: 'Our team is here to help — from styling advice to order support and bulk enquiries.',
  },
  privacy: {
    title: 'Privacy Policy', icon: ShieldCheck,
    intro: 'Your trust matters. This policy explains what we collect, why, and the control you have over your data.',
    blocks: [
      { h: 'What we collect', p: 'Account details you provide (name, phone, email, addresses), your order history, saved designs and style preferences, and anonymous usage analytics that help us improve the experience.' },
      { h: 'How we use it', list: [
        'To process orders, payments and delivery',
        'To personalize recommendations and your style profile',
        'To provide support and keep you updated on your orders',
        'To improve our products, site performance and security',
      ] },
      { h: 'Your choices', p: 'You can view, edit or delete your account data at any time from your account settings. You control marketing preferences and can opt out of non-essential communications.' },
      { h: 'Data security', p: 'Payments are encrypted in transit and we never store full card details. Access to personal data is strictly limited and audited.' },
    ],
  },
  terms: {
    title: 'Terms & Conditions', icon: FileText,
    intro: 'The ground rules for using TaioMei. By shopping with us, you agree to these terms.',
    blocks: [
      { h: 'Orders & pricing', p: 'All prices are shown in Malaysian Ringgit (RM). We reserve the right to correct pricing errors and to limit quantities. Order confirmation is issued once payment is verified.' },
      { h: 'Accounts', p: 'You are responsible for keeping your account secure. Certain higher-value orders may require a verified account for fraud protection.' },
      { h: 'Customization', p: 'You confirm you hold the rights to any artwork, text or logos you upload. We reserve the right to decline content that is unlawful or infringes third-party rights.' },
      { h: 'Intellectual property', p: 'All site content, branding and designs are the property of TaioMei and may not be reproduced without permission.' },
    ],
  },
}

const FAQS = [
  { q: 'How long does delivery take?', a: 'In-stock items arrive in 1–3 business days. Made / imported on request and customized items arrive in 5–7 business days.' },
  { q: 'Can I customize any product?', a: 'Most apparel, caps and bags support customization. Look for the customize icon on a product, or head straight to the Customization Studio to add text, artwork and your logo with a live preview.' },
  { q: 'What payment methods can I use?', a: 'We support a range of methods — card, online banking, e-wallets and cash on delivery. The exact options available are shown at checkout.' },
  { q: 'Do I need an account to order?', a: 'You can check out as a guest for most orders. Higher-value orders may require a quick phone verification for security. Creating an account unlocks order tracking, saved designs and your style profile.' },
  { q: 'How do returns work?', a: 'Unworn items with tags can be returned within 14 days for a refund or exchange. Customized items are non-returnable unless defective.' },
  { q: 'Can you handle bulk and event orders?', a: 'Absolutely. Visit our Event & Custom Orders page to request a quote — we handle weddings, teams, corporate branding and campaigns end to end with volume pricing.' },
  { q: 'Which languages does the site support?', a: 'The entire experience is available in English, Bahasa Melayu, Tiếng Việt, 简体中文 and বাংলা. Switch anytime from the language selector.' },
]

export default function StaticPage() {
  const { slug = 'about' } = useParams()
  const { t } = useI18n()
  const page = PAGES[slug] ?? PAGES.about
  const Icon = page.icon
  useHead({ title: `${page.title} — TaioMei`, description: page.intro, path: `/page/${slug}` })

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-void-radial" />
        <div className="absolute inset-0 -z-10 opacity-40" style={{ background: 'radial-gradient(60% 60% at 20% 0%, rgba(123,77,255,0.25), transparent 60%)' }} />
        <div className="container-max pt-14 pb-8">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
            <Link to="/" className="hover:text-white">{t('nav.home')}</Link><span>/</span><span className="text-slate-300">{page.title}</span>
          </div>
          <div className="inline-flex items-center gap-2 chip glass text-cyber-300 mb-4"><Icon size={14} /> TaioMei</div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold max-w-3xl text-balance">{page.title}</h1>
          <p className="mt-4 text-lg text-slate-300 max-w-2xl">{page.intro}</p>
        </div>
      </section>

      <section className="container-max section-pad pt-4">
        {slug === 'faq' ? <Faq /> : slug === 'contact' ? <Contact /> : <Content blocks={page.blocks ?? []} />}
      </section>
    </div>
  )
}

function Content({ blocks }: { blocks: Block[] }) {
  const { t } = useI18n()
  return (
    <div className="grid lg:grid-cols-[1fr_300px] gap-10 items-start">
      <div className="space-y-8 max-w-2xl">
        {blocks.map((b, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
            {b.h && <h2 className="font-display text-xl font-semibold mb-2">{b.h}</h2>}
            {b.p && <p className="text-slate-400 leading-relaxed">{b.p}</p>}
            {b.list && (
              <ul className="mt-2 space-y-2">
                {b.list.map((li) => (
                  <li key={li} className="flex items-start gap-2.5 text-slate-300"><Check size={17} className="text-cyber-300 mt-0.5 shrink-0" /> {li}</li>
                ))}
              </ul>
            )}
          </motion.div>
        ))}
      </div>
      <aside className="glass-card rounded-2xl p-6 lg:sticky lg:top-24">
        <div className="nova-float mb-2"><NovaMascot mood="wave" size={72} /></div>
        <h3 className="font-display text-lg font-semibold">Need a hand?</h3>
        <p className="text-sm text-slate-400 mt-1">NOVA and our team are here to help you find, style and receive your perfect piece.</p>
        <Link to="/page/contact" className="btn-primary btn-sm w-full mt-4"><Mail size={15} /> Contact us</Link>
        <Link to="/survey" className="btn-ghost btn-sm w-full mt-2"><Sparkles size={15} /> {t('action.startSurvey')}</Link>
      </aside>
    </div>
  )
}

function Faq() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <div className="max-w-2xl space-y-3">
      {FAQS.map((f, i) => (
        <div key={i} className="glass-card rounded-2xl overflow-hidden">
          <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between gap-4 p-5 text-left">
            <span className="font-medium text-white">{f.q}</span>
            <ChevronDown size={18} className={`text-slate-400 shrink-0 transition-transform ${open === i ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
                <p className="px-5 pb-5 text-slate-400 leading-relaxed">{f.a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}

function Contact() {
  const { t } = useI18n()
  const { pushToast } = useUI()
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setSent(true)
    pushToast({ kind: 'success', title: 'Message sent', desc: 'Our team will reply within 24 hours.' })
  }

  const info = [
    { icon: Mail, label: 'Email', value: 'hello@taiomei.com' },
    { icon: Phone, label: 'Phone', value: '+60 3-1234 5678' },
    { icon: MapPin, label: 'Studio', value: 'Kuala Lumpur, Malaysia' },
    { icon: Clock, label: 'Hours', value: 'Mon–Sat · 9am–7pm (MYT)' },
  ]

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-start max-w-4xl">
      <form onSubmit={submit} className="glass-card rounded-2xl p-6 space-y-4">
        {sent ? (
          <div className="text-center py-10">
            <div className="h-14 w-14 rounded-full bg-emerald-500/15 grid place-items-center mx-auto mb-4"><Check size={28} className="text-emerald-400" /></div>
            <h3 className="font-display text-xl font-semibold">Thanks, {form.name || 'friend'}!</h3>
            <p className="text-slate-400 mt-1">We've received your message and will reply within 24 hours.</p>
            <button type="button" onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }) }} className="btn-ghost btn-sm mt-5">Send another</button>
          </div>
        ) : (
          <>
            <h2 className="font-display text-xl font-semibold">Send us a message</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <div><label className="label">Your name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" required /></div>
              <div><label className="label">Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" required /></div>
            </div>
            <div><label className="label">Subject</label><input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="input" /></div>
            <div><label className="label">Message</label><textarea rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="input" required /></div>
            <button type="submit" className="btn-primary w-full"><Send size={16} /> Send message</button>
          </>
        )}
      </form>

      <aside className="space-y-3">
        {info.map((it) => (
          <div key={it.label} className="glass-card rounded-2xl p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-aurora-500/15 grid place-items-center shrink-0"><it.icon size={18} className="text-aurora-300" /></div>
            <div><div className="text-xs text-slate-500">{it.label}</div><div className="text-sm text-slate-200">{it.value}</div></div>
          </div>
        ))}
        <div className="glass-card rounded-2xl p-5 text-center">
          <div className="nova-float mb-1 flex justify-center"><NovaMascot mood="point" size={64} /></div>
          <p className="text-sm text-slate-400">For bulk & event enquiries, request a tailored quote.</p>
          <Link to="/events" className="btn-gold btn-sm w-full mt-3">{t('action.requestQuote')}</Link>
        </div>
      </aside>
    </div>
  )
}
