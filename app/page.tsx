'use client'
import { useState } from 'react'
import StandingsTab from './components/StandingsTab'
import FixturesTab from './components/FixturesTab'
import AnalyticsTab from './components/AnalyticsTab'


export default function PublicDashboard() {
  const [activeTab, setActiveTab] = useState<'standings' | 'fixtures' | 'analytics'>('standings')
  const activeTournamentId = 'YOUR-TOURNAMENT-UUID' // Fetch active dynamically in production

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-end border-b pb-4">
        <h1 className="text-4xl font-black tracking-tight">Tournament Hub</h1>
        <div className="flex space-x-2">
          <button onClick={() => setActiveTab('standings')} className={`px-4 py-2 font-bold rounded-t-lg ${activeTab === 'standings' ? 'bg-black text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>Standings</button>
          <button onClick={() => setActiveTab('fixtures')} className={`px-4 py-2 font-bold rounded-t-lg ${activeTab === 'fixtures' ? 'bg-black text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>Fixtures</button>
          <button onClick={() => setActiveTab('analytics')} className={`px-4 py-2 font-bold rounded-t-lg ${activeTab === 'analytics' ? 'bg-black text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>Analytics</button>
        </div>
      </div>

      {activeTab === 'standings' && <StandingsTab tournamentId={activeTournamentId} />}
      {activeTab === 'fixtures' && <FixturesTab tournamentId={activeTournamentId} />}
      {activeTab === 'analytics' && <AnalyticsTab tournamentId={activeTournamentId} />}
    </div>
  )
}
