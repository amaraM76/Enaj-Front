'use client'

import { Onboarding } from '@/components/onboarding'

// Onboarding itself reads the current step from useParams() and navigates
// between steps with router.push('/onboarding/<step>'), so this route file
// only needs to mount it - refresh and back/forward now land on the exact
// step the URL says, instead of always resetting to 'welcome'.
export default function OnboardingStepPage() {
  return <Onboarding />
}
