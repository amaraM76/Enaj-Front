'use client'

import { Button } from '@/components/ui/button'
import { Heart, ArrowRight, Check, Sparkles, MousePointer2, LogIn } from 'lucide-react'
import { CloudBackground } from '@/components/cloud-background'

// Preview Logo with Gold Shield and Blue/White Wings
function PreviewEnajLogo({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string }) {
  const dimensions = {
    sm: { width: 32, height: 24 },
    md: { width: 48, height: 32 },
    lg: { width: 64, height: 44 },
    xl: { width: 96, height: 64 },
  }

  const d = dimensions[size]

  return (
    <svg
      width={d.width}
      height={d.height}
      viewBox="0 0 96 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`animate-logo-float ${className}`}
      aria-hidden="true"
    >
      {/* Left Angel Wing - Blue/White gradient feathers */}
      <path d="M36 30C32 26 22 14 10 6C7 4 3 5 4 8C6 14 14 24 28 32C32 34 35 33 36 31Z" fill="url(#previewWingGradient)" opacity="0.6"/>
      <path d="M36 29C33 24 24 14 14 8C11 6 8 7 9 10C11 16 18 25 30 32C33 33 35 32 36 30Z" fill="url(#previewWingGradient)" opacity="0.7"/>
      <path d="M37 28C34 22 27 14 18 10C15 9 12 10 13 13C15 18 22 26 32 31C35 32 36 31 37 29Z" fill="url(#previewWingGradient)" opacity="0.85"/>
      <path d="M37 27C35 22 30 16 23 13C20 12 18 13 19 15C20 19 26 26 33 30C35 31 37 30 37 28Z" fill="url(#previewWingGradient)" opacity="0.9"/>
      <path d="M37 26C36 22 33 18 28 16C26 15 24 16 25 18C26 21 30 26 34 29C36 30 37 28 37 27Z" fill="url(#previewWingHighlight)" opacity="0.5"/>
      <path d="M36 29C33 23 25 14 16 9C14 8 12 9 13 11C14 16 20 25 31 31C34 32 36 31 36 30Z" fill="url(#previewWingHighlight)" opacity="0.3"/>

      {/* Right Angel Wing - Blue/White gradient feathers */}
      <path d="M60 30C64 26 74 14 86 6C89 4 93 5 92 8C90 14 82 24 68 32C64 34 61 33 60 31Z" fill="url(#previewWingGradient)" opacity="0.6"/>
      <path d="M60 29C63 24 72 14 82 8C85 6 88 7 87 10C85 16 78 25 66 32C63 33 61 32 60 30Z" fill="url(#previewWingGradient)" opacity="0.7"/>
      <path d="M59 28C62 22 69 14 78 10C81 9 84 10 83 13C81 18 74 26 64 31C61 32 60 31 59 29Z" fill="url(#previewWingGradient)" opacity="0.85"/>
      <path d="M59 27C61 22 66 16 73 13C76 12 78 13 77 15C76 19 70 26 63 30C61 31 59 30 59 28Z" fill="url(#previewWingGradient)" opacity="0.9"/>
      <path d="M59 26C60 22 63 18 68 16C70 15 72 16 71 18C70 21 66 26 62 29C60 30 59 28 59 27Z" fill="url(#previewWingHighlight)" opacity="0.5"/>
      <path d="M60 29C63 23 71 14 80 9C82 8 84 9 83 11C82 16 76 25 65 31C62 32 60 31 60 30Z" fill="url(#previewWingHighlight)" opacity="0.3"/>

      {/* Gold Shield */}
      <path d="M48 10L36 16V30C36 40 48 52 48 52C48 52 60 40 60 30V16L48 10Z" fill="url(#previewGoldShield)" stroke="url(#previewGoldStroke)" strokeWidth="1.5"/>
      
      {/* Shield checkmark in royal blue */}
      <path d="M43 31L46 35L54 26" stroke="#0504aa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>

      <defs>
        {/* Blue/White wing gradient */}
        <linearGradient id="previewWingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0504aa"/>
          <stop offset="40%" stopColor="#4169E1"/>
          <stop offset="100%" stopColor="#ffffff"/>
        </linearGradient>
        <linearGradient id="previewWingHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff"/>
          <stop offset="100%" stopColor="#B0C4DE"/>
        </linearGradient>
        {/* Gold shield gradient */}
        <linearGradient id="previewGoldShield" x1="48" y1="10" x2="48" y2="52">
          <stop offset="0%" stopColor="#FFD700"/>
          <stop offset="50%" stopColor="#FFC107"/>
          <stop offset="100%" stopColor="#DAA520"/>
        </linearGradient>
        <linearGradient id="previewGoldStroke" x1="48" y1="10" x2="48" y2="52">
          <stop offset="0%" stopColor="#FFD700"/>
          <stop offset="100%" stopColor="#B8860B"/>
        </linearGradient>
      </defs>
    </svg>
  )
}

