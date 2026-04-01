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
  Star,
} from 'lucide-react'
import Link from 'next/link'
import { useEnaj } from '@/lib/enaj-context'

type FilterCategory = 'all' | 'conditions' | 'preferences'

export function LearnCenter() {
  const { ailmentCategories, preferenceCategories, profile } = useEnaj()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<FilterCategory>('all')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true)
  }, [])

  // User selections - only after mount
  const myAilments = ready 
    ? new Set(profile?.selectedAilments.map((sa) => sa.ailment.id) ?? []) 
    : new Set<string>()
  const myPreferences = ready 
    ? new Set(profile?.selectedPreferences ?? []) 
    : new Set<string>()

  // Flatten data
  const ailmentList = ailmentCategories.flatMap((c) => 
    c.ailments.map((a) => ({ ...a, category: c.name }))
  )
  const preferenceList = preferenceCategories.flatMap((c) => 
    c.preferences.map((p) => ({ ...p, category: c.label }))
  )
  
  // Sort user selections first
  const sortedAilments = [...ailmentList].sort((a, b) => {
    if (myAilments.has(a.id) && !myAilments.has(b.id)) return -1
    if (!myAilments.has(a.id) && myAilments.has(b.id)) return 1
    return 0
  })

  const sortedPreferences = [...preferenceList].sort((a, b) => {
    if (myPreferences.has(a.id) && !myPreferences.has(b.id)) return -1
    if (!myPreferences.has(a.id) && myPreferences.has(b.id)) return 1
    return 0
  })

  // Filter by search and category
  const visibleAilments = sortedAilments.filter((item) => {
    if (filter === 'preferences') return false
    return query === '' ||
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      (item.description?.toLowerCase().includes(query.toLowerCase()) ?? false) ||
      item.flaggedIngredients.some((i) => i.name.toLowerCase().includes(query.toLowerCase()))
  })

  const visiblePreferences = sortedPreferences.filter((item) => {
    if (filter === 'conditions') return false
    return query === '' ||
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      (item.description?.toLowerCase().includes(query.toLowerCase()) ?? false)
  })

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
              <p className="text-sm text-muted-foreground">Learn about health conditions, dietary preferences, and ingredients to watch for</p>
            </div>
          </div>
        </div>

        {/* Search Box */}
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

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All Enaj Topics
          </Button>
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

        {/* Health Conditions */}
        {(filter === 'all' || filter === 'conditions') && visibleAilments.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Heart className="h-5 w-5 text-rose-500" />
              Health Conditions
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {visibleAilments.map((item) => {
                const isMine = myAilments.has(item.id)
                return (
                  <Link key={item.id} href={`/education/${item.id}`}>
                    <Card className={`cursor-pointer border-border bg-card/80 backdrop-blur-sm transition-all hover:shadow-md hover:border-primary/30 h-full ${isMine ? 'ring-2 ring-primary/50 border-primary/30' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-600">
                                <Heart className="h-3 w-3" />
                                {item.category}
                              </span>
                              {isMine && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                  <Star className="h-3 w-3" />
                                  Your Condition
                                </span>
                              )}
                            </div>
                            <h3 className="font-semibold text-card-foreground">{item.name}</h3>
                            {item.description && (
                              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{item.description}</p>
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
              })}
            </div>
          </div>
        )}

        {/* Preferences */}
        {(filter === 'all' || filter === 'preferences') && visiblePreferences.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Leaf className="h-5 w-5 text-emerald-500" />
              Preferences
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {visiblePreferences.map((item) => {
                const isMine = myPreferences.has(item.id)
                return (
                  <Link key={item.id} href={`/education/${item.id}`}>
                    <Card className={`cursor-pointer border-border bg-card/80 backdrop-blur-sm transition-all hover:shadow-md hover:border-primary/30 h-full ${isMine ? 'ring-2 ring-emerald-500/50 border-emerald-500/30' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-600">
                                <Leaf className="h-3 w-3" />
                                {item.category}
                              </span>
                              {isMine && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600">
                                  <Star className="h-3 w-3" />
                                  Your Preference
                                </span>
                              )}
                            </div>
                            <h3 className="font-semibold text-card-foreground">{item.name}</h3>
                            {item.description && (
                              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                            )}
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-2" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {visibleAilments.length === 0 && visiblePreferences.length === 0 && (
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
                Enaj is here to help you stay informed, but we are not your doctor. The information we provide is educational — designed to help you make choices that feel right for you. If you ever have health concerns or questions, your healthcare provider is the best resource.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
