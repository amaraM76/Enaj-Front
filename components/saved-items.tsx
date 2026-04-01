'use client'

import { useEnaj } from '@/lib/enaj-context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Bookmark,
  ExternalLink,
  ShoppingCart,
  PackageOpen,
  RefreshCw,
} from 'lucide-react'
import { useState } from 'react'

export function SavedItems() {
  const { profile, unsaveProduct, refreshSavedProducts } = useEnaj()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshSavedProducts()
    setIsRefreshing(false)
  }

  if (!profile) return null

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">
            Saved Items
          </h1>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-1.5"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        <p className="mt-1 text-muted-foreground">
          Products you have saved for later. All items have been verified
          against your profile.
        </p>
      </div>

      {profile.savedProducts.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-border py-16">
          <PackageOpen className="mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-lg font-medium text-foreground">
            No saved items yet
          </p>
          <p className="mt-1 max-w-sm text-center text-sm text-muted-foreground">
            When you scan products and find alternatives you like, save them
            here to shop later.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {profile.savedProducts.map((product) => (
            <div
              key={product.id}
              className="flex flex-col rounded-xl border border-border bg-card overflow-hidden"
            >
              <div className="flex h-36 items-center justify-center bg-muted">
                <ShoppingCart className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-primary">
                      {product.brand}
                    </p>
                    <h3 className="mt-1 text-sm font-semibold text-card-foreground leading-snug">
                      {product.name}
                    </h3>
                  </div>
                  <Bookmark className="h-4 w-4 flex-shrink-0 text-primary fill-primary" />
                </div>
                <p className="mt-2 text-sm font-bold text-card-foreground">
                  {product.price}
                </p>
                <Badge
                  variant="secondary"
                  className="mt-2 w-fit bg-muted text-muted-foreground text-xs"
                >
                  {product.category}
                </Badge>

                {/* Ingredients preview */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {product.ingredients.slice(0, 4).map((ing) => (
                    <span
                      key={ing}
                      className="rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground"
                    >
                      {ing}
                    </span>
                  ))}
                  {product.ingredients.length > 4 && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      +{product.ingredients.length - 4} more
                    </span>
                  )}
                </div>

                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5"
                    asChild
                  >
                    <a
                      href={product.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Shop
                    </a>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => unsaveProduct(product.slug || product.id)}
                    className="border-border text-destructive hover:bg-destructive/10 hover:text-destructive gap-1.5"
                  >
                    <Bookmark className="h-3.5 w-3.5" />
                    Unsave
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
