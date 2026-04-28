'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createTournament } from '@/app/actions/tournaments'
import { getTournamentStandings } from '@/app/actions/standings'
import { getPendingMatches } from '@/app/actions/matches'
import MatchEntryForm from '@/app/components/MatchEntryForm'
import StandingsTab from '@/app/components/StandingsTab'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'matches' | 'analysis' | 'setup'>('matches')
  const [activeTournamentId, setActiveTournamentId] = useState<string>('')
  const [tournamentName, setTournamentName] = useState<string>('')
  const [analysisText, setAnalysisText] = useState('')
  const [loadingAI, setLoadingAI] = useState(false)
  const [allPlayers, setAllPlayers] = useState<any[]>([])
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([])
  const [newPlayerName, setNewPlayerName] = useState('')
  const supabase = createClient()

  // Fetch active tournament and all players on load
  useEffect(() => {
    // Get active tournament
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

    // Get all players
    supabase
      .from('players')
      .select('id, name')
      .order('name')
      .then(({ data }) => {
        if (data) {
          setAllPlayers(data)
          setSelectedPlayers(data.map((p: any) => p.id)) // pre-select all
        }
      })
  }, [])

  const handleAIAnalysis = async () => {
    if (!activeTournamentId) return
    setLoadingAI(true)
    setAnalysisText('')

    try {
      const [standings, pending] = await Promise.all([
        getTournamentStandings(activeTournamentId),
        getPendingMatches(activeTournamentId),
      ])

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ standings, pendingMatches: pending }),
      })
      const data = await res.json()
      setAnalysisText(data.analysis || 'No analysis returned.')
    } catch {
      setAnalysisText('Failed to run analysis. Check your Gemini API key.')
    } finally {
      setLoadingAI(false)
    }
  }

  const handleAddPlayer = async () => {
    if (!newPlayerName.trim()) return
    const { data, error } = await supabase
      .from('players')
      .insert({ name: newPlayerName.trim() })
      .select()
      .single()
    if (!error && data) {
      setAllPlayers((prev) => [...prev, data])
      setSelectedPlayers((prev) => [...prev, data.id])
      setNewPlayerName('')
    }
  }

  const togglePlayer = (id: string) => {
    setSelectedPlayers((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  const tabs = [
    { key: 'matches', label: '⚽ Matches' },
    { key: 'analysis', label: '🤖 Analysis' },
    { key: 'setup', label: '+ New Tournament' },
  ]

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center pt-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Admin</h1>
          {tournamentName && (
            <p className="text-sm text-gray-500 font-medium">{tournamentName}</p>
          )}
        </div>
        <a href="/" className="text-sm text-blue-600 font-semibold hover:underline">
          ← Public View
        </a>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl overflow-hidden border border-gray-200 bg-gray-100 p-1 gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Match Entry */}
      {activeTab === 'matches' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-black mb-5 text-gray-800">Enter Match Result</h2>
          {activeTournamentId ? (
            <MatchEntryForm tournamentId={activeTournamentId} />
          ) : (
            <p className="text-center text-gray-400 py-8">
              No active tournament found. Create one first! 👇
            </p>
          )}
        </div>
      )}

      {/* Tab: AI Analysis */}
      {activeTab === 'analysis' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
          <h2 className="text-lg font-black text-gray-800">Qualifier Analysis</h2>

          {activeTournamentId && <StandingsTab tournamentId={activeTournamentId} />}

          <button
            onClick={handleAIAnalysis}
            disabled={loadingAI || !activeTournamentId}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-xl disabled:opacity-50 transition-colors"
          >
            {loadingAI ? '🤖 Analysing...' : '🤖 Run Gemini Analysis'}
          </button>

          {analysisText && (
            <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
              <p className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">
                Gemini Says
              </p>
              <div
                className="text-gray-700 text-sm leading-relaxed prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{
                  __html: analysisText
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\n/g, '<br/>'),
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Tab: New Tournament Setup */}
      {activeTab === 'setup' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
          <h2 className="text-lg font-black text-gray-800">Create New Tournament</h2>

          <form action={createTournament} className="space-y-5">
            {/* Tournament Name */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                Tournament Name
              </label>
              <input
                name="name"
                placeholder="e.g. PES Season 3"
                required
                className="w-full p-3 border-2 border-gray-200 rounded-xl font-semibold focus:border-blue-400 focus:outline-none"
              />
            </div>

            {/* Format */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                Format
              </label>
              <select
                name="format"
                className="w-full p-3 border-2 border-gray-200 rounded-xl font-semibold bg-white focus:border-blue-400 focus:outline-none"
              >
                <option value="double_rr">Double Round Robin</option>
                <option value="single_rr">Single Round Robin</option>
                <option value="knockout">Knockout</option>
                <option value="rr_then_knockout">Round Robin → Knockout</option>
              </select>
            </div>

            {/* Qualify Count */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                How many players qualify / advance?
              </label>
              <input
                name="qualify_count"
                type="number"
                defaultValue={4}
                min={1}
                className="w-full p-3 border-2 border-gray-200 rounded-xl font-semibold focus:border-blue-400 focus:outline-none"
              />
            </div>

            {/* Players */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Players
              </label>

              {/* Add new player inline */}
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  placeholder="Add new player..."
                  className="flex-1 p-2 border-2 border-gray-200 rounded-lg text-sm font-semibold focus:border-blue-400 focus:outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPlayer())}
                />
                <button
                  type="button"
                  onClick={handleAddPlayer}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-gray-700"
                >
                  Add
                </button>
              </div>

              {/* Player checkboxes */}
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {allPlayers.map((p) => (
                  <label
                    key={p.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                      selectedPlayers.includes(p.id)
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-gray-100 bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      name="players"
                      value={p.id}
                      checked={selectedPlayers.includes(p.id)}
                      onChange={() => togglePlayer(p.id)}
                      className="w-4 h-4 accent-blue-600"
                    />
                    <span className="font-bold text-gray-800">{p.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-gray-900 hover:bg-gray-700 text-white font-black text-base rounded-xl transition-colors"
            >
              🚀 Generate Fixtures
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
