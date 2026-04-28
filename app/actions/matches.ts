'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { generateMatchCommentary } from '@/lib/gemini'

// FETCH PENDING MATCHES (Backend Route)
export async function getPendingMatches(tournamentId: string) {
  const supabase = await createClient()

  // Fetch matches that do NOT have a corresponding entry in the results table
  const { data: matches, error } = await supabase
    .from('matches')
    .select(`
      id,
      leg,
      player1:players!player1_id(id, name),
      player2:players!player2_id(id, name)
    `)
    .eq('tournament_id', tournamentId)
    .not('id', 'in', `(select match_id from results)`)
    .order('scheduled_order', { ascending: true })

  if (error) throw new Error(error.message)
  return matches
}

// SAVE MATCH RESULT & GENERATE COMMENTARY (Backend Route)
export async function saveMatchResult(formData: FormData) {
  const supabase = await createClient()
  
  const matchId = formData.get('matchId') as string
  const score1 = parseInt(formData.get('score1') as string, 10) || 0
  const score2 = parseInt(formData.get('score2') as string, 10) || 0
  const isWalkover = formData.get('isWalkover') === 'true'

  // 1. Fetch player names for the AI prompt
  const { data: matchData, error: matchError } = await supabase
    .from('matches')
    .select(`
      player1:players!player1_id(name),
      player2:players!player2_id(name)
    `)
    .eq('id', matchId)
    .single()

  if (matchError || !matchData) {
    throw new Error("Failed to fetch match details to generate commentary.")
  }

  // Safely extract names (assuming standard Supabase joins)
  const p1Name = (matchData.player1 as any).name
  const p2Name = (matchData.player2 as any).name

  // 2. Generate AI Commentary via Gemini
  let commentary = ''
  try {
    commentary = await generateMatchCommentary(p1Name, p2Name, score1, score2, isWalkover)
  } catch (error) {
    console.error("Gemini API Error:", error)
    // Fallback commentary if the AI fails or rate limits
    commentary = isWalkover 
      ? `Walkover! Default win recorded for this matchup.`
      : `Full time result: ${p1Name} ${score1} - ${score2} ${p2Name}.`
  }

  // 3. Insert result securely from the server
  const { error: insertError } = await supabase.from('results').insert({
    match_id: matchId,
    score1,
    score2,
    is_walkover: isWalkover,
    commentary: commentary
  })

  if (insertError) throw new Error(insertError.message)

  // 4. Revalidate the page so the public view instantly updates
  revalidatePath('/')
  revalidatePath('/admin')
  
  return { success: true, commentary }
}
