'use server'

import { createClient } from '@/lib/supabase/server'

export async function getTournamentStandings(tournamentId: string) {
  const supabase = await createClient()

  const { data: standings, error } = await supabase
    .from('tournament_standings')
    .select('*')
    .eq('tournament_id', tournamentId)
    .order('points', { ascending: false })
    .order('goal_difference', { ascending: false })
    .order('goals_for', { ascending: false })

  if (error) throw new Error(error.message)
  return standings
}
