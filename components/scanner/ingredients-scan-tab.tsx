'use client'

import { useCallback, useRef, useState, type ChangeEvent } from 'react'
import { useEnaj } from '@/lib/enaj-context'
import { api, type ScanTextResponse } from '@/lib/api'
import { useCamera } from '@/lib/use-camera'
import { TextScanResult } from './text-scan-result'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Camera,
  Upload,
  Loader2,
  AlertTriangle,
  ScanText as ScanTextIcon,
  RotateCcw,
} from 'lucide-react'

// The "can't find a barcode? scan or paste the ingredients" tab of
// /scanner. OCR's only job here is to turn a photo into text - once
// extracted it's appended into the same textarea/submit flow a manual
// paste uses, rather than being a second ingestion path into the backend.
export function IngredientsScanTab() {
  const { clerkUserId } = useEnaj()
  const { videoRef, active: cameraActive, error: cameraError, start: startCamera, stop: stopCamera } = useCamera()
  const [cameraOn, setCameraOn] = useState(false)
  const [ocrRunning, setOcrRunning] = useState(false)
  const [ocrError, setOcrError] = useState<string | null>(null)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [result, setResult] = useState<ScanTextResponse | null>(null)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const openCamera = useCallback(() => {
    setCameraOn(true)
    startCamera()
  }, [startCamera])

  const closeCamera = useCallback(() => {
    stopCamera()
    setCameraOn(false)
  }, [stopCamera])

  const runOcr = useCallback(async (imageDataUrl: string) => {
    setOcrRunning(true)
    setOcrError(null)
    try {
      // tesseract.js isn't a real dependency yet (see package.json comment
      // / PR notes) - this is expected to throw a module-not-found error
      // until `npm install` has actually run, which is caught below rather
      // than crashing the tab.
      const Tesseract = await import('tesseract.js')
      const { data } = await Tesseract.recognize(imageDataUrl, 'eng')
      const extracted = data.text.trim()
      if (extracted) {
        setText((prev) => (prev ? `${prev}\n${extracted}` : extracted))
      } else {
        setOcrError("We couldn't read any text from that photo. Try a clearer, closer shot of the label.")
      }
    } catch {
      setOcrError("Text recognition couldn't load or failed. You can still type the ingredients below.")
    } finally {
      setOcrRunning(false)
    }
  }, [])

  const captureFromCamera = useCallback(() => {
    const video = videoRef.current
    if (!video || !video.videoWidth) return
    const canvas = canvasRef.current ?? document.createElement('canvas')
    canvasRef.current = canvas
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92)
    closeCamera()
    runOcr(dataUrl)
  }, [videoRef, closeCamera, runOcr])

  const handleFileUpload = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      e.target.value = ''
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') runOcr(reader.result)
      }
      reader.readAsDataURL(file)
    },
    [runOcr]
  )

  const submitText = useCallback(async () => {
    const trimmed = text.trim()
    if (!trimmed || !clerkUserId) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const res = await api.scanText(clerkUserId, trimmed)
      setResult(res)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong scanning those ingredients.')
    } finally {
      setSubmitting(false)
    }
  }, [text, clerkUserId])

  const scanAnother = useCallback(() => {
    setResult(null)
    setSubmitError(null)
  }, [])

  if (result) {
    return (
      <div className="flex flex-col gap-4">
        <Button onClick={scanAnother} className="gap-2 self-start bg-primary text-primary-foreground hover:bg-primary/90">
          <RotateCcw className="h-4 w-4" />
          Check Another
        </Button>
        <TextScanResult result={result} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="mb-1 text-sm font-semibold text-foreground flex items-center gap-1.5">
          <Camera className="h-4 w-4 text-primary" />
          Scan the ingredients label
        </p>
        <p className="mb-3 text-xs text-muted-foreground">
          Can&apos;t find a barcode match? Take or upload a photo of the ingredients label and we&apos;ll read the text for you.
        </p>

        {cameraOn ? (
          <div className="flex flex-col gap-3">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-border bg-muted">
              <video ref={videoRef} className="h-full w-full object-cover" muted playsInline autoPlay />
            </div>
            {cameraError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{cameraError}</AlertDescription>
              </Alert>
            )}
            <div className="flex gap-2">
              <Button onClick={captureFromCamera} disabled={!cameraActive} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                <Camera className="h-4 w-4" />
                Capture Photo
              </Button>
              <Button variant="outline" onClick={closeCamera}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Button onClick={openCamera} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Camera className="h-4 w-4" />
              Take Photo
            </Button>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="gap-2">
              <Upload className="h-4 w-4" />
              Upload Photo
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        )}

        {ocrRunning && (
          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Reading ingredients from photo...
          </div>
        )}
        {ocrError && (
          <Alert variant="destructive" className="mt-3">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{ocrError}</AlertDescription>
          </Alert>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <p className="mb-3 text-sm font-semibold text-foreground flex items-center gap-1.5">
          <ScanTextIcon className="h-4 w-4 text-primary" />
          Or paste ingredients
        </p>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste ingredients here..."
          rows={6}
          className="bg-card"
        />
        {submitError && (
          <Alert variant="destructive" className="mt-3">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}
        <Button
          onClick={submitText}
          disabled={!text.trim() || submitting || !clerkUserId}
          className="mt-3 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanTextIcon className="h-4 w-4" />}
          Check Ingredients
        </Button>
      </div>
    </div>
  )
}
