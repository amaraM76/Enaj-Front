'use client'

import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { useEnaj } from '@/lib/enaj-context'
import { api } from '@/lib/api'
import type { Product, ScanResult } from '@/lib/enaj-data'
import { getPreferenceKeywords } from '@/lib/preference-ingredients'

const PRODUCT_CATEGORIES = [
  { id: 'all', label: 'All', slug: 'all' },
  { id: 'skin-body', label: 'Skin & Body Care', slug: 'skin-body' },
  { id: 'haircare', label: 'Haircare', slug: 'haircare' },
  { id: 'makeup', label: 'Makeup', slug: 'makeup' },
  { id: 'food', label: 'Food', slug: 'food' },
  { id: 'cleaning', label: 'Cleaning Supplies', slug: 'cleaning' },
  { id: 'fragrance', label: 'Fragrance', slug: 'fragrance' },
  { id: 'household', label: 'Household Items', slug: 'household' },
] as const

type ProductCategorySlug = (typeof PRODUCT_CATEGORIES)[number]['slug']
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  AlertTriangle,
  CheckCircle2,
  ShoppingCart,
  Bookmark,
  BookmarkCheck,
  Loader2,
  Search,
  X,
  Heart,
  Leaf,
  Info,
  Scissors,
  Palette,
  UtensilsCrossed,
  SprayCanIcon,
  Droplets,
  Home,
  BookOpen,
  Package,
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

interface ApiFlaggedIngredient {
  ingredient: string
  reason: string
  source: 'ailment' | 'preference'
  sourceName: string
  flaggedFrom?: 'ingredients' | 'packaging' | 'allergens'
  sources?: { title: string; url: string }[]
}

