'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import StandingsTab from '@/app/components/StandingsTab'

export default function HistoryPage() {
  const [tournaments, setTournaments] = useState<any[]>([])
  const [selectedId, setSelectedId] = useState<string>('')
  const supabase = createClient()

  useEffect(() => {
    // Fetch only completed tournaments
    supabase.from('tournaments').select('id, name').eq('status', 'completed')
      .then(({ data }) => {
        if (data) {
          setTournaments(data)
          if (data.length > 0) setSelectedId(data[0].id)
        }
      })
  }, [])

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center border-b pb-4">
        <h1 className="text-3xl font-bold">Hall of Fame</h1>
        <select 
          className="p-2 border rounded bg-gray-50 font-semibold"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
        >
          {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      {selectedId ? (
        <StandingsTab tournamentId={selectedId} />
      ) : (
        <p className="text-gray-500 text-center py-12">No completed tournaments found.</p>
      )}
    </div>
  )
}
