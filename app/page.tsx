'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { EnajProvider, useEnaj } from '@/lib/enaj-context'
import { LandingPage } from '@/components/landing-page'
import { LoginPage } from '@/components/login-page'
import { Onboarding } from '@/components/onboarding'
import { Dashboard } from '@/components/dashboard'

function AppContent() {
  const { currentStep, isClerkLoaded } = useEnaj()

  // Show loading while Clerk initializes
  if (!isClerkLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  switch (currentStep) {
    case 'landing':
      return <LandingPage />
    case 'login':
      return <LoginPage />
    case 'onboarding':
      return <Onboarding />
    case 'dashboard':
      return <Dashboard />
    default:
      return <LandingPage />
  }
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
      <EnajProvider>
        <AppContent />
      </EnajProvider>
    </AccessGate>
  )
}
