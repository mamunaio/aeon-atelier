import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, Check, Sparkles, RefreshCw, ShoppingBag } from 'lucide-react'
import { useI18n } from '../i18n'
import { useHead } from '../lib/seo'
import { useAuth } from '../store/auth'
import { NovaMascot } from '../components/assistant/NovaMascot'
import { ProductCard } from '../components/ProductCard'
import { QuickView } from '../components/QuickView'
import { recommend } from '../lib/recommend'
import type { StyleProfile, Product } from '../types'

interface Q {
  key: string
  title: string
  sub?: string
  multi?: boolean
  options: { value: string; label: string; hint?: string }[]
}

const QUESTIONS: Q[] = [
  {
    key: 'vibe', title: "What's your fashion vibe?", options: [
      { value: 'Streetwear', label: 'Streetwear', hint: 'Bold, oversized, graphic' },
      { value: 'Minimalist', label: 'Minimalist', hint: 'Clean, refined, timeless' },
      { value: 'Classic', label: 'Classic', hint: 'Polished and put-together' },
      { value: 'Luxe', label: 'Luxe', hint: 'Premium materials, statement pieces' },
      { value: 'Athleisure', label: 'Athleisure', hint: 'Sporty, comfortable, versatile' },
      { value: 'Bold', label: 'Bold & Expressive', hint: 'Color, pattern, personality' },
    ]
  },
  {
    key: 'colors', title: 'Which colors speak to you?', sub: 'Pick as many as you like', multi: true, options: [
      { value: 'black', label: 'Black' }, { value: 'white', label: 'White' }, { value: 'grey', label: 'Grey' },
      { value: 'violet', label: 'Violet' }, { value: 'teal', label: 'Teal' }, { value: 'blue', label: 'Blue' },
      { value: 'red', label: 'Red' }, { value: 'green', label: 'Green' }, { value: 'gold', label: 'Gold' },
    ]
  },
  {
    key: 'formality', title: 'How do you usually dress?', options: [
      { value: 'Casual', label: 'Casual', hint: 'Everyday comfort' },
      { value: 'Smart Casual', label: 'Smart Casual', hint: 'Elevated but relaxed' },
      { value: 'Formal', label: 'Formal', hint: 'Sharp and tailored' },
    ]
  },
  {
    key: 'boldness', title: 'How bold are your choices?', options: [
      { value: 'Subtle', label: 'Subtle', hint: 'Understated & versatile' },
      { value: 'Balanced', label: 'Balanced', hint: 'A little of both' },
      { value: 'Bold', label: 'Bold', hint: 'Turn heads' },
    ]
  },
  {
    key: 'fits', title: 'Which fits do you love?', sub: 'Choose your favorites', multi: true, options: [
      { value: 'classic', label: 'Classic' }, { value: 'slim', label: 'Slim' }, { value: 'relaxed', label: 'Relaxed' },
      { value: 'oversized', label: 'Oversized' }, { value: 'tailored', label: 'Tailored' },
    ]
  },
  {
    key: 'categories', title: 'What are you shopping for?', sub: 'Select all that apply', multi: true, options: [
      { value: 'tshirts', label: 'T-Shirts' }, { value: 'hoodies', label: 'Hoodies' }, { value: 'shirts', label: 'Shirts' },
      { value: 'jeans', label: 'Jeans' }, { value: 'sneakers', label: 'Sneakers' }, { value: 'watches', label: 'Watches' },
      { value: 'bags', label: 'Bags' }, { value: 'caps', label: 'Caps' },
    ]
  },
  {
    key: 'price', title: "What's your typical budget per piece?", options: [
      { value: '0-120', label: 'Under RM 120', hint: 'Smart value' },
      { value: '120-260', label: 'RM 120 – 260', hint: 'Premium everyday' },
      { value: '260-600', label: 'RM 260 – 600', hint: 'Elevated' },
      { value: '600-2000', label: 'RM 600+', hint: 'Luxury' },
    ]
  },
  {
    key: 'eventType', title: 'Any occasion in mind?', options: [
      { value: 'everyday', label: 'Everyday wardrobe' }, { value: 'work', label: 'Work' },
      { value: 'event', label: 'Special event' }, { value: 'gift', label: 'A gift' },
    ]
  },
]

