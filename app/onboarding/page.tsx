'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Bare /onboarding (no step segment) always means "start of the flow."
export default function OnboardingIndexPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/onboarding/welcome')
  }, [router])
  return null
}
