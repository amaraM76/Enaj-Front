import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { Gender, Prisma } from '@prisma/client'

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

  // A caller must be signed in, and may only ever read their own profile.
  // Without this check, anyone who knows (or guesses) a database UUID or a
  // Clerk ID could fetch a stranger's full profile - name, email, health
  // conditions, preferences - with no session at all.
  const { userId: sessionClerkId } = await auth()
  if (!sessionClerkId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers })
  }

  try {
    // First try to find by database UUID
    const userProfile = await prisma.userProfile.findUnique({
      where: { id: userId },
      include: {
        auth: true,
        ailments: true,
        preferences: true,
        savedProducts: true,
      },
    })

    if (userProfile) {
      if (userProfile.auth?.clerkId !== sessionClerkId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers })
      }
      const { auth: _authRecord, ...safeProfile } = userProfile
      return NextResponse.json(safeProfile, { headers })
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
      if (authRecord.clerkId !== sessionClerkId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers })
      }
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

  // A caller must be signed in, and may only ever update their own profile -
  // otherwise an unauthenticated PUT to a guessed userId could overwrite a
  // stranger's name, email, location, or gender.
  const { userId: sessionClerkId } = await auth()
  if (!sessionClerkId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers })
  }

  try {
    const body = await request.json()

    // First determine the actual database ID
    let dbUserId = userId
    let ownerClerkId: string | null

    // If it looks like a Clerk ID, look up the real database ID
    if (userId.startsWith('user_')) {
      const authRecord = await prisma.userAuth.findUnique({
        where: { clerkId: userId },
        select: { userId: true, clerkId: true },
      })
      if (!authRecord) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404, headers }
        )
      }
      dbUserId = authRecord.userId
      ownerClerkId = authRecord.clerkId
    } else {
      const authRecord = await prisma.userAuth.findUnique({
        where: { userId: dbUserId },
        select: { clerkId: true },
      })
      ownerClerkId = authRecord?.clerkId ?? null
    }

    if (ownerClerkId !== sessionClerkId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers })
    }

    const updateData: Prisma.UserProfileUpdateInput = {}

    if (body.firstName !== undefined) updateData.firstName = body.firstName
    if (body.lastName !== undefined) updateData.lastName = body.lastName
    if (body.email !== undefined) updateData.email = body.email
    if (body.location !== undefined) updateData.location = body.location
    if (body.shoppingStores !== undefined) updateData.shoppingStores = body.shoppingStores
    
    if (body.age !== undefined) {
      updateData.age = String(body.age)
    }
    
    if (body.gender !== undefined) {
      if (body.gender === 'female') updateData.gender = Gender.FEMALE
      else if (body.gender === 'male') updateData.gender = Gender.MALE
      else if (body.gender === 'prefer-not-to-say') {
        updateData.gender = Gender.PREFER_NOT_TO_SAY
      } else {
        updateData.gender = null
      }
    }
    
    const updatedUser = await prisma.userProfile.update({
      where: { id: dbUserId },
      data: updateData,
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
