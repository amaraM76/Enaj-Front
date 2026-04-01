'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { CloudBackground } from '@/components/cloud-background'
import { EnajLogo } from '@/components/enaj-logo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Heart, Leaf, AlertTriangle, ExternalLink, Loader2, AlertCircle, Info, MapPin } from 'lucide-react'
import Link from 'next/link'
import { api } from '@/lib/api'
import type { Ailment, FlaggedIngredient } from '@/lib/enaj-data'
import { getPreferenceEducation } from '@/lib/preference-education'
import { getAilmentEducation } from '@/lib/ailment-education'

interface Preference {
  id: string
  name: string
  description?: string
  whatItIs?: string
  commonlyFoundIn?: string[]
  whyPeopleAvoid?: string
  sources?: { title: string; url: string }[]
  flaggedIngredients?: Array<{
    id: string
    name: string
    reason?: string
    sources?: { title: string; url: string }[]
  }>
}

export default function EducationDetailPage() {
  const params = useParams()
  const slug = params.slug as string

  const [ailment, setAilment] = useState<Ailment | null>(null)
  const [preference, setPreference] = useState<Preference | null>(null)
  const [loading, setLoading] = useState(true)
  const [type, setType] = useState<'ailment' | 'preference' | null>(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        // Try to find as ailment first
        const ailmentRes = await api.getAilments()
        const allAilments = ailmentRes.categories.flatMap((c) => c.ailments)
        const foundAilment = allAilments.find((a) => a.id === slug)

        if (foundAilment) {
          setAilment(foundAilment)
          setType('ailment')
          setLoading(false)
          return
        }

        // Try to find as preference
        const prefRes = await api.getPreferences()
        const allPrefs = prefRes.categories.flatMap((c) => c.preferences)
        const foundPref = allPrefs.find((p) => p.id === slug)

        if (foundPref) {
          // Get education content from local hardcoded data (preference-education.ts)
          const educationContent = getPreferenceEducation(slug)
          
          // Use preference info from database but education content from local file
          setPreference({
            ...(foundPref as Preference),
            whatItIs: educationContent?.whatItIs,
            commonlyFoundIn: educationContent?.commonlyFoundIn,
            whyPeopleAvoid: educationContent?.whyPeopleAvoid,
            sources: educationContent?.sources,
          })
          setType('preference')
        }
      } catch (err) {
        console.error('Failed to fetch education data:', err)
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchData()
    }
  }, [slug])

  if (loading) {
    return (
      <div
        className="relative min-h-screen flex items-center justify-center"
        style={{
          background:
            'linear-gradient(170deg, #e0f7f6 0%, #c2ede8 20%, #b0e6d8 45%, #a8d5ba 70%, #c2ede8 100%)',
        }}
      >
        <CloudBackground />
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!ailment && !preference) {
    return (
      <div
        className="relative min-h-screen"
        style={{
          background:
            'linear-gradient(170deg, #e0f7f6 0%, #c2ede8 20%, #b0e6d8 45%, #a8d5ba 70%, #c2ede8 100%)',
        }}
      >
        <CloudBackground />
        <header
          className="relative z-10 flex items-center justify-between border-b border-border px-4 py-3 lg:px-8"
          style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)' }}
        >
          <div className="flex items-center gap-3">
            <EnajLogo size="sm" />
            <span className="text-lg font-bold text-foreground">enaj</span>
          </div>
          <Link href="/education">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back to Learn
            </Button>
          </Link>
        </header>
        <main className="relative z-10 px-4 py-12 lg:px-8 text-center">
          <p className="text-muted-foreground">Topic not found.</p>
          <Link href="/education">
            <Button variant="outline" className="mt-4">
              Back to Education Center
            </Button>
          </Link>
        </main>
      </div>
    )
  }

  return (
    <div
      className="relative min-h-screen"
      style={{
        background:
          'linear-gradient(170deg, #e0f7f6 0%, #c2ede8 20%, #b0e6d8 45%, #a8d5ba 70%, #c2ede8 100%)',
      }}
    >
      <CloudBackground />

      <header
        className="relative z-10 flex items-center justify-between border-b border-border px-4 py-3 lg:px-8"
        style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)' }}
      >
        <div className="flex items-center gap-3">
          <EnajLogo size="sm" />
          <span className="text-lg font-bold text-foreground">enaj</span>
        </div>
        <Link href="/education">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Learn
          </Button>
        </Link>
      </header>

      <main className="relative z-10 px-4 py-6 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-3xl">
          {type === 'ailment' && ailment && (() => {
            // Get local education data for this ailment
            const ailmentEducation = getAilmentEducation(slug)
            const generalSources = ailment.sources?.length ? ailment.sources : ailmentEducation?.generalSources || []

            return (
              <Card className="border-border bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-600">
                      <Heart className="h-3 w-3" />
                      Health Condition
                    </span>
                  </div>
                  <CardTitle className="text-2xl">{ailment.name}</CardTitle>
                  {(ailment.description || ailmentEducation?.description) && (
                    <p className="text-muted-foreground">{ailment.description || ailmentEducation?.description}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-6">
                  {ailment.longDescription && (
                    <div className="prose prose-sm max-w-none text-card-foreground">
                      {ailment.longDescription.split('\n\n').map((paragraph, idx) => (
                        <p key={idx} className="mb-4 leading-relaxed">{paragraph}</p>
                      ))}
                    </div>
                  )}

                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      Ingredients to Watch For ({ailment.flaggedIngredients.length})
                    </p>
                    <div className="space-y-3">
                      {ailment.flaggedIngredients.map((ing: FlaggedIngredient) => {
                        // Get local education data for this ingredient
                        const localIngredientInfo = ailmentEducation?.ingredientInfo?.[ing.name]
                        const ingredientSources = ing.sources?.length ? ing.sources : localIngredientInfo?.sources || []
                        const ingredientReason = ing.reason || localIngredientInfo?.reason

                        return (
                          <div
                            key={ing.id}
                            className="rounded-lg bg-background p-3 border border-border"
                          >
                            <p className="font-medium text-card-foreground">{ing.name}</p>
                            {ingredientReason && (
                              <p className="text-sm text-muted-foreground mt-1">{ingredientReason}</p>
                            )}
                            {ingredientSources.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {ingredientSources.map((source, idx) => (
                                  <a
                                    key={idx}
                                    href={source.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    {source.title}
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {generalSources.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-foreground mb-3">Sources & Further Reading:</p>
                      <div className="space-y-2">
                        {generalSources.map((source, idx) => (
                          <a
                            key={idx}
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-primary hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            {source.title}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })()}

          {type === 'preference' && preference && (
            <Card className="border-border bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-600">
                    <Leaf className="h-3 w-3" />
                    Preference
                  </span>
                </div>
                <CardTitle className="text-2xl">{preference.name}</CardTitle>
                {preference.description && (
                  <p className="text-muted-foreground">{preference.description}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {/* What It Is Section */}
                {preference.whatItIs && (
                  <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                    <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                      <Info className="h-4 w-4 text-primary" />
                      What is {preference.name}?
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{preference.whatItIs}</p>
                    {preference.sources && preference.sources.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {preference.sources.map((source, idx) => (
                          <a
                            key={idx}
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            {source.title}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Commonly Found In Section */}
                {preference.commonlyFoundIn && preference.commonlyFoundIn.length > 0 && (
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      Commonly Found In
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {preference.commonlyFoundIn.map((item, idx) => (
                        <span key={idx} className="inline-flex items-center rounded-full bg-background border border-border px-3 py-1 text-sm text-card-foreground">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Why People Avoid Section */}
                {preference.whyPeopleAvoid && (
                  <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
                    <p className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      Why Some People Avoid This
                    </p>
                    <p className="text-sm text-amber-700 leading-relaxed">{preference.whyPeopleAvoid}</p>
                  </div>
                )}

                {/* Ingredients to Watch For */}
                {preference.flaggedIngredients && preference.flaggedIngredients.length > 0 && (
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      Ingredients to Watch For ({preference.flaggedIngredients.length})
                    </p>
                    <div className="space-y-3">
                      {preference.flaggedIngredients.map((ing) => (
                        <div
                          key={ing.id}
                          className="rounded-lg bg-background p-3 border border-border"
                        >
                          <p className="font-medium text-card-foreground">{ing.name}</p>
                          {ing.reason && (
                            <p className="text-sm text-muted-foreground mt-1">{ing.reason}</p>
                          )}
                          {ing.sources && ing.sources.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {ing.sources.map((source, idx) => (
                                <a
                                  key={idx}
                                  href={source.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  {source.title}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Reminder */}
          <div className="mt-8 rounded-xl border border-muted bg-muted/30 p-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">A Quick Reminder</p>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                  Enaj is here to help you stay informed, but we're not your doctor. The information we provide is educational — designed to help you make choices that feel right for you. If you ever have health concerns or questions, your healthcare provider is the best resource.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
