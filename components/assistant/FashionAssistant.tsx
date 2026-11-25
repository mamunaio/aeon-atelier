'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { X, Sparkles, MessageCircle } from 'lucide-react'
import { NovaMascot } from './NovaMascot'
import { useUI, type StepKey } from '../../store/ui'
import { useI18n } from '../../i18n'
import { useNavigate } from '../../lib/router'

const STEP_ORDER: StepKey[] = ['discover', 'style', 'color', 'size', 'customize', 'cart', 'checkout', 'delivery']

const STEP_MESSAGE: Record<StepKey, string> = {
  discover: 'assistant.discover',
  style: 'assistant.style',
  color: 'assistant.color',
  size: 'assistant.size',
  customize: 'assistant.customize',
  cart: 'assistant.cart',
  checkout: 'assistant.checkout',
  delivery: 'assistant.delivery',
}

export function FashionAssistant() {
  const { assistantOpen, setAssistantOpen, assistantStep, assistantMood, reduceMotion } = useUI()
  const { t } = useI18n()
  const navigate = useNavigate()

  const currentIdx = STEP_ORDER.indexOf(assistantStep)
  const message = assistantMood === 'celebrate' ? t('assistant.celebrate') : t(STEP_MESSAGE[assistantStep])

  return (
    <>
      {/* Launcher */}
      <AnimatePresence>
        {!assistantOpen && (
          <motion.button
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            onClick={() => setAssistantOpen(true)}
            aria-label={t('assistant.open')}
            className="fixed z-40 bottom-20 left-4 sm:bottom-6 sm:left-6 group"
          >
            <span className="absolute inset-0 rounded-full bg-aurora-500/40 blur-xl group-hover:bg-aurora-500/60 transition-colors" />
            <span className={`relative block rounded-full glass-strong p-1.5 shadow-glow ${reduceMotion ? '' : 'nova-float'}`}>
              <NovaMascot mood="wave" size={62} />
            </span>
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-cyber-400 text-void-950">
              <MessageCircle size={12} />
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {assistantOpen && (
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.92 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 240, damping: 24 }}
            className="fixed z-40 bottom-20 left-4 sm:bottom-6 sm:left-6 w-[300px] max-w-[calc(100vw-2rem)]"
          >
            <div className="glass-card p-4 relative overflow-hidden">
              <div className="absolute -top-16 -right-16 w-40 h-40 bg-aurora-gradient rounded-full blur-3xl opacity-30" />
              <button
                onClick={() => setAssistantOpen(false)}
                aria-label={t('assistant.close')}
                className="absolute top-3 right-3 z-10 text-slate-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>

              <div className="flex items-start gap-3 relative">
                <div className={`shrink-0 ${reduceMotion ? '' : 'nova-float'}`}>
                  <NovaMascot mood={assistantMood} size={72} />
                </div>
                <div className="pt-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-cyber-300">
                    <Sparkles size={12} /> {t('assistant.name')}
                  </div>
                  <motion.p
                    key={message}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-sm text-slate-100 leading-snug text-balance"
                  >
                    {message}
                  </motion.p>
                </div>
              </div>

              {/* Journey tracker */}
              <div className="mt-4">
                <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">{t('assistant.steps')}</div>
                <div className="flex items-center gap-1">
                  {STEP_ORDER.map((s, i) => (
                    <div key={s} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className={`h-1.5 w-full rounded-full transition-colors duration-500 ${
                          i <= currentIdx ? 'bg-aurora-gradient' : 'bg-white/10'
                        }`}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-1 text-[11px] text-slate-400">{t(`steps.${assistantStep}`)}</div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button className="btn-primary btn-sm w-full" onClick={() => { setAssistantOpen(false); navigate('/survey') }}>
                  {t('action.startSurvey')}
                </button>
                <button className="btn-ghost btn-sm w-full" onClick={() => { setAssistantOpen(false); navigate('/shop') }}>
                  {t('nav.shop')}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
