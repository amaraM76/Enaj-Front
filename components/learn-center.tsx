'use client'
// Cache bust: 2026-03-18-v3

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Search,
  BookOpen,
  Heart,
  Leaf,
  ChevronRight,
  AlertCircle,
} from 'lucide-react'
import Link from 'next/link'
import { useEnaj } from '@/lib/enaj-context'

type FilterCategory = 'conditions' | 'preferences'

export function LearnCenter() {
  const { ailmentCategories, preferenceCategories, profile } = useEnaj()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<FilterCategory>('conditions')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true)
  }, [])

  const myAilments = ready
    ? new Set(profile?.selectedAilments.map((sa) => sa.ailment.id) ?? [])
    : new Set<string>()
  const myPreferences = ready
    ? new Set(profile?.selectedPreferences ?? [])
    : new Set<string>()

  const ailmentList = ailmentCategories.flatMap((c) =>
    c.ailments.map((a) => ({ ...a, category: c.name }))
  )
  const preferenceList = preferenceCategories.flatMap((c) =>
    c.preferences.map((p) => ({ ...p, category: c.label }))
  )

  const matchesQuery = (
    item: { name: string; description?: string | null },
    extraTerms: string[] = []
  ) => {
    if (query === '') return true
    const q = query.toLowerCase()
    return (
      item.name.toLowerCase().includes(q) ||
      (item.description?.toLowerCase().includes(q) ?? false) ||
      extraTerms.some((t) => t.toLowerCase().includes(q))
    )
  }

  // Ailments split
  const myVisibleAilments = ailmentList.filter(
    (item) =>
      myAilments.has(item.id) &&
      matchesQuery(item, item.flaggedIngredients.map((i) => i.name))
  )
  const otherVisibleAilments = ailmentList.filter(
    (item) =>
      !myAilments.has(item.id) &&
      matchesQuery(item, item.flaggedIngredients.map((i) => i.name))
  )

  // Preferences split
  const myVisiblePreferences = preferenceList.filter(
    (item) => myPreferences.has(item.id) && matchesQuery(item)
  )
  const otherVisiblePreferences = preferenceList.filter(
    (item) => !myPreferences.has(item.id) && matchesQuery(item)
  )

  const renderAilmentCard = (item: (typeof ailmentList)[0]) => (
    <Link key={item.id} href={`/education/${item.id}?from=conditions`}>
      <Card className="cursor-pointer border-border bg-card/80 backdrop-blur-sm transition-all hover:shadow-md hover:border-primary/30 h-full">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-600">
                  <Heart className="h-3 w-3" />
                  {item.category}
                </span>
              </div>
              <h3 className="font-semibold text-card-foreground">{item.name}</h3>
              {item.description && (
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {item.description}
                </p>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                {item.flaggedIngredients.length} ingredients monitored
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-2" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )

  const renderPreferenceCard = (item: (typeof preferenceList)[0]) => (
    <Link key={item.id} href={`/education/${item.id}?from=preferences`}>
      <Card className="cursor-pointer border-border bg-card/80 backdrop-blur-sm transition-all hover:shadow-md hover:border-emerald-500/30 h-full">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-600">
                  <Leaf className="h-3 w-3" />
                  {item.category}
                </span>
              </div>
              <h3 className="font-semibold text-card-foreground">{item.name}</h3>
              {item.description && (
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {item.description}
                </p>
              )}
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-2" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )

  const noResults =
    filter === 'conditions'
      ? myVisibleAilments.length === 0 && otherVisibleAilments.length === 0
      : myVisiblePreferences.length === 0 && otherVisiblePreferences.length === 0

  return (
    <div className="pb-8">
      <div className="mx-auto max-w-4xl">
        {/* Title */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Education Center</h1>
              <p className="text-sm text-muted-foreground">
                Learn about health conditions, dietary preferences, and ingredients to watch for
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search conditions, preferences, or ingredients..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 bg-card/80"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <Button
            variant={filter === 'conditions' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('conditions')}
            className="gap-1.5"
          >
            <Heart className="h-3.5 w-3.5" />
            Health Conditions
          </Button>
          <Button
            variant={filter === 'preferences' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('preferences')}
            className="gap-1.5"
          >
            <Leaf className="h-3.5 w-3.5" />
            Preferences
          </Button>
        </div>

        {/* ── HEALTH CONDITIONS TAB ── */}
        {filter === 'conditions' && (
          <div>
            {/* Your selected conditions */}
            {myVisibleAilments.length > 0 && (
              <div className="mb-8">
                <h2 className="text-base font-semibold text-foreground mb-4">
                  Your Selected Health Conditions
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {myVisibleAilments.map((item) => renderAilmentCard(item))}
                </div>
              </div>
            )}

            {/* Divider */}
            {myVisibleAilments.length > 0 && otherVisibleAilments.length > 0 && (
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-border" />
              </div>
            )}

            {/* All other conditions */}
            {otherVisibleAilments.length > 0 && (
              <div className="mb-8">
                <h2 className="text-base font-semibold text-foreground mb-4">
                  {myVisibleAilments.length > 0
                    ? 'All Other Enaj Health Conditions'
                    : 'All Enaj Health Conditions'}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {otherVisibleAilments.map((item) => renderAilmentCard(item))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── PREFERENCES TAB ── */}
        {filter === 'preferences' && (
          <div>
            {/* Your selected preferences */}
            {myVisiblePreferences.length > 0 && (
              <div className="mb-8">
                <h2 className="text-base font-semibold text-foreground mb-4">
                  Your Selected Preferences
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {myVisiblePreferences.map((item) => renderPreferenceCard(item))}
                </div>
              </div>
            )}

            {/* Divider */}
            {myVisiblePreferences.length > 0 && otherVisiblePreferences.length > 0 && (
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-border" />
              </div>
            )}

            {/* All other preferences */}
            {otherVisiblePreferences.length > 0 && (
              <div className="mb-8">
                <h2 className="text-base font-semibold text-foreground mb-4">
                  {myVisiblePreferences.length > 0
                    ? 'All Other Enaj Preferences'
                    : 'All Enaj Preferences'}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {otherVisiblePreferences.map((item) => renderPreferenceCard(item))}
                </div>
              </div>
            )}
          </div>
        )}

        {noResults && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No topics found matching your search.</p>
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-12 rounded-xl border border-muted bg-muted/30 p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">A Quick Reminder</p>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                Enaj is here to help you stay informed, but we are not your doctor. The information
                we provide is educational — designed to help you make choices that feel right for
                you. If you ever have health concerns or questions, your healthcare provider is the
                best resource.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}