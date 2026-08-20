import type {
  AilmentCategory,
  PreferenceCategory,
  Product,
  ScanResult,
} from '@/lib/enaj-data'
import type { JournalCategory } from '@/lib/journal-data'
import type { ApiFlaggedIngredient } from '@/lib/scan-types'

// All calls go through this app's own /api/* routes (which proxy
// server-side to the Railway backend) rather than hitting Railway directly
// from the browser - keeps the backend's hostname, and any user id in the
// request, out of the browser's network tab.

// ---------------------------------------------------------------------------
// Shared fetch helper
// ---------------------------------------------------------------------------

interface FetchOptions {
  method?: string
  body?: unknown
  params?: Record<string, string>
}

async function request<T>(path: string, opts: FetchOptions = {}): Promise<T> {
  const { method = 'GET', body, params } = opts

  let url = path
  if (params) {
    const qs = new URLSearchParams(params).toString()
    if (qs) url += `?${qs}`
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  const res = await fetch(url, {
    method,
    headers,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  })

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}))
    const message =
      (errorBody as { message?: string }).message ||
      (errorBody as { error?: string }).error ||
      `API error ${res.status}`
    throw new Error(message)
  }

  return res.json() as Promise<T>
}

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

export interface RegisterData {
  username: string
  password: string
  firstName: string
  lastName: string
  email: string
  location?: string
  age?: number
  gender?: string
  shoppingStores?: string[]
}

export interface RegisterResponse {
  userId: string
  firstName: string
}

export interface LoginResponse {
  userId: string
  firstName: string
}

export interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  location?: string
  age?: number | string
  gender?: string
  shoppingStores?: string | string[]
  selectedAilments?: any[]
  selectedPreferences?: string[]
  journalEntries?: string[]
  savedProducts?: any[]
}

export interface GetUserResponse {
  user: UserProfile
}

export interface UpdateProfileResponse {
  user: UserProfile
}

export interface GetAilmentsResponse {
  categories: AilmentCategory[]
}

export interface GetLinkedPreferencesResponse {
  linkedPreferences: string[]
}

export interface GetPreferencesResponse {
  categories: PreferenceCategory[]
}

export interface SaveUserAilmentsResponse {
  saved: boolean
}

export interface SaveUserPreferencesBody {
  preferenceSlug?: string
  source: string
  customEntry?: string
}

export interface SaveUserPreferencesResponse {
  saved: boolean
}

export interface GetJournalResponse {
  categories: JournalCategory[]
}
export interface SaveUserJournalResponse {
  saved: boolean
}

export interface GetProductsResponse {
  products: Product[]
  alternatives?: Product[]
}

export interface ScanProductResponse {
  product: Product
  isRecommended: boolean
  flaggedIngredients: ScanResult['flaggedIngredients']
  alternatives: Product[]
}

export interface GetSavedProductsResponse {
  savedProducts: Product[]
}

export interface SaveProductResponse {
  saved: boolean
}

export interface UnsaveProductResponse {
  removed: boolean
}

// Shape returned by POST /api/product-search (barcode lookup) - see
// Enaj-Back's app/api/product-search/route.ts. On a miss the backend
// responds 404 with { error }, which the shared request() helper turns
// into a thrown Error rather than a resolved value, so callers only ever
// see this shape on a hit.
export interface BarcodeLookupProduct {
  barcode: string | null
  name: string
  brand: string
  image: string
  ingredients: string[]
  packaging: string[]
  allergens: string[]
  category: string
  source: string
}

export interface BarcodeLookupResponse {
  product: BarcodeLookupProduct
}

// Response of the new POST /api/scan-text endpoint (Enaj-Back, built in
// parallel against this fixed contract) - a scan of raw pasted/OCR'd
// ingredient text rather than a stored Product, so there's no `product` or
// `alternatives` in the response the way ScanProductResponse has. Uses
// ApiFlaggedIngredient (not ScanResult['flaggedIngredients']) since the
// contract includes `flaggedFrom`/`sources`, which ScanResult's inline type
// doesn't declare.
export interface ScanTextResponse {
  ingredients: string[]
  flaggedIngredients: ApiFlaggedIngredient[]
  isRecommended: boolean
}

// ---------------------------------------------------------------------------
// API methods
// ---------------------------------------------------------------------------

