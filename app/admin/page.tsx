'use client'

import { useState, useEffect } from 'react'
import { getPendingMatches, saveMatchResult } from '@/app/actions/matches'
import { analyzeQualifiers } from '@/lib/gemini'
import { getTournamentStandings } from '@/app/actions/standings'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'matches' | 'analysis' | 'setup'>('matches')
  const [pendingMatches, setPendingMatches] = useState<any[]>([])
  const [analysisText, setAnalysisText] = useState('')
  const [loadingAI, setLoadingAI] = useState(false)
  
  const activeTournamentId = 'YOUR-TOURNAMENT-UUID' // Fetch dynamically in real app

  useEffect(() => {
    getPendingMatches(activeTournamentId).then(setPendingMatches)
  }, [])

  const handleAIAnalysis = async () => {
    setLoadingAI(true)
    const standings = await getTournamentStandings(activeTournamentId)
    const analysis = await analyzeQualifiers(standings, pendingMatches)
    setAnalysisText(analysis)
    setLoadingAI(false)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <h1 className="text-3xl font-bold">Admin Controls</h1>
        <div className="space-x-2">
          <button onClick={() => setActiveTab('matches')} className={`px-4 py-2 rounded ${activeTab === 'matches' ? 'bg-black text-white' : 'bg-gray-200'}`}>Matches</button>
          <button onClick={() => setActiveTab('analysis')} className={`px-4 py-2 rounded ${activeTab === 'analysis' ? 'bg-black text-white' : 'bg-gray-200'}`}>Analysis</button>
          <button onClick={() => setActiveTab('setup')} className={`px-4 py-2 rounded ${activeTab === 'setup' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>+ New Tournament</button>
        </div>
      </div>

      {activeTab === 'matches' && (
         <div className="bg-white p-6 rounded border shadow-sm">
           {/* Insert the form from the previous step here */}
           <h2 className="text-xl font-bold mb-4">Enter Match Result</h2>
           {/* ... match entry form ... */}
         </div>
      )}

      {activeTab === 'analysis' && (
        <div className="bg-white p-6 rounded border shadow-sm space-y-4">
          <h2 className="text-xl font-bold">Gemini Qualifier Analysis</h2>
          <button onClick={handleAIAnalysis} disabled={loadingAI} className="bg-purple-600 text-white px-4 py-2 rounded font-bold">
            {loadingAI ? 'Analyzing...' : 'Run Analysis'}
          </button>
          {analysisText && (
            <div className="p-4 bg-purple-50 border border-purple-100 rounded prose">
               <div dangerouslySetInnerHTML={{ __html: analysisText.replace(/\n/g, '<br/>') }} />
            </div>
          )}
        </div>
      )}

      {activeTab === 'setup' && (
        <div className="bg-white p-6 rounded border shadow-sm">
          <h2 className="text-xl font-bold mb-4">Create New Tournament</h2>
          <form action={/* call createTournament action here */} className="space-y-4">
            <input name="name" placeholder="Tournament Name" required className="w-full p-2 border rounded" />
            <select name="format" className="w-full p-2 border rounded">
              <option value="single">Single Round Robin</option>
              <option value="double">Double Round Robin</option>
            </select>
            {/* Add checkbox list of players here */}
            <button type="submit" className="w-full bg-black text-white py-2 rounded font-bold">Generate Fixtures</button>
          </form>
        </div>
      )}
    </div>
  )
}
