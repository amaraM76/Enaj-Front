'use client'

import { useParams } from 'next/navigation'
import { ProductScanner } from '@/components/product-scanner'
import { isProductCategorySlug } from '@/lib/product-categories'

export default function ScannerCategoryPage() {
  const params = useParams<{ category: string }>()
  const category = isProductCategorySlug(params.category) ? params.category : 'all'
  return <ProductScanner category={category} />
}
