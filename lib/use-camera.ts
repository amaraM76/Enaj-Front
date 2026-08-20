'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

// Thin wrapper around getUserMedia shared by the barcode and OCR camera
// views on /scanner, so both get the same start/stop lifecycle and
// permission-error handling instead of each reimplementing it. Camera
// access is opt-in (start() is called explicitly, not on mount) and always
// torn down on unmount so navigating away or switching tabs releases the
// camera. A denied/unavailable camera surfaces as `error` instead of
// throwing, so callers can keep the rest of the page (e.g. the paste box)
// usable.
export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [active, setActive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setActive(false)
  }, [])

  const start = useCallback(async () => {
    if (streamRef.current) return
    setError(null)

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setError('Camera access is not available in this browser.')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play().catch(() => {})
      }
      setActive(true)
    } catch (err) {
      const name = err instanceof Error ? err.name : ''
      setError(
        name === 'NotAllowedError' || name === 'PermissionDeniedError'
          ? "Camera access was denied. You can allow it in your browser's site settings, or use the options below instead."
          : 'Could not access a camera on this device. You can still use the options below.'
      )
    }
  }, [])

  // Release the camera whenever this hook's owner unmounts (e.g. the tab
  // it's used in is switched away from and Radix unmounts the content).
  useEffect(() => stop, [stop])

  return { videoRef, active, error, start, stop }
}
