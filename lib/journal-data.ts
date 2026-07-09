// Weekly Health Journal - Temporary ailments and conditions data
// These are short-term conditions that users can track.
// The catalog itself is fetched from the backend (api.getJournalConditions())
// and lives in the JournalCategory/JournalCondition tables — these types
// just describe the shape of what comes back.

export interface JournalCondition {
  id: string
  name: string
  category: string
  description: string
  whatWeMonitor: {
    ingredient: string
    reason: string
    sources: { title: string; url: string }[]
  }[]
  funFacts: string[]
  tips: string[]
  generalSources: { title: string; url: string }[]
}

export interface JournalCategory {
  id: string
  label: string
  icon: string // Icon name from lucide-react
  conditions: JournalCondition[]
}