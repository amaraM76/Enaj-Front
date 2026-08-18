'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEnaj } from '@/lib/enaj-context'
import { CloudBackground } from '@/components/cloud-background'
import { EnajLogo } from '@/components/enaj-logo'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

// Own top-level chrome for /scanner - deliberately not nested under
// app/dashboard/layout.tsx (the user was explicit this needs its own page
// and header, not another dashboard tab). Header/background match the
// pattern already used by /journal and /education for visual consistency;
// the auth/profile-loading guard matches app/dashboard/layout.tsx's, since
// the scanner needs a real clerkUserId to look up/import/scan products and
// to call the new scan-text endpoint.
export default function ScannerLayout({ children }: { children: React.ReactNode }) {
  const { profile, isClerkLoaded, clerkUserId, profileLoaded } = useEnaj()
  const router = useRouter()

  useEffect(() => {
    if (isClerkLoaded && !clerkUserId) {
      router.replace('/')
    }
  }, [isClerkLoaded, clerkUserId, router])

  if (!isClerkLoaded || !clerkUserId || !profileLoaded || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div
      className="relative min-h-screen"
      style={{
        background:
          'linear-gradient(170deg, #e0f7f6 0%, #c2ede8 20%, #b0e6d8 45%, #a8d5ba 70%, #c2ede8 100%)',
      }}
    >
      <CloudBackground />

      <header
        className="relative z-10 flex items-center justify-between border-b border-border px-4 py-3 lg:px-8"
        style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)' }}
      >
        <Link href="/dashboard/monitor">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <EnajLogo size="sm" />
          <span className="text-lg font-bold text-foreground">enaJ</span>
        </div>
      </header>

      <main className="relative z-10 px-4 py-6 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-2xl">{children}</div>
      </main>
    </div>
  )
}
