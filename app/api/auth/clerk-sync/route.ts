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

export async function POST(request: NextRequest) {
  const headers = getCorsHeaders(request)
  try {
    const { clerkId, firstName, lastName, email, location, age, gender, shoppingStores } = await request.json()

    if (!clerkId || !email) {
      return NextResponse.json(
        { error: 'clerkId and email are required' },
        { status: 400, headers }
      )
    }

    // Build the profile data to update/create
    const profileData: {
      firstName?: string
      lastName?: string
      location?: string
      age?: number
      gender?: string
      shoppingStores?: string
    } = {}
    
    if (firstName !== undefined) profileData.firstName = firstName
    if (lastName !== undefined) profileData.lastName = lastName
    if (location !== undefined) profileData.location = location
    if (age !== undefined) profileData.age = typeof age === 'number' ? age : parseInt(age, 10) || null
    if (gender !== undefined) profileData.gender = gender
    if (shoppingStores !== undefined) profileData.shoppingStores = shoppingStores

    // Check if user already exists by clerkId
    const existingAuth = await prisma.userAuth.findUnique({
      where: { clerkId },
      include: { user: true },
    })

    if (existingAuth) {
      // Update existing user's profile with new data
      const updatedUser = await prisma.userProfile.update({
        where: { id: existingAuth.user.id },
        data: profileData,
      })
      return NextResponse.json({ user: updatedUser }, { headers })
    }

    // Check if user exists by email
    const existingProfile = await prisma.userProfile.findUnique({
      where: { email },
    })

    if (existingProfile) {
      // Link clerkId to existing profile and update profile data
      await prisma.userAuth.upsert({
        where: { userId: existingProfile.id },
        update: { clerkId },
        create: { userId: existingProfile.id, clerkId },
      })
      const updatedUser = await prisma.userProfile.update({
        where: { id: existingProfile.id },
        data: profileData,
      })
      return NextResponse.json({ user: updatedUser }, { headers })
    }

    // Create new user with all profile data
    const newProfile = await prisma.userProfile.create({
      data: {
        firstName: firstName || '',
        lastName: lastName || '',
        email,
        location: location || null,
        age: age ? (typeof age === 'number' ? age : parseInt(age, 10)) : null,
        gender: gender || null,
        shoppingStores: shoppingStores || null,
        auth: {
          create: { clerkId },
        },
      },
    })

    return NextResponse.json({ user: newProfile }, { status: 201, headers })
  } catch (error) {
    console.error('clerk-sync error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers }
    )
  }
}
