import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const stateCode = request.nextUrl.searchParams.get('state')
  if (!stateCode) return NextResponse.json({ cities: [] })

  const username = process.env.GEONAMES_USERNAME
  const url = `https://secure.geonames.org/searchJSON?country=US&adminCode1=${stateCode}&featureClass=P&maxRows=1000&orderby=population&username=${username}`

  try {
    const res = await fetch(url, { cache: 'no-store' })
    const data = await res.json()

    const cities: string[] = (data.geonames ?? [])
      .map((g: { name: string }) => g.name)
      .filter((n: string, i: number, arr: string[]) => arr.indexOf(n) === i)
      .sort()

    return NextResponse.json({ cities })
  } catch {
    return NextResponse.json({ cities: [] })
  }
}