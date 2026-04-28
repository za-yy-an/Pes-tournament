'use client'

import { useEffect, useState } from 'react'
import { getTournamentStandings } from '@/app/actions/standings'

export default function StandingsTab({ tournamentId }: { tournamentId: string }) {
  const [standings, setStandings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tournamentId) return
    
    // Fetch the live standings from our Server Action
    getTournamentStandings(tournamentId)
      .then((data) => {
        setStandings(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error("Failed to load standings:", error)
        setLoading(false)
      })
  }, [tournamentId])

  if (loading) {
    return <div className="p-12 text-center font-bold text-gray-400 animate-pulse">Loading live standings...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-bold text-gray-800">Current Standings</h2>
        <span className="text-xs text-green-700 font-bold bg-green-100 px-3 py-1 rounded-full uppercase tracking-wider">
          Live Updates
        </span>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 border-b border-gray-200 uppercase text-gray-500 text-xs tracking-wider">
            <tr>
              <th className="p-4 font-bold text-center w-12">#</th>
              <th className="p-4 font-bold">Player</th>
              <th className="p-4 font-bold text-center">MP</th>
              <th className="p-4 font-bold text-center">W</th>
              <th className="p-4 font-bold text-center">D</th>
              <th className="p-4 font-bold text-center">L</th>
              <th className="p-4 font-bold text-center">GF</th>
              <th className="p-4 font-bold text-center">GA</th>
              <th className="p-4 font-bold text-center">GD</th>
              <th className="p-4 font-black text-center text-blue-600">Pts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {standings.map((row, index) => (
              <tr key={row.player_id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 text-center font-medium text-gray-400">{index + 1}</td>
                <td className="p-4 font-bold text-gray-900">{row.name}</td>
                <td className="p-4 text-center text-gray-600">{row.played}</td>
                <td className="p-4 text-center text-green-600 font-semibold">{row.wins}</td>
                <td className="p-4 text-center text-gray-500">{row.draws}</td>
                <td className="p-4 text-center text-red-500 font-semibold">{row.losses}</td>
                <td className="p-4 text-center text-gray-600">{row.goals_for}</td>
                <td className="p-4 text-center text-gray-600">{row.goals_against}</td>
                <td className="p-4 text-center font-semibold text-gray-700">
                  {row.goal_difference > 0 ? `+${row.goal_difference}` : row.goal_difference}
                </td>
                <td className="p-4 text-center font-black text-blue-600 text-base">{row.points}</td>
              </tr>
            ))}
            
            {standings.length === 0 && (
              <tr>
                <td colSpan={10} className="p-12 text-center text-gray-500">
                  No matches played yet. Waiting for kickoff! ⚽
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
