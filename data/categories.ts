import type { Category, Collection } from '../types'

// Scalable catalog taxonomy. Admin can append unlimited categories;
// the UI derives everything (nav, filters, shop) from these arrays.

export const CATEGORIES: Category[] = [
  // Apparel
  { id: 'tshirts', name: 'Premium T-Shirts', kind: 'tshirt', group: 'apparel', icon: 'shirt' },
  { id: 'polos', name: 'Polo Shirts', kind: 'polo', group: 'apparel', icon: 'shirt' },
  { id: 'shirts', name: 'Shirts', kind: 'shirt', group: 'apparel', icon: 'shirt' },
  { id: 'hoodies', name: 'Hoodies', kind: 'hoodie', group: 'apparel', icon: 'shirt' },
  { id: 'sweatshirts', name: 'Sweatshirts', kind: 'sweatshirt', group: 'apparel', icon: 'shirt' },
  { id: 'jackets', name: 'Jackets', kind: 'jacket', group: 'apparel', icon: 'shirt' },
  { id: 'jeans', name: 'Jeans', kind: 'jeans', group: 'apparel', icon: 'shirt' },
  { id: 'casual-pants', name: 'Casual Pants', kind: 'pants', group: 'apparel', icon: 'shirt' },
  { id: 'formal-pants', name: 'Formal Pants', kind: 'pants', group: 'apparel', icon: 'shirt' },
  { id: 'cargo-pants', name: 'Cargo Pants', kind: 'cargo', group: 'apparel', icon: 'shirt' },
  { id: 'shorts', name: 'Shorts', kind: 'shorts', group: 'apparel', icon: 'shirt' },
  // Footwear
  { id: 'shoes', name: 'Shoes', kind: 'shoe', group: 'footwear', icon: 'footprints' },
  { id: 'sneakers', name: 'Sneakers', kind: 'sneaker', group: 'footwear', icon: 'footprints' },
  { id: 'sandals', name: 'Sandals', kind: 'sandal', group: 'footwear', icon: 'footprints' },
  // Accessories
  { id: 'caps', name: 'Caps', kind: 'cap', group: 'accessories', icon: 'crown' },
  { id: 'hats', name: 'Hats', kind: 'hat', group: 'accessories', icon: 'crown' },
  { id: 'belts', name: 'Belts', kind: 'belt', group: 'accessories', icon: 'minus' },
  { id: 'bags', name: 'Bags', kind: 'bag', group: 'accessories', icon: 'shopping-bag' },
  { id: 'wallets', name: 'Wallets', kind: 'wallet', group: 'accessories', icon: 'wallet' },
  { id: 'watches', name: 'Watches', kind: 'watch', group: 'accessories', icon: 'watch' },
  { id: 'sunglasses', name: 'Sunglasses', kind: 'sunglasses', group: 'accessories', icon: 'glasses' },
  { id: 'socks', name: 'Socks', kind: 'socks', group: 'accessories', icon: 'minus' },
  { id: 'accessories', name: 'Fashion Accessories', kind: 'accessory', group: 'accessories', icon: 'sparkles' },
  // Custom
  { id: 'custom-apparel', name: 'Custom Apparel', kind: 'tshirt', group: 'custom', icon: 'wand' },
  { id: 'event-merch', name: 'Custom Event Merchandise', kind: 'tshirt', group: 'custom', icon: 'wand' },
  { id: 'promo', name: 'Promotional Clothing', kind: 'polo', group: 'custom', icon: 'wand' },
  { id: 'uniforms', name: 'Corporate / Event Uniforms', kind: 'shirt', group: 'custom', icon: 'wand' },
]

export const COLLECTIONS: Collection[] = [
  { id: 'new', name: 'New Arrivals', blurb: 'Fresh drops, engineered for the future', accent: '#7b4dff' },
  { id: 'best', name: 'Best Sellers', blurb: 'Loved by the TaioMei community', accent: '#12d3e0' },
  { id: 'trending', name: 'Trending', blurb: 'What the world is wearing', accent: '#ff5da2' },
  { id: 'premium', name: 'Premium Collection', blurb: 'Elevated fabrics, uncompromising craft', accent: '#d4af37' },
  { id: 'men', name: "Men's Fashion", blurb: 'Sharp, modern, effortless', accent: '#4a90ff' },
  { id: 'women', name: "Women's Fashion", blurb: 'Bold, refined, expressive', accent: '#ff7ac4' },
  { id: 'unisex', name: 'Unisex', blurb: 'Designed for everyone', accent: '#12d3e0' },
  { id: 'accessories', name: 'Accessories', blurb: 'The finishing touch', accent: '#a394ff' },
  { id: 'custom', name: 'Custom Collection', blurb: 'Made uniquely yours', accent: '#7b4dff' },
  { id: 'event', name: 'Event Collection', blurb: 'Outfit the whole occasion', accent: '#ffb347' },
  { id: 'promo', name: 'Promotional Collection', blurb: 'Brand it. Wear it. Share it.', accent: '#12d3e0' },
  { id: 'limited', name: 'Limited Edition', blurb: 'Here today. Gone tomorrow.', accent: '#d4af37' },
]

export const SIZE_SETS: Record<string, string[]> = {
  apparel: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  footwear: ['39', '40', '41', '42', '43', '44', '45'],
  accessories: ['One Size'],
  belt: ['S', 'M', 'L', 'XL'],
  hat: ['S/M', 'L/XL'],
  socks: ['S', 'M', 'L'],
}

export const FABRICS = [
  'Organic Cotton',
  'Pima Cotton',
  'Combed Cotton',
  'French Terry',
  'Merino Wool',
  'Linen Blend',
  'Tech Knit',
  'Recycled Poly',
  'Denim',
  'Ripstop',
  'Premium Leather',
  'Vegan Leather',
]

export const PATTERNS = ['Solid', 'Minimal', 'Graphic', 'Striped', 'Camo', 'Tie-Dye', 'Colorblock', 'Abstract']