export default function Survey() {
  const { t } = useI18n()
  const { user, setStyleProfile } = useAuth()
  const [started, setStarted] = useState(false)
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string[]>>({})
  const [profile, setProfile] = useState<StyleProfile | null>(user?.styleProfile ?? null)
  const [quick, setQuick] = useState<Product | null>(null)

  useHead({ title: `${t('survey.title')} — TaioMei`, description: t('survey.sub'), path: '/survey' })

  const q = QUESTIONS[step]
  const current = answers[q?.key] ?? []
  const canNext = current.length > 0

  const choose = (value: string) => {
    setAnswers((a) => {
      const prev = a[q.key] ?? []
      if (q.multi) return { ...a, [q.key]: prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value] }
      return { ...a, [q.key]: [value] }
    })
    if (!q.multi) setTimeout(() => next(), 220)
  }

  const next = () => {
    if (step < QUESTIONS.length - 1) setStep((s) => s + 1)
    else finish()
  }

  const finish = () => {
    const priceStr = (answers.price?.[0] ?? '120-260').split('-').map(Number)
    const built: StyleProfile = {
      vibe: answers.vibe?.[0] ?? 'Minimalist',
      colors: answers.colors ?? [],
      formality: answers.formality?.[0] ?? 'Smart Casual',
      boldness: answers.boldness?.[0] ?? 'Balanced',
      fits: answers.fits ?? [],
      categories: answers.categories ?? [],
      patterns: [],
      fabrics: [],
      priceRange: [priceStr[0] ?? 0, priceStr[1] ?? 600],
      eventType: answers.eventType?.[0] ?? 'everyday',
      completedAt: new Date().toISOString(),
    }
    setStyleProfile(built)
    setProfile(built)
  }

  const restart = () => { setProfile(null); setStarted(true); setStep(0); setAnswers({}) }

  // ---------- Result ----------
  if (profile) {
    const recos = recommend({ profile }, 8)
    return (
      <div className="container-max section-pad">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-2xl mx-auto">
          <div className="nova-float mb-3 flex justify-center"><NovaMascot mood="celebrate" size={96} /></div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold">{t('survey.profileTitle')}</h1>
          <p className="text-slate-400 mt-2">{t('survey.profileSub')}</p>
        </motion.div>

        <div className="glass-strong rounded-3xl p-6 sm:p-8 max-w-2xl mx-auto mt-8">
          <div className="flex items-center gap-4 pb-5 border-b border-white/10">
            <div className="h-16 w-16 rounded-2xl bg-aurora-gradient grid place-items-center shrink-0"><Sparkles size={28} className="text-white" /></div>
            <div>
              <div className="text-xs uppercase tracking-widest text-cyber-300">Your style signature</div>
              <div className="font-display text-2xl font-semibold">{profile.vibe} · {profile.boldness}</div>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 mt-5 text-sm">
            <Trait label="Dress style" value={profile.formality} />
            <Trait label="Budget" value={`RM ${profile.priceRange[0]}–${profile.priceRange[1]}`} />
            <Trait label="Favorite fits" value={profile.fits.join(', ') || 'Flexible'} />
            <Trait label="Colors" value={profile.colors.join(', ') || 'Open'} />
            <Trait label="Shopping for" value={profile.categories.join(', ') || 'Everything'} />
            <Trait label="Occasion" value={profile.eventType} />
          </div>
          <div className="flex flex-wrap gap-2.5 mt-6">
            <Link to="/shop" className="btn-primary"><ShoppingBag size={16} /> {t('survey.shopProfile')}</Link>
            <button onClick={restart} className="btn-ghost"><RefreshCw size={15} /> {t('survey.retake')}</button>
          </div>
        </div>

        <section className="mt-12">
          <h2 className="font-display text-2xl font-semibold mb-1">{t('survey.recommend')}</h2>
          <p className="text-slate-400 mb-6">{t('home.recommendedSub')}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recos.map(({ product, reasons }, i) => <ProductCard key={product.id} product={product} index={i} reason={reasons[0]} onQuickView={setQuick} />)}
          </div>
        </section>

        <QuickView product={quick} onClose={() => setQuick(null)} />
      </div>
    )
  }

  // ---------- Intro ----------
  if (!started) {
    return (
      <div className="container-max section-pad">
        <div className="relative overflow-hidden glass-strong rounded-3xl p-8 sm:p-14 max-w-2xl mx-auto text-center">
          <div className="absolute inset-0 -z-10 opacity-50" style={{ background: 'radial-gradient(80% 80% at 50% 0%, rgba(18,211,224,0.22), transparent 60%)' }} />
          <div className="nova-float mb-4 flex justify-center"><NovaMascot mood="wave" size={120} /></div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold">{t('survey.title')}</h1>
          <p className="text-slate-300 mt-3 max-w-md mx-auto">{t('survey.sub')}</p>
          <button onClick={() => setStarted(true)} className="btn-primary mt-7 !px-8"><Sparkles size={18} /> {t('survey.start')}</button>
          <p className="text-xs text-slate-500 mt-4">{QUESTIONS.length} quick questions · ~60 seconds</p>
        </div>
      </div>
    )
  }

  // ---------- Quiz ----------
  return (
    <div className="container-max section-pad">
      <div className="max-w-2xl mx-auto">
        {/* Progress */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
            <motion.div className="h-full bg-aurora-gradient rounded-full" animate={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }} />
          </div>
          <span className="text-xs text-slate-400 tabular-nums shrink-0">{step + 1} {t('survey.of')} {QUESTIONS.length}</span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={q.key} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
            <div className="flex items-start gap-3 mb-6">
              <div className="nova-float shrink-0"><NovaMascot mood="point" size={56} /></div>
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-semibold">{q.title}</h2>
                {q.sub && <p className="text-slate-400 text-sm mt-1">{q.sub}</p>}
              </div>
            </div>

            <div className={`grid gap-3 ${q.options.length > 4 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
              {q.options.map((opt) => {
                const active = current.includes(opt.value)
                return (
                  <button key={opt.value} onClick={() => choose(opt.value)}
                    className={`relative text-left p-4 rounded-2xl border transition-all ${active ? 'border-aurora-400 bg-aurora-500/10 shadow-glow' : 'border-white/12 hover:border-white/30 hover:bg-white/5'}`}>
                    {active && <span className="absolute top-3 right-3 h-5 w-5 rounded-full bg-aurora-500 grid place-items-center"><Check size={12} className="text-white" strokeWidth={3} /></span>}
                    <div className={`font-medium ${active ? 'text-white' : 'text-slate-200'}`}>{opt.label}</div>
                    {opt.hint && <div className="text-xs text-slate-400 mt-0.5">{opt.hint}</div>}
                  </button>
                )
              })}
            </div>

            <div className="flex items-center justify-between mt-8">
              <button onClick={() => (step === 0 ? setStarted(false) : setStep((s) => s - 1))} className="btn-ghost btn-sm"><ArrowLeft size={15} /> {t('survey.prev')}</button>
              <button onClick={next} disabled={!canNext} className="btn-primary disabled:opacity-40">
                {step === QUESTIONS.length - 1 ? t('survey.finish') : t('survey.next')} <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

function Trait({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-white/5 pb-2">
      <span className="text-slate-400">{label}</span>
      <span className="text-slate-100 text-right capitalize">{value}</span>
    </div>
  )
}
