'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useEnaj } from '@/lib/enaj-context'
import type { Product } from '@/lib/enaj-data'
import type { ApiFlaggedIngredient } from '@/lib/scan-types'
import { categoryToSlug } from '@/lib/product-categories'
import { Button } from '@/components/ui/button'
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
  Heart,
  Leaf,
  Info,
  Package,
  BookOpen,
  X,
  NotebookPen,
} from 'lucide-react'

export interface ProductDetailResult {
  product: Product & { slug?: string }
  isRecommended: boolean
  flaggedIngredients: ApiFlaggedIngredient[]
  alternatives: (Product & { slug?: string })[]
}

// The scan-result view extracted out of product-scanner.tsx so it can be
// reused as its own route (/dashboard/scanner/[category]/[slug] and
// /dashboard/saved/[slug]) instead of being an in-place state swap with no
// URL of its own. "Back" and "open an alternative" now push real routes
// (grid -> productA -> productB), so the browser back button unwinds one
// step at a time instead of always dropping the user at the shop list.
export function ProductDetail({
  result,
  backHref,
  backLabel = 'Back to Products',
}: {
  result: ProductDetailResult
  backHref: string
  backLabel?: string
}) {
  const { saveProduct, unsaveProduct, isProductSaved } = useEnaj()
  const router = useRouter()
  const [sourcesDialog, setSourcesDialog] = useState<{
    ingredient: string
    reason: string
    sourceName: string
    sources: { title: string; url: string }[]
  } | null>(null)

  const getProductSlug = (product: Product & { slug?: string }) => product.slug || product.id

  return (
    <div className="flex flex-col gap-6">
      <Button variant="ghost" size="sm" onClick={() => router.push(backHref)} className="self-start text-muted-foreground hover:text-foreground gap-2">
        <X className="h-4 w-4" />
        {backLabel}
      </Button>

      <div className={`rounded-xl border-2 p-5 ${result.isRecommended ? 'border-secondary bg-secondary/10' : 'border-destructive/30 bg-destructive/5'}`}>
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
            <ShoppingCart className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-primary">{result.product.brand}</p>
            <h3 className="text-lg font-semibold text-foreground leading-snug">{result.product.name}</h3>
            <p className="text-sm font-bold text-foreground mt-0.5">{result.product.price}</p>
          </div>
        </div>

        <div className="mt-4">
          {(() => {
            const slug = getProductSlug(result.product)
            const saved = isProductSaved(slug)

            return (
              <Button
                onClick={() =>
                  saved
                    ? unsaveProduct(slug)
                    : saveProduct(result.product)
                }
                className={`gap-2 ${
                  saved
                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                }`}
              >
                {saved ? (
                  <BookmarkCheck className="h-4 w-4" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )}

                {saved ? 'Saved' : 'Save Product'}
              </Button>
            )
          })()}
        </div>

        <div className="mt-4">
          {result.isRecommended ? (
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
                <p className="text-sm text-muted-foreground">This product contains {result.flaggedIngredients.length} ingredient{result.flaggedIngredients.length !== 1 ? 's' : ''} that conflict with your profile.</p>
              </div>
            </div>
          )}
        </div>

        {(() => {
          const allergenFlags = result.flaggedIngredients.filter((fi) => fi.flaggedFrom === 'allergens')
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

        {result.flaggedIngredients.length > 0 && (
          <div className="mt-4 flex flex-col gap-3">
            <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <Info className="h-4 w-4 text-primary" />
              Why this product is flagged:
            </p>
            {result.flaggedIngredients.map((fi, idx) => (
              <div key={`${fi.ingredient}-${idx}`} className="rounded-lg border border-border bg-card p-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-destructive/10">
                    {fi.source === 'ailment' ? (
                      <Heart className="h-3.5 w-3.5 text-destructive" />
                    ) : fi.source === 'journal' ? (
                      <NotebookPen className="h-3.5 w-3.5 text-destructive" />
                    ) : fi.flaggedFrom === 'packaging' ? (
                      <Package className="h-3.5 w-3.5 text-destructive" />
                    ) : (
                      <Leaf className="h-3.5 w-3.5 text-destructive" />
                    )}
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
                      ) : fi.source === 'journal' ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
                          <NotebookPen className="h-3 w-3" />
                          Flagged by your journal entry: {fi.sourceName}
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
            {result.product.ingredients.map((ing) => {
              const isFlagged = result.flaggedIngredients.some((fi) => ing.toLowerCase().includes(fi.ingredient.toLowerCase()) || fi.ingredient.toLowerCase().includes(ing.toLowerCase()))
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

      {result.alternatives.length > 0 && !result.isRecommended && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Recommended Alternatives</h2>
          <p className="mt-2 mb-4 text-sm italic text-muted-foreground">
            Our enaJ angels are working hard to bring you an even bigger list of personalized recommendations soon.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {result.alternatives.map((alt) => {
              const altSlug = getProductSlug(alt)
              const saved = isProductSaved(altSlug)
              const altHref = `/dashboard/scanner/${categoryToSlug(alt.category)}/${altSlug}`

              return (
                <div
                  key={alt.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(altHref)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      router.push(altHref)
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

      <Dialog open={!!sourcesDialog} onOpenChange={(open) => { if (!open) setSourcesDialog(null) }}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-card-foreground flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Why is this flagged?
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Based on your journal entry, <span className="font-semibold text-foreground">{sourcesDialog?.ingredient}</span> may be contributing to your symptom according to the following sources:
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

export function ProductDetailLoading() {
  return (
    <div className="flex flex-col items-center rounded-xl border border-border bg-card py-16">
      <ShoppingCart className="mb-4 h-10 w-10 animate-pulse text-primary" />
      <p className="text-lg font-semibold text-card-foreground">Checking product...</p>
      <p className="mt-1 text-sm text-muted-foreground">Analyzing ingredients against your health profile</p>
    </div>
  )
}

export function ProductDetailNotFound({ backHref, backLabel = 'Back to Products' }: { backHref: string; backLabel?: string }) {
  return (
    <div className="flex flex-col gap-6">
      <Button variant="ghost" size="sm" asChild className="self-start text-muted-foreground hover:text-foreground gap-2">
        <a href={backHref}>
          <X className="h-4 w-4" />
          {backLabel}
        </a>
      </Button>
      <div className="flex flex-col items-center rounded-xl border border-dashed border-border py-16 text-center">
        <Badge variant="secondary" className="mb-3 bg-muted text-muted-foreground">Not found</Badge>
        <p className="text-lg font-medium text-foreground">We couldn&apos;t load this product</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">It may have been removed, or the link may be out of date.</p>
      </div>
    </div>
  )
}
