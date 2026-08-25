import { AnimatePresence, motion } from 'framer-motion'
import { Check, Info, X, ShoppingBag, AlertCircle } from 'lucide-react'
import { useUI } from '../../store/ui'

const ICONS = {
  success: Check,
  info: Info,
  error: AlertCircle,
  cart: ShoppingBag,
}

const ACCENT = {
  success: 'text-emerald-300 bg-emerald-400/15',
  info: 'text-cyber-300 bg-cyber-400/15',
  error: 'text-rose-300 bg-rose-400/15',
  cart: 'text-aurora-300 bg-aurora-500/15',
}

export function Toaster() {
  const { toasts, removeToast } = useUI()
  return (
    <div className="fixed z-[60] top-20 right-4 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = ICONS[toast.kind]
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              className="pointer-events-auto glass-strong rounded-2xl p-3 pr-9 shadow-glass min-w-[240px] max-w-[340px] relative"
            >
              <div className="flex items-start gap-3">
                <div className={`shrink-0 h-8 w-8 rounded-xl grid place-items-center ${ACCENT[toast.kind]}`}>
                  <Icon size={16} />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-white truncate">{toast.title}</div>
                  {toast.desc && <div className="text-xs text-slate-400 mt-0.5">{toast.desc}</div>}
                </div>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="absolute top-2.5 right-2.5 text-slate-500 hover:text-white transition-colors"
                aria-label="Dismiss"
              >
                <X size={14} />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
