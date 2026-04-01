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

// Handle POST - create or update user profile
export async function POST(request: NextRequest) {
  const headers = getCorsHeaders(request)
  try {
    const body = await request.json()
    const { clerkUserId, email, firstName, lastName, ...profileData } = body

    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'clerkUserId is required' },
        { status: 400, headers }
      )
    }

    // First, try to create the user in our backend
    const createResponse = await fetch(`${API_URL}/api/auth/clerk-register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clerkUserId,
        email: email || '',
        firstName: firstName || '',
        lastName: lastName || '',
        ...profileData,
      }),
    })

    // If user already exists (409) or was created successfully, try to update profile
    if (createResponse.ok || createResponse.status === 409) {
      // Update profile with additional data if needed
      if (Object.keys(profileData).length > 0) {
        const updateResponse = await fetch(`${API_URL}/api/users/${clerkUserId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...profileData,
            firstName,
            lastName,
            email,
          }),
        })

        if (updateResponse.ok) {
          const userData = await updateResponse.json()
          return NextResponse.json(userData, { headers })
        }
      }

      // Return success even if update fails - user exists
      return NextResponse.json(
        { success: true, clerkUserId },
        { headers }
      )
    }

    // If creation failed for other reasons, return error
    const error = await createResponse.json().catch(() => ({}))
    return NextResponse.json(
      { error: (error as { message?: string }).message || 'Failed to create user' },
      { status: createResponse.status, headers }
    )
  } catch (error) {
    console.error('Error in clerk-profile route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: getCorsHeaders(request) }
    )
  }
}

// Handle GET - fetch user profile by Clerk ID
export async function GET(request: NextRequest) {
  const headers = getCorsHeaders(request)
  try {
    const { searchParams } = new URL(request.url)
    const clerkUserId = searchParams.get('clerkUserId')

    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'clerkUserId is required' },
        { status: 400, headers }
      )
    }

    const response = await fetch(`${API_URL}/api/users/${clerkUserId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404, headers }
        )
      }
      const error = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: (error as { message?: string }).message || 'Failed to fetch user' },
        { status: response.status, headers }
      )
    }

    const userData = await response.json()
    return NextResponse.json(userData, { headers })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: getCorsHeaders(request) }
    )
  }
}
