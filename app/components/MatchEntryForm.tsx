'use client'

import { useState, useRef, useEffect } from 'react'
import { saveMatchResult } from '@/app/actions/matches'

// ── Drum Roll Picker ──────────────────────────────────────────────
const ITEM_HEIGHT = 48

function DrumPicker({
  value,
  onChange,
  min = 0,
  max = 20,
}: {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
}) {
  const items = Array.from({ length: max - min + 1 }, (_, i) => i + min)
  const listRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const startY = useRef(0)
  const startScrollTop = useRef(0)

  // Scroll to selected value on mount / value change
  useEffect(() => {
    const el = listRef.current
    if (!el) return
    el.scrollTop = (value - min) * ITEM_HEIGHT
  }, [value, min])

  const handleScroll = () => {
    const el = listRef.current
    if (!el) return
    const index = Math.round(el.scrollTop / ITEM_HEIGHT)
    const clamped = Math.max(0, Math.min(items.length - 1, index))
    if (items[clamped] !== value) onChange(items[clamped])
  }

  // Touch support
  const onTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY
    startScrollTop.current = listRef.current?.scrollTop ?? 0
  }
  const onTouchMove = (e: React.TouchEvent) => {
    if (!listRef.current) return
    const delta = startY.current - e.touches[0].clientY
    listRef.current.scrollTop = startScrollTop.current + delta
  }

  return (
    <div className="relative w-16 h-36 overflow-hidden select-none">
      {/* Selection highlight */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-12 bg-blue-100 border-y-2 border-blue-400 rounded pointer-events-none z-10" />
      {/* Fade top */}
      <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-white to-transparent pointer-events-none z-10" />
      {/* Fade bottom */}
      <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none z-10" />

      <div
        ref={listRef}
        className="h-full overflow-y-scroll no-scrollbar scroll-smooth"
        onScroll={handleScroll}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        style={{ scrollSnapType: 'y mandatory' }}
      >
        {/* Padding so first/last items can center */}
        <div style={{ height: ITEM_HEIGHT * 2 }} />
        {items.map((num) => (
          <div
            key={num}
            className="flex items-center justify-center font-bold text-2xl text-gray-700 cursor-pointer"
            style={{ height: ITEM_HEIGHT, scrollSnapAlign: 'center' }}
            onClick={() => onChange(num)}
          >
            {num}
          </div>
        ))}
        <div style={{ height: ITEM_HEIGHT * 2 }} />
      </div>
    </div>
  )
}

