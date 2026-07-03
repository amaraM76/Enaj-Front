'use client'

export function FlyingLogoWithBag() {
  return (
    <svg
      width={140}
      height={100}
      viewBox="0 0 160 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="animate-logo-float"
      aria-hidden="true"
    >
      {/* Left Wing feathers */}
      <path d="M56 45C50 39 36 22 18 10C14 7 8 8 10 13C13 22 24 36 44 48C50 51 55 49 56 46Z" fill="url(#wingGradFly)" opacity="0.6"/>
      <path d="M56 43C51 36 38 22 24 14C20 11 15 13 17 17C20 26 30 38 48 48C52 50 55 48 56 45Z" fill="url(#wingGradFly)" opacity="0.7"/>
      <path d="M57 41C53 33 42 22 30 16C25 14 21 16 23 20C26 28 36 40 52 48C56 49 57 47 57 44Z" fill="url(#wingGradFly)" opacity="0.85"/>
      <path d="M57 39C54 32 46 24 36 20C32 18 28 20 30 24C32 30 40 40 52 46C55 47 57 45 57 42Z" fill="url(#wingGradFly)" opacity="0.95"/>

      {/* Right Wing feathers */}
      <path d="M88 45C94 39 108 22 126 10C130 7 136 8 134 13C131 22 120 36 100 48C94 51 89 49 88 46Z" fill="url(#wingGradFly)" opacity="0.6"/>
      <path d="M88 43C93 36 106 22 120 14C124 11 129 13 127 17C124 26 114 38 96 48C92 50 89 48 88 45Z" fill="url(#wingGradFly)" opacity="0.7"/>
      <path d="M87 41C91 33 102 22 114 16C119 14 123 16 121 20C118 28 108 40 92 48C88 49 87 47 87 44Z" fill="url(#wingGradFly)" opacity="0.85"/>
      <path d="M87 39C90 32 98 24 108 20C112 18 116 20 114 24C112 30 104 40 92 46C89 47 87 45 87 42Z" fill="url(#wingGradFly)" opacity="0.95"/>

      {/* Main Shield Body */}
      <path d="M72 18L54 26V46C54 60 72 76 72 76C72 76 90 60 90 46V26L72 18Z" fill="url(#shieldGradFly)" stroke="url(#shieldStrokeFly)" strokeWidth="2"/>
      
      {/* Checkmark */}
      <path d="M64 46L69 52L80 40" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>

      {/* Gold Shopping Bag on Right Wing */}
      <g transform="translate(105, 28)">
        <rect x="0" y="10" width="28" height="30" rx="3" fill="url(#goldGradFly)"/>
        <path d="M6 10V6C6 2 10 0 14 0C18 0 22 2 22 6V10" stroke="#B8860B" strokeWidth="3" fill="none"/>
        <rect x="3" y="14" width="8" height="4" rx="1" fill="white" opacity="0.4"/>
      </g>

      <defs>
        <linearGradient id="wingGradFly" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0ABAB5"/>
          <stop offset="100%" stopColor="#A8D5BA"/>
        </linearGradient>
        <linearGradient id="shieldGradFly" x1="72" y1="18" x2="72" y2="76">
          <stop offset="0%" stopColor="#0ABAB5"/>
          <stop offset="100%" stopColor="#78C9A0"/>
        </linearGradient>
        <linearGradient id="shieldStrokeFly" x1="72" y1="18" x2="72" y2="76">
          <stop offset="0%" stopColor="#0ABAB5"/>
          <stop offset="100%" stopColor="#A8D5BA"/>
        </linearGradient>
        <linearGradient id="goldGradFly" x1="0" y1="0" x2="28" y2="40">
          <stop offset="0%" stopColor="#FFD700"/>
          <stop offset="50%" stopColor="#FFC107"/>
          <stop offset="100%" stopColor="#FFB300"/>
        </linearGradient>
      </defs>
    </svg>
  )
}
