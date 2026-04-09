'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { useAuth, useUser } from '@clerk/nextjs'
import type { Ailment, AilmentCategory, FlaggedIngredient, PreferenceCategory, Product } from './enaj-data'
import { api } from './api'

export interface UserProfile {
  firstName: string
  lastName: string
  email: string
  location: string
  age: string
  gender: string
  shoppingStores: string
  selectedAilments: SelectedAilment[]
  selectedPreferences: string[]
  savedProducts: Product[]
  customHealthCondition?: string
  customPreference?: string
}

export interface SelectedAilment {
  ailment: Ailment
  activeIngredients: FlaggedIngredient[] // subset the user hasn't removed
}

interface EnajContextType {
  profile: UserProfile | null
  setProfile: (profile: UserProfile) => void
  currentStep: 'landing' | 'login' | 'onboarding' | 'dashboard'
  setCurrentStep: (step: 'landing' | 'login' | 'onboarding' | 'dashboard') => void
  clerkUserId: string | null
  isClerkLoaded: boolean
  ailmentCategories: AilmentCategory[]
  preferenceCategories: PreferenceCategory[]
  loading: boolean
  logout: () => void
  fetchUserProfile: (clerkUserId: string) => Promise<UserProfile | null>
  createUserInBackend: (clerkUserId: string) => Promise<boolean>
  saveProfileWithClerk: (clerkUserId: string, data: Record<string, unknown>) => Promise<void>
  addAilment: (ailment: Ailment) => void
  removeAilment: (ailmentId: string) => void
  removeIngredientFromAilment: (ailmentId: string, ingredientId: string) => void
  addIngredientToAilment: (ailmentId: string, ingredient: FlaggedIngredient) => void
  togglePreference: (preferenceId: string) => void
  saveProduct: (product: Product) => void
  unsaveProduct: (productId: string) => void
  isProductSaved: (productId: string) => boolean
  refreshSavedProducts: () => Promise<void>
  profileLoaded: boolean

}

const EnajContext = createContext<EnajContextType | null>(null)

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://enaj-back-production.up.railway.app'

