'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth, useUser, SignUp } from '@clerk/nextjs'
import { useEnaj } from '@/lib/enaj-context'
import { EnajLogo } from '@/components/enaj-logo'
import { CloudBackground } from '@/components/cloud-background'
import { getLinkedPreferences, getAilmentsForPreference } from '@/lib/enaj-data'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Heart,
  Leaf,
  Shield,
  User,
  Sparkles,
  NotebookPen,
  Download,
  Chrome,
  Monitor,
  MessageSquarePlus,
  Info,
  X,
  HelpCircle,
  Loader2,
  ShieldCheck,
  Venus,
  ScanEye,
  Apple,
  Stethoscope,
} from 'lucide-react'
import { US_STATES } from '@/lib/us-cities'
import { Thermometer, Activity, Eye, Zap, Wind, Pill } from 'lucide-react'
import type { JournalCondition } from '@/lib/journal-data'


type OnboardingStep = 'welcome' | 'profile' | 'ailments' | 'preferences' | 'journal' | 'review' | 'extension'



// Map icon names to components for journal categories
const CATEGORY_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  digestive: Apple,
  'womens-health': Venus,
  'skin-eye': ScanEye,
  'pain-discomfort': Zap,
  allergies: Wind,
  recovery: Stethoscope,
  general: Thermometer,
}

// Menopause / perimenopause mutual exclusion
const MENOPAUSE_ID = 'menopause'
const PERIMENOPAUSE_ID = 'perimenopause'

const STEPS: OnboardingStep[] = ['welcome', 'profile', 'ailments', 'preferences', 'journal', 'review', 'extension']

