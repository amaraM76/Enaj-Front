// A crude but sufficient singularizer for preference display names, used in
// the "This ingredient is a {X}" ingredient-alert sentence (e.g.
// "Silicones" -> "silicone"). Names that don't follow simple plural rules
// are listed explicitly rather than mangled by the trailing-s heuristic.
const SINGULAR_OVERRIDES: Record<string, string> = {
  'pfas (forever chemicals)': 'PFAS-type chemical',
  'microplastics': 'microplastic',
  'gums & fillers': 'gum or filler',
  'bpa & bps': 'BPA/BPS-type chemical',
  'high fructose corn syrup': 'high fructose corn syrup ingredient',
}

export function singularizePreferenceName(name: string): string {
  const lower = name.toLowerCase()
  if (SINGULAR_OVERRIDES[lower]) return SINGULAR_OVERRIDES[lower]
  return lower.endsWith('s') && !lower.endsWith('ss') ? lower.slice(0, -1) : lower
}

export const BASELINE_PREFERENCE_NAME = 'enaJ Non-Toxic Baseline'
export const ALCOHOL_SKIN_PREFERENCE_NAME = 'Alcohol in Skin Products'

// Condition/preference names are bolded in red wherever they appear in the
// sentence, so the thing that triggered the flag stands out from the
// explanation.
function FlagName({ children }: { children: React.ReactNode }) {
  return <strong className="font-bold text-destructive">{children}</strong>
}

// Reason clauses (AilmentFlaggedIngredient.reason, etc.) are freeform data
// authored as standalone capitalized sentences, e.g. "Evaporates quickly
// and dries the skin surface...". Spliced in after "because" mid-sentence,
// that reads as a run-on with a missing subject ("because Evaporates
// quickly..."). This lowercases the clause and prefixes it with "it" unless
// it already starts with a pronoun, so it reads naturally either way.
const PRONOUN_START = /^(it|this|that|these|those|they)('s|'re)?\b/i

function formatReasonClause(reason: string): string {
  const trimmed = reason.trim()
  if (!trimmed) return trimmed
  const lowerFirst = trimmed.charAt(0).toLowerCase() + trimmed.slice(1)
  return PRONOUN_START.test(trimmed) ? lowerFirst : `it ${lowerFirst}`
}

// Builds the ingredient-alert reason sentence for a flagged ingredient,
// matching the exact wording specified for each flag source:
// - ailment: "Flagged because you marked {ailment}. Some people with
//   {ailment} choose to avoid this because {reason}."
// - enaJ Non-Toxic Baseline: "Flagged because of the enaJ Non-toxic
//   baseline. Some people like to avoid this ingredient because {reason}."
// - alcohol-in-skincare: "This ingredient is an alcohol. Some choose to
//   avoid this in their skincare because {reason}."
// - any other preference: "Flagged because you marked {preference}. This
//   ingredient is a {preference, singular}."
export function buildFlagReasonText(flag: {
  source: 'ailment' | 'preference' | 'journal'
  sourceName: string
  reason: string
}): React.ReactNode {
  if (flag.source === 'ailment') {
    return [
      'Flagged because you marked ',
      <FlagName key="name1">{flag.sourceName}</FlagName>,
      '. Some people with ',
      <FlagName key="name2">{flag.sourceName}</FlagName>,
      ' choose to avoid this because ',
      formatReasonClause(flag.reason || 'it can trigger their symptoms'),
      '.',
    ]
  }
  if (flag.source === 'journal') {
    return [
      'Flagged because of your journal entry: ',
      <FlagName key="name1">{flag.sourceName}</FlagName>,
      '.',
      flag.reason ? ` ${flag.reason}` : '',
    ]
  }
  if (flag.sourceName === BASELINE_PREFERENCE_NAME) {
    return [
      'Flagged because of the ',
      <FlagName key="name1">enaJ Non-toxic baseline</FlagName>,
      '. Some people like to avoid this ingredient because ',
      formatReasonClause(flag.reason || "it's commonly flagged as a toxic or harmful additive"),
      '.',
    ]
  }
  if (flag.sourceName === ALCOHOL_SKIN_PREFERENCE_NAME) {
    return [
      'This ingredient is an alcohol. Some choose to avoid this in their skincare because ',
      formatReasonClause(flag.reason || 'it can be drying or irritating'),
      '.',
    ]
  }
  return [
    'Flagged because you marked ',
    <FlagName key="name1">{flag.sourceName}</FlagName>,
    '. This ingredient is a ',
    singularizePreferenceName(flag.sourceName),
    '.',
  ]
}
