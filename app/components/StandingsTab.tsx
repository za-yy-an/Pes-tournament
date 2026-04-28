'use client'

import { useEffect, useState } from 'react'
import { getTournamentStandings } from '@/app/actions/standings'

const QUALIFY_COUNT = 4

const rankStyle = (i: number) => {
  if (i === 0) return { color: '#ffd600' }
  if (i === 1) return { color: '#b0bec5' }
  if (i === 2) return { color: '#ff8a65' }
  if (i === 3) return { color: '#00e676' }
  return { color: '#3d4f6e' }
}

const rankLabel = (i: number) => {
  if (i === 0) return '🥇'
  if (i === 1) return '🥈'
  if (i === 2) return '🥉'
  if (i === 3) return '4'
  return String(i + 1)
}

export default function StandingsTab({ tournamentId }: { tournamentId: string }) {
  const [standings, setStandings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tournamentId) return
    getTournamentStandings(tournamentId)
      .then((data) => { setStandings(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [tournamentId])

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="shimmer h-14 rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3 afu">
      {/* Header row */}
      <div className="grid text-xs font-bold uppercase tracking-widest px-4 py-2"
        style={{ color: 'var(--text-muted)', gridTemplateColumns: '2rem 1fr 2rem 2rem 2rem 2rem 2.5rem 2.5rem 3rem 3rem' }}>
        <span className="text-center">#</span>
        <span>Player</span>
        <span className="text-center">P</span>
        <span className="text-center">W</span>
        <span className="text-center">D</span>
        <span className="text-center">L</span>
        <span className="text-center">GF</span>
        <span className="text-center">GA</span>
        <span className="text-center">GD</span>
        <span className="text-center" style={{ color: 'var(--accent-blue)' }}>PTS</span>
      </div>

      {standings.map((row, i) => {
        const isQualified = i < QUALIFY_COUNT
        const gd = row.goal_difference
        return (
          <div
            key={row.player_id}
            className="glass rounded-xl grid items-center px-4 py-3 transition-all hover:border-white/15"
            style={{
              gridTemplateColumns: '2rem 1fr 2rem 2rem 2rem 2rem 2.5rem 2.5rem 3rem 3rem',
              borderLeft: isQualified ? `3px solid ${i === 0 ? '#ffd600' : i === 1 ? '#b0bec5' : i === 2 ? '#ff8a65' : '#00e676'}` : '3px solid transparent',
              animationDelay: `${i * 0.04}s`,
            }}
          >
            {/* Rank */}
            <span className="text-center text-sm font-black" style={rankStyle(i)}>
              {rankLabel(i)}
            </span>

            {/* Name + qualified badge */}
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-bold text-sm text-white truncate">{row.name}</span>
              {row.is_qualified && (
                <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded"
                  style={{ background: 'var(--accent-green-dim)', color: 'var(--accent-green)', border: '1px solid rgba(0,230,118,0.3)', whiteSpace: 'nowrap' }}>
                  ✓ QF
                </span>
              )}
            </div>

            <span className="text-center text-sm text-[#6b7a99]">{row.played}</span>
            <span className="text-center text-sm font-semibold" style={{ color: 'var(--accent-green)' }}>{row.wins}</span>
            <span className="text-center text-sm text-[#6b7a99]">{row.draws}</span>
            <span className="text-center text-sm font-semibold" style={{ color: 'var(--accent-red)' }}>{row.losses}</span>
            <span className="text-center text-sm text-[#6b7a99]">{row.goals_for}</span>
            <span className="text-center text-sm text-[#6b7a99]">{row.goals_against}</span>
            <span className="text-center text-sm font-bold"
              style={{ color: gd > 0 ? 'var(--accent-green)' : gd < 0 ? 'var(--accent-red)' : '#6b7a99' }}>
              {gd > 0 ? `+${gd}` : gd}
            </span>
            <span className="text-center font-black text-base" style={{ color: 'var(--accent-blue)' }}>
              {row.points}
            </span>
          </div>
        )
      })}

      {standings.length === 0 && (
        <div className="text-center py-16 text-[#3d4f6e]">
          <p className="text-4xl mb-3">⚽</p>
          <p className="font-semibold">No matches played yet.</p>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-3 pt-2">
        {[
          { color: '#ffd600', label: '1st Place' },
          { color: '#b0bec5', label: '2nd Place' },
          { color: '#ff8a65', label: '3rd Place' },
          { color: '#00e676', label: 'Qualification spots' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5 text-xs text-[#6b7a99]">
            <div className="w-2 h-2 rounded-full" style={{ background: color }} />
            {label}
          </div>
        ))}
      </div>
    </div>
  )
}
