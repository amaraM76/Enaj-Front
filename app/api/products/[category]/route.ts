import { NextResponse } from 'next/server'

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://enaj-back-production.up.railway.app'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ category: string }> }
) {
  const { category } = await params
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

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
