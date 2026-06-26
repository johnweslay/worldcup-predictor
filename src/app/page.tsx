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
    <main style={{ minHeight: '100vh', backgroundColor: '#F5F2EC', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 1rem' }}>
      <div style={{ maxWidth: '420px', width: '100%' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '56px', marginBottom: '1rem' }}>⚽</div>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#111111', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            World Cup Predictor
          </h1>
          <p style={{ color: '#666666', fontSize: '15px', lineHeight: '1.5' }}>
            Predict match winners, earn points,<br />
            claim your free whitelist spot.
          </p>
        </div>

        {/* Feature card */}
        <div style={{ backgroundColor: '#EAE7E1', borderRadius: '16px', padding: '1.5rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { icon: '🎯', title: 'Predict match results', sub: 'Home win · Draw · Away win — per match' },
              { icon: '⭐', title: 'Earn +1 point per correct pick', sub: 'Points verified against official FIFA results' },
              { icon: '🎟️', title: '3 points = whitelist spot', sub: 'Redeem anytime — fully free' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: '#D8FF1A', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontWeight: '600', color: '#111111', fontSize: '14px' }}>{item.title}</div>
                  <div style={{ color: '#666666', fontSize: '12px', marginTop: '2px' }}>{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sign in button */}
        <button
          onClick={() => signIn('twitter', { callbackUrl: '/predict' })}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '10px', backgroundColor: '#111111', color: '#F5F2EC',
            fontWeight: '600', fontSize: '15px', padding: '14px 24px',
            borderRadius: '12px', border: 'none', cursor: 'pointer',
            fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.01em',
          }}
          onMouseOver={e => (e.currentTarget.style.backgroundColor = '#D8FF1A') && (e.currentTarget.style.color = '#111111')}
          onMouseOut={e => (e.currentTarget.style.backgroundColor = '#111111') && (e.currentTarget.style.color = '#F5F2EC')}
        >
          <svg viewBox="0 0 24 24" style={{ width: '18px', height: '18px', fill: 'currentColor' }}>
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.261 5.632 5.903-5.632Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          Sign in with Twitter / X
        </button>

        <p style={{ textAlign: 'center', fontSize: '12px', color: '#666666', marginTop: '12px' }}>
          Free to play · No tokens required
        </p>

      </div>
    </main>
  )
}
