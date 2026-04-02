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
    const body = await request.json()

    const response = await fetch(`https://enaj-back-production.up.railway.app/api/auth/clerk-sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status, headers })
  } catch (error) {
    console.error('clerk-sync error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers })
  }
}