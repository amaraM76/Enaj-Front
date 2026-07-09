'use client'

import { useState } from 'react'
import { useEnaj } from '@/lib/enaj-context'
import { getLinkedPreferences } from '@/lib/enaj-data'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Heart,
  X,
  Plus,
  AlertTriangle,
  Eye,
  Leaf,
  Check,
  Undo2,
  Info,
  Sparkles,
  Shield,
} from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { getPreferenceEducation } from '@/lib/preference-education'

const BASELINE_CATEGORIES = [
  { label: 'Synthetic Chemicals & Preservatives', items: ['Parabens', 'Formaldehyde', 'Phthalates', 'Triclosan', 'Sulfates (SLS/SLES)', 'Oxybenzone', 'PFAS'] },
  { label: 'Food Additives', items: ['High Fructose Corn Syrup', 'Artificial Colors & Dyes', 'Artificial Sweeteners', 'MSG', 'Sodium Nitrite/Nitrate', 'Carrageenan', 'Trans Fats', 'Gums & Fillers'] },
  { label: 'Seed Oils', items: ['Canola Oil', 'Soybean Oil', 'Corn Oil', 'Cottonseed Oil', 'Sunflower Oil'] },
  { label: 'Heavy Metals & Toxins', items: ['Lead', 'Mercury', 'Aluminum', 'BPA/BPS'] },
  { label: 'Microplastics', items: ['Polyethylene Beads', 'Polypropylene Beads', 'Microplastic Particles'] },
]

