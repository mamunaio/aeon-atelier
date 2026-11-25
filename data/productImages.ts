import type { GarmentKind } from '../types'

/**
 * Curated external demo product photography (DummyJSON CDN & FakeStoreAPI)
 * mapped by garment kind, with multiple angles/variants per category so
 * colorway/style cycling transitions smoothly across real photographs.
 */
const PHOTO_POOL: Record<GarmentKind, string[]> = {
  tshirt: [
    'https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_t.png',
    'https://fakestoreapi.com/img/71YXzeOuslL._AC_UY879_t.png',
    'https://cdn.dummyjson.com/product-images/mens-shirts/gigabyte-aorus-men-tshirt/1.webp',
    'https://fakestoreapi.com/img/71z3kpMAYsL._AC_UY879_t.png',
    'https://fakestoreapi.com/img/51eg55uWmdL._AC_UX679_t.png',
  ],
  polo: [
    'https://cdn.dummyjson.com/product-images/mens-shirts/man-short-sleeve-shirt/1.webp',
    'https://cdn.dummyjson.com/product-images/mens-shirts/man-short-sleeve-shirt/2.webp',
    'https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_t.png',
  ],
  shirt: [
    'https://cdn.dummyjson.com/product-images/mens-shirts/blue-&-black-check-shirt/1.webp',
    'https://cdn.dummyjson.com/product-images/mens-shirts/man-plaid-shirt/1.webp',
    'https://cdn.dummyjson.com/product-images/mens-shirts/men-check-shirt/1.webp',
    'https://cdn.dummyjson.com/product-images/mens-shirts/man-short-sleeve-shirt/1.webp',
  ],
  hoodie: [
    'https://fakestoreapi.com/img/51Y5NI-I5jL._AC_UX679_t.png',
    'https://fakestoreapi.com/img/81XH0e8fefL._AC_UY879_t.png',
    'https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_t.png',
  ],
  sweatshirt: [
    'https://fakestoreapi.com/img/71YXzeOuslL._AC_UY879_t.png',
    'https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_t.png',
    'https://fakestoreapi.com/img/61pHAEJ4NML._AC_UX679_t.png',
  ],
  jacket: [
    'https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_t.png',
    'https://fakestoreapi.com/img/81XH0e8fefL._AC_UY879_t.png',
    'https://fakestoreapi.com/img/51Y5NI-I5jL._AC_UX679_t.png',
    'https://fakestoreapi.com/img/71HblAHs5xL._AC_UY879_-2t.png',
  ],
  jeans: [
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/00/Broken_twill_denim_Wrangler_13MWZ_jeans_%282026-01-21%29.jpg/960px-Broken_twill_denim_Wrangler_13MWZ_jeans_%282026-01-21%29.jpg',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/01/Jeans_Jeans_Jeans.jpg/960px-Jeans_Jeans_Jeans.jpg',
  ],
  pants: [
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/77/Chino_Pant_Stack.jpg/960px-Chino_Pant_Stack.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/e/ec/Man_wearing_blue_denim_shirt_with_rolled_sleeves%2C_tan_chinos_1.jpg',
  ],
  cargo: [
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cd/Cargo_pants_001.jpg/960px-Cargo_pants_001.jpg',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3c/Cargo_pants_002.jpg/960px-Cargo_pants_002.jpg',
  ],
  shorts: [
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3c/Cargo_pants_002.jpg/960px-Cargo_pants_002.jpg',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/01/Jeans_Jeans_Jeans.jpg/960px-Jeans_Jeans_Jeans.jpg',
  ],
  shoe: [
    'https://cdn.dummyjson.com/product-images/mens-shoes/nike-air-jordan-1-red-and-black/1.webp',
    'https://cdn.dummyjson.com/product-images/mens-shoes/puma-future-rider-trainers/1.webp',
    'https://cdn.dummyjson.com/product-images/mens-shoes/sports-sneakers-off-white-&-red/1.webp',
  ],
  sneaker: [
    'https://cdn.dummyjson.com/product-images/mens-shoes/sports-sneakers-off-white-&-red/1.webp',
    'https://cdn.dummyjson.com/product-images/mens-shoes/puma-future-rider-trainers/1.webp',
    'https://cdn.dummyjson.com/product-images/mens-shoes/nike-air-jordan-1-red-and-black/1.webp',
    'https://cdn.dummyjson.com/product-images/mens-shoes/nike-baseball-cleats/1.webp',
  ],
  sandal: [
    'https://cdn.dummyjson.com/product-images/womens-shoes/red-shoes/2.webp',
    'https://cdn.dummyjson.com/product-images/mens-shoes/sports-sneakers-off-white-red/1.webp',
  ],
  cap: [
    'https://cdn.dummyjson.com/product-images/sunglasses/black-sun-glasses/1.webp',
    'https://cdn.dummyjson.com/product-images/sunglasses/classic-sun-glasses/1.webp',
  ],
  hat: [
    'https://cdn.dummyjson.com/product-images/sunglasses/classic-sun-glasses/2.webp',
    'https://cdn.dummyjson.com/product-images/sunglasses/black-sun-glasses/2.webp',
  ],
  belt: [
    'https://cdn.dummyjson.com/product-images/mens-watches/brown-leather-belt-watch/1.webp',
    'https://cdn.dummyjson.com/product-images/mens-watches/rolex-cellini-date-black-dial/1.webp',
  ],
  bag: [
    'https://cdn.dummyjson.com/product-images/womens-bags/women-handbag-black/1.webp',
    'https://cdn.dummyjson.com/product-images/womens-bags/prada-women-bag/1.webp',
    'https://cdn.dummyjson.com/product-images/womens-bags/heshe-women\'s-leather-bag/1.webp',
    'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_t.png',
  ],
  wallet: [
    'https://cdn.dummyjson.com/product-images/womens-bags/women-handbag-black/2.webp',
    'https://cdn.dummyjson.com/product-images/womens-bags/prada-women-bag/2.webp',
  ],
  watch: [
    'https://cdn.dummyjson.com/product-images/mens-watches/rolex-cellini-date-black-dial/1.webp',
    'https://cdn.dummyjson.com/product-images/mens-watches/rolex-submariner-watch/1.webp',
    'https://cdn.dummyjson.com/product-images/mens-watches/longines-master-collection/1.webp',
    'https://cdn.dummyjson.com/product-images/mens-watches/rolex-cellini-moonphase/1.webp',
  ],
  sunglasses: [
    'https://cdn.dummyjson.com/product-images/sunglasses/black-sun-glasses/1.webp',
    'https://cdn.dummyjson.com/product-images/sunglasses/classic-sun-glasses/1.webp',
    'https://cdn.dummyjson.com/product-images/sunglasses/green-and-black-glasses/1.webp',
    'https://cdn.dummyjson.com/product-images/sunglasses/sunglasses/1.webp',
  ],
  socks: [
    'https://cdn.dummyjson.com/product-images/mens-shoes/sports-sneakers-off-white-&-red/2.webp',
    'https://cdn.dummyjson.com/product-images/mens-shoes/puma-future-rider-trainers/2.webp',
  ],
  accessory: [
    'https://cdn.dummyjson.com/product-images/mens-watches/rolex-datejust/1.webp',
    'https://cdn.dummyjson.com/product-images/sunglasses/black-sun-glasses/1.webp',
    'https://cdn.dummyjson.com/product-images/womens-bags/women-handbag-black/1.webp',
  ],
}

export function getProductDemoPhotos(kind: GarmentKind, seed = 0): string[] {
  const pool = PHOTO_POOL[kind] ?? PHOTO_POOL.tshirt
  if (pool.length <= 1) return pool
  const offset = Math.abs(seed) % pool.length
  return [...pool.slice(offset), ...pool.slice(0, offset)]
}
