// Canonical list of stores shown in the "where do you shop?" picker, plus a
// small Levenshtein-based normalizer that corrects near-miss typos (e.g.
// "Wallmart" -> "Walmart") against that list before saving. Anything that
// isn't a close match to a known store is kept as-is, since users do shop
// at places outside this list.

export const KNOWN_STORES = [
  'Target',
  'Walmart',
  'Amazon',
  'Sephora',
  'Ulta',
  'CVS',
  'Walgreens',
  'Whole Foods',
  "Trader Joe's",
  'Costco',
  "Kroger",
  'Publix',
  'Safeway',
  'Rite Aid',
  'Nordstrom',
  'Marshalls',
  'TJ Maxx',
  "Sam's Club",
  'H-E-B',
  'Meijer',
]

function levenshteinDistance(a: string, b: string): number {
  const m = a.length
  const n = b.length
  if (m === 0) return n
  if (n === 0) return m

  const prevRow = new Array(n + 1)
  const currRow = new Array(n + 1)
  for (let j = 0; j <= n; j++) prevRow[j] = j

  for (let i = 1; i <= m; i++) {
    currRow[0] = i
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      currRow[j] = Math.min(
        currRow[j - 1] + 1, // insertion
        prevRow[j] + 1, // deletion
        prevRow[j - 1] + cost // substitution
      )
    }
    for (let j = 0; j <= n; j++) prevRow[j] = currRow[j]
  }
  return prevRow[n]
}

// Corrects `input` to the closest KNOWN_STORES entry when it's a plausible
// typo (distance scaled to the word's length, so short names need a near-
// exact match while longer ones tolerate a couple of errors). Otherwise
// returns the input's own trimmed form unchanged - a genuinely different
// store name shouldn't get silently mapped to an unrelated one.
export function normalizeStoreName(input: string): string {
  const trimmed = input.trim()
  if (!trimmed) return trimmed

  const lower = trimmed.toLowerCase()
  const exact = KNOWN_STORES.find((s) => s.toLowerCase() === lower)
  if (exact) return exact

  let best: { store: string; distance: number } | null = null
  for (const store of KNOWN_STORES) {
    const distance = levenshteinDistance(lower, store.toLowerCase())
    if (!best || distance < best.distance) {
      best = { store, distance }
    }
  }

  const maxAllowedDistance = Math.max(1, Math.floor(trimmed.length * 0.3))
  if (best && best.distance <= maxAllowedDistance) {
    return best.store
  }

  return trimmed
}

export function normalizeStoreList(stores: string[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const store of stores) {
    const normalized = normalizeStoreName(store)
    const key = normalized.toLowerCase()
    if (!normalized || seen.has(key)) continue
    seen.add(key)
    result.push(normalized)
  }
  return result
}