export const api = {
  // -- Auth ------------------------------------------------------------------

  register(data: RegisterData): Promise<RegisterResponse> {
    return request<RegisterResponse>('/api/auth/register', {
      method: 'POST',
      body: data,
    })
  },

  login(username: string, password: string): Promise<LoginResponse> {
    return request<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: { username, password },
    })
  },

  // -- User ------------------------------------------------------------------

  getUser(userId: string): Promise<GetUserResponse> {
    return request<GetUserResponse>(`/api/users/${userId}`)
  },

  updateProfile(
    userId: string,
    fields: Partial<Omit<UserProfile, 'id'>>
  ): Promise<UpdateProfileResponse> {
    return request<UpdateProfileResponse>(`/api/users/${userId}`, {
      method: 'PUT',
      body: fields,
    })
  },

  // -- Ailments --------------------------------------------------------------

  getAilments(): Promise<GetAilmentsResponse> {
    return request<GetAilmentsResponse>('/api/ailments')
  },

  getLinkedPreferences(
    ailmentSlug: string
  ): Promise<GetLinkedPreferencesResponse> {
    return request<GetLinkedPreferencesResponse>(
      `/api/ailments/${ailmentSlug}/linked-preferences`
    )
  },

  // -- Preferences -----------------------------------------------------------

  getPreferences(): Promise<GetPreferencesResponse> {
    return request<GetPreferencesResponse>('/api/preferences')
  },

  getPreferenceDetails(slug: string): Promise<{
    id: string
    name: string
    description?: string
    flaggedIngredients?: Array<{
      id: string
      name: string
      reason?: string
      sources?: { title: string; url: string }[]
    }>
  }> {
    return request(`/api/preferences/${slug}`)
  },

  saveUserAilments(
    userId: string,
    ailmentSlugs: string[],
    customEntry?: string
  ): Promise<SaveUserAilmentsResponse> {
    return request<SaveUserAilmentsResponse>('/api/user-ailments', {
      method: 'POST',
      body: { userId, ailmentSlugs, ...(customEntry ? { customEntry } : {}) },
    })
  },

  saveUserPreferences(
    userId: string,
    preferences: SaveUserPreferencesBody[]
  ): Promise<SaveUserPreferencesResponse> {
    return request<SaveUserPreferencesResponse>('/api/preferences', {
      method: 'POST',
      body: { userId, preferences },
    })
  },

  // -- Journal -----------------------------------------------------------
  getJournalConditions(): Promise<GetJournalResponse> {
    return request<GetJournalResponse>('/api/journal')
  },
  saveUserJournal(
    userId: string,
    journalSlugs: string[],
    customEntry?: string
  ): Promise<SaveUserJournalResponse> {
    return request<SaveUserJournalResponse>('/api/user-journal', {
      method: 'POST',
      body: { userId, journalSlugs, ...(customEntry ? { customEntry } : {}) },
    })
  },

  getProducts(
    category: string,
    userId?: string
  ): Promise<GetProductsResponse> {
    return request<GetProductsResponse>(`/api/products/${category}`, {
      params: userId ? { userId } : undefined,
    })
  },

  scanProduct(
    category: string,
    slug: string,
    userId: string
  ): Promise<ScanProductResponse> {
    return request<ScanProductResponse>(
      `/api/products/${category}/${slug}/scan`,
      { params: { userId } }
    )
  },

  // -- Saved Products --------------------------------------------------------

  getSavedProducts(userId: string): Promise<GetSavedProductsResponse> {
    return request<GetSavedProductsResponse>('/api/saved-products', {
      params: { userId },
    })
  },

  saveProduct(
    userId: string,
    productSlug: string
  ): Promise<SaveProductResponse> {
    return request<SaveProductResponse>('/api/saved-products', {
      method: 'POST',
      body: { userId, productSlug },
    })
  },

  unsaveProduct(
    userId: string,
    productSlug: string
  ): Promise<UnsaveProductResponse> {
    return request<UnsaveProductResponse>('/api/saved-products', {
      method: 'DELETE',
      body: { userId, productSlug },
    })
  },

  // -- Product Import --------------------------------------------------------

  importProduct(product: {
    barcode?: string
    name: string
    brand: string
    image?: string
    ingredients: string[]
    packaging: string[]
    allergens?: string[]
    category: string
  }): Promise<{ product: Product & { slug: string } }> {
    return request<{ product: Product & { slug: string } }>('/api/import-product', {
      method: 'POST',
      body: product,
    })
  },

  // -- Product Search --------------------------------------------------------

  searchProducts(
    query: string,
    source: 'food' | 'beauty' | 'all' = 'all',
    page = 1
  ) {
    return request<unknown>(
      `/api/product-search?q=${encodeURIComponent(query)}&source=${source}&page=${page}`
    )
  },

  lookupBarcode(barcode: string): Promise<BarcodeLookupResponse> {
    return request<BarcodeLookupResponse>('/api/product-search', {
      method: 'POST',
      body: { barcode },
    })
  },

  // -- Text/OCR ingredient scan -----------------------------------------------

  scanText(userId: string, ingredientsText: string): Promise<ScanTextResponse> {
    return request<ScanTextResponse>('/api/scan-text', {
      method: 'POST',
      body: { userId, ingredientsText },
    })
  },
}
