'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useProductScan } from '@/lib/use-product-scan'
import { ProductDetail, ProductDetailLoading, ProductDetailNotFound } from '@/components/product-detail'
import { isProductCategorySlug } from '@/lib/product-categories'

export default function ScannerProductPage() {
  const params = useParams<{ category: string; slug: string }>()
  const category = isProductCategorySlug(params.category) ? params.category : 'all'
  const { result, loading, notFound } = useProductScan(category, params.slug)
  const backHref = category === 'all' ? '/dashboard/scanner' : `/dashboard/scanner/${category}`

  // Opening a flagged product used to inherit whatever scroll position the
  // (often long) product grid was at, which is why it could visually land
  // near the bottom of the page. This is now a distinct route, so this only
  // has to guard the moment between navigation and the content swapping in.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [params.slug])

  if (loading) return <ProductDetailLoading />
  if (notFound || !result) return <ProductDetailNotFound backHref={backHref} />

  return <ProductDetail result={result} backHref={backHref} />
}
