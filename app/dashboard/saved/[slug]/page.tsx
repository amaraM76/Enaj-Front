'use client'

import { useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { useEnaj } from '@/lib/enaj-context'
import { useProductScan } from '@/lib/use-product-scan'
import { ProductDetail, ProductDetailLoading, ProductDetailNotFound } from '@/components/product-detail'
import { categoryToSlug, isProductCategorySlug } from '@/lib/product-categories'

export default function SavedProductPage() {
  const params = useParams<{ slug: string }>()
  const searchParams = useSearchParams()
  const { profile } = useEnaj()

  // Saved products already carry their category from context; the ?category
  // query param (set when navigating from the Saved Items list) is a
  // same-request-cycle hint that avoids a flash of "not found" before
  // `profile` is available, but the lookup below is the source of truth.
  const savedProduct = profile?.savedProducts.find(
    (p) => ((p as { slug?: string }).slug || p.id) === params.slug
  )
  const categoryHint = searchParams.get('category')
  const category = savedProduct
    ? categoryToSlug(savedProduct.category)
    : isProductCategorySlug(categoryHint || '')
      ? (categoryHint as ReturnType<typeof categoryToSlug>)
      : 'all'

  const { result, loading, notFound } = useProductScan(category, params.slug)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [params.slug])

  if (loading) return <ProductDetailLoading />
  if (notFound || !result) return <ProductDetailNotFound backHref="/dashboard/saved" backLabel="Back to Saved Items" />

  return <ProductDetail result={result} backHref="/dashboard/saved" backLabel="Back to Saved Items" />
}
