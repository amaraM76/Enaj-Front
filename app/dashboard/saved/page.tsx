'use client'

import { useRouter } from 'next/navigation'
import { SavedItems } from '@/components/saved-items'
import { categoryToSlug } from '@/lib/product-categories'
import type { Product } from '@/lib/enaj-data'

export default function SavedPage() {
  const router = useRouter()

  return (
    <SavedItems
      onOpenProduct={(product: Product & { slug?: string }) => {
        const slug = product.slug || product.id
        router.push(`/dashboard/saved/${slug}?category=${categoryToSlug(product.category)}`)
      }}
    />
  )
}
