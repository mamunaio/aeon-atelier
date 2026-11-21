import { useState, useRef, useMemo, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Type, ImagePlus, Trash2, Save, ShoppingBag, RotateCcw, Wand2, Layers, ChevronRight, Palette, Move } from 'lucide-react'
import { PRODUCTS, PRODUCT_BY_SLUG } from '../data/products'
import { useI18n } from '../i18n'
import { useHead } from '../lib/seo'
import { useAuth } from '../store/auth'
import { useUI } from '../store/ui'
import { useAddToCart } from '../hooks/useAddToCart'
import { Garment } from '../components/Garment'
import { NovaMascot } from '../components/assistant/NovaMascot'
import { formatMoney } from '../lib/format'
import type { Product, DesignElement, PrintLocation } from '../types'

const FONTS = ['Space Grotesk', 'Inter', 'Georgia', 'Impact', 'Courier New', 'Brush Script MT']
const TEXT_COLORS = ['#ffffff', '#0e0e12', '#d4af37', '#7b4dff', '#12d3e0', '#e0463e', '#3f5e42', '#f2a7c4']
const LOCATION_LABELS: Record<PrintLocation, string> = {
  front: 'front', back: 'back', left_chest: 'left_chest', right_chest: 'right_chest', sleeve: 'sleeve', cap_front: 'cap_front', bag: 'bag',
}

let uid = 0
const nextId = () => `el-${++uid}-${Math.floor(performance.now())}`

