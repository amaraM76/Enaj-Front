'use client'

import { Suspense } from 'react'
import { CloudBackground } from '@/components/cloud-background'
import { Education } from '@/components/education'
import { EnajLogo } from '@/components/enaj-logo'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { EnajProvider } from '@/lib/enaj-context'

export default function EducationPage() {
  return (
    <EnajProvider>
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
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <EnajLogo size="sm" />
            <span className="text-lg font-bold text-foreground">enaj</span>
          </div>
        </header>

        <main className="relative z-10 px-4 py-6 lg:px-8 lg:py-8">
          <Suspense fallback={null}>
            <Education />
          </Suspense>
        </main>
      </div>
    </EnajProvider>
  )
}