function BaselineMonitorCard({ categories }: { categories: { label: string; items: string[] }[] }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Shield className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-sm font-semibold text-foreground">enaJ Non-Toxic Baseline</p>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Active</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Monitoring {categories.reduce((sum, c) => sum + c.items.length, 0)} commonly flagged toxic ingredients across all product scans.
            </p>
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-shrink-0 text-xs text-primary hover:underline font-medium"
        >
          {expanded ? 'Hide' : "See what's monitored"}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 flex flex-col gap-3">
          {categories.map((cat) => (
            <div key={cat.label}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">{cat.label}</p>
              <div className="flex flex-wrap gap-1.5">
                {cat.items.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function AilmentMonitor() {
  const {
    profile,
    removeAilment,
    removeIngredientFromAilment,
    addIngredientToAilment,
    addAilment,
    togglePreference,
    ailmentCategories,
    preferenceCategories,
  } = useEnaj()
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [addPreferenceDialogOpen, setAddPreferenceDialogOpen] = useState(false)
  const [pendingAilments, setPendingAilments] = useState<string[]>([])
  const [pendingPrefChanges, setPendingPrefChanges] = useState(false)
  const [pendingPrefs, setPendingPrefs] = useState<Set<string> | null>(null)

  const [pendingDelete, setPendingDelete] = useState<{
    ailmentId: string
    ingredientId: string
    ingredientName: string
  } | null>(null)
  const [pendingAilmentRemove, setPendingAilmentRemove] = useState<{
    ailmentId: string
    ailmentName: string
  } | null>(null)
  const [pendingPrefRemove, setPendingPrefRemove] = useState<{
    prefId: string
    prefName: string
  } | null>(null)

  if (!profile) return null
  
  const baselineId = 'enaj-baseline'
  const baselineActive = profile.selectedPreferences.includes(baselineId)

  const totalMonitored = profile.selectedAilments.reduce(
    (sum, sa) => sum + sa.activeIngredients.length,
    0
  )
  const BASELINE_COVERED_PREFS = new Set([
    'Parabens', 'Phthalates', 'Synthetic Fragrance', 'Oxybenzone', 'BPA & BPS',
    'Sulfates', 'Formaldehyde', 'Triclosan', 'Nitrates/Nitrites', 'Artificial Flavors',
    'Food Dyes', 'MSG', 'Artificial Sweeteners', 'High Fructose Corn Syrup',
    'Trans Fats', 'Seed Oils', 'PFAS (Forever Chemicals)', 'Microplastics', 'Gums & Fillers',
  ])

  const handleIngredientDeleteClick = (ailmentId: string, ingredientId: string, ingredientName: string) => {
    setPendingDelete({ ailmentId, ingredientId, ingredientName })
  }

  const confirmDelete = () => {
    if (pendingDelete) {
      removeIngredientFromAilment(pendingDelete.ailmentId, pendingDelete.ingredientId)
      setPendingDelete(null)
    }
  }

  const confirmAilmentRemove = () => {
    if (pendingAilmentRemove) {
      removeAilment(pendingAilmentRemove.ailmentId)
      setPendingAilmentRemove(null)
    }
  }

  const confirmPrefRemove = () => {
    if (pendingPrefRemove) {
      togglePreference(pendingPrefRemove.prefId)
      setPendingPrefRemove(null)
    }
  }

  const linkedPrefs = getLinkedPreferences(
    new Set(profile.selectedAilments.map((sa) => sa.ailment.id)),
    ailmentCategories
  )

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-6">

        {/* Confirmation Dialogs */}
        <AlertDialog open={!!pendingAilmentRemove} onOpenChange={(open) => { if (!open) setPendingAilmentRemove(null) }}>
          <AlertDialogContent className="bg-card border-border">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-card-foreground">Remove health condition?</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                Are you sure you want to remove <span className="font-semibold text-foreground">{pendingAilmentRemove?.ailmentName}</span>? This will stop monitoring all associated ingredients.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-border text-foreground hover:bg-accent">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmAilmentRemove} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Yes, Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={!!pendingPrefRemove} onOpenChange={(open) => { if (!open) setPendingPrefRemove(null) }}>
          <AlertDialogContent className="bg-card border-border">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-card-foreground">Remove preference?</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                Are you sure you want to remove <span className="font-semibold text-foreground">{pendingPrefRemove?.prefName}</span> from your preferences?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-border text-foreground hover:bg-accent">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmPrefRemove} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Yes, Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={!!pendingDelete} onOpenChange={(open) => { if (!open) setPendingDelete(null) }}>
          <AlertDialogContent className="bg-card border-border">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-card-foreground">Remove ingredient from monitoring?</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                Are you sure you want to stop monitoring <span className="font-semibold text-foreground">{pendingDelete?.ingredientName}</span>? You can add it back later.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-border text-foreground hover:bg-accent">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Yes, Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Health Monitor</h1>
          <p className="mt-1 text-muted-foreground">
            Track your health conditions and the ingredients you want to avoid.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex gap-4 flex-wrap">
          <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2">
            <Heart className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">{profile.selectedAilments.length} conditions</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-2">
            <Eye className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">{totalMonitored} items monitored</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-4 py-2">
            <Leaf className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-600">{profile.selectedPreferences.length} preferences</span>
          </div>
        </div>

        {/* Your Conditions & Monitored Ingredients */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Your Conditions & Monitored Ingredients
            </h2>
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1">
                  <Plus className="h-4 w-4" />
                  Add Condition
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[80vh] overflow-y-auto bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-card-foreground">Add Health Condition</DialogTitle>
                  <DialogDescription className="text-muted-foreground">Select conditions to monitor their associated ingredients.</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 pt-2">
                  {ailmentCategories.map((category) => (
                    <div key={category.id}>
                      <p className="mb-2 text-sm font-semibold text-muted-foreground">{category.label}</p>
                      <div className="flex flex-wrap gap-2">
                        {category.ailments.map((ailment) => {
                          const alreadyAdded = profile.selectedAilments.some((sa) => sa.ailment.id === ailment.id)
                          const isPending = pendingAilments.includes(ailment.id)
                          return (
                            <button
                              key={ailment.id}
                              disabled={alreadyAdded}
                              onClick={() => {
                                if (isPending) {
                                  setPendingAilments((prev) => prev.filter((id) => id !== ailment.id))
                                } else {
                                  setPendingAilments((prev) => [...prev, ailment.id])
                                }
                              }}
                              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors ${
                                alreadyAdded
                                  ? 'bg-primary/10 text-primary cursor-default'
                                  : isPending
                                  ? 'bg-primary text-primary-foreground'
                                  : 'border border-border bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                              }`}
                            >
                              {(alreadyAdded || isPending) && <Check className="h-3 w-3" />}
                              {ailment.name}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                {pendingAilments.length > 0 && (
                  <DialogFooter className="mt-4">
                    <Button
                      onClick={() => {
                        const allAilments = ailmentCategories.flatMap((c) => c.ailments)
                        for (const id of pendingAilments) {
                          const ailment = allAilments.find((a) => a.id === id)
                          if (ailment) addAilment(ailment)
                        }
                        setPendingAilments([])
                        setAddDialogOpen(false)
                      }}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                    >
                      <Check className="h-4 w-4" />
                      Add Selected ({pendingAilments.length})
                    </Button>
                  </DialogFooter>
                )}
              </DialogContent>
            </Dialog>
          </div>

          <div className="p-5">
            {profile.selectedAilments.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <AlertTriangle className="mb-3 h-10 w-10 text-muted-foreground" />
                <p className="text-lg font-medium text-card-foreground">No conditions added yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add a health condition to start monitoring ingredients.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {profile.selectedAilments.map((sa) => {
                  const removedIngredients = sa.ailment.flaggedIngredients.filter(
                    (fi) => !sa.activeIngredients.find((ai) => ai.id === fi.id)
                  )
                  const summaryOnlyConditions = ['dairy-allergy', 'gluten-intolerance', 'soy-allergy']
                  const isSummaryOnly = summaryOnlyConditions.includes(sa.ailment.id)
                  const getSummaryLabel = (ailmentId: string) => {
                    switch (ailmentId) {
                      case 'dairy-allergy': return 'All dairy ingredients monitored'
                      case 'gluten-intolerance': return 'All gluten ingredients monitored'
                      case 'soy-allergy': return 'All soy ingredients monitored'
                      default: return null
                    }
                  }
                  return (
                    <div key={sa.ailment.id} className="rounded-lg border border-border bg-muted/30 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                            <Heart className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-card-foreground">{sa.ailment.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {sa.activeIngredients.length} items monitored
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPendingAilmentRemove({ ailmentId: sa.ailment.id, ailmentName: sa.ailment.name })}
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="mb-3">
                        <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          Monitoring
                        </p>
                        {sa.activeIngredients.length === 0 ? (
                          <p className="text-sm text-muted-foreground italic">All ingredients removed.</p>
                        ) : isSummaryOnly ? (
                          <div className="rounded-lg bg-primary/5 border border-primary/20 px-4 py-3">
                            <p className="text-sm font-medium text-primary flex items-center gap-2">
                              <Check className="h-4 w-4" />
                              {getSummaryLabel(sa.ailment.id)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {sa.activeIngredients.length} ingredients are being checked automatically
                            </p>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {sa.activeIngredients.map((ing) => (
                              <Tooltip key={ing.id}>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={() => handleIngredientDeleteClick(sa.ailment.id, ing.id, ing.name)}
                                    className="group inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm text-primary transition-colors hover:bg-destructive/10 hover:text-destructive"
                                  >
                                    {ing.name}
                                    <X className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                                    <Info className="h-3 w-3 opacity-50 group-hover:opacity-0" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs bg-popover text-popover-foreground border-border">
                                  <p className="text-xs">{ing.reason}</p>
                                  <p className="mt-1 text-xs text-muted-foreground">Click to remove from monitoring</p>
                                </TooltipContent>
                              </Tooltip>
                            ))}
                          </div>
                        )}
                      </div>

                      {!isSummaryOnly && removedIngredients.length > 0 && (
                        <div className="rounded-lg bg-muted p-3">
                          <p className="mb-2 text-xs font-medium text-muted-foreground flex items-center gap-1">
                            <Undo2 className="h-3 w-3" />
                            Removed (click to restore)
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {removedIngredients.map((ing) => (
                              <button
                                key={ing.id}
                                onClick={() => addIngredientToAilment(sa.ailment.id, ing)}
                                className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-border bg-background px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                              >
                                <Plus className="h-3 w-3" />
                                {ing.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Your Preferences */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
              <Leaf className="h-5 w-5 text-emerald-600" />
              Your Preferences
            </h2>
            <Dialog open={addPreferenceDialogOpen} onOpenChange={(open) => {
              setAddPreferenceDialogOpen(open)
              if (open) {
                setPendingPrefs(new Set(profile.selectedPreferences))
              } else {
                setPendingPrefs(null)
                setPendingPrefChanges(false)
              }
            }}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="border-border text-foreground hover:bg-accent gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Edit
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[80vh] overflow-y-auto bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-card-foreground">Edit Preferences</DialogTitle>
                  <DialogDescription className="text-muted-foreground">Select which preferences to apply when scanning products.</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 pt-2">
                  {preferenceCategories.map((category) => (
                    <div key={category.id}>
                      <p className="mb-2 text-sm font-semibold text-muted-foreground">{category.label}</p>
                      <div className="flex flex-wrap gap-2">
                      {category.preferences.map((pref) => {
                        const currentPrefs = pendingPrefs ?? new Set(profile.selectedPreferences)
                        const alreadySelected = profile.selectedPreferences.includes(pref.id)  // ← direct profile check
                        const isPending = pendingPrefs?.has(pref.id) && !alreadySelected       // ← only newly added
                        const isBaselineId = pref.id === baselineId
                        const isCoveredByBaseline = currentPrefs.has(baselineId) && BASELINE_COVERED_PREFS.has(pref.name) && !isBaselineId

                        return (
                          <button
                            key={pref.id}
                            disabled={alreadySelected || isCoveredByBaseline}
                            onClick={() => {
                              if (alreadySelected || isCoveredByBaseline) return
                              setPendingPrefs((prev) => {
                                const next = new Set(prev ?? profile.selectedPreferences)
                                if (next.has(pref.id)) next.delete(pref.id)
                                else next.add(pref.id)
                                return next
                              })
                            }}
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors ${
                              alreadySelected
                                ? 'bg-primary/10 text-primary cursor-default'
                                : isPending
                                ? 'bg-primary text-primary-foreground'
                                : isCoveredByBaseline
                                ? 'border border-primary/30 bg-primary/10 text-primary/60 cursor-not-allowed opacity-60'
                                : 'border border-border bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                            }`}
                          >
                            {(alreadySelected || isPending) && <Check className="h-3 w-3" />}
                            {isCoveredByBaseline && !alreadySelected && <Sparkles className="h-3 w-3" />}
                            {pref.name}
                          </button>
                        )
                      })}
                      </div>
                    </div>
                  ))}
                </div>
                <DialogFooter className="mt-4">
                  <Button
                    onClick={() => {
                      if (pendingPrefs) {
                        const current = new Set(profile.selectedPreferences)
                        for (const id of pendingPrefs) {
                          if (!current.has(id)) togglePreference(id)
                        }
                        // Remove unchecked ones that were previously selected
                        for (const id of current) {
                          if (!pendingPrefs.has(id)) togglePreference(id)
                        }
                      }
                      setPendingPrefs(null)
                      setAddPreferenceDialogOpen(false)
                    }}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Done
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="p-5 flex flex-col gap-4">
            {baselineActive && (
              <BaselineMonitorCard categories={BASELINE_CATEGORIES} />
            )}

            {profile.selectedPreferences.filter((id) => id !== baselineId).length === 0 && !baselineActive ? (
              <div className="flex flex-col items-center py-6 text-center">
                <Leaf className="mb-3 h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">No preferences set yet.</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.selectedPreferences
                  .filter((id) => id !== baselineId && !linkedPrefs.has(id))
                  .map((prefId) => {
                    const pref = preferenceCategories.flatMap((c) => c.preferences).find((p) => p.id === prefId)
                    const prefName = pref?.name || prefId
                    const prefEducation = getPreferenceEducation(prefId)
                    return (
                      <Tooltip key={prefId}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => setPendingPrefRemove({ prefId, prefName })}
                            className="group inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-sm text-emerald-700 transition-colors hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Leaf className="h-3 w-3" />
                            {prefName}
                            <X className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                            <Info className="h-3 w-3 opacity-50 group-hover:opacity-0" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-sm bg-popover text-popover-foreground border-border p-3" side="top">
                          {prefEducation ? (
                            <p className="text-xs leading-relaxed">{prefEducation.whatItIs.slice(0, 200)}{prefEducation.whatItIs.length > 200 ? '...' : ''}</p>
                          ) : (
                            <p className="text-xs">Products containing {prefName.toLowerCase()} ingredients will be flagged.</p>
                          )}
                          <p className="mt-2 text-xs text-muted-foreground italic">Click to remove from preferences</p>
                        </TooltipContent>
                      </Tooltip>
                    )
                  })}
              </div>
            )}
          </div>
        </div>

      </div>
    </TooltipProvider>
  )
}

        