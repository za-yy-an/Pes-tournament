import { NextRequest, NextResponse } from 'next/server'
import { analyzeQualifiers } from '@/lib/gemini'

export async function POST(req: NextRequest) {
  try {
    const { standings, pendingMatches } = await req.json()
    const analysis = await analyzeQualifiers(standings, pendingMatches)
    return NextResponse.json({ analysis })
  } catch (error) {
    console.error('Analyze API error:', error)
    return NextResponse.json({ analysis: 'Analysis failed.' }, { status: 500 })
  }
}
