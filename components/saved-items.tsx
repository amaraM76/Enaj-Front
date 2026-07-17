'use client'

import { useState } from 'react'
import { useEnaj } from '@/lib/enaj-context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Bookmark,
  ExternalLink,
  ShoppingCart,
  PackageOpen,
  RefreshCw,
  X,
} from 'lucide-react'
import type { Product } from '@/lib/enaj-data'

type SavedProduct = Product & {
  slug?: string
  source?: string
  savedSource?: string
}

export function SavedItems() {
  const { profile, unsaveProduct, refreshSavedProducts } = useEnaj()

  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedProduct, setSelectedProduct] =
    useState<SavedProduct | null>(null)

  const handleRefresh = async () => {
    setIsRefreshing(true)

    try {
      await refreshSavedProducts()
    } finally {
      setIsRefreshing(false)
    }
  }

  const getProductSlug = (product: SavedProduct) =>
    product.slug || product.id

  const hasExternalShopLink = (product: SavedProduct) => {
    const url = product.url?.trim()

    if (!url || url === '#') {
      return false
    }

    // Hide the Shop button for products saved from the enaJ marketplace.
    if (
      product.source === 'marketplace' ||
      product.savedSource === 'marketplace' ||
      product.savedSource === 'enaj'
    ) {
      return false
    }

    try {
      const hostname = new URL(url).hostname
        .replace(/^www\./, '')
        .toLowerCase()

      if (
        hostname === 'enajhealth.com' ||
        hostname.endsWith('.enajhealth.com')
      ) {
        return false
      }

      return true
    } catch {
      return false
    }
  }

  const handleUnsave = (
    product: SavedProduct,
    event?: React.MouseEvent
  ) => {
    event?.stopPropagation()

    unsaveProduct(getProductSlug(product))

    if (
      selectedProduct &&
      getProductSlug(selectedProduct) === getProductSlug(product)
    ) {
      setSelectedProduct(null)
    }
  }

  if (!profile) return null

  const savedProducts = profile.savedProducts as SavedProduct[]

  return (
    <>
      <Dialog
        open={Boolean(selectedProduct)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedProduct(null)
          }
        }}
      >
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto border-border bg-card">
          {selectedProduct && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-4 pr-6">
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
                    <ShoppingCart className="h-6 w-6 text-muted-foreground" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-primary">
                      {selectedProduct.brand}
                    </p>

                    <DialogTitle className="mt-1 text-left text-xl leading-snug text-card-foreground">
                      {selectedProduct.name}
                    </DialogTitle>

                    <DialogDescription className="mt-1 text-left">
                      Saved product details
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="mt-4 flex flex-col gap-5">
                <div className="flex flex-wrap items-center gap-2">
                  {selectedProduct.price && (
                    <p className="text-lg font-bold text-card-foreground">
                      {selectedProduct.price}
                    </p>
                  )}

                  {selectedProduct.category && (
                    <Badge
                      variant="secondary"
                      className="bg-muted text-muted-foreground"
                    >
                      {selectedProduct.category}
                    </Badge>
                  )}
                </div>

                <div>
                  <h3 className="mb-3 text-sm font-semibold text-foreground">
                    Ingredients
                  </h3>

                  {selectedProduct.ingredients.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.ingredients.map((ingredient) => (
                        <span
                          key={ingredient}
                          className="rounded-full bg-accent px-3 py-1 text-xs text-accent-foreground"
                        >
                          {ingredient}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No ingredient information is currently available.
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  {hasExternalShopLink(selectedProduct) && (
                    <Button
                      className="flex-1 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                      asChild
                    >
                      <a
                        href={selectedProduct.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                        View on Website
                      </a>
                    </Button>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleUnsave(selectedProduct)}
                    className={`gap-2 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive ${
                      hasExternalShopLink(selectedProduct)
                        ? ''
                        : 'w-full'
                    }`}
                  >
                    <Bookmark className="h-4 w-4" />
                    Unsave Product
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

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
              <RefreshCw
                className={`h-4 w-4 ${
                  isRefreshing ? 'animate-spin' : ''
                }`}
              />
              Refresh
            </Button>
          </div>

          <p className="mt-1 text-muted-foreground">
            Products you have saved for later. All items have been
            verified against your profile.
          </p>
        </div>

        {savedProducts.length === 0 ? (
          <div className="flex flex-col items-center rounded-xl border border-dashed border-border py-16">
            <PackageOpen className="mb-3 h-10 w-10 text-muted-foreground" />

            <p className="text-lg font-medium text-foreground">
              No saved items yet
            </p>

            <p className="mt-1 max-w-sm text-center text-sm text-muted-foreground">
              When you scan products and find alternatives you like,
              save them here to view later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {savedProducts.map((product) => {
              const showShopLink = hasExternalShopLink(product)

              return (
                <div
                  key={getProductSlug(product)}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedProduct(product)}
                  onKeyDown={(event) => {
                    if (
                      event.key === 'Enter' ||
                      event.key === ' '
                    ) {
                      event.preventDefault()
                      setSelectedProduct(product)
                    }
                  }}
                  className="group flex cursor-pointer flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <div className="flex h-36 items-center justify-center bg-muted">
                    <ShoppingCart className="h-8 w-8 text-muted-foreground transition-colors group-hover:text-primary" />
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-primary">
                          {product.brand}
                        </p>

                        <h3 className="mt-1 text-sm font-semibold leading-snug text-card-foreground">
                          {product.name}
                        </h3>
                      </div>

                      <Bookmark className="h-4 w-4 flex-shrink-0 fill-primary text-primary" />
                    </div>

                    {product.price && (
                      <p className="mt-2 text-sm font-bold text-card-foreground">
                        {product.price}
                      </p>
                    )}

                    {product.category && (
                      <Badge
                        variant="secondary"
                        className="mt-2 w-fit bg-muted text-xs text-muted-foreground"
                      >
                        {product.category}
                      </Badge>
                    )}

                    <div className="mt-3 flex flex-wrap gap-1">
                      {product.ingredients
                        .slice(0, 4)
                        .map((ingredient) => (
                          <span
                            key={ingredient}
                            className="rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground"
                          >
                            {ingredient}
                          </span>
                        ))}

                      {product.ingredients.length > 4 && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          +{product.ingredients.length - 4} more
                        </span>
                      )}
                    </div>

                    <div className="mt-auto flex gap-2 pt-4">
                      {showShopLink && (
                        <Button
                          size="sm"
                          className="flex-1 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
                          asChild
                          onClick={(event) =>
                            event.stopPropagation()
                          }
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
                      )}

                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={(event) =>
                          handleUnsave(product, event)
                        }
                        className={`gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive ${
                          showShopLink ? '' : 'w-full'
                        }`}
                      >
                        <X className="h-3.5 w-3.5" />
                        Unsave
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}