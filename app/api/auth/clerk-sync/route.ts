import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
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
async function syncUserToBackend({
  clerkId,
  firstName,
  lastName,
  email,
}: {
  clerkId: string
  firstName?: string
  lastName?: string
  email: string
}) {
  const backendUrl = process.env.BACKEND_URL

  if (!backendUrl) {
    console.error('BACKEND_URL is not configured')
    throw new Error('BACKEND_URL is not configured')
  }

  const response = await fetch(`${backendUrl}/api/auth/clerk-sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      clerkId,
      firstName,
      lastName,
      email,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()

    console.error(
      'Backend clerk-sync failed:',
      response.status,
      errorText
    )

    throw new Error(
      `Backend clerk-sync failed with status ${response.status}`
    )
  }

  return response.json()
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
      await syncUserToBackend({
        clerkId,
        firstName,
        lastName,
        email,
      })

      return NextResponse.json({ user: existingAuth.user }, { headers })
    }

    // Check if user exists by email
    const existingProfile = await prisma.userProfile.findUnique({
      where: { email },
    })

    if (existingProfile) {
      await prisma.userAuth.upsert({
        where: { userId: existingProfile.id },
        update: { clerkId },
        create: {
          userId: existingProfile.id,
          clerkId,
        },
      })

      await syncUserToBackend({
        clerkId,
        firstName,
        lastName,
        email,
      })

      return NextResponse.json(
        { user: existingProfile },
        { headers }
      )
    }

    // Create new user with Clerk identity fields only. Same race as above
    // can hit this branch too (webhook and client both see "no user yet"
    // and both try to create one) - on a unique-constraint loss, the
    // winner's row already exists, so fetch and return that instead of
    // erroring.
    try {
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
      await syncUserToBackend({
        clerkId,
        firstName,
        lastName,
        email,
      })

      return NextResponse.json(
        { user: newProfile },
        { status: 201, headers }
      )
    } catch (err) {
      if (!(err instanceof Prisma.PrismaClientKnownRequestError) || err.code !== 'P2002') throw err
      const winner = await prisma.userAuth.findUnique({ where: { clerkId }, include: { user: true } })
        ?? await prisma.userProfile.findUnique({ where: { email } })
      if (!winner) throw err
      const user = 'user' in winner ? winner.user : winner

      await syncUserToBackend({
        clerkId,
        firstName,
        lastName,
        email,
      })

      return NextResponse.json({ user }, { headers })
    }
  } catch (error) {
    console.error('clerk-sync error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers }
    )
  }
}