// Preview Flying Logo with Gold Shield and Blue/White Wings
function PreviewFlyingLogoWithBag() {
  return (
    <svg
      width={140}
      height={100}
      viewBox="0 0 160 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="animate-float"
      aria-hidden="true"
    >
      {/* Left Wing feathers - Blue/White */}
      <path d="M56 45C50 39 36 22 18 10C14 7 8 8 10 13C13 22 24 36 44 48C50 51 55 49 56 46Z" fill="url(#previewFlyWing)" opacity="0.6"/>
      <path d="M56 43C51 36 38 22 24 14C20 11 15 13 17 17C20 26 30 38 48 48C52 50 55 48 56 45Z" fill="url(#previewFlyWing)" opacity="0.7"/>
      <path d="M57 41C53 33 42 22 30 16C25 14 21 16 23 20C26 28 36 40 52 48C56 49 57 47 57 44Z" fill="url(#previewFlyWing)" opacity="0.85"/>
      <path d="M57 39C54 32 46 24 36 20C32 18 28 20 30 24C32 30 40 40 52 46C55 47 57 45 57 42Z" fill="url(#previewFlyWing)" opacity="0.95"/>

      {/* Right Wing feathers - Blue/White */}
      <path d="M88 45C94 39 108 22 126 10C130 7 136 8 134 13C131 22 120 36 100 48C94 51 89 49 88 46Z" fill="url(#previewFlyWing)" opacity="0.6"/>
      <path d="M88 43C93 36 106 22 120 14C124 11 129 13 127 17C124 26 114 38 96 48C92 50 89 48 88 45Z" fill="url(#previewFlyWing)" opacity="0.7"/>
      <path d="M87 41C91 33 102 22 114 16C119 14 123 16 121 20C118 28 108 40 92 48C88 49 87 47 87 44Z" fill="url(#previewFlyWing)" opacity="0.85"/>
      <path d="M87 39C90 32 98 24 108 20C112 18 116 20 114 24C112 30 104 40 92 46C89 47 87 45 87 42Z" fill="url(#previewFlyWing)" opacity="0.95"/>

      {/* Gold Shield Body */}
      <path d="M72 18L54 26V46C54 60 72 76 72 76C72 76 90 60 90 46V26L72 18Z" fill="url(#previewFlyGold)" stroke="#B8860B" strokeWidth="2"/>
      
      {/* Checkmark in royal blue */}
      <path d="M64 46L69 52L80 40" stroke="#0504aa" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>

      {/* Gold Shopping Bag */}
      <g transform="translate(105, 28)">
        <rect x="0" y="10" width="28" height="30" rx="3" fill="url(#previewBagGold)"/>
        <path d="M6 10V6C6 2 10 0 14 0C18 0 22 2 22 6V10" stroke="#B8860B" strokeWidth="3" fill="none"/>
        <rect x="3" y="14" width="8" height="4" rx="1" fill="white" opacity="0.4"/>
      </g>

      <defs>
        <linearGradient id="previewFlyWing" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0504aa"/>
          <stop offset="40%" stopColor="#4169E1"/>
          <stop offset="100%" stopColor="#ffffff"/>
        </linearGradient>
        <linearGradient id="previewFlyGold" x1="72" y1="18" x2="72" y2="76">
          <stop offset="0%" stopColor="#FFD700"/>
          <stop offset="50%" stopColor="#FFC107"/>
          <stop offset="100%" stopColor="#DAA520"/>
        </linearGradient>
        <linearGradient id="previewBagGold" x1="0" y1="0" x2="28" y2="40">
          <stop offset="0%" stopColor="#FFD700"/>
          <stop offset="50%" stopColor="#FFC107"/>
          <stop offset="100%" stopColor="#FFB300"/>
        </linearGradient>
      </defs>
    </svg>
  )
}

