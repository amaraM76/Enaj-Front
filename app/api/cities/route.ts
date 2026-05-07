import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const stateCode = request.nextUrl.searchParams.get('state')
  if (!stateCode) return NextResponse.json({ cities: [] })

  const username = process.env.GEONAMES_USERNAME
  const url = `https://secure.geonames.org/searchJSON?country=US&adminCode1=${stateCode}&featureClass=P&maxRows=1000&orderby=population&username=${username}`

  try {
    const res = await fetch(url, { cache: 'no-store' })
    const data = await res.json()
    
    if (!data.geonames || data.geonames.length === 0) {
      return NextResponse.json({ cities: [], raw: data })
    }
  } catch {
    return NextResponse.json({ cities: [] })
  }
}