import { NextRequest, NextResponse } from 'next/server'
import { City } from 'country-state-city'

export async function GET(request: NextRequest) {
  const stateCode = request.nextUrl.searchParams.get('state')

  if (!stateCode) {
    return NextResponse.json({ cities: [] })
  }

  const cities = City.getCitiesOfState('US', stateCode)
    .map((city) => city.name)
    .filter((name, index, arr) => arr.indexOf(name) === index)
    .sort()

  return NextResponse.json({ cities })
}