'use client'

export function FlyingLogoWithBag({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <svg
        width={120}
        height={80}
        viewBox="0 0 120 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="animate-logo-float"
        aria-hidden="true"
      >
        {/* Left Wing feathers */}
        <path d="M36 30C32 26 22 14 10 6C7 4 3 5 4 8C6 14 14 24 28 32C32 34 35 33 36 31Z" fill="url(#flyingWingGrad)" opacity="0.6"/>
        <path d="M36 29C33 24 24 14 14 8C11 6 8 7 9 10C11 16 18 25 30 32C33 33 35 32 36 30Z" fill="url(#flyingWingGrad)" opacity="0.7"/>
        <path d="M37 28C34 22 27 14 18 10C15 9 12 10 13 13C15 18 22 26 32 31C35 32 36 31 37 29Z" fill="url(#flyingWingGrad)" opacity="0.85"/>
        <path d="M37 27C35 22 30 16 23 13C20 12 18 13 19 15C20 19 26 26 33 30C35 31 37 30 37 28Z" fill="url(#flyingWingGrad)" opacity="0.9"/>

        {/* Right Wing feathers */}
        <path d="M60 30C64 26 74 14 86 6C89 4 93 5 92 8C90 14 82 24 68 32C64 34 61 33 60 31Z" fill="url(#flyingWingGrad)" opacity="0.6"/>
        <path d="M60 29C63 24 72 14 82 8C85 6 88 7 87 10C85 16 78 25 66 32C63 33 61 32 60 30Z" fill="url(#flyingWingGrad)" opacity="0.7"/>
        <path d="M59 28C62 22 69 14 78 10C81 9 84 10 83 13C81 18 74 26 64 31C61 32 60 31 59 29Z" fill="url(#flyingWingGrad)" opacity="0.85"/>
        <path d="M59 27C61 22 66 16 73 13C76 12 78 13 77 15C76 19 70 26 63 30C61 31 59 30 59 28Z" fill="url(#flyingWingGrad)" opacity="0.9"/>

        {/* Shield */}
        <path d="M48 10L36 16V30C36 40 48 52 48 52C48 52 60 40 60 30V16L48 10Z" fill="url(#flyingShieldGrad)" stroke="url(#flyingShieldStroke)" strokeWidth="1.5"/>
        <path d="M43 31L46 35L54 26" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>

        {/* Shopping Bag on Right Wing */}
        <g transform="translate(70, 18)">
          {/* Bag body */}
          <rect x="0" y="8" width="20" height="22" rx="2" fill="#0ABAB5" opacity="0.9"/>
          {/* Bag handle */}
          <path d="M5 8V5C5 2 7 0 10 0C13 0 15 2 15 5V8" stroke="#0ABAB5" strokeWidth="2" fill="none"/>
          {/* Bag highlight */}
          <rect x="2" y="10" width="6" height="3" rx="1" fill="white" opacity="0.3"/>
        </g>

        <defs>
          <linearGradient id="flyingWingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0ABAB5"/>
            <stop offset="100%" stopColor="#A8D5BA"/>
          </linearGradient>
          <linearGradient id="flyingShieldGrad" x1="48" y1="10" x2="48" y2="52">
            <stop offset="0%" stopColor="#0ABAB5"/>
            <stop offset="100%" stopColor="#78C9A0"/>
          </linearGradient>
          <linearGradient id="flyingShieldStroke" x1="48" y1="10" x2="48" y2="52">
            <stop offset="0%" stopColor="#0ABAB5"/>
            <stop offset="100%" stopColor="#A8D5BA"/>
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}