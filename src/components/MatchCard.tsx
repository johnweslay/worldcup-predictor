'use client'
import { useState } from 'react'

const PICK_LABELS: Record<string, string> = {
  HOME_WIN: 'Home win',
  DRAW:     'Draw',
  AWAY_WIN: 'Away win',
}

const RESULT_COLOR: Record<string, string> = {
  HOME_WIN: 'bg-green-50 border-green-400 text-green-800',
  DRAW:     'bg-amber-50 border-amber-400 text-amber-800',
  AWAY_WIN: 'bg-blue-50 border-blue-400 text-blue-800',
}

interface Props {
  match: any
  onPredicted: (matchId: string, pick: string) => void
}

export default function MatchCard({ match, onPredicted }: Props) {
  const [pick, setPick]       = useState<string | null>(match.userPrediction?.pick ?? null)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const pred       = match.userPrediction
  const isResolved = pred?.is_correct !== null && pred?.is_correct !== undefined
  const kickoff    = new Date(match.kickoff_at)
  const locked     = new Date() >= kickoff || match.status !== 'SCHEDULED'

  async function submit(choice: string) {
    if (locked || saving) return
    setPick(choice)
    setSaving(true)
    setError(null)
    const res = await fetch('/api/predictions', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ matchId: match.id, pick: choice }),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setError(data.error); setPick(null); return }
    onPredicted(match.id, choice)
  }

  function btnClass(key: string) {
    const base = 'flex-1 py-2.5 px-3 rounded-xl border text-sm font-medium transition-all'
    if (isResolved) {
      if (key === match.result && key === pred.pick)
        return `${base} bg-green-100 border-green-500 text-green-800`
      if (key === pred.pick && key !== match.result)
        return `${base} bg-red-50 border-red-400 text-red-700 line-through`
      if (key === match.result)
        return `${base} bg-green-50 border-green-300 text-green-700`
      return `${base} bg-gray-50 border-gray-200 text-gray-400`
    }
    if (key === pick)
      return `${base} bg-blue-50 border-blue-500 text-blue-800 ring-1 ring-blue-300`
    return `${base} bg-gray-50 border-gray-200 text-gray-700 hover:border-blue-300 hover:text-blue-700`
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 mb-4 overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-100">
        <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
          {match.stage}{match.group_name ? ` · ${match.group_name}` : ''}
        </span>
        <span className="text-xs text-gray-400">
          {kickoff.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC
        </span>
      </div>

      <div className="p-4">
        {/* Teams */}
        <div className="grid grid-cols-3 items-center gap-2 mb-4">
          <div className="flex flex-col items-center gap-1.5">
            <div className="text-3xl">{match.home_flag}</div>
            <div className="text-sm font-medium text-gray-800 text-center leading-tight">
              {match.home_team}
            </div>
          </div>
          <div className="text-center">
            {isResolved ? (
              <div className="font-semibold text-gray-900 text-lg">
                {match.home_score} – {match.away_score}
              </div>
            ) : (
              <div className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">
                VS
              </div>
            )}
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <div className="text-3xl">{match.away_flag}</div>
            <div className="text-sm font-medium text-gray-800 text-center leading-tight">
              {match.away_team}
            </div>
          </div>
        </div>

        {/* Prediction buttons */}
        {!locked ? (
          <>
            <div className="flex gap-2 mb-3">
              {(['HOME_WIN', 'DRAW', 'AWAY_WIN'] as const).map(key => (
                <button
                  key={key}
                  className={btnClass(key)}
                  onClick={() => submit(key)}
                  disabled={saving}
                >
                  {PICK_LABELS[key]}
                </button>
              ))}
            </div>
            {pick && !saving && (
              <p className="text-xs text-center text-gray-400">
                Prediction saved — you can change it before kick-off
              </p>
            )}
            {saving && (
              <p className="text-xs text-center text-blue-500">Saving…</p>
            )}
            {error && (
              <p className="text-xs text-center text-red-500">{error}</p>
            )}
          </>
        ) : isResolved ? (
          <>
            <div className="flex gap-2 mb-3">
              {(['HOME_WIN', 'DRAW', 'AWAY_WIN'] as const).map(key => (
                <button key={key} className={btnClass(key)} disabled>
                  {PICK_LABELS[key]}
                </button>
              ))}
            </div>
            <div className={`text-center text-xs font-medium py-1.5 px-3 rounded-lg border ${pred.is_correct ? 'bg-green-50 border-green-300 text-green-700' : 'bg-red-50 border-red-300 text-red-700'}`}>
              {pred.is_correct ? '⚽ Correct! +1 point awarded' : '✗ Wrong prediction — better luck next match!'}
            </div>
          </>
        ) : (
          <div className="text-center text-xs text-gray-400 py-2">
            🔒 Predictions locked — match in progress
          </div>
        )}
      </div>
    </div>
  )
}
