'use client'

import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEnaj } from '@/lib/enaj-context'
import { api } from '@/lib/api'
import type { Product } from '@/lib/enaj-data'
import { getPreferenceKeywords } from '@/lib/preference-ingredients'
import { getJournalKeywords } from '@/lib/journal-ingredients'
import type { ApiFlaggedIngredient } from '@/lib/scan-types'
import { PRODUCT_CATEGORIES, categoryToSlug, type ProductCategorySlug } from '@/lib/product-categories'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  ShoppingCart,
  Loader2,
  Search,
  X,
  Scissors,
  Palette,
  UtensilsCrossed,
  SprayCanIcon,
  Droplets,
  Home,
  ShieldCheck,
  ShieldOff,
} from 'lucide-react'

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'all': <ShoppingCart className="h-4 w-4" />,
  'skin-body': <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="8" cy="10" r="4" /><circle cx="17" cy="7" r="3" /><circle cx="16" cy="17" r="3" /></svg>,
  'haircare': <Scissors className="h-4 w-4" />,
  'makeup': <Palette className="h-4 w-4" />,
  'food': <UtensilsCrossed className="h-4 w-4" />,
  'cleaning': <SprayCanIcon className="h-4 w-4" />,
  'fragrance': <Droplets className="h-4 w-4" />,
  'household': <Home className="h-4 w-4" />,
}

