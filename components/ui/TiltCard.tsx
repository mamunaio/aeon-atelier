'use client'

import { useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useUI } from '../../store/ui'

interface TiltCardProps {
  children: React.ReactNode
  className?: string
  intensity?: number
}

export function TiltCard({ children, className = '', intensity = 7 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduceMotion = useUI((s) => s.reduceMotion)
  const [hovered, setHovered] = useState(false)

  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)

  const rotateX = useSpring(useTransform(my, [0, 1], [intensity, -intensity]), { stiffness: 260, damping: 22 })
  const rotateY = useSpring(useTransform(mx, [0, 1], [-intensity, intensity]), { stiffness: 260, damping: 22 })
  const glareX = useSpring(useTransform(mx, [0, 1], [0, 100]), { stiffness: 200, damping: 25 })
  const glareY = useSpring(useTransform(my, [0, 1], [0, 100]), { stiffness: 200, damping: 25 })
  const glareBg = useTransform(
    [glareX, glareY],
    ([x, y]) => `radial-gradient(circle 220px at ${x}% ${y}%, rgba(255,255,255,0.09), transparent 70%)`
  )

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduceMotion || e.pointerType !== 'mouse' || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    mx.set((e.clientX - rect.left) / rect.width)
    my.set((e.clientY - rect.top) / rect.height)
  }

  const handleLeave = () => {
    setHovered(false)
    mx.set(0.5)
    my.set(0.5)
  }

  return (
    <div style={{ perspective: 1100 }} className="h-full">
      <motion.div
        ref={ref}
        onPointerEnter={() => setHovered(true)}
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
        style={reduceMotion ? undefined : { rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className={`relative h-full will-change-transform ${className}`}
      >
        {children}
        {!reduceMotion && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300"
            style={{
              opacity: hovered ? 1 : 0,
              background: glareBg,
            }}
          />
        )}
      </motion.div>
    </div>
  )
}
