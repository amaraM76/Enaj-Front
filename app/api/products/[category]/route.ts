import { NextResponse } from 'next/server'
import { checkOwnership } from '@/lib/require-owner'

const API_URL =
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'https://enaj-back-production.up.railway.app'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ category: string }> }
) {
  const { category } = await params
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  // userId drives personalized flagging/recommendations - only allow it to
  // be the caller's own id, otherwise anyone could see another user's
  // health-condition-based product flags by guessing their id.
  const denied = await checkOwnership(userId)
  if (denied) {
    return NextResponse.json({ error: denied.error }, { status: denied.status })
  }

  let url = `${API_URL}/api/products/${category}`
  if (userId) url += `?userId=${userId}`

  try {
    const res = await fetch(url)
    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch products from backend' },
      { status: 502 }
    )
  }
}
