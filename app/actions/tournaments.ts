'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createTournament(formData: FormData) {
  const supabase = await createClient()
  const name = formData.get('name') as string
  const format = formData.get('format') as 'single' | 'double'
  const playerIds = formData.getAll('players') as string[]

  // 1. Create Tournament
  const { data: tourney, error: tErr } = await supabase
    .from('tournaments')
    .insert({ name, format })
    .select('id').single()
  if (tErr) throw new Error(tErr.message)

  // 2. Add Players
  const tPlayers = playerIds.map(id => ({ tournament_id: tourney.id, player_id: id }))
  await supabase.from('tournament_players').insert(tPlayers)

  // 3. Generate Round Robin Fixtures
  let players = [...playerIds];
  if (players.length % 2 !== 0) players.push('BYE'); // Dummy for odd numbers
  
  const totalRounds = players.length - 1;
  const matchesPerRound = players.length / 2;
  const fixtures = [];
  let order = 1;

  for (let leg = 1; leg <= (format === 'double' ? 2 : 1); leg++) {
    let currentPlayers = [...players];
    for (let round = 0; round < totalRounds; round++) {
      for (let i = 0; i < matchesPerRound; i++) {
        let home = currentPlayers[i];
        let away = currentPlayers[currentPlayers.length - 1 - i];
        
        // Swap home/away for Leg 2
        if (leg === 2) [home, away] = [away, home];

        if (home !== 'BYE' && away !== 'BYE') {
          fixtures.push({
            tournament_id: tourney.id,
            player1_id: home,
            player2_id: away,
            leg: leg,
            scheduled_order: order++
          });
        }
      }
      // Rotate array for next round (keep first player fixed)
      currentPlayers.splice(1, 0, currentPlayers.pop()!);
    }
  }

  // 4. Save Fixtures
  const { error: mErr } = await supabase.from('matches').insert(fixtures)
  if (mErr) throw new Error(mErr.message)

  revalidatePath('/')
  return { success: true, id: tourney.id }
}
