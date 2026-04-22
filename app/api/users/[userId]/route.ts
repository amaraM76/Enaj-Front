import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function getCorsHeaders(request?: NextRequest) {
  const origin = request?.headers.get('origin') || '*'
  const allowedOrigins = [
    'https://www.enajhealth.com',
    'https://enajhealth.com',
    'http://localhost:3000',
    'http://localhost:3001',
  ]
  const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0]
  return {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  }
}

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { headers: getCorsHeaders(request) })
}

// Handle GET - fetch user by ID (supports both database UUID and Clerk ID)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const headers = getCorsHeaders(request)
  const { userId } = await params

  try {
    // First try to find by database UUID
    const userProfile = await prisma.userProfile.findUnique({
      where: { id: userId },
      include: {
        ailments: true,
        preferences: true,
        savedProducts: true,
      },
    })

    if (userProfile) {
      return NextResponse.json(userProfile, { headers })
    }

    // If not found, try finding by clerkId
    const authRecord = await prisma.userAuth.findUnique({
      where: { clerkId: userId },
      include: {
        user: {
          include: {
            ailments: true,
            preferences: true,
            savedProducts: true,
          },
        },
      },
    })

    if (authRecord) {
      return NextResponse.json(authRecord.user, { headers })
    }

    // Return 404 if neither lookup finds anything
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404, headers }
    )
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers }
    )
  }
}

// Handle PUT - update user profile
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const headers = getCorsHeaders(request)
  const { userId } = await params

  try {
    const body = await request.json()

    // First determine the actual database ID
    let dbUserId = userId

    // If it looks like a Clerk ID, look up the real database ID
    if (userId.startsWith('user_')) {
      const authRecord = await prisma.userAuth.findUnique({
        where: { clerkId: userId },
        select: { userId: true },
      })
      if (!authRecord) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404, headers }
        )
      }
      dbUserId = authRecord.userId
    }

    const updatedUser = await prisma.userProfile.update({
      where: { id: dbUserId },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        location: body.location,
        age: body.age,
        gender: body.gender,
        shoppingStores: body.shoppingStores,
      },
      include: {
        ailments: true,
        preferences: true,
        savedProducts: true,
      },
    })

    return NextResponse.json(updatedUser, { headers })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers }
    )
  }
}
