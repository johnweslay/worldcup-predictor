'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import NavBar from '@/components/NavBar'

const TWEET_URL = 'PLACEHOLDER' // Replace with actual tweet URL later

export default function WhitelistPage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [wallet, setWallet]         = useState('')
  const [entry, setEntry]           = useState<any>(null)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const [taskFollow, setTaskFollow]         = useState(false)
  const [taskLike, setTaskLike]             = useState(false)
  const [verifyingFollow, setVerifyingFollow] = useState(false)
  const [verifyingLike, setVerifyingLike]     = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/')
  }, [status, router])

  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/whitelist')
      .then(r => r.json())
      .then(d => setEntry(d.entry))

    // Load task state from localStorage
    const saved = localStorage.getItem('wl_tasks')
    if (saved) {
      const { follow, like } = JSON.parse(saved)
      setTaskFollow(follow ?? false)
      setTaskLike(like ?? false)
    }
  }, [status])

  function saveTask(key: string, val: boolean) {
    const saved = localStorage.getItem('wl_tasks')
    const tasks = saved ? JSON.parse(saved) : {}
    tasks[key] = val
    localStorage.setItem('wl_tasks', JSON.stringify(tasks))
  }

  function handleFollow() {
    window.open('https://x.com/STU_pidityy', '_blank')
    setVerifyingFollow(true)
    setTimeout(() => {
      setVerifyingFollow(false)
      setTaskFollow(true)
      saveTask('follow', true)
    }, 7000)
  }

  function handleLike() {
    if (TWEET_URL === 'PLACEHOLDER') return
    window.open(TWEET_URL, '_blank')
    setVerifyingLike(true)
    setTimeout(() => {
      setVerifyingLike(false)
      setTaskLike(true)
      saveTask('like', true)
    }, 7000)
  }

  const user      = session?.user as any
  const pts       = user?.points ?? 0
  const hasPoints = pts >= 3
  const allTasks  = taskFollow && taskLike && hasPoints
  const canClaim  = allTasks && !user?.wlClaimed

  async function claim() {
    if (!canClaim) return
    if (!/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
      setError('Please enter a valid Ethereum wallet address (0x…)')
      return
    }
    setLoading(true)
    setError(null)
    const res = await fetch('/api/whitelist', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ walletAddress: wallet }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error); return }
    setEntry(data)
    await update()
  }

  if (status === 'loading') return null

  const tasks = [
    {
      id:       'points',
      icon:     '⚽',
      label:    'Earn 3 points',
      sub:      `${Math.min(pts, 3)} / 3 points earned`,
      done:     hasPoints,
      action:   null,
      btnLabel: null,
    },
    {
      id:          'follow',
      icon:        '𝕏',
      label:       'Follow @STU_pidityy',
      sub:         'Follow us on X to stay updated',
      done:        taskFollow,
      verifying:   verifyingFollow,
      action:      handleFollow,
      btnLabel:    'Follow',
    },
    {
      id:          'like',
      icon:        '🔁',
      label:       'Like & Repost announcement',
      sub:         TWEET_URL === 'PLACEHOLDER' ? 'Coming soon — tweet not posted yet' : 'Like and repost our announcement tweet',
      done:        taskLike,
      verifying:   verifyingLike,
      action:      TWEET_URL === 'PLACEHOLDER' ? null : handleLike,
      btnLabel:    'Like & Repost',
    },
  ]

  return (
    <div className="min-h-screen bg-[#F5F2EC]">
      <NavBar session={session} />
      <main className="max-w-xl mx-auto px-4 py-6">

        <h1 className="text-xl font-bold text-[#111111] mb-1">Claim Whitelist</h1>
        <p className="text-xs text-[#666666] mb-6">Complete all tasks to unlock your whitelist spot.</p>

        {/* Already claimed */}
        {(user?.wlClaimed || entry) ? (
          <div className="bg-[#D8FF1A] rounded-2xl p-5 mb-4">
            <div className="text-2xl mb-2">🎟️</div>
            <div className="font-bold text-[#111111] text-base mb-1">Whitelist claimed!</div>
            <div className="text-xs text-[#111111]/70">You're in — see you at mint day.</div>
            {entry?.walletAddress && (
              <div className="mt-3 text-xs font-mono text-[#111111]/60 break-all">{entry.walletAddress}</div>
            )}
          </div>
        ) : (
          <>
            {/* Tasks */}
            <div className="space-y-3 mb-6">
              {tasks.map(task => (
                <div
                  key={task.id}
                  className={`bg-white rounded-2xl border p-4 flex items-center gap-4 transition-all
                    ${task.done ? 'border-[#D8FF1A]' : 'border-[#EAE7E1]'}`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0
                    ${task.done ? 'bg-[#D8FF1A] text-[#111111]' : 'bg-[#EAE7E1] text-[#666666]'}`}>
                    {task.done ? '✓' : task.icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-[#111111]">{task.label}</div>
                    <div className="text-xs text-[#666666] mt-0.5">{task.sub}</div>
                  </div>
                  {!task.done && task.verifying && (
                    <div className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-[#666666]">
                      <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Verifying…
                    </div>
                  )}
                  {!task.done && !task.verifying && task.action && (
                    <button
                      onClick={task.action}
                      className="shrink-0 text-xs font-bold bg-[#111111] text-white px-3 py-2 rounded-xl hover:bg-[#333] active:scale-95 transition-all"
                    >
                      {task.btnLabel}
                    </button>
                  )}
                  {!task.done && !task.verifying && !task.action && task.id !== 'points' && (
                    <span className="text-xs text-[#666666] font-medium shrink-0">Soon</span>
                  )}
                </div>
              ))}
            </div>

            {/* Claim section */}
            <div className={`rounded-2xl border-2 p-5 transition-all
              ${canClaim ? 'border-[#D8FF1A] bg-white' : 'border-[#EAE7E1] bg-white opacity-60'}`}>

              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🎟️</span>
                <div>
                  <div className="text-sm font-bold text-[#111111]">Whitelist Pass</div>
                  <div className="text-xs text-[#666666]">Guaranteed mint allocation · Limited supply</div>
                </div>
                {!allTasks && (
                  <span className="ml-auto text-lg">🔒</span>
                )}
              </div>

              {canClaim ? (
                <>
                  <input
                    type="text"
                    placeholder="0x… your Ethereum wallet address"
                    value={wallet}
                    onChange={e => setWallet(e.target.value)}
                    className="w-full border border-[#EAE7E1] rounded-xl px-3 py-2.5 text-xs font-mono mb-3 focus:outline-none focus:border-[#111111] bg-[#F5F2EC]"
                  />
                  {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
                  <button
                    onClick={claim}
                    disabled={loading}
                    className="w-full bg-[#D8FF1A] hover:bg-[#c8ef0a] text-[#111111] font-bold py-3 rounded-xl transition-all text-sm active:scale-95 disabled:opacity-50"
                  >
                    {loading ? 'Processing…' : 'Claim Whitelist →'}
                  </button>
                </>
              ) : (
                <div className="text-center text-xs text-[#666666] py-2">
                  Complete all tasks above to unlock
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
