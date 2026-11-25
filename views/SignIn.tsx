'use client'

import { useState, useEffect } from 'react'
import { useNavigate, Link } from '../lib/router'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, Mail, ArrowRight, ArrowLeft, ShieldCheck, Sparkles, Truck, Wand2, Heart } from 'lucide-react'
import { useAuth } from '../store/auth'
import { useUI } from '../store/ui'
import { useI18n } from '../i18n'
import { useHead } from '../lib/seo'
import { NovaMascot } from '../components/assistant/NovaMascot'

type Tab = 'phone' | 'email'

export default function SignIn() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { user, startOtp, verifyOtp, loginEmail, pendingOtp } = useAuth()
  const { pushToast } = useUI()

  const [tab, setTab] = useState<Tab>('phone')
  const [phase, setPhase] = useState<'enter' | 'otp'>('enter')
  const [emailMode, setEmailMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  useEffect(() => { if (user) navigate('/account', { replace: true }) }, [user, navigate])
  useHead({ title: `${t('account.signInTitle')} — TaioMei`, description: t('account.signInSub'), path: '/account/signin' })

  const sendOtp = (e: React.FormEvent) => {
    e.preventDefault(); setError('')
    if (phone.trim().length < 6) { setError('Please enter a valid phone number.'); return }
    startOtp(phone); setPhase('otp')
  }

  const verify = (e: React.FormEvent) => {
    e.preventDefault(); setError('')
    if (verifyOtp(code, { name: name || 'TaioMei Member', phone, email })) {
      pushToast({ kind: 'success', title: `${t('account.welcome')}!`, desc: name || 'TaioMei Member' })
      navigate('/account')
    } else setError('Incorrect code. Try again.')
  }

  const emailSubmit = (e: React.FormEvent) => {
    e.preventDefault(); setError('')
    if (!email.includes('@')) { setError('Please enter a valid email.'); return }
    if (password.length < 4) { setError('Password must be at least 4 characters.'); return }
    loginEmail(email, password, emailMode === 'register' ? name : undefined)
    pushToast({ kind: 'success', title: `${t('account.welcome')}!` })
    navigate('/account')
  }

  const perks = [
    { icon: Truck, text: 'Real-time order tracking' },
    { icon: Wand2, text: 'Save & reorder custom designs' },
    { icon: Heart, text: 'Sync your wishlist everywhere' },
    { icon: Sparkles, text: 'A personal style profile & rewards' },
  ]

  return (
    <div className="container-max section-pad">
      <div className="grid lg:grid-cols-2 gap-8 items-center max-w-4xl mx-auto">
        {/* Left: brand / perks */}
        <div className="hidden lg:block">
          <div className="nova-float mb-4"><NovaMascot mood="wave" size={110} /></div>
          <h2 className="font-display text-3xl font-bold text-balance">Join the future of fashion</h2>
          <p className="text-slate-400 mt-2">Create your TaioMei identity and unlock a fully personalized experience.</p>
          <ul className="mt-6 space-y-3">
            {perks.map((p) => (
              <li key={p.text} className="flex items-center gap-3 text-slate-300">
                <div className="h-9 w-9 rounded-xl bg-aurora-500/15 grid place-items-center shrink-0"><p.icon size={17} className="text-aurora-300" /></div>
                {p.text}
              </li>
            ))}
          </ul>
        </div>

        {/* Right: auth card */}
        <div className="glass-strong rounded-3xl p-6 sm:p-8">
          <div className="text-center mb-6">
            <h1 className="font-display text-2xl font-semibold">{t('account.signInTitle')}</h1>
            <p className="text-slate-400 text-sm mt-1">{t('account.signInSub')}</p>
          </div>

          {/* Tabs */}
          <div className="grid grid-cols-2 gap-1 p-1 glass rounded-xl mb-6">
            {(['phone', 'email'] as Tab[]).map((tb) => (
              <button key={tb} onClick={() => { setTab(tb); setPhase('enter'); setError('') }}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === tb ? 'bg-aurora-gradient text-white shadow-glow' : 'text-slate-400 hover:text-white'}`}>
                {tb === 'phone' ? <Phone size={15} /> : <Mail size={15} />} {tb === 'phone' ? t('checkout.phone') : t('checkout.email')}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {tab === 'phone' ? (
              phase === 'enter' ? (
                <motion.form key="phone-enter" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={sendOtp} className="space-y-4">
                  <div>
                    <label className="label">{t('checkout.name')} <span className="text-slate-500">({t('misc.optional')})</span></label>
                    <input value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="Your name" />
                  </div>
                  <div>
                    <label className="label">{t('checkout.phone')}</label>
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input" placeholder="+60 12-345 6789" inputMode="tel" required />
                  </div>
                  {error && <p className="text-xs text-rose-400">{error}</p>}
                  <button type="submit" className="btn-primary w-full">{t('account.sendOtp')} <ArrowRight size={16} /></button>
                </motion.form>
              ) : (
                <motion.form key="phone-otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={verify} className="space-y-4 text-center">
                  <div className="nova-float flex justify-center"><NovaMascot mood="point" size={72} /></div>
                  <p className="text-sm text-slate-400">{t('checkout.otpSub', { phone })}</p>
                  {pendingOtp && <p className="text-xs text-cyber-300">Demo code: <span className="font-mono font-bold tracking-widest">{pendingOtp}</span></p>}
                  <input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" placeholder="••••••" className="input text-center text-2xl tracking-[0.5em] font-mono" />
                  {error && <p className="text-xs text-rose-400">{error}</p>}
                  <button type="submit" disabled={code.length < 6} className="btn-primary w-full disabled:opacity-50"><ShieldCheck size={16} /> {t('checkout.otpVerify')}</button>
                  <div className="flex items-center justify-between text-xs">
                    <button type="button" onClick={() => { setPhase('enter'); setError('') }} className="text-slate-500 hover:text-white flex items-center gap-1"><ArrowLeft size={12} /> {t('action.back')}</button>
                    <button type="button" onClick={() => startOtp(phone)} className="text-slate-500 hover:text-white">{t('checkout.otpResend')}</button>
                  </div>
                </motion.form>
              )
            ) : (
              <motion.form key="email" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={emailSubmit} className="space-y-4">
                {emailMode === 'register' && (
                  <div><label className="label">{t('checkout.name')}</label><input value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="Your name" required /></div>
                )}
                <div><label className="label">{t('checkout.email')}</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@email.com" required /></div>
                <div><label className="label">{t('account.password')}</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="••••••••" required /></div>
                {error && <p className="text-xs text-rose-400">{error}</p>}
                <button type="submit" className="btn-primary w-full">{emailMode === 'register' ? t('action.register') : t('action.signIn')} <ArrowRight size={16} /></button>
                <button type="button" onClick={() => { setEmailMode(emailMode === 'login' ? 'register' : 'login'); setError('') }} className="w-full text-center text-xs text-cyber-300 hover:underline">
                  {emailMode === 'login' ? t('account.createOne') : t('account.haveAccount')}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="mt-6 pt-5 border-t border-white/10 text-center">
            <p className="text-xs text-slate-500 flex items-center justify-center gap-1.5"><ShieldCheck size={13} className="text-emerald-400" /> Your details are encrypted & never shared.</p>
            <Link to="/" className="text-xs text-slate-500 hover:text-white mt-2 inline-block">← {t('checkout.continueShopping')}</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
