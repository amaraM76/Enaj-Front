'use client'

import { Button } from '@/components/ui/button'
import { Heart, ArrowRight, Check, Sparkles, MousePointer2 } from 'lucide-react'
import { useId } from 'react'

// Inline Cloud component
function Cloud({ className, style, width = 200 }: {
  className?: string
  style?: React.CSSProperties
  width?: number
}) {
  const height = width * 0.5
  const reactId = useId()
  const id = `cg-${width}-${reactId.replace(/:/g, '')}`
  return (
    <div className={`absolute ${className || ''}`} style={style}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 200 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: 'blur(2px)' }}
      >
        <path
          d="M36 78C16 78 2 66 2 54C2 42 14 32 30 32C30 18 44 6 62 6C78 6 90 16 92 28C98 22 108 18 118 18C136 18 150 30 150 46C156 38 168 32 180 34C192 36 198 48 196 60C194 72 184 78 172 78Z"
          fill={`url(#${id}-main)`}
        />
        <path
          d="M50 78C32 78 18 68 18 58C18 48 28 40 42 40C44 28 56 18 70 18C82 18 92 26 94 36C100 32 108 28 118 30C130 32 140 42 138 54C136 66 126 72 116 74Z"
          fill={`url(#${id}-hi)`}
        />
        <defs>
          <radialGradient id={`${id}-main`} cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="60%" stopColor="#f0faf9" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#ddf3ef" stopOpacity="0.4" />
          </radialGradient>
          <radialGradient id={`${id}-hi`} cx="50%" cy="30%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#e6f7f6" stopOpacity="0.3" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  )
}

// Gold Shield Logo with Blue/White Wings
function PreviewLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const dimensions = {
    sm: { width: 32, height: 24 },
    md: { width: 48, height: 32 },
    lg: { width: 64, height: 44 },
    xl: { width: 96, height: 64 },
  }
  const d = dimensions[size]

  return (
    <svg width={d.width} height={d.height} viewBox="0 0 96 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Left Wing - Blue to White */}
      <path d="M36 30C32 26 22 14 10 6C7 4 3 5 4 8C6 14 14 24 28 32C32 34 35 33 36 31Z" fill="url(#wingGrad)" opacity="0.7"/>
      <path d="M37 28C34 22 27 14 18 10C15 9 12 10 13 13C15 18 22 26 32 31C35 32 36 31 37 29Z" fill="url(#wingGrad)" opacity="0.85"/>
      <path d="M37 27C35 22 30 16 23 13C20 12 18 13 19 15C20 19 26 26 33 30C35 31 37 30 37 28Z" fill="url(#wingGrad)" opacity="0.95"/>
      
      {/* Right Wing - Blue to White */}
      <path d="M60 30C64 26 74 14 86 6C89 4 93 5 92 8C90 14 82 24 68 32C64 34 61 33 60 31Z" fill="url(#wingGrad)" opacity="0.7"/>
      <path d="M59 28C62 22 69 14 78 10C81 9 84 10 83 13C81 18 74 26 64 31C61 32 60 31 59 29Z" fill="url(#wingGrad)" opacity="0.85"/>
      <path d="M59 27C61 22 66 16 73 13C76 12 78 13 77 15C76 19 70 26 63 30C61 31 59 30 59 28Z" fill="url(#wingGrad)" opacity="0.95"/>

      {/* Gold Shield */}
      <path d="M48 10L36 16V30C36 40 48 52 48 52C48 52 60 40 60 30V16L48 10Z" fill="url(#goldShield)" stroke="#B8860B" strokeWidth="1.5"/>
      
      {/* Blue Checkmark */}
      <path d="M43 31L46 35L54 26" stroke="#0504aa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>

      <defs>
        <linearGradient id="wingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0504aa"/>
          <stop offset="50%" stopColor="#4169E1"/>
          <stop offset="100%" stopColor="#ffffff"/>
        </linearGradient>
        <linearGradient id="goldShield" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#FFD700"/>
          <stop offset="50%" stopColor="#DAA520"/>
          <stop offset="100%" stopColor="#B8860B"/>
        </linearGradient>
      </defs>
    </svg>
  )
}

