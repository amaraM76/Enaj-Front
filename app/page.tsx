'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { EnajProvider, useEnaj } from '@/lib/enaj-context'
import { LandingPagePreview } from '@/components/landing-page-preview'
import { LoginPage } from '@/components/login-page'
import { Onboarding } from '@/components/onboarding'
import { Dashboard } from '@/components/dashboard'

function AppContent() {
  const { currentStep, setCurrentStep, isClerkLoaded, clerkUserId, profileLoaded } = useEnaj()

  // Show loading while Clerk initializes
  if (!isClerkLoaded || (clerkUserId && !profileLoaded)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  switch (currentStep) {
    case 'landing':
      return <LandingPagePreview onNavigate={(step) => setCurrentStep(step as 'landing' | 'login' | 'onboarding' | 'dashboard')} />
    case 'login':
      return <LoginPage />
    case 'onboarding':
      return <Onboarding />
    case 'dashboard':
      return <Dashboard />
    default:
      return <LandingPagePreview onNavigate={(step) => setCurrentStep(step as 'landing' | 'login' | 'onboarding' | 'dashboard')} />
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
  // Temporarily bypassing AccessGate for preview
  return (
    <EnajProvider>
      <AppContent />
    </EnajProvider>
  )
}