export function Onboarding() {
  const { setProfile, setCurrentStep, ailmentCategories, preferenceCategories, fetchUserProfile, saveProfileWithClerk, profile, journalCategories } = useEnaj()
  const { isSignedIn, userId } = useAuth()
  const { user: clerkUser } = useUser()
  const router = useRouter()
  const routeParams = useParams<{ step?: string }>()
  // The step now lives in the URL (/onboarding/[step]) so refresh and back/
  // forward work correctly - an unrecognized or missing segment falls back
  // to 'welcome' rather than 404ing.
  const step: OnboardingStep = STEPS.includes(routeParams.step as OnboardingStep)
    ? (routeParams.step as OnboardingStep)
    : 'welcome'
  const setStep = (next: OnboardingStep) => router.push(`/onboarding/${next}`)
  const [location, setLocation] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [shoppingStores, setShoppingStores] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [selectedAilmentIds, setSelectedAilmentIds] = useState<Set<string>>(new Set())
  const [selectedPreferenceIds, setSelectedPreferenceIds] = useState<Set<string>>(new Set())
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [profileSaved, setProfileSaved] = useState(false)
  const [customHealthCondition, setCustomHealthCondition] = useState('')
  const [customPreference, setCustomPreference] = useState('')
  const [hasAutoSelected, setHasAutoSelected] = useState(false)
  const [healthConditionSubmitted, setHealthConditionSubmitted] = useState(false)
  const [preferenceSubmitted, setPreferenceSubmitted] = useState(false)
  const [endocrineInfoId, setEndocrineInfoId] = useState<string | null>(null)
  const [menopauseConflict, setMenopauseConflict] = useState(false)
  const [categoryInfoId, setCategoryInfoId] = useState<string | null>(null)
  const [selectedState, setSelectedState] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [citySearch, setCitySearch] = useState('')
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false)
  const [cities, setCities] = useState<string[]>([])
  const [citiesLoading, setCitiesLoading] = useState(false)
  const [selectedJournalIds, setSelectedJournalIds] = useState<Set<string>>(new Set())
  const [expandedJournalCategory, setExpandedJournalCategory] = useState<string | null>(null)
  const dbUserId = profile?.id || userId || ''


  const currentStepIndex = STEPS.indexOf(step)
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100

  useEffect(() => {
    if (isSignedIn && step === 'welcome') {
      setStep('profile')
    }
  }, [isSignedIn, step])

  useEffect(() => {
    if (!selectedState || selectedState === 'DC') { setCities([]); return }
    setCitiesLoading(true)
    const stateCode = selectedState // already the 2-letter abbr
    fetch(`/api/cities?state=${stateCode}`)
    .then((r) => r.json())
    .then((data) => {
      setCities(data.cities ?? [])
    })
    .catch(() => setCities([]))
    .finally(() => setCitiesLoading(false))
  }, [selectedState])

  // When arriving at preferences step, auto-select linked preferences from selected ailments
  useEffect(() => {
    if (step !== 'preferences') return
    const linked = getLinkedPreferences(selectedAilmentIds, ailmentCategories)
    if (linked.size > 0) {
      setSelectedPreferenceIds((prev) => {
        const merged = new Set(prev)
        for (const id of linked) {
          merged.add(id)
        }
        return merged
      })
    }
  }, [step, selectedAilmentIds, ailmentCategories])

  const toggleAilment = (id: string) => {
    setSelectedAilmentIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        // Check menopause / perimenopause conflict
        if (id === MENOPAUSE_ID && next.has(PERIMENOPAUSE_ID)) {
          setMenopauseConflict(true)
          return prev
        }
        if (id === PERIMENOPAUSE_ID && next.has(MENOPAUSE_ID)) {
          setMenopauseConflict(true)
          return prev
        }
        next.add(id)
      }
      return next
    })
  }

  const togglePreference = (id: string) => {
    setSelectedPreferenceIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleJournalCondition = (id: string) => {
    setSelectedJournalIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const isProfileValid = () => {
    return (
      firstName.trim() !== '' &&
      lastName.trim() !== '' &&
      selectedState !== '' &&
      selectedCity !== '' &&
      age.trim() !== '' &&
      gender !== '' &&
      shoppingStores.trim() !== ''
    )
  }

  const saveProfile = async (): Promise<boolean> => {
    if (!userId) {
      setSaveError('Please sign in first')
      return false
    }

    setSaving(true)
    setSaveError('')

    try {
      await saveProfileWithClerk(userId, {
        location: location || `${selectedCity}, ${selectedState}`,
        age: age || undefined,
        gender: gender || undefined,
        shoppingStores: shoppingStores || undefined,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        
      })

      await api.saveUserAilments(
        dbUserId,
        Array.from(selectedAilmentIds),
        customHealthCondition.trim() || undefined
      )
  
      const prefsArray: { preferenceSlug?: string; source: string; customEntry?: string }[] =
        Array.from(selectedPreferenceIds).map((id) => ({
          preferenceSlug: id,
          source: 'SELECTED',
        }))
  
      if (customPreference.trim()) {
        prefsArray.push({ customEntry: customPreference.trim(), source: 'CUSTOM' })
      }
  
      await api.saveUserJournal(dbUserId, Array.from(selectedJournalIds))

      await api.saveUserPreferences(dbUserId, prefsArray)
      // await api.saveUserJournal(dbUserId, Array.from(selectedJournalIds))
      await fetchUserProfile(dbUserId)
  
      const allAilments = ailmentCategories.flatMap((c) => c.ailments)
      const selectedAilments = allAilments
        .filter((a) => selectedAilmentIds.has(a.id))
        .map((ailment) => ({
          ailment,
          activeIngredients: [...ailment.flaggedIngredients],
        }))
  
      setProfile({
        firstName: firstName,
        lastName: lastName,
        email: clerkUser?.primaryEmailAddress?.emailAddress || '',
        location: location || `${selectedCity}, ${selectedState}`,
        age,
        gender,
        shoppingStores,
        selectedAilments,
        selectedPreferences: Array.from(selectedPreferenceIds),
        journalEntries: Array.from(selectedJournalIds),
        savedProducts: [],
      })
  
      setProfileSaved(true)
      return true
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      return false
    } finally {
      setSaving(false)
    }
  }



  
  const handleProfileNext = async () => {
    if (!isProfileValid()) return
    if (!userId) {
      setSaveError('Please sign in first')
      return
    }
    setSaving(true)
    setSaveError('')
    const formattedLocation = `${selectedCity}, ${selectedState}`
    setLocation(formattedLocation)
    
    try {
      await saveProfileWithClerk(userId, {
        location: formattedLocation,
        age: age || undefined,
        gender: gender || undefined,
        shoppingStores: shoppingStores || undefined,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
      })
    
      goNext()
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  const handleCompleteReview = async () => {
    const ok = await saveProfile()
    if (ok) goNext()
  }

  const handleFinish = async () => {
    const ok = profileSaved ? true : await saveProfile()
    if (ok) {
      setCurrentStep('dashboard')
      router.push('/dashboard/monitor')
    }
  }

  const goNext = () => {
    if (step === 'profile') {
      if (!isProfileValid()) return
    }
    const idx = STEPS.indexOf(step)
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1])
  }

  const goBack = () => {
    if (step === 'profile') {
      router.push('/')
      return
    }
    const idx = STEPS.indexOf(step)
    if (idx > 0) setStep(STEPS[idx - 1])
    else router.push('/')
  }

  // Get set of linked preferences for display purposes
  const linkedPrefs = getLinkedPreferences(selectedAilmentIds, ailmentCategories)
  const baselineId = 'enaj-baseline'

  const BASELINE_COVERED_PREFS = new Set([
    'Parabens', 'Phthalates', 'Synthetic Fragrance', 'Oxybenzone', 'BPA & BPS',
    'Sulfates', 'Formaldehyde', 'Triclosan', 'Nitrates/Nitrites', 'Artificial Flavors',
    'Food Dyes', 'MSG', 'Artificial Sweeteners', 'High Fructose Corn Syrup',
    'Trans Fats', 'Seed Oils', 'PFAS (Forever Chemicals)', 'Microplastics', 'Gums & Fillers',
  ])


  return (
    <div className="relative flex min-h-screen flex-col" style={{ background: 'linear-gradient(170deg, #f0faf9 0%, #ddf3ef 30%, #cfeee6 60%, #ddf3ef 100%)' }}>
      <CloudBackground />
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between border-b border-border px-6 py-4" style={{ background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(12px)' }}>
        {step === 'welcome' ? (
          <Button variant="ghost" onClick={() => router.push('/')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <EnajLogo size="sm" />
            <span className="text-lg font-bold text-foreground">enaJ</span>
          </div>
        )}
        <span className="text-sm text-muted-foreground">
          Step {currentStepIndex + 1} of {STEPS.length}
        </span>
      </header>

      {/* Progress */}
      <div className="relative z-10 px-6 pt-4">
        <Progress value={progress} className="h-2 [&>div]:bg-primary" />
      </div>

      {/* Content */}
      <main className={`relative z-10 flex flex-1 flex-col items-center px-6 py-8 ${
        (step === 'ailments' || step === 'preferences' || step === 'journal') ? 'xl:pl-80' : ''
      }`}>
        {/* Selection Sidebar - Only shows on ailments, preferences, and journal steps */}
        {(step === 'ailments' || step === 'preferences' || step === 'journal') && (
          <div className="fixed left-6 top-32 z-20 hidden w-72 xl:block">
            <div className="rounded-xl border border-border bg-card/95 backdrop-blur-sm shadow-lg overflow-hidden">
              {/* Your Selections Header */}
              <div className="border-b border-border bg-muted/50 px-4 py-3">
                <h3 className="font-semibold text-card-foreground text-sm">Your Selections</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  You can view the full list of what enaJ monitors for you, once your profile is completed.
                </p>
              </div>

              <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
                {/* Ailments Section */}
                <div className="border-b border-border p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Heart className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-card-foreground">Health Conditions</span>
                    <span className="ml-auto text-xs text-muted-foreground">{selectedAilmentIds.size}</span>
                  </div>
                  {selectedAilmentIds.size === 0 ? (
                    <p className="text-xs text-muted-foreground italic">No conditions selected yet</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {ailmentCategories.flatMap((c) => c.ailments)
                        .filter((a) => selectedAilmentIds.has(a.id))
                        .map((ailment) => (
                          <span
                            key={ailment.id}
                            className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary"
                          >
                            {ailment.name}
                          </span>
                        ))}
                    </div>
                  )}
                </div>

                {/* Preferences Section - Only show on preferences and journal steps */}
                {(step === 'preferences' || step === 'journal') && (
                  <div className="border-b border-border p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Leaf className="h-4 w-4 text-accent-foreground" />
                      <span className="text-sm font-medium text-card-foreground">Preferences</span>
                      <span className="ml-auto text-xs text-muted-foreground">{selectedPreferenceIds.size}</span>
                    </div>

                    {/* Baseline card if selected */}
                    {selectedPreferenceIds.has(baselineId) && (
                      <div className="mb-3 rounded-lg bg-primary/10 p-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/20 px-2.5 py-1 text-xs text-primary font-medium">
                          <Shield className="h-3 w-3" />
                          enaJ Non-Toxic Baseline
                        </span>
                        <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                          Monitoring {BASELINE_COVERED_PREFS.size} commonly flagged toxic ingredients
                        </p>
                      </div>
                    )}

                    {selectedPreferenceIds.size === 0 ? (
                      <p className="text-xs text-muted-foreground italic">No preferences selected yet</p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {preferenceCategories.flatMap((c) => c.preferences)
                          .filter((p) => selectedPreferenceIds.has(p.id) && p.id !== baselineId)
                          .map((pref) => {
                            const linkedAilments = getAilmentsForPreference(pref.id, selectedAilmentIds, ailmentCategories)
                            return (
                              <div key={pref.id} className="rounded-lg bg-muted/50 p-2">
                                <span className="inline-flex items-center rounded-full bg-secondary/50 px-2.5 py-1 text-xs text-accent-foreground">
                                  {pref.name}
                                </span>
                                {linkedAilments.length > 0 && (
                                  <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                                    <span className="text-primary font-medium">Pre-selected</span> because you marked:{'  '}
                                    {linkedAilments.map((a, i) => (
                                      <span key={a.id}>
                                        <span className="font-medium text-foreground">{a.name}</span>
                                        {i < linkedAilments.length - 1 && (i === linkedAilments.length - 2 ? ' and ' : ', ')}
                                      </span>
                                    ))}
                                  </p>
                                )}
                              </div>
                            )
                          })}
                      </div>
                    )}
                  </div>
                )}
                {/* Journal Section - Only show on journal step */}
                {step === 'journal' && (
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <NotebookPen className="h-4 w-4 text-amber-600" />
                      <span className="text-sm font-medium text-card-foreground">Journal</span>
                      <span className="ml-auto text-xs text-muted-foreground">{selectedJournalIds.size}</span>
                    </div>
                    {selectedJournalIds.size === 0 ? (
                      <p className="text-xs text-muted-foreground italic">No temporary conditions added yet</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {journalCategories.flatMap((c) => c.conditions)
                          .filter((c) => selectedJournalIds.has(c.id))
                          .map((condition) => (
                            <span
                              key={condition.id}
                              className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-1 text-xs text-amber-700"
                            >
                              {condition.name}
                            </span>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        <div className="w-full max-w-2xl">
          {/* Welcome Step - Show Clerk SignUp if not signed in */}
          {step === 'welcome' && (
            <div className="flex flex-col items-center text-center">
              {!isSignedIn ? (
                <>
                  <div className="mb-6">
                    <EnajLogo size="xl" />
                  </div>
                  <h1 className="text-3xl font-bold text-foreground md:text-4xl text-balance">
                    Welcome to enaJ
                  </h1>
                  <p className="mt-4 max-w-md text-muted-foreground text-pretty leading-relaxed mb-8">
                    Your personal guardian angel for smarter shopping. Create an account to get started.
                  </p>
                <div className="[&_.cl-footerAction]:hidden">
                  <SignUp
                    appearance={{
                      layout: {
                        socialButtonsPlacement: 'top',
                        showOptionalFields: false,
                      },
                        elements: {
                          rootBox: 'mx-auto',
                          card: 'bg-card/80 backdrop-blur-sm border-border shadow-lg',
                          headerTitle: 'text-foreground',
                          headerSubtitle: 'text-muted-foreground',
                          formFieldLabel: 'text-foreground',
                          formFieldInput: 'bg-background border-border text-foreground',
                          formButtonPrimary: 'bg-primary hover:bg-primary/90',
                          footerActionLink: 'text-primary hover:text-primary/80',
                          dividerLine: 'bg-border',
                          dividerText: 'text-muted-foreground',
                          socialButtonsBlockButton: 'border-border bg-background hover:bg-accent',
                          socialButtonsBlockButtonText: 'text-foreground',
                          footer: 'hidden',
                          footerAction: { display: 'none' }, 
                        },
                      }}
                      routing="hash"
                      signInUrl="https://www.enajhealth.com/#/sign-in"
                      fallbackRedirectUrl="/"
                    />
                </div>
                  <div className="mt-6 text-sm text-muted-foreground">
                    <p>
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentStep('login')
                          router.push('/')
                        }}
                        className="text-primary hover:underline font-medium"
                      >
                        Sign in
                      </button>
                    </p>
                  </div>

                </>
              ) : (
                <>
                  <div className="mb-6">
                    <EnajLogo size="xl" />
                  </div>
                  <h1 className="text-3xl font-bold text-foreground md:text-4xl text-balance">
                    Welcome to enaJ
                  </h1>
                  <p className="mt-4 max-w-md text-muted-foreground text-pretty leading-relaxed">
                    Your personal guardian angel for smarter shopping. Let us build your health profile so we can protect you from unwanted ingredients.
                  </p>
                  <Button
                    size="lg"
                    onClick={goNext}
                    className="mt-8 bg-primary text-primary-foreground hover:bg-primary/90 gap-2 px-8"
                  >
                    Let{"'"}s Get Started
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Profile Step - Only collect location, age, gender, shoppingStores (Clerk handles auth fields) */}
          {step === 'profile' && (
            <div>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Your Profile</h2>
                  <p className="text-sm text-muted-foreground">Tell us a bit about yourself so we can personalize your experience.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                
                  <div>
                  <Label htmlFor="firstName" className="text-foreground">
                    First Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    placeholder="Your first name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="mt-1.5 bg-card border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-foreground">
                    Last Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    placeholder="Your last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="mt-1.5 bg-card border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                {/* State */}
                <div>
                  <Label htmlFor="state" className="text-foreground">
                    State <span className="text-destructive">*</span>
                  </Label>
                  <select
                    id="state"
                    value={selectedState}
                    onChange={(e) => {
                      const stateValue = e.target.value
                      setSelectedState(stateValue)
                      setSelectedCity(stateValue === 'DC' ? 'Washington' : '')
                      setCitySearch(stateValue === 'DC' ? 'Washington' : '')
                      setCities([])
                    }}
                    className="mt-1.5 h-9 w-full min-w-0 rounded-md border border-input bg-card px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                  >
                    <option value="">Select state</option>
                    {US_STATES.map((s) => (
                      <option key={s.abbr} value={s.abbr}>{s.name}</option>
                    ))}
                  </select>
                </div>

                {/* City */}
                {selectedState !== 'DC' && (
                  <div className="relative">
                    <Label htmlFor="city" className="text-foreground">
                      City <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative mt-1.5">
                      <input
                        id="city"
                        type="text"
                        placeholder={selectedState ? 'Search city...' : 'Select a state first'}
                        disabled={!selectedState}
                        value={citySearch}
                        onChange={(e) => {
                          setCitySearch(e.target.value)
                          setSelectedCity('')
                          setCityDropdownOpen(true)
                        }}
                        onFocus={() => selectedState && setCityDropdownOpen(true)}
                        onBlur={() => setTimeout(() => setCityDropdownOpen(false), 150)}
                        className="h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-base shadow-xs outline-none md:text-sm text-foreground placeholder:text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                      />
                      {cityDropdownOpen && selectedState && (
                        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-card shadow-lg max-h-48 overflow-y-auto">
                          {citiesLoading ? (
                            <div className="flex items-center justify-center py-4">
                              <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            </div>
                          ) : cities
                              .filter((c) => c.toLowerCase().includes(citySearch.toLowerCase()))
                              .map((city) => (
                                <button
                                  key={city}
                                  type="button"
                                  onMouseDown={() => {
                                    setSelectedCity(city)
                                    setCitySearch(city)
                                    setCityDropdownOpen(false)
                                  }}
                                  className="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-accent transition-colors"
                                >
                                  {city}
                                </button>
                              ))
                          }
                          {!citiesLoading && cities.filter((c) =>
                            c.toLowerCase().includes(citySearch.toLowerCase())
                          ).length === 0 && (
                            <p className="px-3 py-2 text-sm text-muted-foreground">No cities found</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {/* Age */}
                <div>
                  <Label htmlFor="age" className="text-foreground">
                    Age <span className="text-destructive">*</span>
                  </Label>
                  <select
                    id="age"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="mt-1.5 h-9 w-full min-w-0 rounded-md border border-input bg-card px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                  >
                    <option value="">Select age range</option>
                    <option value="under-18">Under 18</option>
                    <option value="18-24">18 – 24</option>
                    <option value="25-34">25 – 34</option>
                    <option value="35-44">35 – 44</option>
                    <option value="45-54">45 – 54</option>
                    <option value="55-64">55 – 64</option>
                    <option value="65-74">75+</option>
                  </select>

                </div>

                {/* Gender */}
                <div>
                  <Label htmlFor="gender" className="text-foreground">
                    Gender <span className="text-destructive">*</span>
                  </Label>
                  <select
                    id="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="mt-1.5 h-9 w-full min-w-0 rounded-md border border-input bg-card px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                  >
                    <option value="">Select gender</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>

                {/* Shopping Stores */}
                <div className="sm:col-span-2">
                  <Label htmlFor="shoppingStores" className="text-foreground">
                    Where do you mainly shop? <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="shoppingStores"
                    placeholder="e.g., Target, Amazon, Sephora, Walmart"
                    value={shoppingStores}
                    onChange={(e) => setShoppingStores(e.target.value)}
                    className="mt-1.5 bg-card border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>

              </div>
            </div>
          )}

          {/* Ailments Step */}
          {step === 'ailments' && (
            <div>
              <div className="mb-8 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Heart className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Health Conditions</h2>
                  <p className="text-sm text-muted-foreground">
                    Select any conditions you have. enaJ will monitor conflicting ingredients.
                  </p>
                </div>
              </div>

              {ailmentCategories.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="mt-3 text-sm text-muted-foreground">Loading health conditions...</p>
                </div>
              ) : (
              <div className="flex flex-col gap-4">
                {ailmentCategories.map((category) => (
                  <div key={category.id} className="rounded-xl border border-border bg-card overflow-hidden">
                    <button
                      onClick={() =>
                        setExpandedCategory(expandedCategory === category.id ? null : category.id)
                      }
                      className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-accent/50 transition-colors"
                    >
                      <span className="font-semibold text-card-foreground">{category.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {category.ailments.filter((a) => selectedAilmentIds.has(a.id)).length} selected
                      </span>
                    </button>
                    {expandedCategory === category.id && (
                      <div className="border-t border-border px-3 pb-3 pt-2">
                        <div className="flex flex-wrap gap-2">
                          {category.ailments.map((ailment) => {
                            const selected = selectedAilmentIds.has(ailment.id)
                            return (
                              <button
                                key={ailment.id}
                                onClick={() => toggleAilment(ailment.id)}
                                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm transition-colors ${
                                  selected
                                    ? 'bg-primary text-primary-foreground'
                                    : 'border border-border bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                }`}
                              >
                                {selected && <Check className="h-3.5 w-3.5" />}
                                {ailment.name}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              )}

              {/* Custom health condition box */}
              <div className="mt-6 rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquarePlus className="h-4 w-4 text-primary" />
                  <p className="text-sm font-medium text-card-foreground">
                    {"Don't"} see your health condition? Let us know!
                  </p>
                </div>
                <Textarea
                  placeholder="Type your health condition here..."
                  value={customHealthCondition}
                  onChange={(e) => {
                    setCustomHealthCondition(e.target.value)
                    if (healthConditionSubmitted) setHealthConditionSubmitted(false)
                  }}
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground min-h-[80px]"
                />
                <div className="mt-3 flex items-center justify-between">
                  {healthConditionSubmitted ? (
                    <p className="text-sm text-primary flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5" />
                      Thank you! We{"'"}ll review your suggestion.
                    </p>
                  ) : (
                    <div />
                  )}
                  <Button
                    size="sm"
                    disabled={!customHealthCondition.trim() || healthConditionSubmitted}
                    onClick={() => setHealthConditionSubmitted(true)}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 px-4"
                  >
                    Submit
                  </Button>
                </div>
              </div>

              {/* Menopause / Perimenopause conflict dialog */}
              <Dialog open={menopauseConflict} onOpenChange={setMenopauseConflict}>
                <DialogContent className="bg-card border-border max-w-sm">
                  <DialogHeader>
                    <DialogTitle className="text-card-foreground">Unable to Select Both</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      Perimenopause is the transitional phase leading to menopause. Since menopause means perimenopause has already concluded, these two conditions cannot apply at the same time. Please select the one that best matches your current stage.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex justify-end mt-2">
                    <Button
                      size="sm"
                      onClick={() => setMenopauseConflict(false)}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      Got it
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {/* Preferences Step */}
          {step === 'preferences' && (
            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/30">
                  <Leaf className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Your Preferences</h2>
                  <p className="text-sm text-muted-foreground">
                    Choose ingredients and factors you want to avoid.
                  </p>
                </div>
              </div>

              {/* Auto-select notice */}
              {linkedPrefs.size > 0 && (
                <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4">
                  <p className="text-sm text-foreground">
                    Based on your health conditions, we have preselected the following preferences for you. You can adjust these at any time.
                  </p>
                </div>
              )}

              {preferenceCategories.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="mt-3 text-sm text-muted-foreground">Loading preferences...</p>
                </div>
              ) : (
                <div className="flex flex-col gap-6">

                  {/* ── Enaj Non-Toxic Baseline ── */}
                  <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
                          <Shield className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground">enaJ Non-Toxic Baseline</h3>
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                              Recommended
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            Not sure exactly what to avoid? Select this and enaJ will automatically monitor for the most commonly flagged toxic ingredients — synthetic chemicals, harmful food additives, endocrine disruptors, and more — across everything you shop.
                            <br /> This feature can be used for yourself, children, or any pets you are shopping for!
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => togglePreference('enaj-baseline')}
                        role="switch"
                        aria-checked={selectedPreferenceIds.has(baselineId)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                          selectedPreferenceIds.has(baselineId) ? 'bg-primary' : 'bg-muted-foreground/30'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ${
                            selectedPreferenceIds.has(baselineId) ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* All other preference categories */}
                  {preferenceCategories
                    .filter((category) => category.label !== 'Non-Toxic Lifestyle')
                    .map((category) => {
                    const showingCatInfo = categoryInfoId === category.id
                    return (
                      <div key={category.id}>
                        <div className="mb-3 relative">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground">{category.label}</h3>
                            {category.description && (
                              <button
                                onClick={() => setCategoryInfoId(showingCatInfo ? null : category.id)}
                                className="flex h-5 w-5 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                aria-label={`Learn more about ${category.label}`}
                              >
                                <HelpCircle className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                          {showingCatInfo && category.description && (
                            <div className="mt-2 w-full rounded-xl border border-border bg-card p-4 shadow-lg">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                  {category.description}
                                </p>
                                <button
                                  onClick={() => setCategoryInfoId(null)}
                                  className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                  aria-label="Close"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                        {(() => {
                          const renderChip = (pref: (typeof category.preferences)[number]) => {
                            const selected = selectedPreferenceIds.has(pref.id)
                            const isLinked = linkedPrefs.has(pref.id)
                            const baselineCovered = selectedPreferenceIds.has(baselineId) && BASELINE_COVERED_PREFS.has(pref.name)
                            const showInfoIcon = !!pref.description
                            const showingInfo = endocrineInfoId === pref.id
                            return (
                              <div key={pref.id} className="relative">
                                <div className="flex items-center gap-1">
                                <button
                                  onClick={() => { if (!baselineCovered) togglePreference(pref.id) }}
                                  disabled={baselineCovered}
                                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm transition-colors ${
                                    selected
                                      ? 'bg-primary text-primary-foreground'
                                      : baselineCovered
                                      ? 'border border-primary/40 bg-primary/10 text-primary opacity-70 cursor-not-allowed'
                                      : 'border border-border bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground'
                                  } ${isLinked && selected ? 'ring-2 ring-primary/30' : ''}`}
                                >
                                    {selected && <Check className="h-3.5 w-3.5" />}
                                    {baselineCovered && !selected && <Sparkles className="h-3 w-3 opacity-60" />}
                                    {pref.name}
                                  </button>
                                  {showInfoIcon && (
                                    <button
                                      onClick={() => setEndocrineInfoId(showingInfo ? null : pref.id)}
                                      className="flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-primary hover:bg-primary/10 transition-colors"
                                      aria-label={`What is ${pref.name}?`}
                                    >
                                      <Info className="h-3.5 w-3.5" />
                                    </button>
                                  )}
                                </div>
                                {showingInfo && (
                                  <div className="absolute left-0 top-full z-20 mt-2 w-72 rounded-xl border border-primary/30 bg-card p-5 shadow-lg">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex items-center gap-2">
                                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                                          <Info className="h-4 w-4 text-primary" />
                                        </div>
                                        <p className="text-sm font-semibold text-foreground">
                                          {pref.name}
                                        </p>
                                      </div>
                                      <button
                                        onClick={() => setEndocrineInfoId(null)}
                                        className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                        aria-label="Close"
                                      >
                                        <X className="h-4 w-4" />
                                      </button>
                                    </div>
                                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                                      {pref.description || 'This ingredient is one some people choose to avoid.'}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )
                          }

                          const selectedForYou = category.preferences.filter((pref) => linkedPrefs.has(pref.id))
                          const otherOptions = category.preferences.filter((pref) => !linkedPrefs.has(pref.id))

                          // When none of this category's preferences were
                          // suggested by the user's health conditions, fall
                          // back to one flat list rather than showing an
                          // empty "Selected for you" section.
                          if (selectedForYou.length === 0) {
                            return (
                              <div className="flex flex-wrap gap-2">
                                {otherOptions.map(renderChip)}
                              </div>
                            )
                          }

                          return (
                            <div className="flex flex-col gap-3">
                              <div>
                                <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-primary">
                                  <Sparkles className="h-3 w-3" />
                                  Selected for you based on your health conditions
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {selectedForYou.map(renderChip)}
                                </div>
                              </div>
                              {otherOptions.length > 0 && (
                                <div>
                                  <p className="mb-2 text-xs font-medium text-muted-foreground">
                                    Other options
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {otherOptions.map(renderChip)}
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })()}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Custom preference box */}
              <div className="mt-6 rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquarePlus className="h-4 w-4 text-primary" />
                  <p className="text-sm font-medium text-card-foreground">
                    {"Don't"} see your preference? Let us know!
                  </p>
                </div>
                <Textarea
                  placeholder="Type your preference here..."
                  value={customPreference}
                  onChange={(e) => {
                    setCustomPreference(e.target.value)
                    if (preferenceSubmitted) setPreferenceSubmitted(false)
                  }}
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground min-h-[80px]"
                />
                <div className="mt-3 flex items-center justify-between">
                  {preferenceSubmitted ? (
                    <p className="text-sm text-primary flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5" />
                      Thank you! We{"'"}ll review your suggestion.
                    </p>
                  ) : (
                    <div />
                  )}
                  <Button
                    size="sm"
                    disabled={!customPreference.trim() || preferenceSubmitted}
                    onClick={() => setPreferenceSubmitted(true)}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 px-4"
                  >
                    Submit
                  </Button>
                </div>
              </div>

              {/* Learn tab hint */}
              <div className="mt-6 rounded-xl border border-dashed border-border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  <span className="font-medium text-foreground">Not sure what any of this means?</span>{' '}
                  No worries! Once you{"'"}re logged in, head to our <span className="font-medium text-primary">Learn</span> tab 
                  to educate yourself on different ingredients, health conditions, and lifestyle preferences 
                  and how they may affect you.
                </p>
              </div>
            </div>
          )}

          {/* Weekly Health Journal Step */}
          {step === 'journal' && (
            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
                  <NotebookPen className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Weekly Health Journal</h2>
                  <p className="text-sm text-muted-foreground">
                    Dealing with something temporary? Let us help you shop smarter.
                  </p>
                </div>
              </div>

              {/* Info box */}
              <div className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                <p className="text-sm text-foreground leading-relaxed">
                  Unlike your permanent health conditions, these are temporary issues you might be dealing with right now. 
                  enaJ will monitor relevant ingredients while you recover. You can update your journal anytime from your dashboard.
                </p>
              </div>

              {/* Journal Categories */}
              <div className="flex flex-col gap-4">
                {journalCategories.map((category) => {
                  const IconComponent = CATEGORY_ICONS[category.id] || Thermometer
                  const selectedInCategory = category.conditions.filter((c) => selectedJournalIds.has(c.id)).length
                  return (
                    <div key={category.id} className="rounded-xl border border-border bg-card overflow-hidden">
                      <button
                        onClick={() =>
                          setExpandedJournalCategory(expandedJournalCategory === category.id ? null : category.id)
                        }
                        className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <IconComponent className="h-5 w-5 text-amber-600" />
                          <span className="font-semibold text-card-foreground">{category.label}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {selectedInCategory > 0 ? `${selectedInCategory} selected` : `${category.conditions.length} options`}
                        </span>
                      </button>
                      {expandedJournalCategory === category.id && (
                        <div className="border-t border-border px-3 pb-3 pt-2">
                          <div className="flex flex-wrap gap-2">
                            {category.conditions.map((condition) => {
                              const selected = selectedJournalIds.has(condition.id)
                              return (
                                <button
                                  key={condition.id}
                                  onClick={() => toggleJournalCondition(condition.id)}
                                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm transition-colors ${
                                    selected
                                      ? 'bg-amber-500 text-white'
                                      : 'border border-border bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                  }`}
                                >
                                  {selected && <Check className="h-3.5 w-3.5" />}
                                  {condition.name}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Skip hint */}
              <div className="mt-6 rounded-xl border border-dashed border-border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  <span className="font-medium text-foreground">Nothing going on right now?</span>{' '}
                  No problem! You can skip this step and add entries later from your <span className="font-medium text-primary">Journal</span> tab 
                  whenever you need to.
                </p>
              </div>
            </div>
          )}

          {/* Review Step */}
          {step === 'review' && (
            <div>
              <div className="mb-8 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <EnajLogo size="md" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Review Your Profile</h2>
                  <p className="text-sm text-muted-foreground">
                    Here is a summary of your enaJ profile. You can always edit this later.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                {/* Personal Info */}
                <div className="rounded-xl border border-border bg-card p-5">
                  <p className="text-sm text-muted-foreground mb-3">Personal Information</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">First Name</p>
                      <p className="text-sm font-medium text-card-foreground">{firstName || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Last Name</p>
                      <p className="text-sm font-medium text-card-foreground">{lastName || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="text-sm font-medium text-card-foreground">{location || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Age</p>
                      <p className="text-sm font-medium text-card-foreground">{age || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Gender</p>
                      <p className="text-sm font-medium text-card-foreground capitalize">{gender.replace('-', ' ') || 'Not provided'}</p>
                    </div>
                    {shoppingStores && (
                      <div>
                        <p className="text-xs text-muted-foreground">Shopping Stores</p>
                        <p className="text-sm font-medium text-card-foreground">{shoppingStores}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Selected Ailments */}
                <div className="rounded-xl border border-border bg-card p-5">
                  <p className="mb-3 text-sm text-muted-foreground">
                    Health Conditions ({selectedAilmentIds.size})
                  </p>
                  {selectedAilmentIds.size === 0 ? (
                    <p className="text-sm text-muted-foreground">None selected</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {ailmentCategories.flatMap((c) => c.ailments)
                        .filter((a) => selectedAilmentIds.has(a.id))
                        .map((a) => (
                          <span
                            key={a.id}
                            className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1.5 text-sm text-primary"
                          >
                            {a.name}
                          </span>
                        ))}
                    </div>
                  )}
                  {customHealthCondition.trim() && (
                    <div className="mt-3 rounded-lg bg-muted p-3">
                      <p className="text-xs text-muted-foreground mb-1">Your submitted condition:</p>
                      <p className="text-sm text-foreground">{customHealthCondition}</p>
                    </div>
                  )}
                </div>

                {/* Selected Preferences */}
                <div className="rounded-xl border border-border bg-card p-5">
                  <p className="mb-3 text-sm text-muted-foreground">
                    Preferences ({selectedPreferenceIds.size})
                  </p>
                  {selectedPreferenceIds.size === 0 ? (
                    <p className="text-sm text-muted-foreground">None selected</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {selectedPreferenceIds.has(baselineId) && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1.5 text-sm text-primary font-medium">
                          <Shield className="h-3 w-3" />
                          enaJ Non-Toxic Baseline
                        </span>
                      )}
                      {preferenceCategories.flatMap((c) => c.preferences)
                        .filter((p) => 
                          selectedPreferenceIds.has(p.id) && 
                          p.name !== 'Enaj Non-Toxic Baseline' &&
                          p.name !== 'enaJ Non-Toxic Baseline'
                        )
                        .map((p) => (
                          <span
                            key={p.id}
                            className="inline-flex items-center gap-1.5 rounded-full bg-secondary/30 px-3 py-1.5 text-sm text-accent-foreground"
                          >
                            <Check className="h-3 w-3" />
                            {p.name}
                          </span>
                        ))}
                    </div>
                  )}
                  {customPreference.trim() && (
                    <div className="mt-3 rounded-lg bg-muted p-3">
                      <p className="text-xs text-muted-foreground mb-1">Your submitted preference:</p>
                      <p className="text-sm text-foreground">{customPreference}</p>
                    </div>
                  )}
                </div>

                {/* Weekly Health Journal */}
                <div className="rounded-xl border border-border bg-card p-5">
                  <p className="mb-3 text-sm text-muted-foreground">
                    Weekly Health Journal ({selectedJournalIds.size})
                  </p>
                  {selectedJournalIds.size === 0 ? (
                    <p className="text-sm text-muted-foreground">No temporary conditions selected</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {journalCategories.flatMap((c) => c.conditions)
                        .filter((c) => selectedJournalIds.has(c.id))
                        .map((c) => (
                          <span
                            key={c.id}
                            className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1.5 text-sm text-amber-700"
                          >
                            <NotebookPen className="h-3 w-3" />
                            {c.name}
                          </span>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}



          {/* Browser Extension Step */}
          {step === 'extension' && (
            <div className="flex flex-col items-center">
              <div className="flex flex-col items-center text-center">
                <div
                  className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
                  style={{ background: 'linear-gradient(135deg, rgba(10,186,181,0.15) 0%, rgba(168,213,186,0.25) 100%)' }}
                >
                  <Download className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-3xl font-bold text-foreground md:text-4xl text-balance">
                  Get the Enaj Browser Extension
                </h1>
                <p className="mt-3 max-w-lg text-muted-foreground text-pretty leading-relaxed">
                  Your profile is all set. Install the extension to activate your guardian angel while you shop on any website.
                </p>
              </div>

              {/* Install section — full width on top */}
              <div className="mt-8 w-full max-w-4xl rounded-2xl border border-border bg-card p-6 md:p-8">
                <div className="flex flex-col items-center gap-5 md:flex-row md:items-center md:justify-between">
                  <div className="text-center md:text-left">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Install</h3>
                    <p className="mt-1 text-xs text-muted-foreground">More browsers coming soon.</p>
                  </div>
                  <Button
                    size="lg"
                    className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 md:w-auto md:px-8"
                  >
                    <Chrome className="h-5 w-5" />
                    Add to Chrome
                  </Button>
                </div>

                <ul className="mt-6 grid gap-3 border-t border-border pt-6 sm:grid-cols-3">
                  <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 flex-shrink-0 text-primary" />
                    You&apos;re in control — Enaj only scans when you click the button
                  </li>
                  <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 flex-shrink-0 text-primary" />
                    Private — your health data stays yours
                  </li>
                  <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 flex-shrink-0 text-primary" />
                    Works right in your browser while you shop
                  </li>
                </ul>
              </div>

              {/* How it works — each step in its own card */}
              <div className="mt-6 w-full max-w-4xl">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">How it works</h3>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  {/* Step 1 */}
                  <div className="flex flex-col rounded-2xl border border-border bg-card p-6 text-left">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      1
                    </div>
                    <p className="mt-4 text-sm font-medium text-card-foreground">Shop like you normally do</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Open any product page on Amazon, Sephora, Ulta, Walmart, or Target.
                    </p>
                    <p className="mt-2 text-xs italic text-muted-foreground/80">
                      More supported websites coming soon.
                    </p>
                  </div>
                  {/* Step 2 */}
                  <div className="flex flex-col rounded-2xl border border-border bg-card p-6 text-left">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      2
                    </div>
                    <p className="mt-4 text-sm font-medium text-card-foreground">Open the Enaj extension</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Click the Enaj icon while viewing a product page to instantly analyze its ingredients.
                    </p>
                  </div>
                  {/* Step 3 */}
                  <div className="flex flex-col rounded-2xl border border-border bg-card p-6 text-left">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      3
                    </div>
                    <p className="mt-4 text-sm font-medium text-card-foreground">Get instant results</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      See whether a product matches your health profile, learn why ingredients are flagged, and save products to your Enaj profile.
                    </p>
                    <p className="mt-2 text-xs italic text-muted-foreground/80">
                      Personalized product recommendations coming soon.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer Navigation */}
      {step !== 'welcome' && (
        <footer className="relative z-10 border-t border-border px-6 py-4" style={{ background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(12px)' }}>
          <div className="relative mx-auto flex w-full items-center justify-between px-16">
            <Button variant="ghost" onClick={goBack} className="gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            {saveError && (
              <p className="absolute -top-8 left-0 right-0 text-center text-sm text-destructive">{saveError}</p>
            )}
            {step === 'review' ? (
              <Button
                onClick={handleCompleteReview}
                disabled={saving}
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 px-6"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Complete Profile
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            ) : step === 'extension' ? (
              <Button
                onClick={handleFinish}
                disabled={saving}
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 px-6"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Go to Dashboard
                    <Sparkles className="h-4 w-4" />
                  </>
                )}
              </Button>
            ) : (
            <Button
              onClick={step === 'profile' ? handleProfileNext : goNext}
              disabled={(step === 'profile' && !isProfileValid()) || saving}
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 px-6"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
            )}
          </div>
        </footer>
      )}
    </div>
  )
}
