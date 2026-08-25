import { memo } from 'react'

// The NOVA mascot — a friendly, premium, futuristic guide rendered
// entirely in SVG (lightweight, animatable, resolution-independent).
// Moods drive subtle pose changes; CSS handles the motion so it stays
// cheap and honors reduced-motion via the global .reduce-motion class.

export type Mood = 'idle' | 'wave' | 'point' | 'celebrate' | 'think'

interface Props {
  mood?: Mood
  size?: number
  className?: string
}

export const NovaMascot = memo(function NovaMascot({ mood = 'idle', size = 120, className = '' }: Props) {
  const waving = mood === 'wave' || mood === 'celebrate'
  const pointing = mood === 'point'
  const celebrate = mood === 'celebrate'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 180"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="nova-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8b6dff" />
          <stop offset="55%" stopColor="#6a2fff" />
          <stop offset="100%" stopColor="#3d1799" />
        </linearGradient>
        <linearGradient id="nova-visor" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7df9ff" />
          <stop offset="100%" stopColor="#12d3e0" />
        </linearGradient>
        <radialGradient id="nova-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7b4dff" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#7b4dff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="nova-metal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e6e1ff" />
          <stop offset="100%" stopColor="#a394ff" />
        </linearGradient>
      </defs>

      {/* soft aura */}
      <ellipse cx="80" cy="90" rx="70" ry="72" fill="url(#nova-glow)" />

      {/* floating shadow */}
      <ellipse cx="80" cy="170" rx="34" ry="6" fill="#000" opacity="0.28" />

      <g className={mood === 'idle' ? 'origin-center' : ''} style={{ transformOrigin: '80px 90px' }}>
        {/* antenna */}
        <line x1="80" y1="34" x2="80" y2="20" stroke="url(#nova-metal)" strokeWidth="3" strokeLinecap="round" />
        <circle cx="80" cy="17" r="5" fill="#12d3e0">
          <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
        </circle>

        {/* head */}
        <rect x="46" y="34" width="68" height="60" rx="26" fill="url(#nova-body)" stroke="#a394ff" strokeWidth="1.5" />
        {/* visor */}
        <rect x="54" y="46" width="52" height="30" rx="15" fill="#0a0a0f" />
        <rect x="54" y="46" width="52" height="30" rx="15" fill="url(#nova-visor)" opacity="0.9" />
        {/* eyes */}
        <g fill="#04222b">
          {celebrate ? (
            <>
              <path d="M64 58 q6 -8 12 0" stroke="#04222b" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              <path d="M84 58 q6 -8 12 0" stroke="#04222b" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            </>
          ) : (
            <>
              <circle cx="70" cy="61" r="4.5" className="nova-eye" />
              <circle cx="90" cy="61" r="4.5" className="nova-eye" />
              <circle cx="71.5" cy="59.5" r="1.5" fill="#7df9ff" />
              <circle cx="91.5" cy="59.5" r="1.5" fill="#7df9ff" />
            </>
          )}
        </g>
        {/* cheeks */}
        <circle cx="60" cy="70" r="3" fill="#ff7ac4" opacity="0.5" />
        <circle cx="100" cy="70" r="3" fill="#ff7ac4" opacity="0.5" />
        {/* headphones */}
        <rect x="40" y="52" width="8" height="20" rx="4" fill="url(#nova-metal)" />
        <rect x="112" y="52" width="8" height="20" rx="4" fill="url(#nova-metal)" />

        {/* body */}
        <path d="M58 92 Q80 86 102 92 L108 138 Q80 148 52 138 Z" fill="url(#nova-body)" stroke="#a394ff" strokeWidth="1.5" />
        {/* chest emblem */}
        <circle cx="80" cy="114" r="10" fill="#0a0a0f" opacity="0.7" />
        <path d="M80 108 l3 6 l6 0.5 l-4.5 4 l1.5 6 l-6 -3.5 l-6 3.5 l1.5 -6 l-4.5 -4 l6 -0.5 Z" fill="#12d3e0" transform="scale(0.8)" transform-origin="80 114" />

        {/* left arm (points when pointing) */}
        <g style={{ transformOrigin: '58px 100px', transform: pointing ? 'rotate(-32deg)' : 'rotate(0deg)', transition: 'transform .4s cubic-bezier(.16,1,.3,1)' }}>
          <rect x="42" y="98" width="14" height="34" rx="7" fill="url(#nova-body)" stroke="#a394ff" strokeWidth="1.2" />
          <circle cx="49" cy="134" r="8" fill="url(#nova-metal)" />
        </g>

        {/* right arm (waves) */}
        <g
          className={waving ? 'nova-wave' : ''}
          style={{ transformOrigin: '104px 100px', transform: waving ? undefined : 'rotate(6deg)' }}
        >
          <rect x="104" y="96" width="14" height="34" rx="7" fill="url(#nova-body)" stroke="#a394ff" strokeWidth="1.2" />
          <circle cx="111" cy="132" r="8" fill="url(#nova-metal)" />
        </g>
      </g>

      {celebrate && (
        <g className="nova-confetti">
          <rect x="30" y="40" width="5" height="5" fill="#12d3e0" />
          <rect x="126" y="52" width="5" height="5" fill="#ff7ac4" />
          <rect x="120" y="30" width="4" height="4" fill="#d4af37" />
          <circle cx="40" cy="70" r="3" fill="#7b4dff" />
          <circle cx="130" cy="90" r="3" fill="#12d3e0" />
        </g>
      )}
    </svg>
  )
})
