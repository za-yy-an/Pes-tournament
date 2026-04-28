import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { createClient } from '@/lib/supabase/client'

export default function AnalyticsTab({ tournamentId }: { tournamentId: string }) {
  const [players, setPlayers] = useState<any[]>([])
  const [selectedPlayer, setSelectedPlayer] = useState<string>('')
  const [chartData, setChartData] = useState<any[]>([])
  const supabase = createClient()

  // Fetch players on load
  useEffect(() => {
    supabase.from('tournament_players').select('player_id, players(name)').eq('tournament_id', tournamentId)
      .then(({ data }) => {
        if (data) setPlayers(data.map(d => ({ id: d.player_id, name: (d.players as any).name })))
      })
  }, [tournamentId])

  // Fetch trend data when a player is selected
  useEffect(() => {
    if (!selectedPlayer) return
    const fetchStats = async () => {
      const { data } = await supabase.from('matches')
        .select(`id, scheduled_order, player1_id, player2_id, results(score1, score2)`)
        .eq('tournament_id', tournamentId)
        .or(`player1_id.eq.${selectedPlayer},player2_id.eq.${selectedPlayer}`)
        .order('scheduled_order', { ascending: true })

      if (data) {
        const history = data.filter(m => m.results.length > 0).map((m, index) => {
          const isHome = m.player1_id === selectedPlayer
          const goalsScored = isHome ? m.results[0].score1 : m.results[0].score2
          return { match: `Match ${index + 1}`, goals: goalsScored }
        })
        setChartData(history)
      }
    }
    fetchStats()
  }, [selectedPlayer, tournamentId])

  return (
    <div className="space-y-6">
      <select 
        className="w-full p-3 border rounded-lg font-bold text-lg"
        onChange={(e) => setSelectedPlayer(e.target.value)}
        value={selectedPlayer}
      >
        <option value="" disabled>Select a player to view analytics...</option>
        {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>

      {selectedPlayer && chartData.length > 0 && (
        <div className="bg-white p-6 border rounded-lg shadow-sm">
          <h3 className="text-xl font-bold mb-6">Goals Scored Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="match" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Line type="monotone" dataKey="goals" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}
