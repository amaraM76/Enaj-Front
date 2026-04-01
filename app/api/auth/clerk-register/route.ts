import { NextRequest, NextResponse } from 'next/server'

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://enaj-back-production.up.railway.app'

// CORS headers for cross-origin requests
function getCorsHeaders(request?: NextRequest) {
  const origin = request?.headers.get('origin') || '*'
  const allowedOrigins = [
    'https://www.enajhealth.com',
    'https://enajhealth.com',
    'http://localhost:3000',
  ]
  
  const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0]
  
  return {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  }
}

// Handle OPTIONS preflight requests
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { headers: getCorsHeaders(request) })
}

// Handle POST - register new user with Clerk ID
export async function POST(request: NextRequest) {
  const headers = getCorsHeaders(request)
  try {
    const body = await request.json()
    const { clerkUserId, clerkId, email, firstName, lastName, source, ...additionalData } = body

    // Accept either clerkUserId or clerkId for flexibility
    const userId = clerkUserId || clerkId

    if (!userId) {
      return NextResponse.json(
        { error: 'clerkUserId or clerkId is required' },
        { status: 400, headers }
      )
    }

    // Forward request to Railway backend
    const response = await fetch(`${API_URL}/api/auth/clerk-register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clerkUserId: userId,
        clerkId: userId,
        email: email || '',
        firstName: firstName || '',
        lastName: lastName || '',
        source: source || 'frontend',
        ...additionalData,
      }),
    })

    if (!response.ok) {
      // If user already exists (409), that's okay
      if (response.status === 409) {
        return NextResponse.json(
          { success: true, message: 'User already exists', clerkUserId: userId },
          { status: 200, headers }
        )
      }
      
      const error = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: (error as { message?: string }).message || 'Failed to register user' },
        { status: response.status, headers }
      )
    }

    const userData = await response.json()
    return NextResponse.json(userData, { headers })
  } catch (error) {
    console.error('Error in clerk-register route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: getCorsHeaders(request) }
    )
  }
}