export function EnajProvider({ children }: { children: ReactNode }) {
  const { isSignedIn, userId: clerkUserId, isLoaded: isClerkLoaded } = useAuth()
  const { user: clerkUser } = useUser()
  const [profile, setProfileState] = useState<UserProfile | null>(null)
  const [currentStep, setCurrentStep] = useState<'landing' | 'login' | 'onboarding' | 'dashboard'>('landing')
  const [ailmentCategories, setAilmentCategories] = useState<AilmentCategory[]>([])
  const [preferenceCategories, setPreferenceCategories] = useState<PreferenceCategory[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch user profile from our backend using Clerk userId
  const fetchUserProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {
      const { user } = await api.getUser(userId)
      const profileData = {
        firstName: user.firstName ?? clerkUser?.firstName ?? '',
        lastName: user.lastName ?? clerkUser?.lastName ?? '',
        email: user.email ?? clerkUser?.primaryEmailAddress?.emailAddress ?? '',
        location: user.location ?? '',
        age: user.age != null ? String(user.age) : '',
        gender: user.gender ?? '',
        shoppingStores: Array.isArray(user.shoppingStores)
          ? user.shoppingStores.join(', ')
          : user.shoppingStores ?? '',
        selectedAilments: user.selectedAilments ?? [],
        selectedPreferences: user.selectedPreferences ?? [],
        savedProducts: user.savedProducts ?? [],
        customHealthCondition: undefined,
        customPreference: undefined,
      }
      setProfileState(profileData)
      return profileData
    } catch {
      return null
    }
  }, [clerkUser])

  const saveProfileWithClerk = useCallback(async (userId: string, data: Record<string, unknown>) => {
    const response = await fetch(`${API_URL}/api/users/${userId}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        email: clerkUser?.primaryEmailAddress?.emailAddress,
        firstName: clerkUser?.firstName,
        lastName: clerkUser?.lastName,
      }),
    })
  
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error((error as { message?: string }).message || 'Failed to save profile')
    }
  }, [clerkUser])


  // ── Fetch catalog data on mount ──────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    async function init() {
      try {
        const [ailRes, prefRes] = await Promise.all([
          api.getAilments(),
          api.getPreferences(),
        ])
        if (!cancelled) {
          setAilmentCategories(ailRes.categories)
          setPreferenceCategories(prefRes.categories)
        }
      } catch {
        // API unavailable — app still works with empty arrays
      }

      if (!cancelled) setLoading(false)
    }
    init()
    return () => {
      cancelled = true
    }
  }, [])

  // Create user in our backend if they don't exist (uses local API proxy to avoid CORS)
  const createUserInBackend = useCallback(async (userId: string): Promise<boolean> => {
    if (!clerkUser) return false
    
    try {
      // Use local API route to avoid CORS issues
      const response = await fetch('/api/auth/clerk-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clerkId: userId,
          email: clerkUser.primaryEmailAddress?.emailAddress || '',
          firstName: clerkUser.firstName || clerkUser.fullName?.split(' ')[0] || '',
          lastName: clerkUser.lastName || clerkUser.fullName?.split(' ').slice(1).join(' ') || '',
        }),
      })

      if (!response.ok) {
        return false
      }
      
      return true
    } catch {
      return false
    }
  }, [clerkUser])

  const [profileLoaded, setProfileLoaded] = useState(false)

  useEffect(() => {
    if (!isClerkLoaded) return
    if (!isSignedIn || !clerkUserId) return
    if (!clerkUser) return  // ← add this
    if (profileLoaded) return

    const initializeUser = async () => {
      console.log('=== initializeUser called ===')
      console.log('clerkUserId:', clerkUserId)
      
      const userProfile = await fetchUserProfile(clerkUserId)
      console.log('=== fetchUserProfile returned ===')
      console.log('userProfile:', JSON.stringify(userProfile))
      console.log('selectedAilments:', userProfile?.selectedAilments)
      console.log('selectedPreferences:', userProfile?.selectedPreferences)
      
      setProfileLoaded(true)
      
      if (userProfile) {
        const hasCompletedOnboarding = (
          (userProfile.selectedAilments && userProfile.selectedAilments.length > 0) ||
          (userProfile.selectedPreferences && userProfile.selectedPreferences.length > 0)
        )
        console.log('hasCompletedOnboarding:', hasCompletedOnboarding)
        if (hasCompletedOnboarding) {
          setCurrentStep('dashboard')
        } else {
          setCurrentStep('onboarding')
        }
      } else {
        console.log('no user profile found, creating...')
        await createUserInBackend(clerkUserId)
        await fetchUserProfile(clerkUserId)
        setCurrentStep('onboarding')
      }
    }
    initializeUser()
  }, [isClerkLoaded, isSignedIn, clerkUserId, clerkUser, profileLoaded, fetchUserProfile, createUserInBackend])

  const logout = useCallback(() => {
    setProfileState(null)
    setProfileLoaded(false)
    setCurrentStep('landing')
  }, [])

  const setProfile = useCallback((p: UserProfile) => {
    setProfileState(p)
  }, [])

  const addAilment = useCallback((ailment: Ailment) => {
    setProfileState((prev) => {
      if (!prev) return prev
      if (prev.selectedAilments.find((sa) => sa.ailment.id === ailment.id)) return prev
      const updated = {
        ...prev,
        selectedAilments: [
          ...prev.selectedAilments,
          { ailment, activeIngredients: [...ailment.flaggedIngredients] },
        ],
      }
      // Persist to backend using Clerk userId
      if (clerkUserId) {
        const allSlugs = updated.selectedAilments.map((sa) => sa.ailment.id)
        api.saveUserAilments(clerkUserId, allSlugs, prev.customHealthCondition).catch(() => {})
      }
      return updated
    })
  }, [clerkUserId])

  const removeAilment = useCallback((ailmentId: string) => {
    setProfileState((prev) => {
      if (!prev) return prev
      const updated = {
        ...prev,
        selectedAilments: prev.selectedAilments.filter((sa) => sa.ailment.id !== ailmentId),
      }
      // Persist to backend using Clerk userId
      if (clerkUserId) {
        const allSlugs = updated.selectedAilments.map((sa) => sa.ailment.id)
        api.saveUserAilments(clerkUserId, allSlugs, prev.customHealthCondition).catch(() => {})
      }
      return updated
    })
  }, [clerkUserId])

  const removeIngredientFromAilment = useCallback((ailmentId: string, ingredientId: string) => {
    setProfileState((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        selectedAilments: prev.selectedAilments.map((sa) =>
          sa.ailment.id === ailmentId
            ? { ...sa, activeIngredients: sa.activeIngredients.filter((ing) => ing.id !== ingredientId) }
            : sa
        ),
      }
    })
  }, [])

  const addIngredientToAilment = useCallback((ailmentId: string, ingredient: FlaggedIngredient) => {
    setProfileState((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        selectedAilments: prev.selectedAilments.map((sa) =>
          sa.ailment.id === ailmentId
            ? { ...sa, activeIngredients: [...sa.activeIngredients, ingredient] }
            : sa
        ),
      }
    })
  }, [])

  const togglePreference = useCallback((preferenceId: string) => {
    setProfileState((prev) => {
      if (!prev) return prev
      const has = prev.selectedPreferences.includes(preferenceId)
      const updated = {
        ...prev,
        selectedPreferences: has
          ? prev.selectedPreferences.filter((id) => id !== preferenceId)
          : [...prev.selectedPreferences, preferenceId],
      }
      // Persist to backend using Clerk userId
      if (clerkUserId) {
        const prefsArray = updated.selectedPreferences.map((id) => ({
          preferenceSlug: id,
          source: 'SELECTED' as const,
        }))
        api.saveUserPreferences(clerkUserId, prefsArray).catch(() => {})
      }
      return updated
    })
  }, [clerkUserId])

  const saveProduct = useCallback((product: Product & { slug?: string }) => {
    const productSlug = product.slug || product.id
    setProfileState((prev) => {
      if (!prev) return prev
      // Check if already saved by slug or id
      if (prev.savedProducts.find((p) => (p as Product & { slug?: string }).slug === productSlug || p.id === productSlug)) return prev
      return { ...prev, savedProducts: [...prev.savedProducts, { ...product, slug: productSlug }] }
    })
    // Persist to backend using Clerk userId
    if (clerkUserId) {
      api.saveProduct(clerkUserId, productSlug).catch(() => {})
    }
  }, [clerkUserId])

  const unsaveProduct = useCallback((productSlug: string) => {
    setProfileState((prev) => {
      if (!prev) return prev
      return { ...prev, savedProducts: prev.savedProducts.filter((p) => {
        const pSlug = (p as Product & { slug?: string }).slug || p.id
        return pSlug !== productSlug
      }) }
    })
    // Persist to backend using Clerk userId
    if (clerkUserId) {
      api.unsaveProduct(clerkUserId, productSlug).catch(() => {})
    }
  }, [clerkUserId])

  const isProductSaved = useCallback(
    (productSlug: string) => {
      return !!profile?.savedProducts.find((p) => {
        const pSlug = (p as Product & { slug?: string }).slug || p.id
        return pSlug === productSlug
      })
    },
    [profile?.savedProducts]
  )

  const refreshSavedProducts = useCallback(async () => {
    if (!clerkUserId) return
    try {
      const { user } = await api.getUser(clerkUserId)
      setProfileState((prev) => {
        if (!prev) return prev
        return { ...prev, savedProducts: user.savedProducts ?? [] }
      })
    } catch {
      // Failed to refresh - ignore
    }
  }, [clerkUserId])

  // Auto-refresh saved products every 30 seconds
  useEffect(() => {
    if (!clerkUserId) return
    const interval = setInterval(() => {
      refreshSavedProducts()
    }, 30000)
    return () => clearInterval(interval)
  }, [clerkUserId, refreshSavedProducts])

  return (
    <EnajContext.Provider
      value={{
        profile,
        setProfile,
        currentStep,
        setCurrentStep,
        clerkUserId: clerkUserId ?? null,
        isClerkLoaded,
        ailmentCategories,
        preferenceCategories,
        loading,
        logout,
        fetchUserProfile,
        createUserInBackend,
        saveProfileWithClerk,
        addAilment,
        removeAilment,
        removeIngredientFromAilment,
        addIngredientToAilment,
        togglePreference,
        saveProduct,
        unsaveProduct,
        isProductSaved,
        refreshSavedProducts,
        profileLoaded,
      }}
    >
      {children}
    </EnajContext.Provider>
  )
}

export function useEnaj() {
  const ctx = useContext(EnajContext)
  if (!ctx) throw new Error('useEnaj must be used within EnajProvider')
  return ctx
}
