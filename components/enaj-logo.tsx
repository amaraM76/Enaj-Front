export function EnajLogo({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string }) {
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
      {/* Left Angel Wing - Outer feather 1 (longest, outermost) */}
      <path
        d="M36 30C32 26 22 14 10 6C7 4 3 5 4 8C6 14 14 24 28 32C32 34 35 33 36 31Z"
        fill="url(#wingGradient)"
        opacity="0.6"
      />
      {/* Left Angel Wing - Outer feather 2 */}
      <path
        d="M36 29C33 24 24 14 14 8C11 6 8 7 9 10C11 16 18 25 30 32C33 33 35 32 36 30Z"
        fill="url(#wingGradient)"
        opacity="0.7"
      />
      {/* Left Angel Wing - Middle feather 3 */}
      <path
        d="M37 28C34 22 27 14 18 10C15 9 12 10 13 13C15 18 22 26 32 31C35 32 36 31 37 29Z"
        fill="url(#wingGradient)"
        opacity="0.85"
      />
      {/* Left Angel Wing - Inner feather 4 */}
      <path
        d="M37 27C35 22 30 16 23 13C20 12 18 13 19 15C20 19 26 26 33 30C35 31 37 30 37 28Z"
        fill="url(#wingGradient)"
        opacity="0.9"
      />
      {/* Left Angel Wing - Innermost feather 5 (shortest) */}
      <path
        d="M37 26C36 22 33 18 28 16C26 15 24 16 25 18C26 21 30 26 34 29C36 30 37 28 37 27Z"
        fill="url(#wingHighlight)"
        opacity="0.5"
      />
      {/* Left Wing highlight shimmer */}
      <path
        d="M36 29C33 23 25 14 16 9C14 8 12 9 13 11C14 16 20 25 31 31C34 32 36 31 36 30Z"
        fill="url(#wingHighlight)"
        opacity="0.3"
      />

      {/* Right Angel Wing - Outer feather 1 (longest, outermost) */}
      <path
        d="M60 30C64 26 74 14 86 6C89 4 93 5 92 8C90 14 82 24 68 32C64 34 61 33 60 31Z"
        fill="url(#wingGradient)"
        opacity="0.6"
      />
      {/* Right Angel Wing - Outer feather 2 */}
      <path
        d="M60 29C63 24 72 14 82 8C85 6 88 7 87 10C85 16 78 25 66 32C63 33 61 32 60 30Z"
        fill="url(#wingGradient)"
        opacity="0.7"
      />
      {/* Right Angel Wing - Middle feather 3 */}
      <path
        d="M59 28C62 22 69 14 78 10C81 9 84 10 83 13C81 18 74 26 64 31C61 32 60 31 59 29Z"
        fill="url(#wingGradient)"
        opacity="0.85"
      />
      {/* Right Angel Wing - Inner feather 4 */}
      <path
        d="M59 27C61 22 66 16 73 13C76 12 78 13 77 15C76 19 70 26 63 30C61 31 59 30 59 28Z"
        fill="url(#wingGradient)"
        opacity="0.9"
      />
      {/* Right Angel Wing - Innermost feather 5 (shortest) */}
      <path
        d="M59 26C60 22 63 18 68 16C70 15 72 16 71 18C70 21 66 26 62 29C60 30 59 28 59 27Z"
        fill="url(#wingHighlight)"
        opacity="0.5"
      />
      {/* Right Wing highlight shimmer */}
      <path
        d="M60 29C63 23 71 14 80 9C82 8 84 9 83 11C82 16 76 25 65 31C62 32 60 31 60 30Z"
        fill="url(#wingHighlight)"
        opacity="0.3"
      />

      {/* Shield */}
      <path
        d="M48 10L36 16V30C36 40 48 52 48 52C48 52 60 40 60 30V16L48 10Z"
        fill="url(#shieldGradient)"
        stroke="url(#shieldStroke)"
        strokeWidth="1.5"
      />

      {/* Shield checkmark */}
      <path
        d="M43 31L46 35L54 26"
        stroke="#0504aa"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      <defs>
        <linearGradient id="wingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0504aa" />
          <stop offset="50%" stopColor="#4169E1" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
        <linearGradient id="wingHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#87CEEB" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
        <linearGradient id="shieldGradient" x1="48" y1="10" x2="48" y2="52">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="50%" stopColor="#FFC107" />
          <stop offset="100%" stopColor="#DAA520" />
        </linearGradient>
        <linearGradient id="shieldStroke" x1="48" y1="10" x2="48" y2="52">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>
      </defs>
    </svg>
  )
}
