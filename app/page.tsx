'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import StandingsTab from './components/StandingsTab'
import FixturesTab from './components/FixturesTab'
import AnalyticsTab from './components/AnalyticsTab'

const TABS = [
  { key: 'standings', label: 'Standings', icon: '📊' },
  { key: 'fixtures',  label: 'Fixtures',  icon: '⚽' },
  { key: 'analytics', label: 'Analytics', icon: '📈' },
] as const

type Tab = typeof TABS[number]['key']

export default function PublicDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('standings')
  const [activeTournamentId, setActiveTournamentId] = useState<string>('')
  const [tournamentName, setTournamentName] = useState<string>('')
  const [matchCount, setMatchCount] = useState<{ played: number; total: number } | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase
      .from('tournaments')
      .select('id, name')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) {
          setActiveTournamentId(data.id)
          setTournamentName(data.name)
        }
      })
  }, [])

  useEffect(() => {
    if (!activeTournamentId) return
    Promise.all([
      supabase.from('matches').select('id', { count: 'exact', head: true }).eq('tournament_id', activeTournamentId),
      supabase.from('results').select('match_id', { count: 'exact', head: true })
        .in('match_id', supabase.from('matches').select('id').eq('tournament_id', activeTournamentId) as any),
    ]).then(([total, played]) => {
      setMatchCount({ played: played.count ?? 0, total: total.count ?? 0 })
    })
  }, [activeTournamentId])

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="afu">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--accent-green)' }}>
              Live Tournament
            </p>
            <h1 className="font-display text-5xl sm:text-6xl text-white tracking-wide leading-none">
              {tournamentName || 'PES League'}
            </h1>
          </div>
          {matchCount && (
            <div className="text-right shrink-0">
              <p className="font-display text-3xl text-white">{matchCount.played}</p>
              <p className="text-xs text-[#6b7a99] font-medium">of {matchCount.total} played</p>
              {/* Progress bar */}
              <div className="mt-2 w-24 h-1 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.round((matchCount.played / matchCount.total) * 100)}%`,
                    background: 'var(--accent-green)',
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="afu1 border-b border-white/5 flex gap-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="relative px-4 py-3 text-sm font-bold transition-colors"
            style={{ color: activeTab === tab.key ? 'var(--accent-green)' : 'var(--text-secondary)' }}
          >
            <span className="hidden sm:inline mr-1">{tab.icon}</span>
            {tab.label}
            {activeTab === tab.key && (
              <span
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full"
                style={{ background: 'var(--accent-green)' }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="afu2">
        {!activeTournamentId ? (
          <div className="text-center py-20 text-[#3d4f6e]">
            <p className="text-5xl mb-4">🏟️</p>
            <p className="font-semibold text-lg">No active tournament</p>
            <p className="text-sm mt-1">Ask the admin to create one</p>
          </div>
        ) : (
          <>
            {activeTab === 'standings' && <StandingsTab tournamentId={activeTournamentId} />}
            {activeTab === 'fixtures'  && <FixturesTab  tournamentId={activeTournamentId} />}
            {activeTab === 'analytics' && <AnalyticsTab tournamentId={activeTournamentId} />}
          </>
        )}
      </div>
    </div>
  )
}
