'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import NavBar from '@/components/NavBar'

export default function WhitelistPage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [wallet, setWallet]   = useState('')
  const [entry, setEntry]     = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/')
  }, [status, router])

  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/whitelist')
      .then(r => r.json())
      .then(d => setEntry(d.entry))
  }, [status])

  const user = session?.user as any
  const pts  = user?.points ?? 0
  const canClaim = pts >= 3 && !user?.wlClaimed

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
    await update()   // refresh session to reflect wl_claimed
  }

  if (status === 'loading') return null

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar session={session} />
      <main className="max-w-xl mx-auto px-4 py-6">
        <h1 className="text-xl font-semibold text-gray-900 mb-1">Whitelist exchange</h1>
        <p className="text-sm text-gray-500 mb-5">
          Redeem 3 points for a guaranteed mint allocation.
        </p>

        {/* Already claimed */}
        {(user?.wlClaimed || entry) && (
          <div className="bg-green-50 border border-green-300 rounded-2xl p-5 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-xl">✅</div>
              <div>
                <div className="font-medium text-green-900">Whitelist claimed!</div>
                <div className="text-sm text-green-700">You're in — see you at mint day.</div>
              </div>
            </div>
            <div className="text-xs text-green-700 space-y-1">
              <div>Wallet: <code className="font-mono">{entry?.walletAddress ?? user?.wallet_address}</code></div>
              {entry?.txHash && (
                <div>Tx: <a href={`https://etherscan.io/tx/${entry.txHash}`} target="_blank" rel="noreferrer"
                  className="underline font-mono">{entry.txHash.slice(0,18)}…</a></div>
              )}
              {entry?.on_chain && <div className="text-green-600 font-medium">✓ On-chain confirmed</div>}
            </div>
          </div>
        )}

        {/* Claim card */}
        {!user?.wlClaimed && !entry && (
          <div className={`rounded-2xl border-2 p-5 mb-4 ${canClaim ? 'border-teal-400 bg-teal-50' : 'border-gray-200 bg-white'}`}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🎟️</span>
              <div>
                <div className="font-medium text-gray-900">Whitelist Pass</div>
                <div className="text-sm text-gray-500">Guaranteed mint allocation · Limited supply</div>
              </div>
            </div>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-gray-600">Your points</span>
                <span className="font-medium text-gray-900">{Math.min(pts, 3)} / 3</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-500 rounded-full transition-all"
                  style={{ width: `${Math.min((pts / 3) * 100, 100)}%` }}
                />
              </div>
            </div>

            {canClaim ? (
              <>
                <input
                  type="text"
                  placeholder="0x... your Ethereum wallet address"
                  value={wallet}
                  onChange={e => setWallet(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm font-mono mb-3 focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
                {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
                <button
                  onClick={claim}
                  disabled={loading}
                  className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-200 text-white font-medium py-3 rounded-xl transition-colors text-sm"
                >
                  {loading ? 'Processing…' : 'Claim whitelist (3 pts) →'}
                </button>
              </>
            ) : (
              <div className="text-center text-sm text-gray-500 py-2">
                You need <strong>{3 - pts} more point{3 - pts !== 1 ? 's' : ''}</strong> to unlock this.
              </div>
            )}
          </div>
        )}

        {/* How it works */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="font-medium text-gray-900 mb-3">How it works</div>
          <div className="space-y-2.5 text-sm text-gray-500">
            {[
              'Predict the correct result for any World Cup match',
              'Each correct pick earns you +1 point (verified by official data)',
              'Accumulate 3 points, then enter your wallet address',
              'Your wallet is added to the smart contract on-chain',
              'You receive a guaranteed mint allocation on launch day',
            ].map((s, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-teal-500 flex-shrink-0">✓</span>
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
