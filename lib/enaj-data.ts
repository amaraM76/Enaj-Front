// Ailment categories and their associated ingredients to monitor
export interface AilmentCategory {
  id: string
  label: string
  ailments: Ailment[]
}

export interface Ailment {
  id: string
  name: string
  flaggedIngredients: FlaggedIngredient[]
  /** IDs of preferences that should be auto-selected when this ailment is chosen */
  linkedPreferences?: string[]
}

export interface IngredientSource {
  title: string
  url: string
}

export interface FlaggedIngredient {
  id: string
  name: string
  reason: string
  sources?: IngredientSource[]
}

export interface PreferenceCategory {
  id: string
  label: string
  description?: string
  preferences: Preference[]
}

export interface Preference {
  id: string
  name: string
  description: string
}

export interface Product {
  id: string
  slug?: string
  name: string
  brand: string
  image: string
  price: string
  url: string
  ingredients: string[]
  category: string
}

export interface ScanResult {
  product: Product
  isRecommended: boolean
  flaggedIngredients: {
    ingredient: string
    reason: string
    source: 'ailment' | 'preference'
    sourceName: string
  }[]
  alternatives: Product[]
}

/** Helper: Given a set of ailment IDs and the ailment categories from the API, return all linked preference IDs */
export function getLinkedPreferences(ailmentIds: Set<string>, ailmentCategories: AilmentCategory[]): Set<string> {
  const allAilments = ailmentCategories.flatMap((c) => c.ailments)
  const linked = new Set<string>()
  for (const id of ailmentIds) {
    const ailment = allAilments.find((a) => a.id === id)
    if (ailment?.linkedPreferences) {
      for (const prefId of ailment.linkedPreferences) {
        linked.add(prefId)
      }
    }
  }
  return linked
}
