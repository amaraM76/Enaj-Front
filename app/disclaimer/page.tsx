'use client'

import { EnajLogo } from '@/components/enaj-logo'
import { CloudBackground } from '@/components/cloud-background'
import { Button } from '@/components/ui/button'
import { ArrowLeft, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function DisclaimerPage() {
  return (
    <div className="relative min-h-screen" style={{ background: 'linear-gradient(170deg, #e0f7f6 0%, #c2ede8 20%, #b0e6d8 45%, #a8d5ba 70%, #c2ede8 100%)' }}>
      <CloudBackground />
      
      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 lg:px-12" style={{ background: 'rgba(255,255,255,0.45)', backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center gap-2">
          <EnajLogo size="md" />
          <span className="text-xl font-bold text-foreground tracking-tight">enaj</span>
        </div>
        <Link href="/">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </nav>

      {/* Content */}
      <main className="relative z-10 px-6 py-12 lg:py-16">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-border bg-card/90 backdrop-blur-sm p-8 md:p-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Disclaimer</h1>
                <p className="text-sm text-muted-foreground">Please read carefully before using Enaj</p>
              </div>
            </div>

            <div className="prose prose-sm max-w-none text-foreground">
              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-3">Not Medical Advice</h2>
                <p className="text-muted-foreground leading-relaxed">
                  The information provided by Enaj is for general educational and informational purposes only. It is not intended to be, and should not be construed as, medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition, dietary needs, or health concerns.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-3">No Guarantee of Accuracy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  While we strive to provide accurate and up-to-date information about ingredients and their potential effects, we cannot guarantee the completeness, accuracy, or reliability of any information on our platform. Product formulations may change, and ingredient information may vary by region, batch, or manufacturer.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-3">Individual Responses Vary</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Every individual is unique, and reactions to ingredients can vary significantly from person to person. An ingredient flagged by Enaj may not cause issues for you, and conversely, you may have sensitivities to ingredients that are not flagged. Our service is a tool to assist your research, not a replacement for personal testing and professional guidance.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-3">User Responsibility</h2>
                <p className="text-muted-foreground leading-relaxed">
                  You are solely responsible for your health decisions and product choices. Before using any product, especially if you have known health conditions, allergies, or are taking medications, consult with a healthcare professional. Always read product labels carefully and perform patch tests when appropriate.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-3">Limitation of Liability</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Enaj, its creators, and affiliates shall not be held liable for any damages, injuries, or adverse effects resulting from the use of information provided through our service. By using Enaj, you acknowledge and accept these limitations.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-3">Third-Party Products</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Enaj may provide information about third-party products. We are not responsible for the quality, safety, or efficacy of these products. Any purchases you make are transactions between you and the respective sellers.
                </p>
              </section>

              <section className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                <p className="text-amber-800 text-sm leading-relaxed">
                  <strong>Remember:</strong> Enaj is designed to empower you with information, but it is not a substitute for professional medical advice. When in doubt, always consult with a healthcare provider before making decisions that could affect your health.
                </p>
              </section>

              <section className="mt-8">
                <h2 className="text-xl font-semibold text-foreground mb-3">Questions?</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have any questions about this disclaimer, please contact us at{' '}
                  <a href="mailto:enajhealth@gmail.com" className="text-primary hover:text-primary/80">
                    enajhealth@gmail.com
                  </a>
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