// Water/Glass text effect component
function WaterText({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span 
      className={`relative inline-block ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(5,4,170,0.9) 0%, rgba(65,105,225,0.7) 25%, rgba(135,206,250,0.8) 50%, rgba(65,105,225,0.7) 75%, rgba(5,4,170,0.9) 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        filter: 'drop-shadow(2px 4px 6px rgba(5,4,170,0.3))',
        textShadow: '0 0 30px rgba(135,206,250,0.5)',
      }}
    >
      {children}
    </span>
  )
}

export default function PreviewPage() {
  const features = [
    { icon: MousePointer2, title: 'Smart Selection', desc: 'AI-powered product matching' },
    { icon: Heart, title: 'Health First', desc: 'Personalized wellness recommendations' },
    { icon: Sparkles, title: 'Premium Quality', desc: 'Curated selection of top brands' },
  ]

  const steps = [
    { num: '01', title: 'Create Profile', desc: 'Tell us about your health goals' },
    { num: '02', title: 'Get Matched', desc: 'AI finds your perfect products' },
    { num: '03', title: 'Shop & Save', desc: 'Exclusive deals just for you' },
  ]

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: 'linear-gradient(180deg, #E6E6FA 0%, #B0C4DE 20%, #4169E1 50%, #0504aa 100%)' }}>
      {/* Floating Clouds */}
      <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
        <Cloud style={{ top: '4%', left: '-4%', animation: 'float1 20s ease-in-out infinite' }} width={280} />
        <Cloud style={{ top: '10%', right: '0%', animation: 'float2 25s ease-in-out infinite' }} width={220} />
        <Cloud style={{ top: '30%', left: '2%', animation: 'float3 22s ease-in-out infinite' }} width={200} />
        <Cloud style={{ top: '38%', right: '-2%', animation: 'float4 28s ease-in-out infinite' }} width={260} />
        <Cloud style={{ top: '58%', left: '8%', animation: 'float5 24s ease-in-out infinite' }} width={180} />
        <Cloud style={{ top: '6%', left: '38%', animation: 'float6 26s ease-in-out infinite' }} width={160} />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <PreviewLogo size="lg" />
            <span className="text-2xl font-bold text-white drop-shadow-lg">Enaj</span>
          </div>
          <Button variant="outline" className="border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20">
            Sign In
          </Button>
        </header>

        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center px-6 py-20 text-center">
          <div className="mb-6 animate-bounce">
            <PreviewLogo size="xl" />
          </div>
          <h1 className="mb-6 text-5xl font-bold md:text-7xl">
            <WaterText>Your Health,</WaterText>
            <br />
            <WaterText>Back in Your Hands</WaterText>
          </h1>
          <p className="mb-8 max-w-2xl text-lg text-white/90 drop-shadow-md md:text-xl">
            Discover personalized wellness products tailored to your unique health journey. 
            Shop smarter, live better.
          </p>
          <div className="flex gap-4">
            <Button size="lg" className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg hover:from-yellow-600 hover:to-yellow-700">
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20">
              Learn More
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-6 py-16">
          <h2 className="mb-12 text-center text-4xl font-bold">
            <WaterText>Shop with Confidence</WaterText>
          </h2>
          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            {features.map((feature, i) => (
              <div key={i} className="rounded-2xl border border-white/20 bg-white/10 p-6 text-center backdrop-blur-md">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600">
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-white">{feature.title}</h3>
                <p className="text-white/80">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="px-6 py-16">
          <h2 className="mb-12 text-center text-4xl font-bold">
            <WaterText>How Enaj Works</WaterText>
          </h2>
          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
            {steps.map((step, i) => (
              <div key={i} className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 text-2xl font-bold text-white shadow-lg">
                  {step.num}
                </div>
                <h3 className="mb-2 text-xl font-semibold text-white">{step.title}</h3>
                <p className="text-white/80">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-3xl rounded-3xl border border-white/20 bg-white/10 p-12 text-center backdrop-blur-md">
            <h2 className="mb-4 text-4xl font-bold">
              <WaterText>Ready to Transform Your Health?</WaterText>
            </h2>
            <p className="mb-8 text-lg text-white/90">
              Join thousands who have discovered a better way to shop for wellness.
            </p>
            <Button size="lg" className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg hover:from-yellow-600 hover:to-yellow-700">
              Create Your Profile <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 bg-[#030266] px-6 py-12">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <PreviewLogo size="md" />
              <span className="text-xl font-bold text-white">Enaj</span>
            </div>
            <div className="flex gap-6 text-sm text-white/70">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Contact</span>
            </div>
            <p className="text-sm text-white/50">&copy; 2026 Enaj Health. All rights reserved.</p>
          </div>
        </footer>
      </div>

      {/* Cloud animation keyframes */}
      <style jsx global>{`
        @keyframes float1 { 0%, 100% { transform: translateX(0) translateY(0); } 50% { transform: translateX(30px) translateY(-10px); } }
        @keyframes float2 { 0%, 100% { transform: translateX(0) translateY(0); } 50% { transform: translateX(-25px) translateY(15px); } }
        @keyframes float3 { 0%, 100% { transform: translateX(0) translateY(0); } 50% { transform: translateX(20px) translateY(-8px); } }
        @keyframes float4 { 0%, 100% { transform: translateX(0) translateY(0); } 50% { transform: translateX(-30px) translateY(12px); } }
        @keyframes float5 { 0%, 100% { transform: translateX(0) translateY(0); } 50% { transform: translateX(25px) translateY(-15px); } }
        @keyframes float6 { 0%, 100% { transform: translateX(0) translateY(0); } 50% { transform: translateX(-15px) translateY(10px); } }
      `}</style>
    </div>
  )
}
