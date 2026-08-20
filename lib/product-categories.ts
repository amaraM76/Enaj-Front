// Single source of truth for the shop's category list and the mapping
// between the kebab-case slugs used in URLs (/dashboard/scanner/skin-body)
// and the Prisma ProductCategory enum values products carry (SKIN_BODY).
// Previously this list and an enum<->slug map were duplicated inline in
// product-scanner.tsx; centralizing it here is what lets the new
// route-based product detail pages build correct links without guessing.

export const PRODUCT_CATEGORIES = [
  { id: 'all', label: 'All', slug: 'all' },
  { id: 'skin-body', label: 'Skin & Body Care', slug: 'skin-body' },
  { id: 'haircare', label: 'Haircare', slug: 'haircare' },
  { id: 'makeup', label: 'Makeup', slug: 'makeup' },
  { id: 'food', label: 'Food', slug: 'food' },
  { id: 'cleaning', label: 'Cleaning Supplies', slug: 'cleaning' },
  { id: 'fragrance', label: 'Fragrance', slug: 'fragrance' },
  { id: 'household', label: 'Household Items', slug: 'household' },
] as const

export type ProductCategorySlug = (typeof PRODUCT_CATEGORIES)[number]['slug']

const ENUM_TO_SLUG: Record<string, string> = {
  SKIN_BODY: 'skin-body',
  HAIRCARE: 'haircare',
  MAKEUP: 'makeup',
  FOOD: 'food',
  CLEANING: 'cleaning',
  FRAGRANCE: 'fragrance',
  HOUSEHOLD: 'household',
}

export function isProductCategorySlug(value: string): value is ProductCategorySlug {
  return PRODUCT_CATEGORIES.some((c) => c.slug === value)
}

// Products come back from the backend with `category` as the raw Prisma
// enum (e.g. "SKIN_BODY"), but our URLs and the products-list endpoint use
// kebab-case slugs (e.g. "skin-body") - this normalizes either shape.
export function categoryToSlug(raw: string): ProductCategorySlug {
  const direct = ENUM_TO_SLUG[raw]
  if (direct && isProductCategorySlug(direct)) return direct as ProductCategorySlug
  const lower = raw.toLowerCase().replace(/_/g, '-')
  return isProductCategorySlug(lower) ? (lower as ProductCategorySlug) : 'all'
}

export function categoryLabel(raw: string): string {
  const slug = categoryToSlug(raw)
  return PRODUCT_CATEGORIES.find((c) => c.slug === slug)?.label ?? raw
}
