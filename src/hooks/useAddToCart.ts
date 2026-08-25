import { useCart } from '../store/cart'
import { useUI } from '../store/ui'
import { useI18n } from '../i18n'
import type { Product, DesignElement } from '../types'

/**
 * Shared "add to cart" flow: triggers the fly animation, the confirmation
 * toast, and NOVA's celebratory mood. Every entry point (card, PDP, quick
 * view, customizer) routes through this so behavior stays consistent.
 */
export function useAddToCart() {
  const add = useCart((s) => s.add)
  const { fly, pushToast, setMood, setStep } = useUI()
  const { t } = useI18n()

  return function addToCart(
    product: Product,
    opts: {
      styleId?: string
      colorIdx?: number
      size?: string
      fabric?: string
      qty?: number
      customization?: DesignElement[]
      customizationLabel?: string
      origin?: { x: number; y: number }
    } = {}
  ) {
    const style = product.styles.find((s) => s.id === opts.styleId) ?? product.styles[0]
    const color = product.colors[opts.colorIdx ?? 0] ?? product.colors[0]
    const size = opts.size ?? product.sizes[Math.floor(product.sizes.length / 2)] ?? 'M'
    const fabric = opts.fabric ?? product.fabrics[0]

    add({
      productId: product.id,
      name: product.name,
      price: product.price,
      qty: opts.qty ?? 1,
      styleId: style.id,
      styleName: style.name,
      colorName: color.name,
      colorHex: color.hex,
      size,
      fabric,
      kind: product.kind,
      customization: opts.customization,
      customizationLabel: opts.customizationLabel,
      stock: product.stock,
    })

    if (opts.origin) fly({ from: opts.origin, color: color.hex, kind: product.kind })
    pushToast({ kind: 'cart', title: t('product.added'), desc: product.name })
    setStep('cart')
    setMood('celebrate')
    setTimeout(() => setMood('idle'), 1800)
  }
}
