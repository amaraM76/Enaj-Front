'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useEnaj } from '@/lib/enaj-context'

// A signed-in user whose profile is already complete (e.g. a stale
// bookmark to an onboarding step, or the "onboarding" step firing after
// they'd already finished a previous session) gets bounced to the
// dashboard instead of being stuck back in the onboarding form. Anonymous
// visitors are intentionally left alone here - the 'welcome' step itself
// renders the sign-up form for them.
export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const { currentStep, profileLoaded } = useEnaj()
  const router = useRouter()

  useEffect(() => {
    if (profileLoaded && currentStep === 'dashboard') {
      router.replace('/dashboard/monitor')
    }
  }, [profileLoaded, currentStep, router])

  return <>{children}</>
}
