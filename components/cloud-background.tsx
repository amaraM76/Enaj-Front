'use client'

import { useId } from 'react'

export function Cloud({ className, style, width = 200 }: {
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
        {/* Main cloud body */}
        <path
          d="M36 78C16 78 2 66 2 54C2 42 14 32 30 32C30 18 44 6 62 6C78 6 90 16 92 28C98 22 108 18 118 18C136 18 150 30 150 46C156 38 168 32 180 34C192 36 198 48 196 60C194 72 184 78 172 78Z"
          fill={`url(#${id}-main)`}
        />
        {/* Top highlight puff */}
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

export function CloudBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden" aria-hidden="true">
      {/* Cloud 1 - large, upper-left */}
      <Cloud
        className="animate-cloud-1"
        style={{ top: '4%', left: '-4%' }}
        width={280}
      />
      {/* Cloud 2 - medium, upper-right */}
      <Cloud
        className="animate-cloud-2"
        style={{ top: '10%', right: '0%' }}
        width={220}
      />
      {/* Cloud 3 - mid-left */}
      <Cloud
        className="animate-cloud-3"
        style={{ top: '30%', left: '2%' }}
        width={200}
      />
      {/* Cloud 4 - large, mid-right */}
      <Cloud
        className="animate-cloud-4"
        style={{ top: '38%', right: '-2%' }}
        width={260}
      />
      {/* Cloud 5 - lower-left */}
      <Cloud
        className="animate-cloud-5"
        style={{ top: '58%', left: '8%' }}
        width={180}
      />
      {/* Cloud 6 - lower-right */}
      <Cloud
        className="animate-cloud-6"
        style={{ top: '68%', right: '5%' }}
        width={240}
      />
      {/* Cloud 7 - top-center */}
      <Cloud
        className="animate-cloud-7"
        style={{ top: '6%', left: '38%' }}
        width={160}
      />
    </div>
  )
}
