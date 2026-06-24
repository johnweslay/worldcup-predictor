'use client'
import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated') router.push('/predict')
  }, [status, router])

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">

        <div className="text-center mb-8">
          <div className="text-6xl mb-4">⚽</div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            World Cup Predictor
          </h1>
          <p className="text-gray-500">
            Predict match winners, earn points,<br />
            claim your free whitelist spot.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <div className="font-medium text-gray-900 text-sm">Predict match results</div>
                <div className="text-gray-500 text-xs">Home win · Draw · Away win — per match</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">⭐</span>
              <div>
                <div className="font-medium text-gray-900 text-sm">Earn +1 point per correct pick</div>
                <div className="text-gray-500 text-xs">Points verified against official FIFA results</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎟️</span>
              <div>
                <div className="font-medium text-gray-900 text-sm">3 points = whitelist spot</div>
                <div className="text-gray-500 text-xs">Redeem anytime — on-chain guarantee</div>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => signIn('twitter', { callbackUrl: '/predict' })}
          className="w-full flex items-center justify-center gap-3 bg-[#1D9BF0] hover:bg-[#1677c0] text-white font-medium py-3 px-6 rounded-xl transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.261 5.632 5.903-5.632Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          Sign in with Twitter / X
        </button>
        <p className="text-center text-xs text-gray-400 mt-3">
          Free to play · No tokens required
        </p>
      </div>
    </main>
  )
}
