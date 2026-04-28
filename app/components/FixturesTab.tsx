'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function FixturesTab({ tournamentId }: { tournamentId: string }) {
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
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
      setLoading(false)
    }
    fetchFixtures()
  }, [tournamentId])

  const played = matches.filter((m) => m.results?.length > 0)
  const pending = matches.filter((m) => !m.results?.length)

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="shimmer h-20 rounded-xl" />
        ))}
      </div>
    )
  }

  const ResultCard = ({ match }: { match: any }) => {
    const r = match.results[0]
    const p1Won = r.score1 > r.score2
    const p2Won = r.score2 > r.score1
    const draw = r.score1 === r.score2
    return (
      <div className="glass rounded-xl p-4 space-y-3 hover:border-white/15 transition-all">
        <div className="flex items-center gap-3">
          {/* Player 1 */}
          <div className={`flex-1 text-right`}>
            <p className={`font-bold text-sm ${p1Won ? 'text-white' : 'text-[#6b7a99]'}`}>
              {match.player1.name}
            </p>
          </div>

          {/* Score */}
          <div className="flex items-center gap-2 shrink-0">
            <span className={`font-display text-2xl ${p1Won ? 'text-white' : 'text-[#6b7a99]'}`}>{r.score1}</span>
            <span className="text-[#3d4f6e] text-xs font-bold">—</span>
            <span className={`font-display text-2xl ${p2Won ? 'text-white' : 'text-[#6b7a99]'}`}>{r.score2}</span>
          </div>

          {/* Player 2 */}
          <div className="flex-1">
            <p className={`font-bold text-sm ${p2Won ? 'text-white' : 'text-[#6b7a99]'}`}>
              {match.player2.name}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2 pt-1 border-t border-white/5">
          <span className="text-[10px] font-bold text-[#3d4f6e] uppercase tracking-widest shrink-0 mt-0.5">
            Leg {match.leg} {r.is_walkover ? '· 🚶 WO' : ''}
          </span>
          {r.commentary && (
            <p className="text-[11px] text-[#6b7a99] italic leading-relaxed">
              🎙️ {r.commentary}
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 afu">
      {/* Played */}
      <div>
        <h2 className="font-display text-2xl text-white tracking-wide mb-4">
          Results <span className="text-[#3d4f6e] text-lg">({played.length})</span>
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {played.map((m) => <ResultCard key={m.id} match={m} />)}
        </div>
      </div>

      {/* Pending */}
      {pending.length > 0 && (
        <div>
          <h2 className="font-display text-2xl text-[#6b7a99] tracking-wide mb-4">
            Upcoming <span className="text-[#3d4f6e] text-lg">({pending.length})</span>
          </h2>
          <div className="glass rounded-xl overflow-hidden">
            {pending.map((m, i) => (
              <div
                key={m.id}
                className="flex items-center justify-between px-5 py-3 border-b border-white/5 last:border-b-0 hover:bg-white/[0.02] transition-colors"
              >
                <span className="font-semibold text-sm text-[#6b7a99]">{m.player1.name}</span>
                <span className="text-[10px] font-black text-[#3d4f6e] uppercase tracking-widest bg-white/5 px-2 py-1 rounded">
                  Leg {m.leg}
                </span>
                <span className="font-semibold text-sm text-[#6b7a99]">{m.player2.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
