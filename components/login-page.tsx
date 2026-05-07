'use client'

// import { useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useEnaj } from '@/lib/enaj-context'
import { EnajLogo } from '@/components/enaj-logo'
import { CloudBackground } from '@/components/cloud-background'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { SignIn } from '@clerk/nextjs'

export function LoginPage() {
  const { setCurrentStep } = useEnaj()

  // // When user signs in via Clerk, fetch their profile and go to dashboard
  // useEffect(() => {
  //   if (isSignedIn && userId) {
  //     fetchUserProfile(userId).then(async (userProfile) => {
  //       if (userProfile) {
  //         const hasCompletedOnboarding = (
  //           (userProfile.selectedAilments && userProfile.selectedAilments.length > 0) ||
  //           (userProfile.selectedPreferences && userProfile.selectedPreferences.length > 0)
  //         )
          
  //         if (hasCompletedOnboarding) {
  //           setCurrentStep('dashboard')
  //         } else {
  //           setCurrentStep('onboarding')
  //         }
  //       } else {
  //         await createUserInBackend(userId)
  //         setCurrentStep('onboarding')
  //       }
  //     })
  //   }
  // }, [isSignedIn, userId, fetchUserProfile, createUserInBackend, setCurrentStep])

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <CloudBackground />
      
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 lg:px-8">
        <Button
          variant="ghost"
          onClick={() => setCurrentStep('landing')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <EnajLogo />
      </header>

      {/* Clerk SignIn */}
      <main className="relative z-10 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="[&_.cl-footerAction]:hidden">
            <SignIn 
              appearance={{
                elements: {
                  rootBox: 'mx-auto',
                  card: 'bg-card/80 backdrop-blur-sm border-border shadow-lg',
                  headerTitle: 'text-foreground',
                  headerSubtitle: 'text-muted-foreground',
                  formFieldLabel: 'text-foreground',
                  formFieldInput: 'bg-background border-border text-foreground',
                  formButtonPrimary: 'bg-primary hover:bg-primary/90',
                  footerActionLink: 'text-primary hover:text-primary/80',
                  dividerLine: 'bg-border',
                  dividerText: 'text-muted-foreground',
                  socialButtonsBlockButton: 'border-border bg-background hover:bg-accent',
                  socialButtonsBlockButtonText: 'text-foreground',
                  footer: 'hidden',
                  footerAction: { display: 'none' }, 
                },
              }}
              routing="hash"
              signUpUrl="https://www.enajhealth.com/#/sign-up"
              fallbackRedirectUrl="/"
            />
          </div>
          
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => setCurrentStep('onboarding')}
                className="text-primary hover:underline font-medium"
              >
                Create one
              </button>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
