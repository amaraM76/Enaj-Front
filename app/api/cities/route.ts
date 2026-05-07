import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const stateCode = request.nextUrl.searchParams.get('state')
  if (!stateCode) return NextResponse.json({ cities: [] })

  const url = `https://api.geonames.org/searchJSON?country=US&adminCode1=${stateCode}&featureClass=P&maxRows=1000&orderby=population&username=enajhealth`
  
  try {
    const res = await fetch(url, { cache: 'no-store' })
    const data = await res.json()
    
    if (!data.geonames || data.geonames.length === 0) {
      return NextResponse.json({ cities: [], raw: data })
    }

    const cities: string[] = data.geonames
      .map((g: { name: string }) => g.name)
      .filter((n: string, i: number, arr: string[]) => arr.indexOf(n) === i)
      .sort()

    return NextResponse.json({ cities })
  } catch {
    return NextResponse.json({ cities: [] })
  }
}