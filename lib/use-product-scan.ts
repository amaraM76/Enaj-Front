'use client'

import { useEffect, useState } from 'react'
import { useEnaj } from '@/lib/enaj-context'
import { api } from '@/lib/api'
import type { Product } from '@/lib/enaj-data'
import type { ApiFlaggedIngredient } from '@/lib/scan-types'

export interface ProductScanResult {
  product: Product & { slug?: string }
  isRecommended: boolean
  flaggedIngredients: ApiFlaggedIngredient[]
  alternatives: (Product & { slug?: string })[]
}

// Shared by the two product-detail routes (shop grid -> product, and saved
// items -> product) so both fetch the scan the same way instead of forking
// this logic per route. The backend's scan endpoint ignores the `category`
// path segment entirely (it looks products up by slug alone), so this only
// strictly needs `slug` - `category` is passed through for a
// meaningful/shareable URL, not because the API requires it.
export function useProductScan(category: string, slug: string) {
  const { clerkUserId } = useEnaj()
  const [result, setResult] = useState<ProductScanResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug) {
      setLoading(false)
      setNotFound(true)
      return
    }
    let cancelled = false
    async function run() {
      setLoading(true)
      setNotFound(false)
      try {
        const res = await api.scanProduct(category, slug, clerkUserId || '')
        if (!cancelled) {
          setResult({
            product: res.product,
            isRecommended: res.isRecommended,
            flaggedIngredients: res.flaggedIngredients ?? [],
            alternatives: res.alternatives ?? [],
          })
        }
      } catch {
        if (!cancelled) {
          setResult(null)
          setNotFound(true)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [category, slug, clerkUserId])

  return { result, loading, notFound }
}
