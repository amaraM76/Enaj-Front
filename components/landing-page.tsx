'use client'

import { useEnaj } from '@/lib/enaj-context'
import { EnajLogo } from '@/components/enaj-logo'
import { Button } from '@/components/ui/button'
import { Heart, ArrowRight, Check, Sparkles, MousePointer2, LogIn } from 'lucide-react'
import { CloudBackground, Cloud, SunRayCloud, SectionClouds } from '@/components/cloud-background'
import { FlyingLogoWithBag } from '@/components/flying-logo-with-bag'

export function LandingPage() {
  const { setCurrentStep } = useEnaj()

  return (
    <div className="relative min-h-screen" style={{ background: 'linear-gradient(170deg, #e0f7f6 0%, #c2ede8 20%, #b0e6d8 45%, #a8d5ba 70%, #c2ede8 100%)' }}>
      <CloudBackground />
      {/* Navigation */}
      <nav className="relative z-10 flex items-center px-6 py-4 lg:px-12" style={{ background: 'rgba(255,255,255,0.45)', backdropFilter: 'blur(12px)' }}>
        <div className="flex flex-1 items-center gap-2">
          <EnajLogo size="md" />
          <span className="text-xl font-bold text-foreground tracking-tight">enaJ</span>
        </div>
        <div className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Features
          </a>
          <a href="#how-it-works" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            How It Works
          </a>
          <a href="#about" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            About
          </a>
          <a href="#our-story" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Our Story
          </a>
        </div>
        <div className="flex flex-1 items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => setCurrentStep('login')}
            className="gap-2"
          >
            <LogIn className="h-4 w-4" />
            Login
          </Button>
          <Button
            onClick={() => setCurrentStep('onboarding')}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero Section with Ombre Background */}
      <section className="relative flex flex-col items-center px-6 pt-16 pb-20 text-center lg:pt-24 lg:pb-32 overflow-hidden">
        {/* Ombre gradient overlay */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'linear-gradient(160deg, rgba(10,186,181,0.15) 0%, rgba(168,213,186,0.2) 40%, rgba(10,186,181,0.12) 70%, rgba(176,230,216,0.18) 100%)',
          }}
          aria-hidden="true"
        />

        {/* Stationary sun-ray clouds shining onto the hero from both sides */}
        <SunRayCloud
          side="left"
          width={240}
          className="hidden lg:block"
          style={{ top: '18%', left: '-2%' }}
        />
        <SunRayCloud
          side="right"
          width={240}
          className="hidden lg:block"
          style={{ top: '18%', right: '-2%' }}
        />

        <div className="relative z-10 flex flex-col items-center">
          {/* Arched tagline above the logo */}
          <div className="mb-4 relative" style={{ width: '420px', height: '70px' }}>
            <svg viewBox="0 0 420 70" className="w-full h-full">
              <defs>
                <path id="archPath" d="M 10,62 Q 210,2 410,62" fill="none" />
                <linearGradient id="archTextGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#078783" />
                  <stop offset="50%" stopColor="#3a9e96" />
                  <stop offset="100%" stopColor="#078783" />
                </linearGradient>
              </defs>
              <text
                className="font-sans"
                fill="url(#archTextGradient)"
                fontSize="16"
                fontWeight="700"
                letterSpacing="0.5"
              >
                <textPath href="#archPath" startOffset="50%" textAnchor="middle">
                  Your Personal Guardian Angel for Shopping
                </textPath>
              </text>
            </svg>
          </div>

          {/* Hero Logo - lowered with mt */}
          <div className="mb-6">
            <EnajLogo size="xl" />
          </div>

          <h1 className="mt-4 max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-foreground md:text-6xl lg:text-7xl text-balance">
            Putting the Power of Shopping{' '}
            <span className="bg-gradient-to-r from-[#0ABAB5] to-[#A8D5BA] bg-clip-text text-transparent">Back in Your Hands</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl text-pretty">
            No more studying labels or analyzing ingredients.{' '}
            <span className="whitespace-nowrap">We do the work for you.</span>{' '}
            enaJ scans products on any shopping site in one click, or you can search directly on our platform. We instantly analyze every ingredient, flag conflicts with your health, and suggest safer alternatives. Zero research. Zero effort.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <Button
              size="lg"
              onClick={() => setCurrentStep('onboarding')}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg gap-2"
            >
              Create Your Profile
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-border text-foreground hover:bg-accent px-8 py-6 text-lg"
              onClick={() => {
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              See How It Works
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-6 py-20 lg:py-28" style={{ background: 'rgba(240,249,246,0.45)' }}>
      <SectionClouds />
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-foreground md:text-4xl text-balance">
              Shop with Confidence
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground text-pretty">
              enaJ is your personal guardian angel, built around your unique health needs.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-8 transition-shadow hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-card-foreground">Personalized Health Profile</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Tell enaJ about your ailments, allergies, and dietary preferences. We will build a custom ingredient watchlist just for you. From there, our browser extension will have your back while you shop online.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-8 transition-shadow hover:shadow-lg">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-secondary/30 relative">
                {/* Shield with wings logo + mouse click icon with sparks */}
                <EnajLogo size="sm" className="!animate-none" />
                <div className="absolute -bottom-1 -right-1">
                  <MousePointer2 className="h-5 w-5 text-accent-foreground" />
                  {/* Click sparks */}
                  <svg className="absolute -top-2 -left-2 h-5 w-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <line x1="10" y1="2" x2="10" y2="0" stroke="#0ABAB5" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="14" y1="4" x2="16" y2="2" stroke="#0ABAB5" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="4" y1="6" x2="2" y2="4" stroke="#0ABAB5" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="15" y1="9" x2="18" y2="9" stroke="#A8D5BA" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="3" y1="10" x2="0" y2="10" stroke="#A8D5BA" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-card-foreground">One-Click Product Analysis</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                No camera needed. Just tap the enaJ button while shopping online — we scan the ingredients, check them against your profile, and flag concerns instantly.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-8 transition-shadow hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-card-foreground">Understand What You're Buying</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                When a product does not meet your needs, enaJ will alert you and educate you on why.
                <><br /> <em> COMING SOON: enaJ will suggest products that are better suited for your ailments and preferences. Every recommended product will be shoppable and saveable. </em> </>              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative z-10 px-6 py-20 lg:py-28">
      <SectionClouds />
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-foreground md:text-4xl text-balance">How enaJ Works</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground text-pretty">
              Three simple steps to smarter, personalized shopping.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Build Your Profile',
                desc: 'Share your health conditions, allergies, and ingredient preferences. Choose from dozens of ailments and dietary filters.',
              },
              {
                step: '02',
                title: 'Install the Extension',
                desc: 'Download the enaJ browser extension. While shopping on any website, just press one button and enaJ scans the product page for you.',
              },
              {
                step: '03',
                title: 'Shop Smarter',
                desc: 'See exactly which ingredients conflict with your health and why. Get personalized, shoppable product alternatives you can trust.',
              },
            ].map((item) => (
              <div key={item.step} className="relative flex flex-col items-center text-center">
                <div
                  className="mb-4 flex h-16 w-16 items-center justify-center rounded-full text-primary-foreground"
                  style={{ background: 'linear-gradient(135deg, #0ABAB5 0%, #A8D5BA 100%)' }}
                >
                  <span className="text-xl font-bold">{item.step}</span>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ailments Preview */}
      <section id="about" className="relative z-10 px-6 py-20 lg:py-28" style={{ background: 'rgba(240,249,246,0.45)' }}>
        <SectionClouds />
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-foreground md:text-4xl text-balance">
              Built for Real Health Needs
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground text-pretty">
              enaJ supports a wide range of health conditions and dietary preferences such as...
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {[
              'Rosacea', 'Eczema', 'Perioral Dermatitis', 'Celiac Disease', 'IBS', "Parkinson's", 'Dementia',
              "Alzheimer's", 'Epilepsy', 'Psoriasis', 'Acne', "Crohn's Disease", 'GERD',
              'Dairy Allergy', 'Nut Allergy', 'Soy Allergy', 'Lupus', "Hashimoto's",
              'Rheumatoid Arthritis', 'Asthma', 'Multiple Sclerosis', 'Chronic Migraines', 'ADHD', 'Fibromyalgia',
              'Anemia', 'Menopause', 'Perimenopause', 'Gastrectomy Surgery',
            ].map((condition) => (
              <span
                key={condition}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm text-card-foreground"
              >
                <Check className="h-3.5 w-3.5 text-primary" />
                {condition}
              </span>
            ))}
            <p className="mt-6 text-center text-muted-foreground">and many more.</p>
          </div>
        </div>
      </section>

      {/* Our Story / Team Section */}
      <section id="our-story" className="relative z-10 px-6 py-20 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-foreground md:text-4xl text-balance">
              The People Behind Enaj
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground text-pretty">
              A small team on a personal mission to make shopping safer for everyone.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Founders card */}
            <div className="overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-lg">
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <img
                  src="/images/team-founders.jpeg"
                  alt="Nicole and May, the founders of Enaj"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-8">
                <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  Our Founders
                </span>
                <h3 className="mt-4 text-xl font-semibold text-card-foreground">Nicole &amp; May</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Placeholder text — replace with your own words. Nicole and May came up with the
                  idea for Enaj and built it from the ground up. Share your background, what
                  brought you together, and the vision you have for empowering shoppers everywhere.
                </p>
              </div>
            </div>

            {/* Inspiration card */}
            <div className="overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-lg">
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <img
                  src="/images/team-inspiration.jpeg"
                  alt="Jane, Nicole's mother and the inspiration behind Enaj"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-8">
                <span className="inline-flex items-center rounded-full bg-secondary/30 px-3 py-1 text-xs font-semibold text-accent-foreground">
                  Our Why
                </span>
                <h3 className="mt-4 text-xl font-semibold text-card-foreground">Jane</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Placeholder text — replace with your own words. Jane, Nicole&apos;s mom, lives
                  with Parkinson&apos;s disease and is the reason Enaj exists. Share her story and
                  how her experience navigating ingredients and health needs inspired you to create
                  a smarter, safer way to shop.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative px-6 py-20 lg:py-28 overflow-hidden">
        {/* Clouds for CTA section */}
        <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden" aria-hidden="true">
          <Cloud className="animate-cloud-1" style={{ top: '10%', left: '-5%' }} width={180} />
          <Cloud className="animate-cloud-2" style={{ top: '20%', right: '-3%' }} width={150} />
          <Cloud className="animate-cloud-3" style={{ top: '60%', left: '5%' }} width={120} />
          <Cloud className="animate-cloud-4" style={{ top: '50%', right: '0%' }} width={160} />
        </div>
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(168,213,186,0.2) 0%, rgba(10,186,181,0.18) 50%, rgba(176,230,216,0.15) 100%)',
          }}
          aria-hidden="true"
        />
        <SectionClouds density='light' />
        {/* Flying Logo with Gold Bag */}
        <div className="pointer-events-none absolute left-[8%] top-1/2 -translate-y-1/2 z-[1] hidden md:block" aria-hidden="true">
          <FlyingLogoWithBag />
        </div>
        
        {/* Flying Logo with Gold Bag */}
        <div className="pointer-events-none absolute right-[8%] top-1/2 -translate-y-1/2 z-[1] hidden md:block" aria-hidden="true">
          <FlyingLogoWithBag />
        </div>
        <div className="relative z-10 mx-auto max-w-3xl text-center"></div>

        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-foreground md:text-4xl text-balance">
            Ready to Take Control?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground text-pretty">
            Start your free trial now. Create your profile and start shopping with confidence. Your health, your rules.
          </p>
          <Button
            size="lg"
            onClick={() => setCurrentStep('onboarding')}
            className="mt-8 bg-primary text-primary-foreground hover:bg-primary/90 px-10 py-6 text-lg gap-2"
          >
            Start Free Trial
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border px-6 py-12" style={{ background: 'rgba(240,249,246,0.5)' }}>
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <EnajLogo size="sm" />
                <span className="text-sm font-semibold text-foreground">enaJ</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Putting the power of shopping back in your hands.
              </p>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <a href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="/disclaimer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Disclaimer
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Support</h4>
              <ul className="space-y-2">
                <li>
                  <a href="mailto:hello@enajhealth.com" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="mailto:hello@enajhealth.com?subject=Bug%20Report" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Report a Bug
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    How It Works
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Get in Touch</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Questions or feedback? We would love to hear from you.
              </p>
              <a 
                href="mailto:hello@enajhealth.com" 
                className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
              >
                hello@enajhealth.com
              </a>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-10 pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} enaJ. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground text-center max-w-xl">
              Disclaimer: enaJ provides information for educational purposes only and is not a substitute for professional medical advice. Always consult with a healthcare provider before making health-related decisions.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
