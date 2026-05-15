'use client'

import { useState } from 'react'
import { useClerk } from '@clerk/nextjs'
import { useEnaj } from '@/lib/enaj-context'
import { CloudBackground } from '@/components/cloud-background'
import { AilmentMonitor } from '@/components/ailment-monitor'
import { ProductScanner } from '@/components/product-scanner'
import { SavedItems } from '@/components/saved-items'
import { ProfileSettings } from '@/components/profile-settings'
import { Button } from '@/components/ui/button'
import { EnajLogo } from '@/components/enaj-logo'
import {
  ShoppingCart,
  Heart,
  Bookmark,
  Settings,
  Menu,
  X,
  LogOut,
  BookOpen,
  Sparkles,
} from 'lucide-react'
import Link from 'next/link'
import { HealthJournal } from '@/components/health-journal'

type DashboardTab = 'monitor' | 'journal' | 'scanner' | 'saved' | 'settings'

const NAV_ITEMS: { id: DashboardTab; label: string; icon: React.ReactNode }[] = [
  { id: 'monitor', label: 'My Health', icon: <Heart className="h-5 w-5" /> },
  { id: 'journal', label: 'Journal', icon: <Sparkles className="h-5 w-5" /> },
  { id: 'scanner', label: 'Shop', icon: <ShoppingCart className="h-5 w-5" /> },
  { id: 'saved', label: 'Saved Items', icon: <Bookmark className="h-5 w-5" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> },
]

export function Dashboard() {
  const { profile, setCurrentStep, logout } = useEnaj()
  const { signOut } = useClerk()
  const [activeTab, setActiveTab] = useState<DashboardTab>('monitor')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await signOut()
    logout()
  }

  if (!profile) return null

  return (
    <div className="relative flex min-h-screen flex-col" style={{ background: 'linear-gradient(170deg, #e0f7f6 0%, #c2ede8 20%, #b0e6d8 45%, #a8d5ba 70%, #c2ede8 100%)' }}>
      <CloudBackground />
      {/* Top Header */}
      <header className="relative z-10 flex items-center justify-between border-b border-border px-4 py-3 lg:px-8" style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center gap-3">
          <EnajLogo size="sm" />
          <div>
            <span className="text-lg font-bold text-foreground">enaj</span>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Welcome back, {profile.firstName || 'there'}
            </p>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab(item.id)}
              className={`gap-2 ${
                activeTab === item.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {item.icon}
              {item.label}
            </Button>
          ))}
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
              <Button
                key={item.id}
                variant={activeTab === item.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => {
                  setActiveTab(item.id)
                  setMobileMenuOpen(false)
                }}
                className={`justify-start gap-3 ${
                  activeTab === item.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.icon}
                {item.label}
              </Button>
            ))}
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
        <div className="mx-auto max-w-5xl">
          {activeTab === 'monitor' && <AilmentMonitor />}
          {activeTab === 'journal' && <HealthJournal />}
          {activeTab === 'scanner' && <ProductScanner />}
          {activeTab === 'saved' && <SavedItems />}
          {activeTab === 'settings' && <ProfileSettings />}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 flex border-t border-border bg-card md:hidden z-50">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs transition-colors ${
              activeTab === item.id ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      {/* Bottom spacer for mobile */}
      <div className="h-16 md:hidden" />
    </div>
  )
}
