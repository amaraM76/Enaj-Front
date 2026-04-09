'use client'

import { useState } from 'react'
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
} from 'lucide-react'

export function ProfileSettings() {
  const { profile, setProfile, addAilment, togglePreference, setCurrentStep, ailmentCategories, preferenceCategories, clerkUserId } =
    useEnaj()
  const [firstName, setFirstName] = useState(profile?.firstName || '')
  const [lastName, setLastName] = useState(profile?.lastName || '')
  const [email, setEmail] = useState(profile?.email || '')
  const [location, setLocation] = useState(profile?.location || '')
  const [age, setAge] = useState(profile?.age || '')
  const [gender, setGender] = useState(profile?.gender || '')
  const [shoppingStores, setShoppingStores] = useState(profile?.shoppingStores || '')
  const [saved, setSaved] = useState(false)
  const [addAilmentOpen, setAddAilmentOpen] = useState(false)

  if (!profile) return null

  const handleSave = async () => {
    const updatedFields = {
      firstName,
      lastName,
      email,
      location,
      age: age ? Number(age) : undefined,
      gender,
      shoppingStores,
    }
    setProfile({
      ...profile,
      firstName,
      lastName,
      email,
      location,
      age,
      gender,
      shoppingStores,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)

    // Persist to backend
    if (clerkUserId) {
      fetch(`/api/users/${clerkUserId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields),
      }).catch(() => {})
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
            <Label htmlFor="settings-first-name" className="text-foreground">First Name</Label>
            <Input
              id="settings-first-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mt-1.5 bg-background border-border text-foreground"
            />
          </div>
          <div>
            <Label htmlFor="settings-last-name" className="text-foreground">Last Name</Label>
            <Input
              id="settings-last-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="mt-1.5 bg-background border-border text-foreground"
            />
          </div>
          <div>
            <Label htmlFor="settings-email" className="text-foreground">Email</Label>
            <div className="relative mt-1.5">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="settings-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background border-border text-foreground pl-10"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="settings-location" className="text-foreground">Location</Label>
            <Input
              id="settings-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mt-1.5 bg-background border-border text-foreground"
            />
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

        {profile.selectedPreferences.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No preferences set. Add preferences to filter products by your
            lifestyle choices.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {preferenceCategories.flatMap((c) => c.preferences)
              .filter((p) => profile.selectedPreferences.includes(p.id))
              .map((p) => (
                <button
                  key={p.id}
                  onClick={() => togglePreference(p.id)}
                  className="group inline-flex items-center gap-1.5 rounded-full bg-secondary/30 px-3 py-1.5 text-sm text-accent-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  title="Click to remove"
                >
                  <Check className="h-3 w-3" />
                  {p.name}
                </button>
              ))}
          </div>
        )}
      </div>

      {/* Extension Download */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <EnajLogo size="md" />
            <div>
              <h3 className="font-semibold text-foreground">
                Enaj Browser Extension
              </h3>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Your guardian angel while you shop online. Press one button on any product page and Enaj scans it for you. Works on Sephora, Target, Walmart, and any other shopping site.
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
