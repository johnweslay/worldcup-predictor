'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import NavBar from '@/components/NavBar'

export default function PointsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [leaderboard, setLeaderboard] = useState<any[]>([])

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/')
  }, [status, router])

  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/points/leaderboard')
      .then(r => r.json())
      .then(d => setLeaderboard(d.leaderboard ?? []))
  }, [status])

  const user = session?.user as any
  const pts  = user?.points ?? 0

  if (status === 'loading') return null

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar session={session} />
      <main className="max-w-xl mx-auto px-4 py-6">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Your points',  value: pts },
            { label: 'To whitelist', value: Math.max(0, 3 - pts) },
            { label: 'Status',       value: user?.wlClaimed ? '✅ WL' : pts >= 3 ? '🔥 Ready' : '⏳' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <div className="text-2xl font-semibold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-gray-800">Progress to whitelist</span>
            <span className="text-gray-400">{Math.min(pts, 3)} / 3 pts</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((pts / 3) * 100, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-3">
            {[0, 1, 2].map(i => (
              <div key={i} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm
                ${i < pts ? 'bg-purple-500 border-purple-500 text-white' : 'border-gray-200 text-gray-300'}`}>
                ⚽
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <h2 className="text-base font-semibold text-gray-900 mb-3">Leaderboard</h2>
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {leaderboard.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-400">No predictions yet</div>
          ) : leaderboard.map((u: any, i: number) => (
            <div key={i} className={`flex items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-0
              ${u.twitter_handle === user?.handle ? 'bg-purple-50' : ''}`}>
              <span className="text-sm font-medium text-gray-400 w-5 text-right">{u.rank}</span>
              {u.twitter_image && (
                <img src={u.twitter_image} className="w-8 h-8 rounded-full" alt="" />
              )}
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">@{u.twitter_handle}</div>
                <div className="text-xs text-gray-400">{u.total_correct}/{u.total_predicted} correct</div>
              </div>
              <div className="flex items-center gap-2">
                {u.wl_claimed && <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">WL ✓</span>}
                <span className="text-sm font-semibold text-purple-700">{u.points} pts</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
