import { memo } from 'react'
import type { GarmentKind } from '../types'

// ============================================================
// Procedural garment renderer.
// Draws every product as crisp, gradient-rich SVG art — no photo
// dependencies, instant load, always on-brand. Each silhouette is
// a hand-tuned path; color + accent are injected per product.
// ============================================================

export interface GarmentProps {
  kind: GarmentKind
  color: string
  color2?: string
  accent?: string
  className?: string
  /** print art overlay (used by customization preview) */
  children?: React.ReactNode
  showDetail?: boolean
}

function shade(hex: string, amt: number): string {
  const h = hex.replace('#', '')
  const num = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16)
  let r = (num >> 16) + amt
  let g = ((num >> 8) & 0xff) + amt
  let b = (num & 0xff) + amt
  r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b))
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

function isLight(hex: string): boolean {
  const h = hex.replace('#', '')
  const num = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16)
  const r = num >> 16, g = (num >> 8) & 0xff, b = num & 0xff
  return (0.299 * r + 0.587 * g + 0.114 * b) > 150
}

// Each renderer returns SVG children for a 0..200 viewBox.
const SHAPES: Record<GarmentKind, (c: string, dark: string, light: string, accent: string, seam: string) => JSX.Element> = {
  tshirt: (c, dark, light, accent, seam) => (
    <g>
      <path d="M60 40 L40 55 L30 80 L45 90 L55 80 L55 165 L145 165 L145 80 L155 90 L170 80 L160 55 L140 40 L120 38 Q100 55 80 38 Z" fill={c} stroke={seam} strokeWidth="1.5" />
      <path d="M80 38 Q100 55 120 38 L112 44 Q100 58 88 44 Z" fill={dark} opacity="0.5" />
      <path d="M55 80 L55 165 L70 165 L70 82 Z" fill={light} opacity="0.25" />
    </g>
  ),
  polo: (c, dark, light, accent, seam) => (
    <g>
      <path d="M60 42 L40 55 L32 80 L46 89 L56 80 L56 165 L144 165 L144 80 L154 89 L168 80 L160 55 L140 42 L124 40 L112 52 L100 60 L88 52 L76 40 Z" fill={c} stroke={seam} strokeWidth="1.5" />
      <path d="M88 40 L100 60 L112 40 L104 40 L100 50 L96 40 Z" fill={dark} opacity="0.6" />
      <path d="M76 40 L88 52 L92 46 Z M124 40 L112 52 L108 46 Z" fill={light} opacity="0.4" />
      <line x1="100" y1="60" x2="100" y2="88" stroke={accent} strokeWidth="2" />
      <circle cx="100" cy="70" r="1.6" fill={accent} /><circle cx="100" cy="80" r="1.6" fill={accent} />
    </g>
  ),
  shirt: (c, dark, light, accent, seam) => (
    <g>
      <path d="M60 40 L38 54 L30 82 L44 90 L54 82 L54 168 L146 168 L146 82 L156 90 L170 82 L162 54 L140 40 L120 40 L100 58 L80 40 Z" fill={c} stroke={seam} strokeWidth="1.5" />
      <path d="M80 40 L100 58 L120 40 L110 40 L100 52 L90 40 Z" fill={dark} opacity="0.55" />
      <line x1="100" y1="58" x2="100" y2="168" stroke={dark} strokeWidth="2" opacity="0.5" />
      {[74, 90, 106, 122, 138, 154].map((y) => <circle key={y} cx="100" cy={y} r="1.5" fill={accent} />)}
      <path d="M54 168 L54 82 L64 82 L64 168 Z" fill={light} opacity="0.2" />
    </g>
  ),
  hoodie: (c, dark, light, accent, seam) => (
    <g>
      <path d="M62 46 Q100 26 138 46 L160 58 L168 84 L152 94 L142 84 L142 168 L58 168 L58 84 L48 94 L32 84 L40 58 Z" fill={c} stroke={seam} strokeWidth="1.5" />
      <path d="M72 44 Q100 30 128 44 Q100 66 72 44 Z" fill={dark} opacity="0.6" />
      <path d="M78 60 Q100 74 122 60 L122 96 Q100 108 78 96 Z" fill={dark} opacity="0.25" />
      <rect x="70" y="120" width="60" height="34" rx="8" fill={dark} opacity="0.3" />
      <line x1="92" y1="64" x2="92" y2="104" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="108" y1="64" x2="108" y2="104" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
    </g>
  ),
  sweatshirt: (c, dark, light, accent, seam) => (
    <g>
      <path d="M60 44 L38 56 L30 82 L46 92 L56 82 L56 158 Q56 166 64 166 L136 166 Q144 166 144 158 L144 82 L154 92 L170 82 L162 56 L140 44 L120 42 Q100 56 80 42 Z" fill={c} stroke={seam} strokeWidth="1.5" />
      <path d="M80 42 Q100 56 120 42 L112 48 Q100 60 88 48 Z" fill={dark} opacity="0.5" />
      <rect x="56" y="158" width="88" height="8" fill={dark} opacity="0.35" />
      <rect x="30" y="82" width="16" height="10" fill={dark} opacity="0.35" />
      <rect x="154" y="82" width="16" height="10" fill={dark} opacity="0.35" />
    </g>
  ),
  jacket: (c, dark, light, accent, seam) => (
    <g>
      <path d="M58 42 L36 54 L28 84 L44 94 L54 84 L54 170 L146 170 L146 84 L156 94 L172 84 L164 54 L142 42 L118 42 L100 54 L82 42 Z" fill={c} stroke={seam} strokeWidth="1.5" />
      <path d="M82 42 L100 54 L100 170 L82 170 Z" fill={dark} opacity="0.3" />
      <path d="M118 42 L100 54 L100 170 L118 170 Z" fill={light} opacity="0.18" />
      <line x1="100" y1="54" x2="100" y2="170" stroke={accent} strokeWidth="2.5" />
      <rect x="66" y="120" width="20" height="26" rx="3" fill={dark} opacity="0.4" />
      <rect x="114" y="120" width="20" height="26" rx="3" fill={dark} opacity="0.4" />
      <path d="M58 42 L82 42 L74 60 L54 58 Z" fill={dark} opacity="0.5" />
      <path d="M142 42 L118 42 L126 60 L146 58 Z" fill={dark} opacity="0.5" />
    </g>
  ),
  jeans: (c, dark, light, accent, seam) => (
    <g>
      <path d="M66 30 L134 30 L138 60 L120 176 L104 176 L100 92 L96 176 L80 176 L62 60 Z" fill={c} stroke={seam} strokeWidth="1.5" />
      <rect x="66" y="30" width="68" height="20" fill={dark} opacity="0.3" />
      <line x1="100" y1="50" x2="100" y2="92" stroke={dark} strokeWidth="1.5" opacity="0.5" />
      <path d="M66 30 L72 44 L128 44 L134 30 Z" fill={light} opacity="0.15" />
      <line x1="70" y1="60" x2="86" y2="170" stroke={accent} strokeWidth="1" opacity="0.6" strokeDasharray="2 2" />
      <line x1="130" y1="60" x2="114" y2="170" stroke={accent} strokeWidth="1" opacity="0.6" strokeDasharray="2 2" />
      <rect x="72" y="52" width="14" height="12" rx="2" fill="none" stroke={dark} strokeWidth="1" opacity="0.5" />
    </g>
  ),
  pants: (c, dark, light, accent, seam) => (
    <g>
      <path d="M68 30 L132 30 L136 58 L122 176 L106 176 L100 94 L94 176 L78 176 L64 58 Z" fill={c} stroke={seam} strokeWidth="1.5" />
      <rect x="68" y="30" width="64" height="16" fill={dark} opacity="0.28" />
      <line x1="88" y1="48" x2="80" y2="172" stroke={light} strokeWidth="1.5" opacity="0.3" />
      <line x1="112" y1="48" x2="120" y2="172" stroke={light} strokeWidth="1.5" opacity="0.3" />
    </g>
  ),
  cargo: (c, dark, light, accent, seam) => (
    <g>
      <path d="M68 30 L132 30 L136 58 L122 176 L106 176 L100 94 L94 176 L78 176 L64 58 Z" fill={c} stroke={seam} strokeWidth="1.5" />
      <rect x="68" y="30" width="64" height="16" fill={dark} opacity="0.28" />
      <rect x="66" y="96" width="24" height="30" rx="3" fill={dark} opacity="0.4" stroke={seam} strokeWidth="1" />
      <rect x="110" y="96" width="24" height="30" rx="3" fill={dark} opacity="0.4" stroke={seam} strokeWidth="1" />
      <line x1="66" y1="108" x2="90" y2="108" stroke={accent} strokeWidth="1.5" opacity="0.7" />
      <line x1="110" y1="108" x2="134" y2="108" stroke={accent} strokeWidth="1.5" opacity="0.7" />
    </g>
  ),
  shorts: (c, dark, light, accent, seam) => (
    <g>
      <path d="M64 40 L136 40 L140 66 L128 120 L108 120 L100 78 L92 120 L72 120 L60 66 Z" fill={c} stroke={seam} strokeWidth="1.5" />
      <rect x="64" y="40" width="72" height="14" fill={dark} opacity="0.3" />
      <line x1="100" y1="54" x2="100" y2="78" stroke={dark} strokeWidth="1.5" opacity="0.5" />
    </g>
  ),
  shoe: (c, dark, light, accent, seam) => (
    <g>
      <path d="M28 120 Q30 96 60 92 L96 90 Q120 90 150 108 L172 116 Q178 120 176 130 L174 140 L34 140 Q26 138 28 120 Z" fill={c} stroke={seam} strokeWidth="1.5" />
      <path d="M34 140 L174 140 L172 150 Q170 154 160 154 L40 154 Q30 152 34 140 Z" fill={dark} />
      <path d="M60 92 Q90 96 96 118 L70 116 Q58 104 60 92 Z" fill={light} opacity="0.3" />
      <path d="M100 100 Q120 98 140 108" stroke={accent} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <ellipse cx="150" cy="120" rx="10" ry="6" fill={light} opacity="0.35" />
    </g>
  ),
  sneaker: (c, dark, light, accent, seam) => (
    <g>
      <path d="M24 122 Q26 98 58 92 L92 88 Q118 88 148 106 L172 116 Q180 122 176 134 L174 142 L30 142 Q22 140 24 122 Z" fill={c} stroke={seam} strokeWidth="1.5" />
      <path d="M28 142 L176 142 L174 152 Q172 158 158 158 L38 158 Q24 156 28 142 Z" fill={dark} />
      <path d="M30 150 L174 150" stroke={accent} strokeWidth="2" opacity="0.9" />
      <path d="M58 92 Q92 96 100 120 L74 118 Q58 106 58 92 Z" fill={light} opacity="0.35" />
      {[92, 106, 120, 134].map((x, i) => <line key={x} x1={x} y1={102 + i * 2} x2={x + 14} y2={112 + i * 2} stroke={dark} strokeWidth="2" opacity="0.6" />)}
      <ellipse cx="150" cy="118" rx="12" ry="7" fill={accent} opacity="0.5" />
      <path d="M118 96 Q140 100 158 112" stroke={accent} strokeWidth="3" fill="none" strokeLinecap="round" />
    </g>
  ),
  sandal: (c, dark, light, accent, seam) => (
    <g>
      <path d="M40 128 Q40 118 52 118 L150 116 Q164 116 164 128 Q164 140 150 140 L52 142 Q40 140 40 128 Z" fill={c} stroke={seam} strokeWidth="1.5" />
      <path d="M60 118 Q90 96 120 118" stroke={accent} strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M100 118 L96 128" stroke={dark} strokeWidth="5" strokeLinecap="round" />
      <ellipse cx="100" cy="140" rx="60" ry="5" fill={dark} opacity="0.4" />
    </g>
  ),
  cap: (c, dark, light, accent, seam) => (
    <g>
      <path d="M46 108 Q48 68 100 66 Q152 68 154 108 L100 104 Z" fill={c} stroke={seam} strokeWidth="1.5" />
      <path d="M44 108 Q100 98 120 112 Q150 118 150 126 L44 122 Z" fill={dark} />
      <path d="M100 66 Q74 68 60 96 L100 94 Z" fill={light} opacity="0.28" />
      <circle cx="100" cy="70" r="4" fill={accent} />
      <line x1="70" y1="78" x2="76" y2="102" stroke={dark} strokeWidth="1" opacity="0.4" />
      <line x1="130" y1="78" x2="124" y2="102" stroke={dark} strokeWidth="1" opacity="0.4" />
    </g>
  ),
  hat: (c, dark, light, accent, seam) => (
    <g>
      <ellipse cx="100" cy="132" rx="72" ry="16" fill={c} stroke={seam} strokeWidth="1.5" />
      <ellipse cx="100" cy="130" rx="72" ry="14" fill={dark} opacity="0.3" />
      <path d="M66 130 Q66 74 100 72 Q134 74 134 130 Z" fill={c} stroke={seam} strokeWidth="1.5" />
      <rect x="66" y="112" width="68" height="12" fill={accent} opacity="0.85" />
      <path d="M100 72 Q80 74 74 118 L100 116 Z" fill={light} opacity="0.25" />
    </g>
  ),
  belt: (c, dark, light, accent, seam) => (
    <g>
      <rect x="26" y="94" width="130" height="18" rx="4" fill={c} stroke={seam} strokeWidth="1.5" />
      <rect x="26" y="94" width="130" height="6" fill={light} opacity="0.2" />
      <rect x="150" y="84" width="30" height="38" rx="6" fill={accent} stroke={shade(accent, -40)} strokeWidth="2" />
      <rect x="158" y="96" width="14" height="14" rx="2" fill="none" stroke={shade(accent, -50)} strokeWidth="2" />
      {[44, 60, 76, 92].map((x) => <circle key={x} cx={x} cy="103" r="2" fill={dark} opacity="0.6" />)}
    </g>
  ),
  bag: (c, dark, light, accent, seam) => (
    <g>
      <path d="M56 78 Q56 54 100 54 Q144 54 144 78" fill="none" stroke={accent} strokeWidth="5" />
      <path d="M50 78 L150 78 L158 160 Q158 168 150 168 L50 168 Q42 168 42 160 Z" fill={c} stroke={seam} strokeWidth="1.5" />
      <path d="M50 78 L150 78 L152 96 L48 96 Z" fill={dark} opacity="0.25" />
      <rect x="86" y="112" width="28" height="20" rx="3" fill={accent} opacity="0.5" />
      <path d="M50 78 L64 78 L60 168 L50 168 Q42 168 42 160 Z" fill={light} opacity="0.16" />
    </g>
  ),
  wallet: (c, dark, light, accent, seam) => (
    <g>
      <rect x="44" y="70" width="112" height="72" rx="8" fill={c} stroke={seam} strokeWidth="1.5" />
      <rect x="44" y="70" width="112" height="24" rx="8" fill={dark} opacity="0.25" />
      <rect x="112" y="96" width="34" height="24" rx="4" fill={accent} opacity="0.85" />
      <line x1="44" y1="106" x2="156" y2="106" stroke={dark} strokeWidth="1" opacity="0.4" />
      <rect x="54" y="114" width="40" height="4" rx="2" fill={light} opacity="0.4" />
    </g>
  ),
  watch: (c, dark, light, accent, seam) => (
    <g>
      <rect x="86" y="40" width="28" height="46" rx="8" fill={dark} />
      <rect x="86" y="114" width="28" height="46" rx="8" fill={dark} />
      <circle cx="100" cy="100" r="34" fill={c} stroke={accent} strokeWidth="3" />
      <circle cx="100" cy="100" r="28" fill={dark} opacity="0.5" />
      <circle cx="100" cy="100" r="28" fill="none" stroke={light} strokeWidth="1" opacity="0.3" />
      <line x1="100" y1="100" x2="100" y2="82" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="100" y1="100" x2="114" y2="100" stroke={light} strokeWidth="2" strokeLinecap="round" />
      <circle cx="100" cy="100" r="2.5" fill={accent} />
      {[0, 90, 180, 270].map((a) => {
        const rad = (a * Math.PI) / 180
        return <circle key={a} cx={100 + Math.cos(rad) * 24} cy={100 + Math.sin(rad) * 24} r="1.5" fill={light} />
      })}
    </g>
  ),
  sunglasses: (c, dark, light, accent, seam) => (
    <g>
      <path d="M40 90 L76 90 Q80 90 80 96 L78 112 Q76 120 64 120 L48 120 Q38 118 36 106 L36 96 Q36 90 40 90 Z" fill={c} stroke={seam} strokeWidth="1.5" />
      <path d="M124 90 L160 90 Q164 90 164 96 L164 106 Q162 118 152 120 L136 120 Q124 120 122 112 L120 96 Q120 90 124 90 Z" fill={c} stroke={seam} strokeWidth="1.5" />
      <path d="M80 96 Q100 90 120 96" stroke={accent} strokeWidth="3" fill="none" />
      <path d="M40 92 L58 96 L48 116 Z" fill={light} opacity="0.3" />
      <path d="M124 92 L142 96 L132 116 Z" fill={light} opacity="0.3" />
      <line x1="36" y1="94" x2="24" y2="88" stroke={dark} strokeWidth="3" strokeLinecap="round" />
      <line x1="164" y1="94" x2="176" y2="88" stroke={dark} strokeWidth="3" strokeLinecap="round" />
    </g>
  ),
  socks: (c, dark, light, accent, seam) => (
    <g>
      <path d="M78 40 L110 40 L112 104 Q112 116 128 120 L150 128 Q160 132 158 144 L154 156 Q150 164 138 160 L92 142 Q80 136 80 120 L78 40 Z" fill={c} stroke={seam} strokeWidth="1.5" />
      <rect x="78" y="40" width="34" height="14" fill={accent} opacity="0.85" />
      <rect x="78" y="58" width="34" height="4" fill={accent} opacity="0.5" />
      <path d="M96 138 Q120 146 150 150" stroke={light} strokeWidth="2" fill="none" opacity="0.3" />
    </g>
  ),
  accessory: (c, dark, light, accent, seam) => (
    <g>
      <circle cx="100" cy="100" r="52" fill={c} stroke={seam} strokeWidth="1.5" />
      <circle cx="100" cy="100" r="52" fill="none" stroke={accent} strokeWidth="2" strokeDasharray="6 6" />
      <path d="M100 60 L112 90 L144 92 L118 112 L128 144 L100 124 L72 144 L82 112 L56 92 L88 90 Z" fill={accent} opacity="0.85" />
      <circle cx="100" cy="100" r="30" fill={dark} opacity="0.2" />
    </g>
  ),
}