// Water/Liquid text effect component
function WaterText({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span 
      className={`relative inline-block ${className}`}
      style={{
        background: 'linear-gradient(135deg, #87CEEB 0%, #00BFFF 15%, #1E90FF 30%, #0504aa 50%, #1E90FF 70%, #00BFFF 85%, #87CEEB 100%)',
        backgroundSize: '200% 200%',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
        textShadow: '0 2px 10px rgba(5,4,170,0.3), 0 0 40px rgba(30,144,255,0.2)',
        filter: 'drop-shadow(0 2px 4px rgba(5,4,170,0.2))',
        animation: 'waterShimmer 4s ease-in-out infinite',
      }}
    >
      {children}
    </span>
  )
}

export function LandingPagePreview({ onNavigate }: { onNavigate?: (step: string) => void }) {
  const handleNavigate = (step: string) => {
    if (onNavigate) {
      onNavigate(step)
    }
  }

  return (
    <div 
      className="relative min-h-screen" 
      style={{ 
        background: 'linear-gradient(170deg, #E8EDFF 0%, #B8C8FF 20%, #8AA2E8 45%, #5B7BD1 70%, #0504aa 100%)' 
      }}
    >
      {/* Add water shimmer animation */}
      <style jsx global>{`
        @keyframes waterShimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
      
      <CloudBackground />
      
      {/* Navigation */}
      <nav 
        className="relative z-10 flex items-center justify-between px-6 py-4 lg:px-12" 
        style={{ 
          background: 'rgba(255,255,255,0.35)', 
          backdropFilter: 'blur(12px)' 
        }}
      >
        <div className="flex items-center gap-2">
          <PreviewEnajLogo size="md" />
          <span className="text-xl font-bold tracking-tight" style={{ color: '#0504aa' }}>enaj</span>
        </div>
        <div className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm transition-colors" style={{ color: '#0504aa' }}>
            Features
          </a>
          <a href="#how-it-works" className="text-sm transition-colors" style={{ color: '#0504aa' }}>
            How It Works
          </a>
          <a href="#about" className="text-sm transition-colors" style={{ color: '#0504aa' }}>
            About
          </a>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => handleNavigate('login')}
            className="gap-2 border-[#0504aa] text-[#0504aa] hover:bg-[#0504aa]/10"
          >
            <LogIn className="h-4 w-4" />
            Login
          </Button>
          <Button
            onClick={() => handleNavigate('onboarding')}
            style={{ background: 'linear-gradient(135deg, #FFD700 0%, #FFC107 100%)', color: '#0504aa' }}
            className="font-semibold hover:opacity-90"
          >
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex flex-col items-center px-6 pt-16 pb-20 text-center lg:pt-24 lg:pb-32 overflow-hidden">
        <div 
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'linear-gradient(160deg, rgba(5,4,170,0.05) 0%, rgba(100,149,237,0.1) 40%, rgba(5,4,170,0.08) 70%, rgba(135,206,250,0.1) 100%)',
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col items-center">
          {/* Arched tagline */}
          <div className="mb-4 relative" style={{ width: '420px', height: '70px' }}>
            <svg viewBox="0 0 420 70" className="w-full h-full">
              <defs>
                <path id="archPathPreview" d="M 10,62 Q 210,2 410,62" fill="none" />
                <linearGradient id="archPreviewGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0504aa" />
                  <stop offset="50%" stopColor="#4169E1" />
                  <stop offset="100%" stopColor="#0504aa" />
                </linearGradient>
              </defs>
              <text
                className="font-sans"
                fill="url(#archPreviewGradient)"
                fontSize="16"
                fontWeight="700"
                letterSpacing="0.5"
              >
                <textPath href="#archPathPreview" startOffset="50%" textAnchor="middle">
                  Your Personal Guardian Angel for Shopping
                </textPath>
              </text>
            </svg>
          </div>

          {/* Hero Logo */}
          <div className="mb-6">
            <PreviewEnajLogo size="xl" />
          </div>

          {/* Water-effect headline */}
          <h1 className="mt-4 max-w-4xl text-4xl font-extrabold leading-tight tracking-tight md:text-6xl lg:text-7xl text-balance">
            <span style={{ color: '#1a1a2e' }}>Putting the Power of Shopping </span>
            <WaterText>Back in Your Hands</WaterText>
          </h1>
          
          <p className="mt-6 max-w-2xl text-lg leading-relaxed md:text-xl text-pretty" style={{ color: '#2a2a4a' }}>
            No more studying labels or analyzing ingredients.{' '}
            <span className="whitespace-nowrap">We do the work for you.</span>{' '}
            Enaj scans products on any shopping site in one click, or you can search directly on our platform.
          </p>
          
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <Button
              size="lg"
              onClick={() => handleNavigate('onboarding')}
              style={{ background: 'linear-gradient(135deg, #FFD700 0%, #FFC107 100%)', color: '#0504aa' }}
              className="px-8 py-6 text-lg gap-2 font-semibold hover:opacity-90"
            >
              Create Your Profile
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/50 text-white hover:bg-white/10 px-8 py-6 text-lg"
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
      <section id="features" className="relative z-10 px-6 py-20 lg:py-28" style={{ background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)' }}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold md:text-4xl text-balance">
              <WaterText>Shop with Confidence</WaterText>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-pretty" style={{ color: '#2a2a4a' }}>
              Enaj is your personal guardian angel, built around your unique health needs.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-white/30 p-8 transition-shadow hover:shadow-lg" style={{ background: 'rgba(255,255,255,0.7)' }}>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: 'rgba(5,4,170,0.1)' }}>
                <Heart className="h-6 w-6" style={{ color: '#0504aa' }} />
              </div>
              <h3 className="mb-2 text-lg font-semibold" style={{ color: '#0504aa' }}>Personalized Health Profile</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#3a3a5a' }}>
                Tell Enaj about your ailments, allergies, and dietary preferences. We will build a custom ingredient watchlist just for you.
              </p>
            </div>

            <div className="rounded-2xl border border-white/30 p-8 transition-shadow hover:shadow-lg" style={{ background: 'rgba(255,255,255,0.7)' }}>
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl relative" style={{ background: 'rgba(255,215,0,0.2)' }}>
                <PreviewEnajLogo size="sm" className="!animate-none" />
                <div className="absolute -bottom-1 -right-1">
                  <MousePointer2 className="h-5 w-5" style={{ color: '#0504aa' }} />
                </div>
              </div>
              <h3 className="mb-2 text-lg font-semibold" style={{ color: '#0504aa' }}>One-Click Product Analysis</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#3a3a5a' }}>
                No camera needed. Just tap the Enaj button while shopping online — we scan the ingredients and flag concerns instantly.
              </p>
            </div>

            <div className="rounded-2xl border border-white/30 p-8 transition-shadow hover:shadow-lg" style={{ background: 'rgba(255,255,255,0.7)' }}>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: 'rgba(5,4,170,0.1)' }}>
                <Sparkles className="h-6 w-6" style={{ color: '#FFD700' }} />
              </div>
              <h3 className="mb-2 text-lg font-semibold" style={{ color: '#0504aa' }}>Understand What You are Buying</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#3a3a5a' }}>
                When a product does not meet your needs, Enaj will alert you and educate you on why.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative z-10 px-6 py-20 lg:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold md:text-4xl text-balance">
              <WaterText>How Enaj Works</WaterText>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-pretty" style={{ color: '#ffffff' }}>
              Three simple steps to safer, smarter shopping.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              { step: '01', title: 'Build Your Profile', desc: 'Share your health conditions, allergies, and ingredient preferences.' },
              { step: '02', title: 'Install the Extension', desc: 'Download the Enaj browser extension. Just press one button and Enaj scans for you.' },
              { step: '03', title: 'Shop Smarter', desc: 'See which ingredients conflict with your health and get personalized alternatives.' },
            ].map((item) => (
              <div key={item.step} className="relative flex flex-col items-center text-center">
                <div
                  className="mb-4 flex h-16 w-16 items-center justify-center rounded-full text-[#0504aa] font-bold"
                  style={{ background: 'linear-gradient(135deg, #FFD700 0%, #FFC107 100%)' }}
                >
                  <span className="text-xl">{item.step}</span>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ailments Preview */}
      <section id="about" className="relative z-10 px-6 py-20 lg:py-28" style={{ background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)' }}>
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold md:text-4xl text-balance">
              <WaterText>Built for Real Health Needs</WaterText>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-pretty" style={{ color: '#2a2a4a' }}>
              Enaj supports a wide range of health conditions and dietary preferences such as...
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {[
              'Rosacea', 'Eczema', 'Celiac Disease', 'IBS', "Parkinson's", 'Dementia',
              "Alzheimer's", 'Epilepsy', 'Psoriasis', 'Acne', "Crohn's Disease", 'GERD',
              'Dairy Allergy', 'Nut Allergy', 'Soy Allergy', 'Lupus', "Hashimoto's",
            ].map((condition) => (
              <span
                key={condition}
                className="inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm"
                style={{ background: 'rgba(255,255,255,0.8)', borderColor: 'rgba(5,4,170,0.2)', color: '#0504aa' }}
              >
                <Check className="h-3.5 w-3.5" style={{ color: '#FFD700' }} />
                {condition}
              </span>
            ))}
            <p className="mt-6 text-center w-full" style={{ color: '#2a2a4a' }}>and many more.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative px-6 py-20 lg:py-28 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden" aria-hidden="true">
          <Cloud className="animate-cloud-1" style={{ top: '10%', left: '-5%' }} width={180} />
          <Cloud className="animate-cloud-2" style={{ top: '20%', right: '-3%' }} width={150} />
          <Cloud className="animate-cloud-3" style={{ top: '60%', left: '5%' }} width={120} />
          <Cloud className="animate-cloud-4" style={{ top: '50%', right: '0%' }} width={160} />
        </div>

        <div className="pointer-events-none absolute left-[8%] top-1/2 -translate-y-1/2 z-[1] hidden md:block" aria-hidden="true">
          <PreviewFlyingLogoWithBag />
        </div>
        <div className="pointer-events-none absolute right-[8%] top-1/2 -translate-y-1/2 z-[1] hidden md:block" aria-hidden="true">
          <PreviewFlyingLogoWithBag />
        </div>

        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-white md:text-4xl text-balance">
            <WaterText>Ready to Take Control?</WaterText>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty" style={{ color: 'rgba(255,255,255,0.9)' }}>
            Create your free profile and start shopping with confidence. Your health, your rules.
          </p>
          <Button
            size="lg"
            onClick={() => handleNavigate('onboarding')}
            style={{ background: 'linear-gradient(135deg, #FFD700 0%, #FFC107 100%)', color: '#0504aa' }}
            className="mt-8 px-10 py-6 text-lg gap-2 font-semibold hover:opacity-90"
          >
            Get Started Free
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/20 px-6 py-12" style={{ background: 'rgba(5,4,170,0.9)' }}>
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <PreviewEnajLogo size="sm" />
                <span className="text-sm font-semibold text-white">enaj</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Putting the power of shopping back in your hands.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Legal</h4>
              <ul className="space-y-2">
                <li><a href="/privacy" className="text-sm transition-colors" style={{ color: 'rgba(255,255,255,0.7)' }}>Privacy Policy</a></li>
                <li><a href="/terms" className="text-sm transition-colors" style={{ color: 'rgba(255,255,255,0.7)' }}>Terms of Service</a></li>
                <li><a href="/disclaimer" className="text-sm transition-colors" style={{ color: 'rgba(255,255,255,0.7)' }}>Disclaimer</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Support</h4>
              <ul className="space-y-2">
                <li><a href="mailto:enajhealth@gmail.com" className="text-sm transition-colors" style={{ color: 'rgba(255,255,255,0.7)' }}>Contact Us</a></li>
                <li><a href="#how-it-works" className="text-sm transition-colors" style={{ color: 'rgba(255,255,255,0.7)' }}>How It Works</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Get in Touch</h4>
              <p className="text-sm mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Questions or feedback?
              </p>
              <a href="mailto:enajhealth@gmail.com" className="text-sm font-medium" style={{ color: '#FFD700' }}>
                enajhealth@gmail.com
              </a>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-white/20 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
              &copy; {new Date().getFullYear()} Enaj. All rights reserved.
            </p>
            <p className="text-xs text-center max-w-xl" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Disclaimer: Enaj provides information for educational purposes only and is not a substitute for professional medical advice.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
