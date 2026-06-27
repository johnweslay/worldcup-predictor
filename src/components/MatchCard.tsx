'use client'
import { useState } from 'react'

const PICK_LABELS: Record<string, string> = {
  HOME_WIN: 'Home win',
  DRAW:     'Draw',
  AWAY_WIN: 'Away win',
}

interface Props {
  match: any
  userPoints: number
  usedStupidPickToday: boolean
  onPredicted: (matchId: string, pick: string, isStupidPick: boolean) => void
}

export default function MatchCard({ match, userPoints, usedStupidPickToday, onPredicted }: Props) {
  const [selected, setSelected]       = useState<string | null>(null)
  const [stupidPick, setStupidPick]   = useState(false)
  const [showModal, setShowModal]     = useState(false)
  const [confirmed, setConfirmed]     = useState<boolean>(!!match.userPrediction?.pick)
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState<string | null>(null)

  const pred          = match.userPrediction
  const confirmedPick = pred?.pick ?? null
  const isStupidUsed  = pred?.is_stupid_pick ?? false
  const isResolved    = pred?.is_correct !== null && pred?.is_correct !== undefined
  const kickoff       = new Date(match.kickoff_at)
  const locked        = new Date() >= kickoff || !['SCHEDULED', 'TIMED'].includes(match.status)
  const hasScore      = match.home_score !== null && match.away_score !== null
  const canStupidPick = userPoints >= 1 && !usedStupidPickToday

  async function submitPrediction(isStupid: boolean) {
    if (!selected || saving) return
    setSaving(true)
    setError(null)
    setShowModal(false)

    const res = await fetch('/api/predictions', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ matchId: match.id, pick: selected, isStupidPick: isStupid }),
    })
    const data = await res.json()
    setSaving(false)

    if (!res.ok) { setError(data.error); return }
    setConfirmed(true)
    setStupidPick(isStupid)
    onPredicted(match.id, selected, isStupid)
  }

  function btnClass(key: string, active: string | null) {
    const base = 'flex-1 py-2.5 px-2 rounded-xl border text-xs font-bold tracking-wide transition-all'
    if (isResolved) {
      if (key === match.result && key === confirmedPick)
        return `${base} bg-[#D8FF1A] border-[#D8FF1A] text-[#111111]`
      if (key === confirmedPick && key !== match.result)
        return `${base} bg-[#EAE7E1] border-[#EAE7E1] text-[#666666] line-through`
      if (key === match.result)
        return `${base} bg-[#EAE7E1] border-[#EAE7E1] text-[#111111]`
      return `${base} bg-transparent border-[#EAE7E1] text-[#666666]`
    }
    if (confirmed && key === confirmedPick)
      return `${base} ${isStupidPick || isStupidUsed ? 'bg-red-500 border-red-500 text-white' : 'bg-[#111111] border-[#111111] text-white'}`
    if (!confirmed && key === active)
      return `${base} bg-[#111111] border-[#111111] text-[#D8FF1A]`
    return `${base} bg-transparent border-[#EAE7E1] text-[#666666] hover:border-[#111111] hover:text-[#111111]`
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-[#EAE7E1] mb-3 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#F5F2EC] border-b border-[#EAE7E1]">
          <span className="text-[10px] font-bold tracking-widest text-[#666666] uppercase">
            {match.stage?.replace('_', ' ')}{match.group_name ? ` · ${match.group_name?.replace('_', ' ')}` : ''}
          </span>
          <span className="text-[10px] font-semibold text-[#666666]">
            {kickoff.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div className="p-4">
          {/* Teams */}
          <div className="grid grid-cols-3 items-center gap-2 mb-4">
            <div className="flex flex-col items-center gap-1">
              <div className="text-3xl">{match.home_flag}</div>
              <div className="text-xs font-semibold text-[#111111] text-center leading-tight">{match.home_team}</div>
            </div>
            <div className="text-center">
              {hasScore ? (
                <div className="font-bold text-[#111111] text-2xl tracking-tight">
                  {match.home_score} – {match.away_score}
                </div>
              ) : (
                <div className="text-xs font-bold text-[#666666] bg-[#EAE7E1] px-2 py-1.5 rounded-lg">VS</div>
              )}
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="text-3xl">{match.away_flag}</div>
              <div className="text-xs font-semibold text-[#111111] text-center leading-tight">{match.away_team}</div>
            </div>
          </div>

          {/* Prediction area */}
          {locked ? (
            isResolved ? (
              <>
                <div className="flex gap-2 mb-3">
                  {(['HOME_WIN', 'DRAW', 'AWAY_WIN'] as const).map(key => (
                    <button key={key} className={btnClass(key, confirmedPick)} disabled>
                      {PICK_LABELS[key]}
                    </button>
                  ))}
                </div>
                {isStupidUsed && (
                  <div className="text-center text-[10px] font-bold text-red-500 mb-2 tracking-widest uppercase">
                    ⚡ Stupid Pick used
                  </div>
                )}
                <div className={`text-center text-xs font-bold py-2 px-3 rounded-xl ${pred.is_correct ? 'bg-[#D8FF1A] text-[#111111]' : 'bg-[#EAE7E1] text-[#666666]'}`}>
                  {pred.is_correct
                    ? isStupidUsed ? '⚡ Stupid Pick correct! +2 points' : '⚽ Correct! +1 point'
                    : isStupidUsed ? '⚡ Stupid Pick wrong — lost 1 point' : '✗ Wrong prediction'}
                </div>
              </>
            ) : (
              <div className="text-center text-xs font-semibold text-[#666666] py-2">
                🔒 Predictions locked
              </div>
            )
          ) : confirmed ? (
            <>
              <div className="flex gap-2 mb-3">
                {(['HOME_WIN', 'DRAW', 'AWAY_WIN'] as const).map(key => (
                  <button key={key} className={btnClass(key, confirmedPick)} disabled>
                    {PICK_LABELS[key]}
                  </button>
                ))}
              </div>
              {(stupidPick || isStupidUsed) && (
                <div className="text-center text-[10px] font-bold text-red-500 mb-2 tracking-widest uppercase">
                  ⚡ Stupid Pick active — 1 pt locked
                </div>
              )}
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#666666] bg-[#EAE7E1] rounded-xl py-2">
                ⏱ Awaiting result
              </div>
            </>
          ) : (
            <>
              <div className="flex gap-2 mb-3">
                {(['HOME_WIN', 'DRAW', 'AWAY_WIN'] as const).map(key => (
                  <button
                    key={key}
                    className={btnClass(key, selected)}
                    onClick={() => setSelected(key)}
                    disabled={saving}
                  >
                    {PICK_LABELS[key]}
                  </button>
                ))}
              </div>

              {selected && (
                <div className="flex gap-2">
                  <button
                    onClick={() => submitPrediction(false)}
                    disabled={saving}
                    className="flex-1 py-2.5 rounded-xl bg-[#D8FF1A] text-[#111111] text-xs font-bold tracking-wide hover:bg-[#c8ef0a] active:scale-95 transition-all disabled:opacity-50"
                  >
                    {saving ? 'Saving…' : 'Confirm Prediction'}
                  </button>
                  {canStupidPick && (
                    <button
                      onClick={() => setShowModal(true)}
                      disabled={saving}
                      className="px-3 py-2.5 rounded-xl bg-[#111111] text-[#D8FF1A] text-xs font-bold tracking-wide hover:bg-red-600 hover:text-white active:scale-95 transition-all disabled:opacity-50"
                    >
                      ⚡ Stupid
                    </button>
                  )}
                </div>
              )}

              {!selected && (
                <p className="text-xs text-center text-[#666666] font-medium">Select a result to predict</p>
              )}
              {error && <p className="text-xs text-center text-red-500 mt-2">{error}</p>}
            </>
          )}
        </div>
      </div>

      {/* Stupid Pick Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="text-center mb-5">
              <div className="text-4xl mb-2">⚡</div>
              <h2 className="text-lg font-bold text-[#111111] mb-1">Stupid Pick</h2>
              <p className="text-xs text-[#666666]">You're about to risk 1 point on this prediction</p>
            </div>

            <div className="space-y-2 mb-5">
              <div className="flex items-center gap-3 bg-[#F5F2EC] rounded-xl px-4 py-3">
                <span className="text-lg">✅</span>
                <div>
                  <div className="text-xs font-bold text-[#111111]">Correct prediction</div>
                  <div className="text-xs text-[#666666]">Staked point returned + 2 bonus points</div>
                </div>
                <span className="ml-auto text-xs font-bold text-[#111111]">+2 pts</span>
              </div>
              <div className="flex items-center gap-3 bg-[#F5F2EC] rounded-xl px-4 py-3">
                <span className="text-lg">❌</span>
                <div>
                  <div className="text-xs font-bold text-[#111111]">Wrong prediction</div>
                  <div className="text-xs text-[#666666]">Staked point is lost</div>
                </div>
                <span className="ml-auto text-xs font-bold text-red-500">-1 pt</span>
              </div>
            </div>

            <button
              onClick={() => submitPrediction(true)}
              className="w-full py-3 rounded-xl bg-[#111111] text-[#D8FF1A] text-sm font-bold tracking-wide mb-2 active:scale-95 transition-all"
            >
              Confirm Stupid Pick
            </button>
            <button
              onClick={() => setShowModal(false)}
              className="w-full py-2.5 rounded-xl text-[#666666] text-xs font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  )
}