// ── Confirmation Modal ────────────────────────────────────────────
function ConfirmModal({
  match,
  score1,
  score2,
  isWalkover,
  commentary,
  onConfirm,
  onCancel,
  saving,
}: {
  match: any
  score1: number
  score2: number
  isWalkover: boolean
  commentary: string
  onConfirm: () => void
  onCancel: () => void
  saving: boolean
}) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 animate-in fade-in zoom-in-95">
        <h2 className="text-xl font-black text-center">Confirm Result</h2>

        {/* Score display */}
        <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
          <div className="text-center flex-1">
            <p className="font-bold text-gray-800 text-sm">{match.player1.name}</p>
            <p className="text-4xl font-black text-blue-600 mt-1">{score1}</p>
          </div>
          <div className="text-gray-400 font-bold text-lg">vs</div>
          <div className="text-center flex-1">
            <p className="font-bold text-gray-800 text-sm">{match.player2.name}</p>
            <p className="text-4xl font-black text-blue-600 mt-1">{score2}</p>
          </div>
        </div>

        {isWalkover && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-2 text-center text-orange-700 font-bold text-sm">
            ⚠️ Walkover
          </div>
        )}

        {/* AI Commentary */}
        {commentary && (
          <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
            <p className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">🎙️ AI Commentary</p>
            <p className="text-gray-700 italic text-sm">{commentary}</p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={onCancel}
            disabled={saving}
            className="flex-1 py-3 rounded-xl border-2 border-gray-200 font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={saving}
            className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-black hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Result ✅'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Match Entry Form ─────────────────────────────────────────
export default function MatchEntryForm({ tournamentId }: { tournamentId: string }) {
  const [matches, setMatches] = useState<any[]>([])
  const [selectedMatch, setSelectedMatch] = useState<any>(null)
  const [score1, setScore1] = useState(0)
  const [score2, setScore2] = useState(0)
  const [isWalkover, setIsWalkover] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [commentary, setCommentary] = useState('')
  const [loadingCommentary, setLoadingCommentary] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Fetch pending matches
  useEffect(() => {
    fetch(`/api/matches/pending?tournamentId=${tournamentId}`)
      .then((r) => r.json())
      .then((data) => {
        setMatches(data)
        if (data.length > 0) setSelectedMatch(data[0])
      })
  }, [tournamentId])

  const handleMatchSelect = (matchId: string) => {
    const m = matches.find((x) => x.id === matchId)
    setSelectedMatch(m)
    setScore1(0)
    setScore2(0)
    setIsWalkover(false)
    setCommentary('')
    setError('')
  }

  const handleWalkoverToggle = (checked: boolean) => {
    setIsWalkover(checked)
    if (checked) {
      // Walkover = 3-0 by default, prompt admin to choose winner via score
      setScore1(3)
      setScore2(0)
    } else {
      setScore1(0)
      setScore2(0)
    }
  }

  // Step 1: Generate commentary THEN show modal
  const handleSaveClick = async () => {
    if (!selectedMatch) return
    setLoadingCommentary(true)
    setError('')

    try {
      const res = await fetch('/api/commentary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          p1: selectedMatch.player1.name,
          p2: selectedMatch.player2.name,
          score1,
          score2,
          isWalkover,
        }),
      })
      const data = await res.json()
      setCommentary(data.commentary || '')
    } catch {
      setCommentary('')
    } finally {
      setLoadingCommentary(false)
      setShowModal(true)
    }
  }

  // Step 2: Confirmed — actually save to DB
  const handleConfirm = async () => {
    if (!selectedMatch) return
    setSaving(true)

    const formData = new FormData()
    formData.append('matchId', selectedMatch.id)
    formData.append('score1', String(score1))
    formData.append('score2', String(score2))
    formData.append('isWalkover', String(isWalkover))
    formData.append('commentary', commentary)

    try {
      await saveMatchResult(formData)
      setSuccessMsg(`✅ Result saved! ${selectedMatch.player1.name} ${score1} - ${score2} ${selectedMatch.player2.name}`)
      setShowModal(false)
      // Remove saved match from list
      const remaining = matches.filter((m) => m.id !== selectedMatch.id)
      setMatches(remaining)
      setSelectedMatch(remaining[0] || null)
      setScore1(0)
      setScore2(0)
      setCommentary('')
    } catch (e: any) {
      setError(e.message || 'Failed to save result.')
    } finally {
      setSaving(false)
    }
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-5xl mb-4">🏆</p>
        <p className="font-bold text-lg">All matches completed!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 font-semibold text-sm">
          {successMsg}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 font-semibold text-sm">
          {error}
        </div>
      )}

      {/* Match Selector */}
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
          Select Match
        </label>
        <select
          className="w-full p-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-800 bg-white focus:border-blue-400 focus:outline-none"
          value={selectedMatch?.id || ''}
          onChange={(e) => handleMatchSelect(e.target.value)}
        >
          {matches.map((m) => (
            <option key={m.id} value={m.id}>
              {m.player1.name} vs {m.player2.name} — Leg {m.leg}
            </option>
          ))}
        </select>
      </div>

      {selectedMatch && (
        <>
          {/* Score Pickers */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 text-center">
              Enter Score
            </label>
            <div className="flex items-center justify-center gap-4">
              {/* Player 1 */}
              <div className="text-center flex-1">
                <p className="font-black text-gray-800 mb-2 truncate">{selectedMatch.player1.name}</p>
                <div className="flex justify-center">
                  <DrumPicker value={score1} onChange={setScore1} />
                </div>
              </div>

              {/* VS divider */}
              <div className="text-2xl font-black text-gray-300 pb-2">—</div>

              {/* Player 2 */}
              <div className="text-center flex-1">
                <p className="font-black text-gray-800 mb-2 truncate">{selectedMatch.player2.name}</p>
                <div className="flex justify-center">
                  <DrumPicker value={score2} onChange={setScore2} />
                </div>
              </div>
            </div>
          </div>

          {/* Walkover Toggle */}
          <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-xl border border-orange-100">
            <input
              id="walkover"
              type="checkbox"
              checked={isWalkover}
              onChange={(e) => handleWalkoverToggle(e.target.checked)}
              className="w-5 h-5 accent-orange-500 cursor-pointer"
            />
            <label htmlFor="walkover" className="font-bold text-orange-700 cursor-pointer">
              Mark as Walkover (3-0 default win)
            </label>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSaveClick}
            disabled={loadingCommentary}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-lg rounded-xl disabled:opacity-60 transition-colors"
          >
            {loadingCommentary ? '⚡ Generating commentary...' : 'Save Result'}
          </button>
        </>
      )}

      {/* Confirmation Modal */}
      {showModal && selectedMatch && (
        <ConfirmModal
          match={selectedMatch}
          score1={score1}
          score2={score2}
          isWalkover={isWalkover}
          commentary={commentary}
          onConfirm={handleConfirm}
          onCancel={() => setShowModal(false)}
          saving={saving}
        />
      )}
    </div>
  )
}
