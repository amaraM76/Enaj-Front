'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { EnajLogo } from '@/components/enaj-logo'
import { CloudBackground } from '@/components/cloud-background'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock, Eye, EyeOff } from 'lucide-react'

const VALID_USERNAME = 'enajhealth'
const VALID_PASSWORD = 'enaj'

export default function AccessPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Validate credentials
    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      // Set access token in localStorage
      localStorage.setItem('enaj-access-granted', 'true')
      // Redirect to main app
      router.push('/')
    } else {
      setError('Invalid username or password')
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <CloudBackground />
      
      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md border-border bg-card/95 backdrop-blur-sm shadow-lg">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <EnajLogo size="lg" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-foreground">
                Welcome to enaJ
              </CardTitle>
              <CardDescription className="mt-2">
                Enter your credentials to access the platform
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-foreground">
                  Username
                </label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
              >
                <Lock className="h-4 w-4" />
                {isLoading ? 'Accessing...' : 'Access Enaj'}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                This is a private platform. Unauthorized access is prohibited.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} enaJ. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
