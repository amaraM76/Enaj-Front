'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useEnaj } from '@/lib/enaj-context'
import { api } from '@/lib/api'
import { useCamera } from '@/lib/use-camera'
import { ProductDetail, type ProductDetailResult } from '@/components/product-detail'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  ScanLine,
  AlertTriangle,
  RotateCcw,
  Type,
  Loader2,
} from 'lucide-react'

// Minimal surface of the @zxing/library reader this component relies on -
// avoids importing its types at module scope (the module itself is only
// ever dynamically imported, so this stays load-bearing-free if the
// dependency isn't installed yet).
interface ZXingReader {
  decodeFromVideoElement(
    source: HTMLVideoElement,
    callback: (result: { getText(): string } | undefined, error: unknown) => void
  ): void
  reset(): void
}

type Status = 'scanning' | 'looking-up' | 'result' | 'not-found'

// The barcode tab of /scanner: point the camera at a product, decode the
// barcode continuously via @zxing/library, then run the exact
// lookup -> import -> scan sequence the browser extension and
// components/product-scanner.tsx's openProduct() already use. Unlike that
// grid flow, a match here is shown inline as component state rather than
// navigated to - there's no saved/shareable "this barcode" URL the way a
// catalog product slug has, so "scan another" just resets this state.
export function BarcodeScanTab({ onSwitchToIngredients }: { onSwitchToIngredients: () => void }) {
  const { clerkUserId } = useEnaj()
  const { videoRef, active: cameraActive, error: cameraError, start: startCamera, stop: stopCamera } = useCamera()
  const [status, setStatus] = useState<Status>('scanning')
  const [result, setResult] = useState<ProductDetailResult | null>(null)
  const [lookupError, setLookupError] = useState<string | null>(null)
  const [zxingUnavailable, setZxingUnavailable] = useState(false)

  const readerRef = useRef<ZXingReader | null>(null)
  const processingRef = useRef(false)

  useEffect(() => {
    startCamera()
    return () => stopCamera()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleDecoded = useCallback(
    async (barcodeText: string) => {
      if (processingRef.current) return
      processingRef.current = true
      setStatus('looking-up')
      setLookupError(null)

      try {
        const lookup = await api.lookupBarcode(barcodeText)
        const found = lookup?.product
        if (!found) {
          setStatus('not-found')
          return
        }

        const importRes = await api.importProduct({
          barcode: found.barcode || barcodeText,
          name: found.name,
          brand: found.brand,
          image: found.image || undefined,
          ingredients: found.ingredients,
          packaging: found.packaging,
          allergens: found.allergens,
          category: found.category,
        })

        const scanRes = await api.scanProduct(
          importRes.product.category,
          importRes.product.slug,
          clerkUserId || ''
        )

        setResult({
          product: scanRes.product,
          isRecommended: scanRes.isRecommended,
          flaggedIngredients: scanRes.flaggedIngredients ?? [],
          alternatives: scanRes.alternatives ?? [],
        })
        setStatus('result')
      } catch {
        // Covers both a genuine "not found" (the backend 404s, which the
        // shared request() helper turns into a thrown Error) and any other
        // lookup/import/scan failure - either way there's nothing to show
        // but a barcode-based result, so offer the OCR fallback.
        setStatus('not-found')
        setLookupError("We couldn't find that barcode in any product database.")
      } finally {
        processingRef.current = false
      }
    },
    [clerkUserId]
  )

  // Start continuous decoding once the camera stream is actually attached
  // to the video element. @zxing/library isn't a real dependency yet (see
  // package.json comment / PR notes) - this dynamic import is expected to
  // fail with a module-not-found error until `npm install` has run, in
  // which case the barcode tab still degrades to "camera preview only,
  // switch to Ingredients" rather than crashing the page.
  useEffect(() => {
    if (!cameraActive || status !== 'scanning') return
    let cancelled = false

    async function setup() {
      try {
        const zxing = await import('@zxing/library')
        if (cancelled || !videoRef.current) return
        const reader: ZXingReader = new zxing.BrowserMultiFormatReader()
        readerRef.current = reader
        reader.decodeFromVideoElement(videoRef.current, (result) => {
          if (result) handleDecoded(result.getText())
        })
      } catch {
        if (!cancelled) setZxingUnavailable(true)
      }
    }
    setup()

    return () => {
      cancelled = true
      readerRef.current?.reset()
      readerRef.current = null
    }
  }, [cameraActive, status, handleDecoded, videoRef])

  const scanAnother = useCallback(() => {
    setResult(null)
    setLookupError(null)
    setStatus('scanning')
    if (!cameraActive) startCamera()
  }, [cameraActive, startCamera])

  if (status === 'result' && result) {
    return (
      <ProductDetail
        result={result}
        backHref="/scanner"
        backLabel="Scan Another Product"
        onBack={scanAnother}
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-xl border-2 border-border bg-muted">
        <video ref={videoRef} className="h-full w-full object-cover" muted playsInline autoPlay />
        {cameraActive && status === 'scanning' && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-1/3 w-4/5 rounded-lg border-2 border-primary/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
          </div>
        )}
        {status === 'looking-up' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/80">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-foreground">Checking product...</p>
          </div>
        )}
        {!cameraActive && !cameraError && (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <ScanLine className="h-8 w-8 animate-pulse" />
            <p className="text-sm">Starting camera...</p>
          </div>
        )}
      </div>

      {cameraError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Camera unavailable</AlertTitle>
          <AlertDescription>{cameraError}</AlertDescription>
        </Alert>
      )}

      {zxingUnavailable && !cameraError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Barcode scanning unavailable</AlertTitle>
          <AlertDescription>
            The barcode scanner couldn&apos;t load. You can still check a product by scanning or pasting its ingredients.
          </AlertDescription>
        </Alert>
      )}

      {status === 'not-found' && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Barcode not found</AlertTitle>
          <AlertDescription>
            <p>{lookupError || "We couldn't find that product."}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" onClick={onSwitchToIngredients} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                <Type className="h-4 w-4" />
                Scan the ingredients label instead
              </Button>
              <Button size="sm" variant="outline" onClick={scanAnother} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Try another barcode
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {cameraActive && status === 'scanning' && !zxingUnavailable && (
        <p className="text-center text-sm text-muted-foreground">
          Point your camera at a product&apos;s barcode. It scans automatically.
        </p>
      )}
    </div>
  )
}
