// Shared shape for a single flagged-ingredient entry, returned by both the
// backend's scan endpoints and the client-side fallback scanner. Pulled out
// so components/product-scanner.tsx, components/product-detail.tsx, and
// lib/use-product-scan.ts don't each redeclare it.
export interface ApiFlaggedIngredient {
  ingredient: string
  reason: string
  source: 'ailment' | 'preference' | 'journal'
  sourceName: string
  // The ailment/preference's catalog slug, e.g. "eczema" or "no-silicones" -
  // used to deep-link "Learn why" to /education/{sourceSlug} and highlight
  // this ingredient there.
  sourceSlug?: string
  flaggedFrom?: 'ingredients' | 'packaging' | 'allergens'
  sources?: { title: string; url: string }[]
}