export default function Customize() {
  const { t } = useI18n()
  const [params] = useSearchParams()
  const addToCart = useAddToCart()
  const { user, saveDesign } = useAuth()
  const { pushToast, setStep } = useUI()

  const customizables = useMemo(() => PRODUCTS.filter((p) => p.customizable), [])
  const initial = params.get('product') ? PRODUCT_BY_SLUG[params.get('product')!] : undefined
  const [product, setProduct] = useState<Product | undefined>(initial ?? customizables[0])
  const [colorIdx, setColorIdx] = useState(0)
  const [location, setLocation] = useState<PrintLocation>('front')
  const [elements, setElements] = useState<DesignElement[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [text, setText] = useState('YOUR TEXT')
  const [font, setFont] = useState(FONTS[0])
  const [textColor, setTextColor] = useState('#ffffff')

  const canvasRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setStep('customize') }, [setStep])
  useEffect(() => {
    if (product?.printLocations?.length && !product.printLocations.includes(location)) setLocation(product.printLocations[0])
  }, [product])

  useHead({ title: `${t('customize.title')} — TaioMei`, description: t('customize.sub'), path: '/customize' })

  if (!product) return null
  const color = product.colors[colorIdx]
  const locations = product.printLocations ?? ['front']
  const visibleEls = elements.filter((e) => e.location === location)

  const addText = () => {
    const el: DesignElement = { id: nextId(), type: 'text', location, x: 0.5, y: 0.5, scale: 1, rotation: 0, text: text || 'TEXT', font, color: textColor }
    setElements((els) => [...els, el]); setSelected(el.id)
  }

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const el: DesignElement = { id: nextId(), type: 'image', location, x: 0.5, y: 0.5, scale: 1, rotation: 0, src: reader.result as string }
      setElements((els) => [...els, el]); setSelected(el.id)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const update = (id: string, patch: Partial<DesignElement>) => setElements((els) => els.map((e) => (e.id === id ? { ...e, ...patch } : e)))
  const removeEl = (id: string) => { setElements((els) => els.filter((e) => e.id !== id)); if (selected === id) setSelected(null) }

  // pointer drag inside the print zone
  const startDrag = (e: React.PointerEvent, id: string) => {
    e.stopPropagation(); setSelected(id)
    const zone = canvasRef.current?.querySelector('[data-zone]') as HTMLElement | null
    if (!zone) return
    const move = (ev: PointerEvent) => {
      const r = zone.getBoundingClientRect()
      update(id, {
        x: Math.max(0, Math.min(1, (ev.clientX - r.left) / r.width)),
        y: Math.max(0, Math.min(1, (ev.clientY - r.top) / r.height)),
      })
    }
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up) }
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up)
  }

  const sel = elements.find((e) => e.id === selected)
  const customizationCount = elements.length
  const extraCost = customizationCount * 15

  const handleAddToCart = () => {
    addToCart(product, {
      colorIdx,
      customization: elements,
      customizationLabel: `${customizationCount} print${customizationCount !== 1 ? 's' : ''} · ${locations.length > 1 ? 'multi-location' : location}`,
    })
  }

  const handleSave = () => {
    if (!user) { pushToast({ kind: 'info', title: 'Sign in to save designs', desc: 'Your design is ready to add to cart.' }); return }
    saveDesign({ id: nextId(), productId: product.id, name: `${product.name} — Custom`, elements, colorName: color.name, createdAt: new Date().toISOString() })
    pushToast({ kind: 'success', title: t('customize.savedToast') })
  }

  return (
    <div className="container-max section-pad">
      <div className="flex items-center gap-3 mb-6">
        <div className="nova-float"><NovaMascot mood="point" size={56} /></div>
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold">{t('customize.title')}</h1>
          <p className="text-slate-400">{t('customize.sub')}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[300px_1fr_300px] gap-6 items-start">
        {/* LEFT: product + base */}
        <div className="space-y-4 order-2 lg:order-1">
          <Panel title={t('customize.pickProduct')} icon={ShoppingBag}>
            <div className="grid grid-cols-3 gap-2 max-h-52 overflow-y-auto no-scrollbar">
              {customizables.map((p) => (
                <button key={p.id} onClick={() => { setProduct(p); setColorIdx(0); setElements([]); setSelected(null) }}
                  className={`rounded-xl border p-2 transition-all ${product.id === p.id ? 'border-aurora-400 bg-aurora-500/10' : 'border-white/12 hover:border-white/30'}`} title={p.name}>
                  <Garment kind={p.kind} color={p.colors[0].hex} accent={p.styles[0].accent} className="w-full" showDetail={false} />
                </button>
              ))}
            </div>
            <Link to={`/product/${product.slug}`} className="mt-2 text-xs text-cyber-300 hover:underline flex items-center gap-1">{product.name} <ChevronRight size={12} /></Link>
          </Panel>

          <Panel title={t('customize.baseColor')} icon={Palette}>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((c, i) => (
                <button key={c.name} onClick={() => setColorIdx(i)} title={c.name}
                  className={`h-8 w-8 rounded-full border transition-all ${colorIdx === i ? 'ring-2 ring-white ring-offset-2 ring-offset-void-900' : 'border-white/20'}`}
                  style={{ background: c.hex2 ? `linear-gradient(135deg, ${c.hex}, ${c.hex2})` : c.hex }} />
              ))}
            </div>
          </Panel>

          <Panel title={t('customize.location')} icon={Move}>
            <div className="flex flex-wrap gap-1.5">
              {locations.map((loc) => (
                <button key={loc} onClick={() => setLocation(loc)} className={`chip ${location === loc ? 'border-aurora-400 text-white bg-aurora-500/15' : ''}`}>
                  {t(`customize.${LOCATION_LABELS[loc]}`)}
                </button>
              ))}
            </div>
          </Panel>
        </div>

        {/* CENTER: live preview */}
        <div className="order-1 lg:order-2">
          <div ref={canvasRef} className="relative aspect-square rounded-3xl glass-card overflow-hidden grid place-items-center p-8"
            style={{ background: `radial-gradient(120% 90% at 50% 15%, ${product.palette[0]}25, transparent 60%)` }}
            onPointerDown={() => setSelected(null)}
          >
            <div className="relative w-full max-w-md">
              <Garment kind={product.kind} color={color.hex} color2={color.hex2} accent={product.styles[0].accent} className="w-full drop-shadow-2xl" />

              {/* print zone overlay — positioned over the garment body */}
              <div data-zone className="absolute" style={printZoneStyle(location)}>
                <div className="absolute inset-0 rounded-lg border border-dashed border-white/20 pointer-events-none" />
                {visibleEls.map((el) => (
                  <div
                    key={el.id}
                    onPointerDown={(e) => startDrag(e, el.id)}
                    className={`absolute cursor-move select-none ${selected === el.id ? 'ring-1 ring-cyber-300 ring-offset-2 ring-offset-transparent' : ''}`}
                    style={{
                      left: `${el.x * 100}%`, top: `${el.y * 100}%`,
                      transform: `translate(-50%,-50%) scale(${el.scale}) rotate(${el.rotation}deg)`,
                    }}
                  >
                    {el.type === 'text'
                      ? <span style={{ fontFamily: el.font, color: el.color, fontWeight: 700, whiteSpace: 'nowrap', fontSize: '18px' }}>{el.text}</span>
                      : <img src={el.src} alt="art" draggable={false} style={{ width: 60, height: 60, objectFit: 'contain' }} />}
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[11px] text-slate-500 flex items-center gap-1.5"><Move size={12} /> Drag to position · {t(`customize.${LOCATION_LABELS[location]}`)}</div>
          </div>

          {/* Selected element controls */}
          {sel && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-4 mt-3">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium flex items-center gap-2">{sel.type === 'text' ? <Type size={14} /> : <ImagePlus size={14} />} {sel.type === 'text' ? sel.text : 'Artwork'}</span>
                <button onClick={() => removeEl(sel.id)} className="text-rose-400 hover:text-rose-300"><Trash2 size={15} /></button>
              </div>
              <Slider label={t('customize.scale')} min={0.4} max={2.5} step={0.05} value={sel.scale} onChange={(v) => update(sel.id, { scale: v })} />
              <Slider label={t('customize.rotate')} min={-180} max={180} step={1} value={sel.rotation} onChange={(v) => update(sel.id, { rotation: v })} />
              {sel.type === 'text' && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {TEXT_COLORS.map((c) => (
                    <button key={c} onClick={() => update(sel.id, { color: c })} className={`h-6 w-6 rounded-full border ${sel.color === c ? 'ring-2 ring-white ring-offset-1 ring-offset-void-900' : 'border-white/20'}`} style={{ background: c }} />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* RIGHT: tools + layers */}
        <div className="space-y-4 order-3">
          <Panel title={t('customize.addText')} icon={Type}>
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder={t('customize.yourText')} className="input !py-2.5 text-sm" />
            <div className="grid grid-cols-2 gap-2 mt-2">
              <select value={font} onChange={(e) => setFont(e.target.value)} className="input !py-2 text-sm cursor-pointer">
                {FONTS.map((f) => <option key={f} value={f} className="bg-void-900" style={{ fontFamily: f }}>{f}</option>)}
              </select>
              <div className="flex items-center gap-1 flex-wrap">
                {TEXT_COLORS.slice(0, 5).map((c) => (
                  <button key={c} onClick={() => setTextColor(c)} className={`h-6 w-6 rounded-full border ${textColor === c ? 'ring-2 ring-white ring-offset-1 ring-offset-void-900' : 'border-white/20'}`} style={{ background: c }} />
                ))}
              </div>
            </div>
            <button onClick={addText} className="btn-primary btn-sm w-full mt-2"><Type size={14} /> {t('customize.addText')}</button>
          </Panel>

          <Panel title={t('customize.uploadImage')} icon={ImagePlus}>
            <input ref={fileRef} type="file" accept="image/*" onChange={onUpload} className="hidden" />
            <button onClick={() => fileRef.current?.click()} className="btn-ghost btn-sm w-full border-dashed"><ImagePlus size={15} /> {t('customize.uploadImage')}</button>
            <p className="text-[11px] text-slate-500 mt-1.5">PNG, JPG or SVG. Your logo stays on your device.</p>
          </Panel>

          <Panel title={t('customize.layers')} icon={Layers}>
            {elements.length === 0 ? (
              <p className="text-xs text-slate-500">{t('customize.noLayers')}</p>
            ) : (
              <div className="space-y-1.5 max-h-40 overflow-y-auto no-scrollbar">
                {elements.map((el) => (
                  <button key={el.id} onClick={() => { setSelected(el.id); setLocation(el.location) }}
                    className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-xs transition-colors ${selected === el.id ? 'bg-aurora-500/15 text-white' : 'text-slate-400 hover:bg-white/5'}`}>
                    {el.type === 'text' ? <Type size={13} /> : <ImagePlus size={13} />}
                    <span className="truncate flex-1">{el.type === 'text' ? el.text : 'Artwork'}</span>
                    <span className="text-[10px] text-slate-500">{t(`customize.${LOCATION_LABELS[el.location]}`)}</span>
                    <Trash2 size={12} onClick={(e) => { e.stopPropagation(); removeEl(el.id) }} className="text-slate-500 hover:text-rose-400" />
                  </button>
                ))}
              </div>
            )}
          </Panel>

          <div className="glass-strong rounded-2xl p-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-slate-400">{product.name}</span><span className="text-slate-200">{formatMoney(product.price)}</span>
            </div>
            {customizationCount > 0 && (
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-slate-400">Customization ×{customizationCount}</span><span className="text-slate-200">{formatMoney(extraCost)}</span>
              </div>
            )}
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
              <span className="font-medium text-sm">{t('cart.total')}</span>
              <span className="font-display text-xl font-semibold text-gradient">{formatMoney(product.price + extraCost)}</span>
            </div>
            <button onClick={handleAddToCart} className="btn-primary w-full mt-3"><ShoppingBag size={16} /> {t('customize.addToCartCustom')}</button>
            <div className="flex gap-2 mt-2">
              <button onClick={handleSave} className="btn-ghost btn-sm flex-1"><Save size={14} /> {t('customize.saveDesign')}</button>
              <button onClick={() => { setElements([]); setSelected(null) }} className="btn-ghost btn-sm px-3" title={t('customize.reset')}><RotateCcw size={14} /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Print zone rectangles per location (relative to the garment box)
function printZoneStyle(loc: PrintLocation): React.CSSProperties {
  const zones: Record<PrintLocation, React.CSSProperties> = {
    front: { left: '34%', top: '32%', width: '32%', height: '34%' },
    back: { left: '34%', top: '30%', width: '32%', height: '36%' },
    left_chest: { left: '30%', top: '30%', width: '16%', height: '14%' },
    right_chest: { left: '54%', top: '30%', width: '16%', height: '14%' },
    sleeve: { left: '16%', top: '34%', width: '14%', height: '18%' },
    cap_front: { left: '34%', top: '40%', width: '32%', height: '20%' },
    bag: { left: '32%', top: '38%', width: '36%', height: '30%' },
  }
  return { ...zones[loc], position: 'absolute' }
}

function Panel({ title, icon: Icon, children }: { title: string; icon: typeof Type; children: React.ReactNode }) {
  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3 text-sm font-medium text-slate-200"><Icon size={15} className="text-cyber-300" /> {title}</div>
      {children}
    </div>
  )
}

function Slider({ label, min, max, step, value, onChange }: { label: string; min: number; max: number; step: number; value: number; onChange: (v: number) => void }) {
  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs text-slate-400 mb-1"><span>{label}</span><span className="tabular-nums">{value.toFixed(step < 1 ? 2 : 0)}</span></div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-aurora-500" />
    </div>
  )
}