export function ProductScanner({
  selectedProduct,
  onProductOpened,
}: {
  selectedProduct?: Product & { slug?: string }
  onProductOpened?: () => void
}) {
  const { profile, clerkUserId, saveProduct, unsaveProduct, isProductSaved, ailmentCategories, preferenceCategories } = useEnaj()
  const [scanResult, setScanResult] = useState<(Omit<ScanResult, 'flaggedIngredients'> & { flaggedIngredients: ApiFlaggedIngredient[] }) | null>(null)
  const [scanning, setScanning] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [products, setProducts] = useState<(Product & { slug?: string; isRecommended?: boolean; flaggedIngredients?: ApiFlaggedIngredient[] })[]>([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [enajFilterOn, setEnajFilterOn] = useState(true) // ← NEW

  const [apiSearchResults, setApiSearchResults] = useState<(Product & { slug?: string })[]>([])
  const [apiSearchLoading, setApiSearchLoading] = useState(false)
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [activeCategory, setActiveCategoryState] = useState<ProductCategorySlug>(() => {
    if (typeof window !== 'undefined') {
      const match = window.location.pathname.match(/^\/products\/(.+)$/)
      if (match) {
        const label = decodeURIComponent(match[1])
        const found = PRODUCT_CATEGORIES.find(
          (c) => c.label.toLowerCase() === label.toLowerCase()
        )
        if (found) return found.slug
      }
    }
    return 'all'
  })

  const setActiveCategory = (slug: ProductCategorySlug) => {
    setActiveCategoryState(slug)
    if (slug === 'all') {
      window.history.pushState({}, '', '/')
    } else {
      const cat = PRODUCT_CATEGORIES.find((c) => c.slug === slug)
      const label = cat ? cat.label : slug
      window.history.pushState({}, '', `/products/${label}`)
    }
  }

  const [sourcesDialog, setSourcesDialog] = useState<{
    ingredient: string
    reason: string
    sourceName: string
    sources: { title: string; url: string }[]
  } | null>(null)


  useEffect(() => {
    let cancelled = false
    async function load() {
      setProductsLoading(true)
      try {
        const res = await api.getProducts(activeCategory, clerkUserId || undefined)
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
  }, [activeCategory, clerkUserId])

  useEffect(() => {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current)
      searchTimerRef.current = null
    }

    const normalizedQuery = searchQuery
      .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
      .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
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
      return { flaggedIngredients: flagged, isRecommended: flagged.length === 0 }
    },
    [profile, preferenceCategories]
  )

  const performScan = useCallback(
    async (product: Product & { slug?: string; packaging?: string[]; barcode?: string }) => {
      if (!profile) return
      setScanning(true)
      setScanResult(null)
      try {
        let slug = product.slug || product.id
        let category = product.category
        const isExternalProduct = !product.slug || apiSearchResults.some((p) => (p.slug || p.id) === (product.slug || product.id))
        if (isExternalProduct) {
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
            slug = importRes.product.slug
            category = importRes.product.category
          } catch {
            const { flaggedIngredients, isRecommended } = clientSideScan(product)
            setScanResult({ product, isRecommended, flaggedIngredients, alternatives: [] })
            setScanning(false)
            return
          }
        }
        const res = await api.scanProduct(category, slug, clerkUserId || '')
        setScanResult({ product: res.product ?? product, isRecommended: res.isRecommended, flaggedIngredients: res.flaggedIngredients ?? [], alternatives: res.alternatives ?? [] })
      } catch {
        const { flaggedIngredients, isRecommended } = clientSideScan(product)
        setScanResult({ product, isRecommended, flaggedIngredients, alternatives: [] })
      } finally {
        setScanning(false)
      }
    },
    [profile, clerkUserId, clientSideScan, apiSearchResults]
  )

  useEffect(() => {
    if (!selectedProduct) return

    performScan(selectedProduct)
    onProductOpened?.()
  }, [selectedProduct, performScan, onProductOpened])

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

    // ← NEW: if Enaj filter is on, only show products with no flagged ingredients
    if (enajFilterOn && profile) {
      return base.filter((p) => {
        const { flaggedIngredients } = clientSideScan(p)
        return flaggedIngredients.length === 0
      })
    }

    return base
  }, [searchQuery, products, apiSearchResults, enajFilterOn, profile, clientSideScan])

  const getCategoryLabel = (raw: string) => {
    const enumToSlug: Record<string, string> = {
      'SKIN_BODY': 'skin-body',
      'HAIRCARE': 'haircare',
      'MAKEUP': 'makeup',
      'FOOD': 'food',
      'CLEANING': 'cleaning',
      'FRAGRANCE': 'fragrance',
      'HOUSEHOLD': 'household',
    }
    const slug = enumToSlug[raw] ?? raw.toLowerCase().replace(/_/g, '-')
    return PRODUCT_CATEGORIES.find((c) => c.slug === slug)?.label ?? raw
  }
  const getProductSlug = (product: Product & { slug?: string }) => product.slug || product.id

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
      {!scanResult && (
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
          {/* Toggle switch */}
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
      )}

      {/* Category Banner */}
      {!scanResult && (
        <div className="flex gap-2 overflow-x-auto pb-2 -mb-2 scrollbar-none">
          {PRODUCT_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.slug)}
              className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeCategory === cat.slug
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              {CATEGORY_ICONS[cat.slug]}
              {cat.label}
            </button>
          ))}
        </div>
      )}

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
      {!scanResult && (
        <>
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
                    onClick={() => performScan(product)}
                    disabled={scanning}
                    className="group flex flex-col rounded-xl border border-border bg-card p-4 text-left transition-all hover:shadow-lg hover:border-primary/30 disabled:opacity-60"
                  >
                    <div className="mb-3 flex h-32 items-center justify-center rounded-lg bg-muted">
                      <ShoppingCart className="h-8 w-8 text-muted-foreground transition-colors group-hover:text-primary" />
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
        </>
      )}

      {/* Scanning Animation */}
      {scanning && (
        <div className="flex flex-col items-center rounded-xl border border-border bg-card py-16">
          <Loader2 className="mb-4 h-10 w-10 animate-spin text-primary" />
          <p className="text-lg font-semibold text-card-foreground">Checking product...</p>
          <p className="mt-1 text-sm text-muted-foreground">Analyzing ingredients against your health profile</p>
        </div>
      )}

      {/* Scan Results */}
      {scanResult && !scanning && (
        <div className="flex flex-col gap-6">
          <Button variant="ghost" size="sm" onClick={() => setScanResult(null)} className="self-start text-muted-foreground hover:text-foreground gap-2">
            <X className="h-4 w-4" />
            Back to Products
          </Button>

          <div className={`rounded-xl border-2 p-5 ${scanResult.isRecommended ? 'border-secondary bg-secondary/10' : 'border-destructive/30 bg-destructive/5'}`}>
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
                <ShoppingCart className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-primary">{scanResult.product.brand}</p>
                <h3 className="text-lg font-semibold text-foreground leading-snug">{scanResult.product.name}</h3>
                <p className="text-sm font-bold text-foreground mt-0.5">{scanResult.product.price}</p>
              </div>
            </div>

            <div className="mt-4">
              {(() => {
                const slug = getProductSlug(scanResult.product as Product & { slug?: string })
                const saved = isProductSaved(slug)

                return (
                  <Button
                    onClick={() =>
                      saved
                        ? unsaveProduct(slug)
                        : saveProduct(scanResult.product)
                    }
                    className={`gap-2 ${
                      saved
                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    }`}
                  >
                    {saved ? (
                      <BookmarkCheck className="h-4 w-4" />
                    ) : (
                      <Bookmark className="h-4 w-4" />
                    )}

                    {saved ? "Saved" : "Save Product"}
                  </Button>
                )
              })()}
            </div>

            <div className="mt-4">
              {scanResult.isRecommended ? (
                <div className="flex items-center gap-2 rounded-lg bg-secondary/20 px-4 py-3">
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-accent-foreground" />
                  <div>
                    <p className="font-semibold text-foreground">Recommended</p>
                    <p className="text-sm text-muted-foreground">This product does not contain any ingredients that conflict with your health profile or preferences.</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2 rounded-lg bg-destructive/10 px-4 py-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-destructive" />
                  <div>
                    <p className="font-semibold text-foreground">Not Recommended</p>
                    <p className="text-sm text-muted-foreground">This product contains {scanResult.flaggedIngredients.length} ingredient{scanResult.flaggedIngredients.length !== 1 ? 's' : ''} that conflict with your profile.</p>
                  </div>
                </div>
              )}
            </div>

            {(() => {
              const allergenFlags = scanResult.flaggedIngredients.filter((fi) => fi.flaggedFrom === 'allergens')
              if (allergenFlags.length === 0) return null
              return (
                <div className="mt-4 flex items-start gap-3 rounded-lg bg-amber-100 border-2 border-amber-400 px-4 py-3">
                  <AlertTriangle className="mt-0.5 h-6 w-6 flex-shrink-0 text-amber-600" />
                  <div>
                    <p className="font-bold text-amber-800 text-base">Contains Allergens</p>
                    <p className="text-sm text-amber-700 mt-1">{allergenFlags.map((fi) => fi.ingredient).join(', ')}</p>
                  </div>
                </div>
              )
            })()}

            {scanResult.flaggedIngredients.length > 0 && (
              <div className="mt-4 flex flex-col gap-3">
                <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <Info className="h-4 w-4 text-primary" />
                  Why this product is flagged:
                </p>
                {scanResult.flaggedIngredients.map((fi, idx) => (
                  <div key={`${fi.ingredient}-${idx}`} className="rounded-lg border border-border bg-card p-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-destructive/10">
                        {fi.source === 'ailment' ? <Heart className="h-3.5 w-3.5 text-destructive" /> : fi.flaggedFrom === 'packaging' ? <Package className="h-3.5 w-3.5 text-destructive" /> : <Leaf className="h-3.5 w-3.5 text-destructive" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-card-foreground">{fi.ingredient}</p>
                        <p className="mt-0.5 text-sm text-muted-foreground">{fi.reason}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {fi.source === 'ailment' ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
                              <Heart className="h-3 w-3" />
                              Conflicts with your {fi.sourceName}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
                              <Leaf className="h-3 w-3" />
                              Flagged by your preference: {fi.sourceName}
                            </span>
                          )}
                          {fi.flaggedFrom === 'packaging' && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                              <Package className="h-3 w-3" />
                              Found in packaging
                            </span>
                          )}
                          {fi.sources && fi.sources.length > 0 && (
                            <button
                              onClick={() => setSourcesDialog({ ingredient: fi.ingredient, reason: fi.reason, sourceName: fi.sourceName, sources: fi.sources! })}
                              className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                            >
                              <BookOpen className="h-3 w-3" />
                              Find out why
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4">
              <p className="mb-2 text-sm font-semibold text-foreground">Full ingredient list:</p>
              <div className="flex flex-wrap gap-1.5">
                {scanResult.product.ingredients.map((ing) => {
                  const isFlagged = scanResult.flaggedIngredients.some((fi) => ing.toLowerCase().includes(fi.ingredient.toLowerCase()) || fi.ingredient.toLowerCase().includes(ing.toLowerCase()))
                  return (
                    <span key={ing} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs ${isFlagged ? 'bg-destructive/10 text-destructive font-medium' : 'bg-muted text-muted-foreground'}`}>
                      {isFlagged && <AlertTriangle className="h-3 w-3" />}
                      {ing}
                    </span>
                  )
                })}
              </div>
            </div>
          </div>

          {scanResult.alternatives.length > 0 && !scanResult.isRecommended && (
            <div>
              <h2 className="mb-4 text-lg font-semibold text-foreground">Recommended Alternatives</h2>
              <p className="mt-2 mb-4 text-sm italic text-muted-foreground">
                Our enaJ angels are working hard to bring you an even bigger list of personalized recommendations soon.
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {scanResult.alternatives.map((alt: Product & { slug?: string }) => {
                  const altSlug = getProductSlug(alt)
                  const saved = isProductSaved(altSlug)

                  return (
                    <div
                      key={alt.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => performScan(alt)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          performScan(alt)
                        }
                      }}
                      className="group flex cursor-pointer flex-col rounded-xl border border-border bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg"
                    >
                      <div className="mb-3 flex h-28 items-center justify-center rounded-lg bg-muted">
                        <CheckCircle2 className="h-8 w-8 text-secondary transition-transform group-hover:scale-105" />
                      </div>

                      <p className="text-xs font-medium text-primary">
                        {alt.brand}
                      </p>

                      <h3 className="mt-1 flex-1 text-sm font-semibold leading-snug text-card-foreground">
                        {alt.name}
                      </h3>

                      <p className="mt-1 text-sm font-bold text-card-foreground">
                        {alt.price}
                      </p>

                      <Button
                        type="button"
                        size="sm"
                        onClick={(event) => {
                          event.stopPropagation()

                          if (saved) {
                            unsaveProduct(altSlug)
                          } else {
                            saveProduct(alt)
                          }
                        }}
                        className={`mt-3 w-full gap-1.5 ${
                          saved
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : 'bg-primary text-primary-foreground hover:bg-primary/90'
                        }`}
                      >
                        {saved ? (
                          <BookmarkCheck className="h-3.5 w-3.5" />
                        ) : (
                          <Bookmark className="h-3.5 w-3.5" />
                        )}

                        {saved ? 'Saved' : 'Save Product'}
                      </Button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      <Dialog open={!!sourcesDialog} onOpenChange={(open) => { if (!open) setSourcesDialog(null) }}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-card-foreground flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Why is this flagged?
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              We have flagged <span className="font-semibold text-foreground">{sourcesDialog?.ingredient}</span> to conflict with your health condition based on the following sources:
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2 rounded-lg bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground mb-3">{sourcesDialog?.reason}</p>
            <ul className="flex flex-col gap-3">
              {sourcesDialog?.sources.map((source, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                  <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline underline-offset-2 hover:text-primary/80 transition-colors">
                    {source.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}