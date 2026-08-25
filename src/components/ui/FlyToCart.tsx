import { AnimatePresence, motion } from 'framer-motion'
import { useUI } from '../../store/ui'
import { Garment } from '../Garment'
import type { GarmentKind } from '../../types'

function cartTarget(): { x: number; y: number } {
  const el = document.getElementById('cart-target')
  if (el) {
    const r = el.getBoundingClientRect()
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
  }
  return { x: window.innerWidth - 60, y: 24 }
}

export function FlyToCart() {
  const { flights, clearFlight, reduceMotion } = useUI()
  if (reduceMotion) return null

  return (
    <div className="fixed inset-0 z-[70] pointer-events-none">
      <AnimatePresence>
        {flights.map((f) => {
          const target = cartTarget()
          const midX = (f.from.x + target.x) / 2
          return (
            <motion.div
              key={f.id}
              initial={{ x: f.from.x - 32, y: f.from.y - 32, scale: 1, opacity: 1 }}
              animate={{
                x: [f.from.x - 32, midX - 32, target.x - 16],
                y: [f.from.y - 32, f.from.y - 140, target.y - 16],
                scale: [1, 0.85, 0.18],
                opacity: [1, 1, 0.2],
              }}
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], times: [0, 0.5, 1] }}
              onAnimationComplete={() => clearFlight(f.id)}
              className="absolute top-0 left-0 h-16 w-16 rounded-2xl glass-strong grid place-items-center shadow-glow"
            >
              <Garment kind={f.kind as GarmentKind} color={f.color} className="h-12 w-12" showDetail={false} />
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
