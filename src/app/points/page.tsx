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

  const user          = session?.user as any
  const pts           = user?.points ?? 0
  const lockedPts     = user?.locked_points ?? 0
  const availablePts  = pts - lockedPts

  if (status === 'loading') return null

  return (
    <div className="min-h-screen bg-[#F5F2EC]">
      <NavBar session={session} />
      <main className="max-w-xl mx-auto px-4 py-6">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Available',    value: availablePts },
            { label: 'Locked ⚡',   value: lockedPts },
            { label: 'To whitelist', value: Math.max(0, 3 - pts) },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-[#EAE7E1] p-4 text-center">
              <div className="text-2xl font-bold text-[#111111]">{s.value}</div>
              <div className="text-[10px] font-semibold text-[#666666] mt-1 uppercase tracking-wide">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Stupid Pick info if locked */}
        {lockedPts > 0 && (
          <div className="bg-[#111111] rounded-2xl p-4 mb-6 flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <div>
              <div className="text-xs font-bold text-[#D8FF1A]">Stupid Pick Active</div>
              <div className="text-xs text-[#666666] mt-0.5">{lockedPts} pt{lockedPts !== 1 ? 's' : ''} locked — awaiting match result</div>
            </div>
          </div>
        )}

        {/* Progress bar */}
        <div className="bg-white rounded-2xl border border-[#EAE7E1] p-4 mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-bold text-[#111111]">Progress to whitelist</span>
            <span className="text-xs font-semibold text-[#666666]">{Math.min(pts, 3)} / 3 pts</span>
          </div>
          <div className="h-2 bg-[#EAE7E1] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#D8FF1A] rounded-full transition-all duration-500"
              style={{ width: `${Math.min((pts / 3) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Leaderboard */}
        <h2 className="text-base font-bold text-[#111111] mb-3">Leaderboard</h2>
        <div className="bg-white rounded-2xl border border-[#EAE7E1] overflow-hidden">
          {leaderboard.length === 0 ? (
            <div className="p-6 text-center text-sm text-[#666666]">No predictions yet</div>
          ) : leaderboard.map((u: any, i: number) => (
            <div key={i} className={`flex items-center gap-3 px-4 py-3 border-b border-[#EAE7E1] last:border-0
              ${u.twitter_handle === user?.handle ? 'bg-[#F5F2EC]' : ''}`}>
              <span className="text-xs font-bold text-[#666666] w-5 text-right">{u.rank}</span>
              {u.twitter_image && (
                <img src={u.twitter_image} className="w-8 h-8 rounded-full" alt="" />
              )}
              <div className="flex-1">
                <div className="text-sm font-bold text-[#111111]">@{u.twitter_handle}</div>
                <div className="text-xs text-[#666666]">{u.total_correct}/{u.total_predicted} correct</div>
              </div>
              <div className="flex items-center gap-2">
                {u.wl_claimed && <span className="text-xs bg-[#D8FF1A] text-[#111111] font-bold px-2 py-0.5 rounded-full">WL ✓</span>}
                <span className="text-sm font-bold text-[#111111]">{u.points} pts</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
