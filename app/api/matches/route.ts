import { NextRequest, NextResponse } from 'next/server'
import { getPendingMatches } from '@/app/actions/matches'

export async function GET(req: NextRequest) {
  const tournamentId = req.nextUrl.searchParams.get('tournamentId')
  if (!tournamentId) return NextResponse.json([], { status: 400 })

  try {
    const matches = await getPendingMatches(tournamentId)
    return NextResponse.json(matches)
  } catch (error) {
    return NextResponse.json([], { status: 500 })
  }
}
