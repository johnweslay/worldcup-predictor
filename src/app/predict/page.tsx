'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import MatchCard from '@/components/MatchCard'
import NavBar from '@/components/NavBar'

function getDayLabel(localDateStr: string): string {
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth()+1).padStart(2,'0')}-${String(tomorrow.getDate()).padStart(2,'0')}`

  if (localDateStr === todayStr) return 'Today'
  if (localDateStr === tomorrowStr) return 'Tomorrow'
  const d = new Date(localDateStr + 'T12:00:00')
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })
}

export default function PredictPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/')
  }, [status, router])

  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/matches')
      .then(r => r.json())
      .then(d => { setMatches(d.matches ?? []); setLoading(false) })
  }, [status])

  function onPredicted(matchId: string, pick: string, isStupidPick: boolean) {
    setMatches(prev => prev.map(m =>
      m.id === matchId
        ? { ...m, userPrediction: { pick, is_correct: null, is_stupid_pick: isStupidPick } }
        : m
    ))
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F2EC]">
        <div className="text-[#666666] text-sm font-medium">Loading matches…</div>
      </div>
    )
  }

  const user = session?.user as any
  const userPoints = user?.points ?? 0
  const lockedPoints = user?.locked_points ?? 0
  const availablePoints = userPoints - lockedPoints

  // Check if Stupid Pick already used today
  const todayStr = new Date().toISOString().slice(0, 10)
  const usedStupidPickToday = matches.some(m => {
    const matchDay = new Date(m.kickoff_at).toISOString().slice(0, 10)
    return matchDay === todayStr && m.userPrediction?.is_stupid_pick === true
  })

  // Group by local date
  const grouped: Record<string, any[]> = {}
  for (const match of matches) {
    const localDate = new Date(match.kickoff_at)
    const localDateStr = `${localDate.getFullYear()}-${String(localDate.getMonth()+1).padStart(2,'0')}-${String(localDate.getDate()).padStart(2,'0')}`
    if (!grouped[localDateStr]) grouped[localDateStr] = []
    grouped[localDateStr].push(match)
  }
  const days = Object.keys(grouped).sort()

  return (
    <div className="min-h-screen bg-[#F5F2EC]">
      <NavBar session={session} />
      <main className="max-w-xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-[#111111]">Upcoming matches</h1>
            <p className="text-xs text-[#666666] mt-0.5">Predictions lock at kick-off</p>
          </div>
          {availablePoints >= 1 && !usedStupidPickToday && (
            <div className="text-[10px] font-bold text-[#111111] bg-[#D8FF1A] px-2.5 py-1.5 rounded-xl tracking-wide">
              ⚡ STUPID PICK AVAILABLE
            </div>
          )}
        </div>

        {days.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#EAE7E1] p-8 text-center text-[#666666] text-sm">
            No matches in the next 4 days — check back soon!
          </div>
        ) : (
          days.map(day => {
            // Check if stupid pick used for this specific day
            const usedStupidThisDay = matches.some(m => {
              const matchDay = new Date(m.kickoff_at).toISOString().slice(0, 10)
              const localDay = (() => {
                const d = new Date(m.kickoff_at)
                return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
              })()
              return localDay === day && m.userPrediction?.is_stupid_pick === true
            })

            return (
              <div key={day} className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-sm font-bold text-[#111111]">{getDayLabel(day)}</span>
                  <div className="flex-1 h-px bg-[#EAE7E1]" />
                </div>
                {grouped[day].map(match => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    userPoints={availablePoints}
                    usedStupidPickToday={usedStupidThisDay}
                    onPredicted={onPredicted}
                  />
                ))}
              </div>
            )
          })
        )}
      </main>
    </div>
  )
}
