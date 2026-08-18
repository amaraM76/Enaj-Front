'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { ScanTextResponse } from '@/lib/api'
import { buildFlagReasonText } from '@/lib/preference-display'
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
  Heart,
  Leaf,
  Info,
  Package,
  BookOpen,
  NotebookPen,
  ClipboardList,
} from 'lucide-react'

// The result view for a raw-ingredients-text scan (pasted, or extracted
// via OCR) - POST /api/scan-text returns { ingredients, flaggedIngredients,
// isRecommended } with no `product`/`alternatives`, unlike
// ScanProductResponse. That shape doesn't fit components/product-detail.tsx's
// ProductDetailResult prop (which several existing routes depend on as-is),
// so this is a small, separate view that reuses the same flagged-ingredient
// card markup rather than reshaping ProductDetail's props to accommodate a
// case it was never meant to cover.
export function TextScanResult({
  result,
  title = 'Pasted Ingredients',
}: {
  result: ScanTextResponse
  title?: string
}) {
  const [sourcesDialog, setSourcesDialog] = useState<{
    ingredient: string
    reason: string
    sourceName: string
    sources: { title: string; url: string }[]
  } | null>(null)

  return (
    <div
      className={`rounded-xl border-2 p-5 ${
        result.isRecommended
          ? 'border-secondary bg-secondary/10'
          : 'border-destructive/30 bg-destructive/5'
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
          <ClipboardList className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-foreground leading-snug">{title}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            {result.ingredients.length} ingredient{result.ingredients.length !== 1 ? 's' : ''} checked against your health profile
          </p>
        </div>
      </div>

      <div className="mt-4">
        {result.isRecommended ? (
          <div className="flex items-center gap-2 rounded-lg bg-secondary/20 px-4 py-3">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-accent-foreground" />
            <div>
              <p className="font-semibold text-foreground">Recommended</p>
              <p className="text-sm text-muted-foreground">
                These ingredients don&apos;t contain anything that conflicts with your health profile or preferences.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-2 rounded-lg bg-destructive/10 px-4 py-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-destructive" />
            <div>
              <p className="font-semibold text-foreground">Not Recommended</p>
              <p className="text-sm text-muted-foreground">
                These ingredients contain {result.flaggedIngredients.length} ingredient
                {result.flaggedIngredients.length !== 1 ? 's' : ''} that conflict with your profile.
              </p>
            </div>
          </div>
        )}
      </div>

      {result.flaggedIngredients.length > 0 && (
        <div className="mt-4 flex flex-col gap-3">
          <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <Info className="h-4 w-4 text-primary" />
            Why this is flagged:
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
                  <p className="mt-0.5 text-sm text-muted-foreground">{buildFlagReasonText(fi)}</p>
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
                    {fi.sourceSlug && (
                      <Link
                        href={`/education/${fi.sourceSlug}?from=${fi.source === 'ailment' ? 'conditions' : 'preferences'}&highlight=${encodeURIComponent(fi.ingredient)}`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                      >
                        <BookOpen className="h-3 w-3" />
                        Learn why
                      </Link>
                    )}
                    {fi.sources && fi.sources.length > 0 && (
                      <button
                        onClick={() =>
                          setSourcesDialog({
                            ingredient: fi.ingredient,
                            reason: fi.reason,
                            sourceName: fi.sourceName,
                            sources: fi.sources!,
                          })
                        }
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

      {result.ingredients.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-sm font-semibold text-foreground">Full ingredient list:</p>
          <div className="flex flex-wrap gap-1.5">
            {result.ingredients.map((ing, idx) => {
              const isFlagged = result.flaggedIngredients.some(
                (fi) =>
                  ing.toLowerCase().includes(fi.ingredient.toLowerCase()) ||
                  fi.ingredient.toLowerCase().includes(ing.toLowerCase())
              )
              return (
                <span
                  key={`${ing}-${idx}`}
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs ${
                    isFlagged
                      ? 'bg-destructive/10 text-destructive font-medium'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isFlagged && <AlertTriangle className="h-3 w-3" />}
                  {ing}
                </span>
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
