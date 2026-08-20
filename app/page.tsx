'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useEnaj } from '@/lib/enaj-context'
import { LandingPage } from '@/components/landing-page'
import { LoginPage } from '@/components/login-page'

// This route now only ever needs to decide between landing/login for an
// anonymous visitor, and redirecting a signed-in one straight to their
// deep route - it no longer renders onboarding or the dashboard itself
// (those are real routes now, under /onboarding and /dashboard), so a
// refresh or back-navigation on those never passes through here.
function AppContent() {
  const { currentStep, isClerkLoaded, clerkUserId, profileLoaded } = useEnaj()
  const router = useRouter()

  useEffect(() => {
    if (currentStep === 'dashboard') {
      router.replace('/dashboard/monitor')
    } else if (currentStep === 'onboarding') {
      router.replace('/onboarding/welcome')
    }
  }, [currentStep, router])

  const redirecting = currentStep === 'dashboard' || currentStep === 'onboarding'

  if (!isClerkLoaded || (clerkUserId && !profileLoaded) || redirecting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return currentStep === 'login' ? <LoginPage /> : <LandingPage />
}

function AccessGate({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)

  useEffect(() => {
    const accessGranted = localStorage.getItem('enaj-access-granted')
    if (accessGranted === 'true') {
      setHasAccess(true)
    } else {
      setHasAccess(false)
      router.push('/access')
    }
  }, [router])

  if (hasAccess === null) {
    // Loading state
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!hasAccess) {
    return null
  }

  return <>{children}</>
}

export default function Home() {
  return (
    <AccessGate>
      <AppContent />
    </AccessGate>
  )
}