// The grid/search page for the shop. Opening a product now navigates to a
// real route (/dashboard/scanner/[category]/[slug]) instead of swapping in
// a result view held in local state - see components/product-detail.tsx
// for what renders there. External (not-yet-imported) search results still
// need one network round trip to get a real slug before there's anywhere
// to navigate to; that happens here, inline, before the push.
export function ProductScanner({ category }: { category: ProductCategorySlug }) {
  const router = useRouter()
  const { profile, clerkUserId, preferenceCategories, journalCategories } = useEnaj()
  const [searchQuery, setSearchQuery] = useState('')
  const [products, setProducts] = useState<(Product & { slug?: string; isRecommended?: boolean; flaggedIngredients?: ApiFlaggedIngredient[] })[]>([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [enajFilterOn, setEnajFilterOn] = useState(true)
  const [openingSlug, setOpeningSlug] = useState<string | null>(null)

  const [apiSearchResults, setApiSearchResults] = useState<(Product & { slug?: string })[]>([])
  const [apiSearchLoading, setApiSearchLoading] = useState(false)
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setProductsLoading(true)
      try {
        const res = await api.getProducts(category, clerkUserId || undefined)
        if (!cancelled) {
          setProducts(res.products ?? [])
        }
      } catch {
        if (!cancelled) setProducts([])
      } finally {
        if (!cancelled) setProductsLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [category, clerkUserId])

  useEffect(() => {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current)
      searchTimerRef.current = null
    }

    const normalizedQuery = searchQuery
      .replace(/[‘’‚‛]/g, "'")
      .replace(/[“”„‟]/g, '"')
      .trim()

    if (normalizedQuery.length < 2) {
      setApiSearchResults([])
      setApiSearchLoading(false)
      return
    }

    setApiSearchLoading(true)

    searchTimerRef.current = setTimeout(async () => {
      try {
        const res = await api.searchProducts(normalizedQuery, 'all')
        const results = ((res as { products?: unknown[] }).products ?? []) as unknown[]

        const normalizeText = (value: unknown): string => {
          if (Array.isArray(value)) return value.join(' ').toLowerCase()
          if (typeof value === 'string') return value.toLowerCase()
          return ''
        }

        const includesAny = (text: string, words: string[]) =>
          words.some((word) => text.includes(word))

        const inferCategory = (product: Record<string, unknown>): string => {
          const validCategories = ['skin-body', 'haircare', 'makeup', 'food', 'cleaning', 'fragrance', 'household']
          const existingCategory = normalizeText(product.category)
          if (validCategories.includes(existingCategory)) return existingCategory

          const source = normalizeText(product.source)
          const name = normalizeText(product.name || product.product_name || product.productName || product.generic_name || product.brands)
          const categories = normalizeText(product.categories || product.categories_tags || product.categories_hierarchy || product.compared_to_category)
          const labels = normalizeText(product.labels || product.labels_tags)
          const ingredients = normalizeText(product.ingredients_text)
          const text = `${source} ${name} ${categories} ${labels} ${ingredients}`

          const makeupWords = [
            'makeup', 'cosmetic', 'eyeliner', 'eye liner', 'mascara', 'foundation',
            'concealer', 'blush', 'bronzer', 'highlighter', 'primer', 'setting spray',
            'setting powder', 'lipstick', 'lip gloss', 'lip liner', 'lip stain',
            'eyeshadow', 'eye shadow', 'brow gel', 'brow pencil', 'eyebrow pencil',
            'kajal', 'kohl', 'contour', 'cc cream', 'bb cream', 'tinted moisturizer',
            'nail polish', 'nail lacquer', 'false lashes', 'colour cosmetic',
            'color cosmetic', 'gel liner', 'liquid liner', 'eye pencil',
          ]

          const hairWords = [
            'shampoo', 'conditioner', 'dry shampoo', 'hair mask', 'hair oil',
            'hair serum', 'hair spray', 'hairspray', 'hair gel', 'hair mousse',
            'pomade', 'curl cream', 'leave-in', 'scalp treatment', 'detangler',
            'hair treatment', 'hair care', 'haircare', 'hair color', 'hair dye',
          ]

          const fragranceWords = [
            'eau de parfum', 'eau de toilette', 'eau de cologne', 'body mist',
            'fragrance mist', 'parfum', 'perfume', 'cologne',
          ]

          const skinBodyWords = [
            'skincare', 'skin care', 'body care', 'body wash', 'body lotion',
            'moisturizer', 'moisturiser', 'face wash', 'facial cleanser', 'toner',
            'sunscreen', 'face sunscreen', 'spf', 'deodorant', 'antiperspirant',
            'hand wash', 'hand cream', 'body butter', 'exfoliant', 'face scrub',
            'retinol', 'vitamin c serum', 'hyaluronic acid', 'niacinamide',
            'toothpaste', 'mouthwash', 'lip balm', 'micellar', 'cleansing oil',
            'face mask', 'sheet mask', 'eye cream', 'night cream', 'day cream',
            'petroleum jelly', 'healing ointment', 'body oil', 'bath oil',
            'salicylic acid', 'benzoyl peroxide', 'face serum',
          ]

          const cleaningWords = [
            'cleaning', 'cleaner', 'detergent', 'dish soap', 'dishwasher pod',
            'laundry detergent', 'laundry pod', 'disinfectant', 'disinfecting',
            'bleach', 'all purpose cleaner', 'glass cleaner', 'toilet cleaner',
            'bathroom cleaner', 'kitchen cleaner', 'floor cleaner', 'fabric softener',
            'dryer sheet', 'stain remover', 'oven cleaner', 'drain cleaner',
          ]

          const householdWords = [
            'paper towel', 'tissue', 'toilet paper', 'trash bag', 'garbage bag',
            'storage bag', 'aluminum foil', 'plastic wrap', 'air freshener',
            'scented candle', 'wax candle', 'hand soap', 'dish soap',
          ]

          const foodWords = [
            'food', 'snack', 'beverage', 'drink', 'water', 'juice', 'coffee', 'tea',
            'bread', 'cereal', 'pasta', 'sauce', 'cookie', 'chocolate', 'candy',
            'chips', 'protein bar', 'granola', 'yogurt', 'milk', 'cheese', 'egg',
            'rice', 'oat', 'fruit', 'vegetable', 'meat', 'fish', 'seafood', 'nut',
            'seed', 'oil', 'vinegar', 'condiment', 'seasoning', 'spice', 'soup',
            'cracker', 'pretzel', 'popcorn', 'energy drink', 'soda', 'sparkling water',
          ]

          if (includesAny(text, makeupWords)) return 'makeup'
          if (includesAny(text, hairWords)) return 'haircare'
          if (includesAny(text, fragranceWords)) return 'fragrance'
          if (includesAny(text, cleaningWords)) return 'cleaning'
          if (includesAny(text, householdWords)) return 'household'
          if (includesAny(text, skinBodyWords)) return 'skin-body'
          if (includesAny(text, foodWords)) return 'food'

          if (source.includes('openfoodfacts') || source.includes('off')) return 'food'
          if (source.includes('openbeautyfacts') || source.includes('beauty') || source.includes('obf')) return 'skin-body'

          return 'food'
        }

        const mappedResults = results.map((p) => {
          const prod = p as Record<string, unknown>
          return {
            id: (prod.slug as string) || (prod.id as string) || String(Math.random()),
            slug: (prod.slug as string) || (prod.id as string),
            name: (prod.name as string) || (prod.product_name as string) || 'Unknown Product',
            brand: (prod.brand as string) || (prod.brands as string) || 'Unknown Brand',
            image: (prod.image as string) || (prod.image_url as string) || '',
            price: (prod.price as string) || '',
            url: (prod.url as string) || '#',
            ingredients: Array.isArray(prod.ingredients)
              ? prod.ingredients.map((i: unknown) => typeof i === 'string' ? i : (i as Record<string, unknown>).name as string || String(i))
              : typeof prod.ingredients_text === 'string'
                ? (prod.ingredients_text as string).split(',').map((s: string) => s.trim()).filter(Boolean)
                : [],
            category: inferCategory(prod),
            packaging: Array.isArray(prod.packaging) ? prod.packaging as string[] : [],
            allergens: Array.isArray(prod.allergens)
              ? prod.allergens as string[]
              : typeof prod.allergens_tags === 'string'
                ? (prod.allergens_tags as string).split(',').map((s: string) => s.trim()).filter(Boolean)
                : [],
            barcode: (prod.barcode as string) || (prod.code as string) || undefined,
          }
        })
        const withIngredients = mappedResults.filter((p) => p.ingredients.length > 0)
        setApiSearchResults(withIngredients)
      } catch (err) {
        console.error("[v0] Search error:", err)
        setApiSearchResults([])
      } finally {
        setApiSearchLoading(false)
      }
    }, 500)

    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    }
  }, [searchQuery])

  const clientSideScan = useCallback(
    (product: Product & { slug?: string; packaging?: string[] }): { flaggedIngredients: ApiFlaggedIngredient[]; isRecommended: boolean } => {
      if (!profile) return { flaggedIngredients: [], isRecommended: true }
      const flagged: ApiFlaggedIngredient[] = []
      const productIngredients = product.ingredients.map((i) => i.toLowerCase())
      const productPackaging = (product.packaging || []).map((p) => p.toLowerCase())
      const findMatch = (keywords: string[], items: string[]): string | null => {
        for (const keyword of keywords) {
          const kw = keyword.toLowerCase()
          for (const item of items) {
            if (item.includes(kw) || kw.includes(item)) return item
          }
        }
        return null
      }
      for (const sa of profile.selectedAilments) {
        for (const fi of sa.activeIngredients) {
          const matchedIngredient = productIngredients.find(
            (pi) => pi.includes(fi.name.toLowerCase()) || fi.name.toLowerCase().includes(pi)
          )
          if (matchedIngredient) {
            flagged.push({ ingredient: fi.name, reason: fi.reason, source: 'ailment', sourceName: sa.ailment.name, flaggedFrom: 'ingredients', sources: fi.sources })
          }
        }
      }
      const prefInfoMap = new Map<string, { name: string; reason?: string }>()
      for (const cat of preferenceCategories) {
        for (const pref of cat.preferences) {
          prefInfoMap.set(pref.id, { name: pref.name, reason: pref.description })
        }
      }
      const flaggedPrefIds = new Set<string>()
      for (const prefId of profile.selectedPreferences) {
        if (flaggedPrefIds.has(prefId)) continue
        const prefInfo = prefInfoMap.get(prefId) || { name: prefId }
        const prefName = prefInfo.name
        const keywords = getPreferenceKeywords(prefName)
        const ingredientMatch = findMatch(keywords, productIngredients)
        if (ingredientMatch) {
          flagged.push({ ingredient: ingredientMatch, reason: prefInfo.reason || `Contains ${prefName}`, source: 'preference', sourceName: prefName, flaggedFrom: 'ingredients' })
          flaggedPrefIds.add(prefId)
          continue
        }
        const packagingMatch = findMatch(keywords, productPackaging)
        if (packagingMatch) {
          flagged.push({ ingredient: packagingMatch, reason: prefInfo.reason || `Packaging contains ${prefName}`, source: 'preference', sourceName: prefName, flaggedFrom: 'packaging' })
          flaggedPrefIds.add(prefId)
        }
      }
      const journalConditionMap = new Map<string, { name: string; whatWeMonitor: { ingredient: string; reason: string }[] }>()
      for (const cat of journalCategories) {
        for (const condition of cat.conditions) {
          journalConditionMap.set(condition.id, condition)
        }
      }
      for (const conditionId of profile.journalEntries) {
        const condition = journalConditionMap.get(conditionId)
        if (!condition) continue
        for (const monitor of condition.whatWeMonitor) {
          const keywords = getJournalKeywords(monitor.ingredient)
          const ingredientMatch = findMatch(keywords, productIngredients)
          if (ingredientMatch) {
            flagged.push({ ingredient: ingredientMatch, reason: monitor.reason, source: 'journal', sourceName: condition.name, flaggedFrom: 'ingredients' })
            continue
          }
          const packagingMatch = findMatch(keywords, productPackaging)
          if (packagingMatch) {
            flagged.push({ ingredient: packagingMatch, reason: monitor.reason, source: 'journal', sourceName: condition.name, flaggedFrom: 'packaging' })
          }
        }
      }
      return { flaggedIngredients: flagged, isRecommended: flagged.length === 0 }
    },
    [profile, preferenceCategories, journalCategories]
  )

  const openProduct = useCallback(
    async (product: Product & { slug?: string; packaging?: string[]; barcode?: string }) => {
      const isExternalProduct = !product.slug || apiSearchResults.some((p) => (p.slug || p.id) === (product.slug || product.id))
      if (!isExternalProduct && product.slug) {
        router.push(`/dashboard/scanner/${categoryToSlug(product.category)}/${product.slug}`)
        return
      }
      setOpeningSlug(product.id)
      try {
        const importRes = await api.importProduct({
          barcode: product.barcode,
          name: product.name,
          brand: product.brand,
          image: product.image || undefined,
          ingredients: product.ingredients,
          packaging: (product as Product & { packaging?: string[] }).packaging || [],
          allergens: (product as Product & { allergens?: string[] }).allergens || [],
          category: product.category,
        })
        router.push(`/dashboard/scanner/${categoryToSlug(importRes.product.category)}/${importRes.product.slug}`)
      } catch {
        // Import failed (e.g. backend unreachable) - there's no real slug to
        // route to, so fall back to a client-side-only estimate shown
        // inline rather than navigating anywhere.
        const { flaggedIngredients, isRecommended } = clientSideScan(product)
        console.warn('[enaJ] Falling back to client-side scan for', product.name, { isRecommended, flaggedIngredients })
      } finally {
        setOpeningSlug(null)
      }
    },
    [apiSearchResults, clientSideScan, router]
  )

  const filteredProducts = useMemo(() => {
    let base = products.filter((p) => {
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      return p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
    })

    if (searchQuery.trim().length >= 2 && apiSearchResults.length > 0) {
      const localIds = new Set(base.map((p) => p.slug || p.id))
      const uniqueApiResults = apiSearchResults.filter((p) => !localIds.has(p.slug || p.id))
      base = [...base, ...uniqueApiResults]
    }

    if (enajFilterOn && profile) {
      return base.filter((p) => {
        const { flaggedIngredients } = clientSideScan(p)
        return flaggedIngredients.length === 0
      })
    }

    return base
  }, [searchQuery, products, apiSearchResults, enajFilterOn, profile, clientSideScan])

  const getCategoryLabel = (raw: string) => PRODUCT_CATEGORIES.find((c) => c.slug === categoryToSlug(raw))?.label ?? raw

  if (!profile) return null

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Search</h1>
        <p className="mt-1 text-muted-foreground">
          Search for products; enaJ will determine if they match your health conditions and preferences.
        </p>
      </div>

      {/* ── ENAJ FILTER TOGGLE ── */}
      <div className={`flex items-center justify-between rounded-xl border-2 px-4 py-3 transition-colors ${enajFilterOn ? 'border-primary/40 bg-primary/5' : 'border-border bg-card'}`}>
        <div className="flex items-center gap-3">
          {enajFilterOn
            ? <ShieldCheck className="h-5 w-5 text-primary flex-shrink-0" />
            : <ShieldOff className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          }
          <div>
            <p className={`text-sm font-semibold ${enajFilterOn ? 'text-primary' : 'text-foreground'}`}>
              {enajFilterOn ? 'enaJ Filter: On' : 'enaJ Filter: Off'}
            </p>
            <p className="text-xs text-muted-foreground">
              {enajFilterOn
                ? 'Only showing products that match your health profile'
                : 'Showing all products — some may conflict with your profile'}
            </p>
          </div>
        </div>
        <button
          role="switch"
          aria-checked={enajFilterOn}
          onClick={() => setEnajFilterOn((v) => !v)}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${enajFilterOn ? 'bg-primary' : 'bg-muted-foreground/30'}`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ${enajFilterOn ? 'translate-x-5' : 'translate-x-0'}`}
          />
        </button>
      </div>

      {/* Category Banner */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mb-2 scrollbar-none">
        {PRODUCT_CATEGORIES.map((cat) => (
          <Link
            key={cat.id}
            href={cat.slug === 'all' ? '/dashboard/scanner' : `/dashboard/scanner/${cat.slug}`}
            className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              category === cat.slug
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            {CATEGORY_ICONS[cat.slug]}
            {cat.label}
          </Link>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search products by name or brand..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-card border-border text-foreground placeholder:text-muted-foreground pl-10"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Product Grid */}
      {productsLoading && !apiSearchLoading ? (
        <div className="flex flex-col items-center py-16">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
          <p className="text-sm text-muted-foreground">Loading products...</p>
        </div>
      ) : filteredProducts.length === 0 && !apiSearchLoading ? (
        <div className="flex flex-col items-center py-16 text-center">
          <Search className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-lg font-medium text-foreground">No products found</p>
          <p className="text-sm text-muted-foreground mt-1">
            {enajFilterOn
              ? 'No products match your health profile in this category. Try turning off the enaJ Filter to see all products.'
              : 'Try a different search term or category.'}
          </p>
        </div>
      ) : (
        <>
          {apiSearchLoading && (
            <div className="flex items-center justify-center gap-2 py-4">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Searching Open Food Facts & Open Beauty Facts...</p>
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => openProduct(product)}
                disabled={openingSlug === product.id}
                className="group flex flex-col rounded-xl border border-border bg-card p-4 text-left transition-all hover:shadow-lg hover:border-primary/30 disabled:opacity-60"
              >
                <div className="mb-3 flex h-32 items-center justify-center rounded-lg bg-muted">
                  {openingSlug === product.id ? (
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  ) : (
                    <ShoppingCart className="h-8 w-8 text-muted-foreground transition-colors group-hover:text-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-primary">{product.brand}</p>
                  <h3 className="mt-1 text-sm font-semibold text-card-foreground leading-snug">{product.name}</h3>
                  <p className="mt-1 text-sm font-bold text-card-foreground">{product.price}</p>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Badge variant="secondary" className="bg-muted text-muted-foreground text-xs">
                    {getCategoryLabel(product.category)}
                  </Badge>
                  <span className="ml-auto text-xs text-muted-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                    <Search className="h-3.5 w-3.5" />
                    Check
                  </span>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
