'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { generateMatchCommentary } from '@/lib/gemini'

// FETCH PENDING MATCHES
export async function getPendingMatches(tournamentId: string) {
  const supabase = await createClient()

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

// SAVE MATCH RESULT
// Commentary is generated client-side first (shown in modal), 
// then passed here for saving — avoids double API calls
export async function saveMatchResult(formData: FormData) {
  const supabase = await createClient()

  const matchId = formData.get('matchId') as string
  const score1 = parseInt(formData.get('score1') as string, 10) || 0
  const score2 = parseInt(formData.get('score2') as string, 10) || 0
  const isWalkover = formData.get('isWalkover') === 'true'
  const commentary = formData.get('commentary') as string || ''

  const { error: insertError } = await supabase.from('results').insert({
    match_id: matchId,
    score1,
    score2,
    is_walkover: isWalkover,
    commentary,
  })

  if (insertError) throw new Error(insertError.message)

  revalidatePath('/')
  revalidatePath('/admin')

  return { success: true }
}
