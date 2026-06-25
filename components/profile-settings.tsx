'use client'

import { useEffect, useState } from 'react'
import { useEnaj } from '@/lib/enaj-context'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { EnajLogo } from '@/components/enaj-logo'
import {
  User,
  Mail,
  Save,
  Heart,
  Leaf,
  Plus,
  Check,
  Download,
  ChevronRight,
  Chrome,
  Sparkles,
} from 'lucide-react'
import { US_STATES } from '@/lib/us-cities'
import { Loader2 } from 'lucide-react'

export function ProfileSettings() {
  const { profile, setProfile, addAilment, togglePreference, setCurrentStep, ailmentCategories, preferenceCategories, clerkUserId } =
    useEnaj()
  const [firstName] = useState(profile?.firstName || '')
  const [lastName] = useState(profile?.lastName || '')
  const [email] = useState(profile?.email || '')
  const [location, setLocation] = useState(profile?.location || '')
  const [age, setAge] = useState(profile?.age || '')
  const [gender, setGender] = useState(profile?.gender || '')
  const [shoppingStores, setShoppingStores] = useState(profile?.shoppingStores || '')
  const [saved, setSaved] = useState(false)
  const [addAilmentOpen, setAddAilmentOpen] = useState(false)
  const [selectedState, setSelectedState] = useState(() => {
    const parts = (profile?.location || '').split(', ')
    return parts.length === 2 ? parts[1] : ''
  })
  const [selectedCity, setSelectedCity] = useState(() => {
    const parts = (profile?.location || '').split(', ')
    return parts.length === 2 ? parts[0] : ''
  })
  const [citySearch, setCitySearch] = useState(() => {
    const parts = (profile?.location || '').split(', ')
    return parts.length === 2 ? parts[0] : ''
  })
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false)
  const [cities, setCities] = useState<string[]>([])
  const [citiesLoading, setCitiesLoading] = useState(false)

  if (!profile) return null

  const baselinePref = preferenceCategories
    .flatMap((c) => c.preferences)
    .find((p) => p.id === 'enaJ-baseline' || p.name === 'enaJ Non-Toxic Baseline')
  const baselineId = baselinePref?.id ?? 'enaJ-baseline'

  const BASELINE_COVERED_PREFS = new Set([
    'Parabens', 'Phthalates', 'Synthetic Fragrance', 'Oxybenzone', 'BPA & BPS',
    'Sulfates', 'Formaldehyde', 'Triclosan', 'Nitrates/Nitrites', 'Artificial Flavors',
    'Food Dyes', 'MSG', 'Artificial Sweeteners', 'High Fructose Corn Syrup',
    'Trans Fats', 'Seed Oils', 'PFAS (Forever Chemicals)', 'Microplastics',
  ])

  useEffect(() => {
    if (!selectedState) { setCities([]); return }
    setCitiesLoading(true)
    fetch(`/api/cities?state=${selectedState}`)
      .then((r) => r.json())
      .then((data) => {
        setCities(data.cities ?? [])
      })
      .catch(() => setCities([]))
      .finally(() => setCitiesLoading(false))
  }, [selectedState])

  const handleSave = async () => {
    const formattedLocation =
      selectedCity && selectedState ? `${selectedCity}, ${selectedState}` : location
  
    const updatedFields = {
      location: formattedLocation,
      age: age ? Number(age) : undefined,
      gender,
      shoppingStores,
    }
  
    setProfile({
      ...profile,
      firstName,
      lastName,
      email,
      location: formattedLocation,
      age,
      gender,
      shoppingStores,
    })
  
    setLocation(formattedLocation)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  
    const dbUserId = profile?.id || clerkUserId
    if (dbUserId) {
      fetch(`/api/users/${dbUserId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields),
      }).catch((err) => {
        console.error('Failed to update profile:', err)
      })
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">
          Profile Settings
        </h1>
        <p className="mt-1 text-muted-foreground">
          Manage your account information and health profile.
        </p>
      </div>

      {/* Personal Info */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-card-foreground flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Personal Information
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label className="text-foreground">First Name</Label>
            <Input
              value={firstName}
              disabled
              className="mt-1.5 bg-muted border-border text-muted-foreground cursor-not-allowed"
            />
          </div>
          <div>
            <Label className="text-foreground">Last Name</Label>
            <Input
              value={lastName}
              disabled
              className="mt-1.5 bg-muted border-border text-muted-foreground cursor-not-allowed"
            />
          </div>
          <p className="text-xs text-muted-foreground sm:col-span-2 -mt-2">
            Your name is pulled from your Google account and cannot be changed here.
          </p>
          <div>
            <Label htmlFor="settings-email" className="text-foreground">Email</Label>
            <div className="relative mt-1.5">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="settings-email"
                type="email"
                value={email}
                disabled
                className="bg-muted border-border text-muted-foreground pl-10 cursor-not-allowed"
              />
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              To change your email, contact us at{' '}
              <a href="mailto:hello@enajhealth.com" className="text-primary hover:underline">
                hello@enajhealth.com
              </a>
            </p>
          </div>

          {/* State */}
          <div>
            <Label htmlFor="settings-state" className="text-foreground">State</Label>
            <select
              id="settings-state"
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value)
                setSelectedCity('')
                setCitySearch('')
                setCities([])
              }}
              className="mt-1.5 h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-sm text-foreground"
            >
              <option value="">Select state</option>
              {US_STATES.map((s) => (
                <option key={s.abbr} value={s.abbr}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* City */}
          <div className="relative">
            <Label htmlFor="settings-city" className="text-foreground">City</Label>
            <div className="relative mt-1.5">
              <input
                id="settings-city"
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
                className="h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-sm text-foreground placeholder:text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed"
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
                            setLocation(`${city}, ${selectedState}`)
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
          <div>
            <Label htmlFor="settings-age" className="text-foreground">Age</Label>
            <Input
              id="settings-age"
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="mt-1.5 bg-background border-border text-foreground"
            />
          </div>
          <div>
            <Label htmlFor="settings-gender" className="text-foreground">Gender</Label>
            <select
              id="settings-gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
            >
              <option value="">Select gender</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="settings-stores" className="text-foreground">Where do you mainly shop?</Label>
            <Input
              id="settings-stores"
              value={shoppingStores}
              onChange={(e) => setShoppingStores(e.target.value)}
              placeholder="e.g., Target, Amazon, Sephora"
              className="mt-1.5 bg-background border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>
        <Button
          onClick={handleSave}
          className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
          size="sm"
        >
          {saved ? (
            <>
              <Check className="h-4 w-4" />
              Saved
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Health Conditions Summary */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Health Conditions ({profile.selectedAilments.length})
          </h2>
          <Dialog open={addAilmentOpen} onOpenChange={setAddAilmentOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="border-border text-foreground hover:bg-accent gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] overflow-y-auto bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-card-foreground">
                  Add Health Condition
                </DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4 pt-2">
                {ailmentCategories.map((category) => (
                  <div key={category.id}>
                    <p className="mb-2 text-sm font-semibold text-muted-foreground">
                      {category.label}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {category.ailments.map((ailment) => {
                        const alreadyAdded = profile.selectedAilments.some(
                          (sa) => sa.ailment.id === ailment.id
                        )
                        return (
                          <button
                            key={ailment.id}
                            disabled={alreadyAdded}
                            onClick={() => {
                              addAilment(ailment)
                              setAddAilmentOpen(false)
                            }}
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors ${
                              alreadyAdded
                                ? 'bg-primary/10 text-primary cursor-default'
                                : 'border border-border bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                            }`}
                          >
                            {alreadyAdded && <Check className="h-3 w-3" />}
                            {ailment.name}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {profile.selectedAilments.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No health conditions added. Add conditions to start monitoring
            ingredients.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {profile.selectedAilments.map((sa) => (
              <span
                key={sa.ailment.id}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm text-primary"
              >
                {sa.ailment.name}
                <span className="text-xs opacity-70">
                  ({sa.activeIngredients.length})
                </span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Preferences Summary */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-card-foreground flex items-center gap-2">
          <Leaf className="h-5 w-5 text-accent-foreground" />
          Active Preferences ({profile.selectedPreferences.length})
        </h2>
        {/* enaJ Non-Toxic Baseline */}
        <div className={`mb-4 rounded-xl border-2 p-4 transition-colors ${
          profile.selectedPreferences.includes(baselineId)
            ? 'border-primary/40 bg-primary/5'
            : 'border-border bg-muted/30'
        }`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-semibold text-foreground">enaJ Non-Toxic Baseline</p>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    Recommended
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Monitors for the most commonly flagged toxic ingredients across all products you scan — synthetic chemicals, harmful additives, endocrine disruptors, and more.
                </p>
              </div>
            </div>
            <button
              onClick={() => togglePreference(baselineId)}
              role="switch"
              aria-checked={profile.selectedPreferences.includes(baselineId)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                profile.selectedPreferences.includes(baselineId) ? 'bg-primary' : 'bg-muted-foreground/30'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ${
                  profile.selectedPreferences.includes(baselineId) ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {profile.selectedPreferences.filter((id) => id !== baselineId).length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No preferences set. Add preferences to filter products by your
            lifestyle choices.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {preferenceCategories
              .flatMap((c) => c.preferences)
              .filter((p) => profile.selectedPreferences.includes(p.id) && p.id !== baselineId)
              .map((p) => {
                const baselineCovered =
                  profile.selectedPreferences.includes(baselineId) &&
                  BASELINE_COVERED_PREFS.has(p.name)

                return (
                  <button
                    key={p.id}
                    onClick={() => togglePreference(p.id)}
                    className={`group inline-flex items-center gap-1.5 rounded-full bg-secondary/30 px-3 py-1.5 text-sm text-accent-foreground transition-colors hover:bg-destructive/10 hover:text-destructive ${
                      baselineCovered ? 'ring-1 ring-primary/30' : ''
                    }`}
                    title="Click to remove"
                  >
                    <Check className="h-3 w-3" />
                    {p.name}
                  </button>
                )
              })}
          </div>
        )}
      </div>

      {/* Extension Download */}
      <div className="rounded-xl border border-border bg-white p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <EnajLogo size="md" />
            <div>
              <h3 className="font-semibold text-foreground">
                enaJ Browser Extension
              </h3>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Your guardian angel while you shop online. Press one button on any product page and enaJ scans it for you. Works on Sephora, Target, Walmart, and any other shopping site.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 flex-shrink-0 sm:flex-row">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
              <Chrome className="h-4 w-4" />
              Add to Chrome
            </Button>
            <Button variant="outline" className="border-border text-foreground hover:bg-accent gap-2">
              <Download className="h-4 w-4" />
              Other Browsers
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-card-foreground">
          Quick Actions
        </h2>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setCurrentStep('landing')}
            className="flex items-center justify-between rounded-lg px-4 py-3 text-left transition-colors hover:bg-accent"
          >
            <span className="text-sm text-foreground">Log Out</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  )
}