export const Garment = memo(function Garment({ kind, color, color2, accent, className, children, showDetail = true }: GarmentProps) {
  const dark = shade(color, -46)
  const light = shade(color, 46)
  const acc = accent ?? '#7b4dff'
  const seam = isLight(color) ? shade(color, -70) : shade(color, 60)
  const gradId = `g-${kind}-${color.replace('#', '')}`
  const render = SHAPES[kind] ?? SHAPES.accessory

  return (
    <svg viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg" role="img" aria-label={`${kind} product`}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={light} />
          <stop offset="45%" stopColor={color2 ?? color} />
          <stop offset="100%" stopColor={dark} />
        </linearGradient>
        <radialGradient id={`${gradId}-glow`} cx="50%" cy="38%" r="60%">
          <stop offset="0%" stopColor={acc} stopOpacity="0.22" />
          <stop offset="100%" stopColor={acc} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="200" height="200" fill={`url(#${gradId}-glow)`} />
      <g filter="">{
        // inject the gradient fill by swapping the base color reference
        SHAPES[kind]
          ? render(`url(#${gradId})`, dark, light, acc, showDetail ? seam : 'transparent')
          : SHAPES.accessory(`url(#${gradId})`, dark, light, acc, seam)
      }</g>
      {children}
    </svg>
  )
})
