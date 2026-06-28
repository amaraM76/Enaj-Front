'use client'

import { EnajLogo } from '@/components/enaj-logo'
import { CloudBackground } from '@/components/cloud-background'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="relative min-h-screen" style={{ background: 'linear-gradient(170deg, #e0f7f6 0%, #c2ede8 20%, #b0e6d8 45%, #a8d5ba 70%, #c2ede8 100%)' }}>
      <CloudBackground />
      
      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 lg:px-12" style={{ background: 'rgba(255,255,255,0.45)', backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center gap-2">
          <EnajLogo size="md" />
          <span className="text-xl font-bold text-foreground tracking-tight">enaJ</span>
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
            <h1 className="text-3xl font-bold text-foreground mb-2">Terms of Service</h1>
            <p className="text-sm text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

            <div className="prose prose-sm max-w-none text-foreground">
              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  By accessing or using enaJ, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-3">2. Description of Service</h2>
                <p className="text-muted-foreground leading-relaxed">
                  enaJ is a health-focused shopping assistant that helps users identify ingredients in products that may conflict with their health conditions, allergies, or dietary preferences. Our service provides information for educational purposes only.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-3">3. User Accounts</h2>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  To use certain features of enaJ, you must create an account. You agree to:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>Provide accurate and complete information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Notify us immediately of any unauthorized access</li>
                  <li>Be responsible for all activities under your account</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-3">4. Acceptable Use</h2>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  You agree not to:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>Use the service for any unlawful purpose</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Interfere with or disrupt the service</li>
                  <li>Reproduce, duplicate, or resell any part of the service</li>
                  <li>Use automated systems to access the service without permission</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-3">5. Intellectual Property</h2>
                <p className="text-muted-foreground leading-relaxed">
                  All content, features, and functionality of enaJ are owned by us and are protected by copyright, trademark, and other intellectual property laws. You may not use our trademarks without prior written consent.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-3">6. Limitation of Liability</h2>
                <p className="text-muted-foreground leading-relaxed">
                  enaJ is provided &quot;as is&quot; without warranties of any kind. We shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the service. Our total liability shall not exceed the amount you paid us in the past 12 months.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-3">7. Termination</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may terminate or suspend your account at any time for any reason, including violation of these terms. Upon termination, your right to use the service will immediately cease.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-3">8. Changes to Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right to modify these terms at any time. We will notify you of significant changes by posting a notice on our website. Continued use of the service after changes constitutes acceptance of the new terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">9. Contact Us</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have any questions about these Terms of Service, please contact us at{' '}
                  <a href="mailto:hello@enajhealth.com" className="text-primary hover:text-primary/80">
                    hello@enajhealth.com
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
