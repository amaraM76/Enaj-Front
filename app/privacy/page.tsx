'use client'

import { EnajLogo } from '@/components/enaj-logo'
import { CloudBackground } from '@/components/cloud-background'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function PrivacyPage() {
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
            <h1 className="text-3xl font-bold text-foreground mb-2">Privacy Policy</h1>
            <p className="text-sm text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

            <div className="prose prose-sm max-w-none text-foreground">
              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-3">1. Information We Collect</h2>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  When you use Enaj, we collect information you provide directly to us, including:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>Account information (username, email, password)</li>
                  <li>Profile information (name, age, gender, location)</li>
                  <li>Health information (health conditions, dietary preferences, allergies)</li>
                  <li>Shopping preferences and saved products</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-3">2. How We Use Your Information</h2>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  We use the information we collect to:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Personalize your experience and product recommendations</li>
                  <li>Analyze ingredients against your health profile</li>
                  <li>Communicate with you about updates and features</li>
                  <li>Protect against fraud and unauthorized access</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-3">3. Information Sharing</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We do not sell, trade, or rent your personal information to third parties. We may share information only in the following circumstances: with your consent, to comply with legal obligations, or to protect our rights and safety.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-3">4. Data Security</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-3">5. Your Rights</h2>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  You have the right to:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>Access and update your personal information</li>
                  <li>Delete your account and associated data</li>
                  <li>Opt out of marketing communications</li>
                  <li>Request a copy of your data</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-3">6. Cookies and Tracking</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We use cookies and similar technologies to remember your preferences, understand how you use our services, and improve your experience. You can control cookie settings through your browser.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-3">7. Changes to This Policy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the &quot;Last updated&quot; date.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">8. Contact Us</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have any questions about this Privacy Policy, please contact us at{' '}
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
