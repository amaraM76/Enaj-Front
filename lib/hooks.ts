'use client'

import useSWR from 'swr'
import { api } from '@/lib/api'
import type { AilmentCategory, PreferenceCategory, Product } from '@/lib/enaj-data'

// -------------------------------------------------------------------
// Product category definitions (static, lightweight – kept client-side)
// -------------------------------------------------------------------

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

// -------------------------------------------------------------------
// SWR hooks
// -------------------------------------------------------------------

export function useAilmentCategories() {
  const { data, error, isLoading } = useSWR<AilmentCategory[]>(
    'ailment-categories',
    async () => {
      const res = await api.getAilments()
      return res.categories
    },
    { revalidateOnFocus: false, dedupingInterval: 60_000 }
  )
  return { ailmentCategories: data ?? [], isLoading, error }
}

export function usePreferenceCategories() {
  const { data, error, isLoading } = useSWR<PreferenceCategory[]>(
    'preference-categories',
    async () => {
      const res = await api.getPreferences()
      return res.categories
    },
    { revalidateOnFocus: false, dedupingInterval: 60_000 }
  )
  return { preferenceCategories: data ?? [], isLoading, error }
}

export function useProducts(category: string, userId?: string) {
  const { data, error, isLoading } = useSWR<Product[]>(
    ['products', category, userId],
    async () => {
      const res = await api.getProducts(category, userId)
      return res.products
    },
    { revalidateOnFocus: false, dedupingInterval: 30_000 }
  )
  return { products: data ?? [], isLoading, error }
}
