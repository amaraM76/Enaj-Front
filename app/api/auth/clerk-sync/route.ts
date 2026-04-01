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
    const { clerkId, firstName, lastName, email } = await request.json()

    if (!clerkId || !email) {
      return NextResponse.json(
        { error: 'clerkId and email are required' },
        { status: 400, headers }
      )
    }

    // Check if user already exists by clerkId
    const existingAuth = await prisma.userAuth.findUnique({
      where: { clerkId },
      include: { user: true },
    })

    if (existingAuth) {
      return NextResponse.json({ user: existingAuth.user }, { headers })
    }

    // Check if user exists by email
    const existingProfile = await prisma.userProfile.findUnique({
      where: { email },
    })

    if (existingProfile) {
      // Link clerkId to existing profile
      await prisma.userAuth.upsert({
        where: { userId: existingProfile.id },
        update: { clerkId },
        create: { userId: existingProfile.id, clerkId },
      })
      return NextResponse.json({ user: existingProfile }, { headers })
    }

    // Create new user
    const newProfile = await prisma.userProfile.create({
      data: {
        firstName: firstName || '',
        lastName: lastName || '',
        email,
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
