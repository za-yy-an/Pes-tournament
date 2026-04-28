import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client' // Need a client-side supabase helper

export default function FixturesTab({ tournamentId }: { tournamentId: string }) {
  const [matches, setMatches] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    const fetchFixtures = async () => {
      const { data } = await supabase
        .from('matches')
        .select(`
          id, leg, scheduled_order,
          player1:players!player1_id(name),
          player2:players!player2_id(name),
          results(score1, score2, is_walkover, commentary)
        `)
        .eq('tournament_id', tournamentId)
        .order('scheduled_order', { ascending: true })
      
      if (data) setMatches(data)
    }
    fetchFixtures()
  }, [tournamentId])

  const played = matches.filter(m => m.results.length > 0)
  const pending = matches.filter(m => m.results.length === 0)

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Latest Results</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {played.map(match => (
            <div key={match.id} className="p-4 border rounded-lg bg-white shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>{match.player1.name}</span>
                <span className="bg-gray-100 px-3 py-1 rounded">{match.results[0].score1} - {match.results[0].score2}</span>
                <span>{match.player2.name}</span>
              </div>
              <p className="mt-3 text-sm text-gray-600 italic border-t pt-2">🎙️ {match.results[0].commentary}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4 text-gray-400">Upcoming Fixtures</h2>
        <div className="bg-gray-50 border rounded-lg overflow-hidden">
          {pending.map(match => (
            <div key={match.id} className="p-4 border-b last:border-b-0 flex justify-between items-center">
              <span className="font-semibold text-gray-700">{match.player1.name}</span>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-200 px-2 py-1 rounded">Leg {match.leg}</span>
              <span className="font-semibold text-gray-700">{match.player2.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
