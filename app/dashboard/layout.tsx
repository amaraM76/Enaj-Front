'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useClerk } from '@clerk/nextjs'
import { useEnaj } from '@/lib/enaj-context'
import { CloudBackground } from '@/components/cloud-background'
import { EnajLogo } from '@/components/enaj-logo'
import { Button } from '@/components/ui/button'
import {
  ShoppingCart,
  Heart,
  Bookmark,
  Settings,
  Menu,
  X,
  LogOut,
  BookOpen,
  NotebookPen,
  ScanLine,
} from 'lucide-react'
import Link from 'next/link'

const NAV_ITEMS = [
  { id: 'monitor', label: 'My Health', href: '/dashboard/monitor', icon: <Heart className="h-5 w-5" /> },
  { id: 'scanner', label: 'Shop', href: '/dashboard/scanner', icon: <ShoppingCart className="h-5 w-5" /> },
  { id: 'scan', label: 'Scanner', href: '/scanner', icon: <ScanLine className="h-5 w-5" /> },
  { id: 'saved', label: 'Saved Items', href: '/dashboard/saved', icon: <Bookmark className="h-5 w-5" /> },
  { id: 'settings', label: 'Settings', href: '/dashboard/settings', icon: <Settings className="h-5 w-5" /> },
] as const

// This layout persists across /dashboard/* navigation, so it - not each
// individual tab page - owns the nav chrome, the auth/profile-loading
// guard, and the active-tab highlight (derived from the URL via
// usePathname() instead of component state). A bookmark or refresh on any
// /dashboard/* route lands here directly; there's no longer a "flash the
// marketing homepage first" step for a signed-in user.
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile, logout, isClerkLoaded, clerkUserId, profileLoaded, currentStep } = useEnaj()
  const { signOut } = useClerk()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (isClerkLoaded && !clerkUserId) {
      router.replace('/')
    }
  }, [isClerkLoaded, clerkUserId, router])

  useEffect(() => {
    // A signed-in user who hasn't finished onboarding yet (e.g. a direct/
    // bookmarked link to /dashboard/*) gets sent to pick up onboarding
    // where they left off, instead of seeing a dashboard built on an
    // incomplete profile.
    if (profileLoaded && currentStep === 'onboarding') {
      router.replace('/onboarding/welcome')
    }
  }, [profileLoaded, currentStep, router])

  const handleLogout = async () => {
    await signOut()
    logout()
    router.replace('/')
  }

  const isActive = (href: string) => pathname === href || pathname?.startsWith(`${href}/`)

  if (!isClerkLoaded || !clerkUserId || !profileLoaded || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div
      className="relative flex min-h-screen flex-col"
      style={{ background: 'linear-gradient(170deg, #e0f7f6 0%, #c2ede8 20%, #b0e6d8 45%, #a8d5ba 70%, #c2ede8 100%)' }}
    >
      <CloudBackground />
      {/* Top Header */}
      <header className="relative z-10 flex items-center justify-between border-b border-border px-4 py-3 lg:px-8" style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center gap-3">
          <EnajLogo size="sm" />
          <div>
            <span className="text-lg font-bold text-foreground">enaJ</span>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Welcome, {profile.firstName || 'there'}
            </p>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link key={item.id} href={item.href}>
              <Button
                variant={isActive(item.href) ? 'default' : 'ghost'}
                size="sm"
                className={`gap-2 ${
                  isActive(item.href)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.icon}
                {item.label}
              </Button>
            </Link>
          ))}
          <Link href="/journal">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <NotebookPen className="h-5 w-5" />
              Journal
            </Button>
          </Link>
          <Link href="/education">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <BookOpen className="h-5 w-5" />
              Learn
            </Button>
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="hidden text-muted-foreground hover:text-foreground md:flex gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only">Log Out</span>
          </Button>

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="relative z-10 border-b border-border p-3 md:hidden" style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)' }}>
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <Link key={item.id} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant={isActive(item.href) ? 'default' : 'ghost'}
                  size="sm"
                  className={`w-full justify-start gap-3 ${
                    isActive(item.href)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Button>
              </Link>
            ))}
            <Link href="/journal" onClick={() => setMobileMenuOpen(false)}>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
              >
                <NotebookPen className="h-5 w-5" />
                Journal
              </Button>
            </Link>
            <Link href="/education" onClick={() => setMobileMenuOpen(false)}>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
              >
                <BookOpen className="h-5 w-5" />
                Learn
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="justify-start gap-3 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-5 w-5" />
              Log Out
            </Button>
          </nav>
        </div>
      )}

      {/* Content */}
      <main className="relative z-10 flex-1 px-4 py-6 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 flex border-t border-border bg-card md:hidden z-50">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs transition-colors ${
              isActive(item.href) ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
        <Link
          href="/journal"
          className="flex flex-1 flex-col items-center gap-1 py-3 text-xs text-muted-foreground"
        >
          <NotebookPen className="h-5 w-5" />
          <span>Journal</span>
        </Link>
        <Link
          href="/education"
          className="flex flex-1 flex-col items-center gap-1 py-3 text-xs text-muted-foreground"
        >
          <BookOpen className="h-5 w-5" />
          <span>Learn</span>
        </Link>
      </nav>

      {/* Bottom spacer for mobile */}
      <div className="h-16 md:hidden" />
    </div>
  )
}
