'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Bare /dashboard (no tab segment) defaults to the health monitor tab.
export default function DashboardIndexPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/dashboard/monitor')
  }, [router])
  return null
}
