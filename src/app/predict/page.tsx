'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import MatchCard from '@/components/MatchCard'
import NavBar from '@/components/NavBar'

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

  function onPredicted(matchId: string, pick: string) {
    setMatches(prev => prev.map(m =>
      m.id === matchId
        ? { ...m, userPrediction: { pick, is_correct: null } }
        : m
    ))
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading matches…</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar session={session} />
      <main className="max-w-xl mx-auto px-4 py-6">
        <h1 className="text-xl font-semibold text-gray-900 mb-1">Today's matches</h1>
        <p className="text-sm text-gray-500 mb-5">
          Predictions lock at kick-off. Results verified automatically.
        </p>

        {matches.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-400 text-sm">
            No matches scheduled today — check back tomorrow!
          </div>
        ) : (
          matches.map(match => (
            <MatchCard key={match.id} match={match} onPredicted={onPredicted} />
          ))
        )}
      </main>
    </div>
  )
}
