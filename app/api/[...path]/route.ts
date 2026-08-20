import { NextRequest, NextResponse } from 'next/server'
import { checkOwnership } from '@/lib/require-owner'

// Server-only. Deliberately NOT NEXT_PUBLIC_* so it can never end up in the
// client bundle - every browser call to the app's data API goes through
// this proxy instead of calling the Railway backend directly, so the
// backend's hostname (and whatever user id is in the request) never shows
// up in the browser's own network tab.
const BACKEND_URL =
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'https://enaj-back-production.up.railway.app'

// Routes with their own file (app/api/users/[userId], app/api/products/[category])
// are matched by Next.js before this catch-all, so this only ever proxies
// the remaining, mostly-catalog endpoints (ailments, preferences, journal,
// product-search, import-product, saved-products, and the nested
// products/:category/:slug/scan path). Any of those that carry a userId -
// as a query param on GET, or in the JSON body on a mutating request -
// still gets the same ownership check as the dedicated routes.
async function extractUserId(request: NextRequest, bodyText: string): Promise<string | null> {
  const fromQuery = new URL(request.url).searchParams.get('userId')
  if (fromQuery) return fromQuery
  if (!bodyText) return null
  try {
    const parsed = JSON.parse(bodyText)
    return typeof parsed?.userId === 'string' ? parsed.userId : null
  } catch {
    return null
  }
}

async function proxy(request: NextRequest, path: string[]) {
  const bodyText = ['GET', 'HEAD'].includes(request.method) ? '' : await request.text()

  const targetUserId = await extractUserId(request, bodyText)
  const denied = await checkOwnership(targetUserId)
  if (denied) {
    return NextResponse.json({ error: denied.error }, { status: denied.status })
  }

  const targetUrl = new URL(`${BACKEND_URL}/api/${path.join('/')}`)
  targetUrl.search = new URL(request.url).search

  try {
    const res = await fetch(targetUrl.toString(), {
      method: request.method,
      headers: { 'Content-Type': 'application/json' },
      ...(bodyText ? { body: bodyText } : {}),
    })

    const contentType = res.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      const data = await res.json().catch(() => ({}))
      return NextResponse.json(data, { status: res.status })
    }
    const text = await res.text()
    return new NextResponse(text, { status: res.status })
  } catch (error) {
    console.error('Backend proxy error:', error)
    return NextResponse.json({ error: 'Failed to reach backend' }, { status: 502 })
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(request, (await params).path)
}
export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(request, (await params).path)
}
export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(request, (await params).path)
}
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(request, (await params).path)
}
