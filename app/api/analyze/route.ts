import { NextRequest, NextResponse } from 'next/server'
import { generateMatchCommentary } from '@/lib/gemini'

export async function POST(req: NextRequest) {
  try {
    const { p1, p2, score1, score2, isWalkover } = await req.json()
    const commentary = await generateMatchCommentary(p1, p2, score1, score2, isWalkover)
    return NextResponse.json({ commentary })
  } catch (error) {
    console.error('Commentary API error:', error)
    return NextResponse.json({ commentary: '' }, { status: 500 })
  }
}
