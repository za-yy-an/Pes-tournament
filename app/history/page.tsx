'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import StandingsTab from '@/app/components/StandingsTab'
import FixturesTab from '@/app/components/FixturesTab'

export default function HistoryPage() {
  const [tournaments, setTournaments] = useState<any[]>([])
  const [selectedId, setSelectedId] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'standings' | 'fixtures'>('standings')
  const supabase = createClient()

  useEffect(() => {
    supabase
      .from('tournaments')
      .select('id, name, created_at, format')
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) {
          setTournaments(data)
          if (data.length > 0) setSelectedId(data[0].id)
        }
      })
  }, [])

  const selected = tournaments.find((t) => t.id === selectedId)

  const formatLabel: Record<string, string> = {
    double_rr: 'Double Round Robin',
    single_rr: 'Single Round Robin',
    knockout: 'Knockout',
    rr_then_knockout: 'RR + Knockout',
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="afu">
        <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--accent-gold)' }}>
          Archive
        </p>
        <h1 className="font-display text-5xl text-white tracking-wide">Hall of Fame</h1>
      </div>

      {tournaments.length === 0 ? (
        <div className="text-center py-20 text-[#3d4f6e]">
          <p className="text-5xl mb-4">🏆</p>
          <p className="font-semibold text-lg">No completed tournaments yet</p>
          <p className="text-sm mt-1">Come back after a tournament is finished!</p>
        </div>
      ) : (
        <>
          {/* Tournament selector */}
          <div className="afu1 flex flex-wrap gap-2">
            {tournaments.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedId(t.id)}
                className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                style={{
                  background: selectedId === t.id ? 'rgba(255,214,0,0.15)' : 'var(--bg-card)',
                  border: `1px solid ${selectedId === t.id ? 'rgba(255,214,0,0.4)' : 'rgba(255,255,255,0.07)'}`,
                  color: selectedId === t.id ? 'var(--accent-gold)' : 'var(--text-secondary)',
                }}
              >
                {t.name}
                <span className="ml-2 text-[10px] opacity-60">{formatLabel[t.format] ?? t.format}</span>
              </button>
            ))}
          </div>

          {/* Selected tournament info */}
          {selected && (
            <div className="afu2 glass rounded-xl px-5 py-4 flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl text-white tracking-wide">{selected.name}</h2>
                <p className="text-xs text-[#6b7a99] mt-0.5">{formatLabel[selected.format] ?? selected.format}</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full"
                style={{ background: 'rgba(255,214,0,0.12)', color: 'var(--accent-gold)', border: '1px solid rgba(255,214,0,0.3)' }}>
                ✓ Completed
              </span>
            </div>
          )}

          {/* Sub tabs */}
          <div className="border-b border-white/5 flex gap-1">
            {(['standings', 'fixtures'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="relative px-4 py-3 text-sm font-bold capitalize transition-colors"
                style={{ color: activeTab === tab ? 'var(--accent-gold)' : 'var(--text-secondary)' }}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full"
                    style={{ background: 'var(--accent-gold)' }} />
                )}
              </button>
            ))}
          </div>

          {selectedId && (
            <div className="afu3">
              {activeTab === 'standings' && <StandingsTab tournamentId={selectedId} />}
              {activeTab === 'fixtures'  && <FixturesTab  tournamentId={selectedId} />}
            </div>
          )}
        </>
      )}
    </div>
  )
}
