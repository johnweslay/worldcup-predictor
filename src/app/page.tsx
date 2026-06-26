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
    <main style={{ minHeight: '100vh', backgroundColor: '#111111', fontFamily: "'Space Grotesk', sans-serif", overflowX: 'hidden' }}>

      {/* NAV */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ fontWeight: '700', fontSize: '18px', color: '#F5F2EC', letterSpacing: '-0.03em' }}>
          DUDE,<br />
          <span style={{ color: '#D8FF1A' }}>TRUST ME ×</span>
        </div>
        <div style={{ display: 'none', gap: '32px' }} className="nav-links">
          {['ABOUT', 'LEADERBOARD', 'REWARDS', 'FAQ'].map(l => (
            <span key={l} style={{ color: '#666666', fontSize: '13px', fontWeight: '500', letterSpacing: '0.05em', cursor: 'pointer' }}>{l}</span>
          ))}
        </div>
        <button
          onClick={() => signIn('twitter', { callbackUrl: '/predict' })}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#D8FF1A', color: '#111111', fontWeight: '700', fontSize: '13px', padding: '10px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', letterSpacing: '0.03em', fontFamily: "'Space Grotesk', sans-serif" }}
        >
          <svg viewBox="0 0 24 24" style={{ width: '14px', height: '14px', fill: '#111111' }}>
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.261 5.632 5.903-5.632Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          SIGN IN WITH X
        </button>
      </nav>

      {/* HERO */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 24px 0' }}>
        <div style={{ position: 'relative' }}>

          {/* Tagline */}
          <p style={{ color: '#666666', fontSize: '13px', fontWeight: '500', letterSpacing: '0.08em', marginBottom: '16px' }}>
            NO TOKENS. NO FEES. JUST <span style={{ color: '#D8FF1A', fontStyle: 'italic' }}>DUMB LUCK.</span>
          </p>

          {/* Hero headline */}
          <h1 style={{ fontSize: 'clamp(52px, 12vw, 120px)', fontWeight: '700', lineHeight: '0.92', letterSpacing: '-0.04em', marginBottom: '24px' }}>
            <span style={{ color: '#F5F2EC', display: 'block' }}>PREDICT.</span>
            <span style={{ color: '#F5F2EC', display: 'block' }}>EARN POINTS.</span>
            <span style={{ color: '#D8FF1A', display: 'block' }}>GET WHITELIST.</span>
          </h1>

          {/* Sub copy */}
          <p style={{ color: '#EAE7E1', fontSize: '15px', lineHeight: '1.6', maxWidth: '380px', marginBottom: '32px' }}>
            Predict World Cup matches, earn points for each correct pick, and exchange{' '}
            <span style={{ border: '1px solid #D8FF1A', color: '#D8FF1A', padding: '1px 6px', borderRadius: '4px' }}>3 points</span>{' '}
            for a <span style={{ textDecoration: 'underline', color: '#D8FF1A' }}>whitelist spot.</span>
          </p>

          {/* Stupid Pick card */}
          <div style={{ display: 'inline-block', backgroundColor: '#D8FF1A', padding: '16px 20px', borderRadius: '12px', marginBottom: '40px', maxWidth: '260px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.08em', color: '#111111', marginBottom: '6px' }}>STUPID PICK ⚡</div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#111111', lineHeight: '1.4' }}>
              MAKE A STUPID PICK,<br />
              RISK NOTHING,<br />
              WIN BIG. →
            </div>
          </div>

          {/* Big soccer ball decoration */}
          <div style={{ position: 'absolute', right: '-20px', top: '0', fontSize: 'clamp(120px, 25vw, 280px)', lineHeight: '1', opacity: '0.15', pointerEvents: 'none', userSelect: 'none' }}>
            ⚽
          </div>
        </div>

        {/* 3 feature pills */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '48px' }}>
          {[
            { icon: '🎯', title: 'PREDICT MATCHES', sub: 'Pick home win, draw or away win before kick-off.' },
            { icon: '⭐', title: 'EARN POINTS', sub: '+1 point for every correct prediction.' },
            { icon: '🎟️', title: '3 POINTS = 1 SPOT', sub: 'Exchange your points for a guaranteed whitelist spot.' },
          ].map((f, i) => (
            <div key={i} style={{ backgroundColor: '#1A1A1A', border: '1px solid #222', borderRadius: '12px', padding: '16px 14px' }}>
              <div style={{ fontSize: '22px', marginBottom: '10px' }}>{f.icon}</div>
              <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.07em', color: '#D8FF1A', marginBottom: '6px' }}>{f.title}</div>
              <div style={{ fontSize: '12px', color: '#666666', lineHeight: '1.5' }}>{f.sub}</div>
            </div>
          ))}
        </div>

        {/* HOW IT WORKS */}
        <div style={{ borderTop: '1px solid #222', paddingTop: '40px', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: '700', letterSpacing: '0.1em', color: '#D8FF1A', marginBottom: '28px' }}>
            HOW IT WORKS ←
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            {[
              { num: '1.', title: 'PREDICT', sub: 'Make your picks on upcoming matches.' },
              { num: '2.', title: 'GET IT RIGHT', sub: 'Correct pick = +1 point.' },
              { num: '3.', title: 'COLLECT', sub: 'Reach 3 points to unlock your reward.' },
              { num: '4.', title: 'CLAIM', sub: 'Redeem anytime. Guaranteed.' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                {i < 3 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0' }}>
                    <div style={{ width: '36px', height: '36px', border: '2px solid #333', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', marginBottom: '12px' }}>
                      {['📋', '⚽', '3️⃣'][i]}
                    </div>
                  </div>
                )}
                {i === 3 && (
                  <div style={{ width: '36px', height: '36px', backgroundColor: '#D8FF1A', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', margin: '0 auto 12px' }}>
                    🎟️
                  </div>
                )}
                <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.06em', color: '#F5F2EC', marginBottom: '4px' }}>{s.num} {s.title}</div>
                <div style={{ fontSize: '11px', color: '#666666', lineHeight: '1.5' }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM CTA */}
        <div style={{ borderTop: '1px solid #222', paddingTop: '32px', paddingBottom: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => signIn('twitter', { callbackUrl: '/predict' })}
            style={{ width: '100%', maxWidth: '480px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', backgroundColor: '#D8FF1A', color: '#111111', fontWeight: '700', fontSize: '16px', padding: '18px 32px', borderRadius: '12px', border: 'none', cursor: 'pointer', letterSpacing: '0.02em', fontFamily: "'Space Grotesk', sans-serif' " }}
          >
            <svg viewBox="0 0 24 24" style={{ width: '18px', height: '18px', fill: '#111111' }}>
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.261 5.632 5.903-5.632Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            SIGN IN WITH X
          </button>
          <p style={{ fontSize: '12px', color: '#444', letterSpacing: '0.05em' }}>
            FREE TO PLAY. NO TOKENS REQUIRED. · <span style={{ color: '#D8FF1A' }}>JUST STUPID.</span> ×
          </p>
        </div>

      </section>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');
        @media (max-width: 600px) {
          .nav-links { display: none !important; }
        }
        @media (min-width: 768px) {
          .nav-links { display: flex !important; }
        }
      `}</style>
    </main>
  )
}
