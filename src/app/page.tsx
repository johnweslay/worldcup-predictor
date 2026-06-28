'use client'
import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (status === 'authenticated') router.push('/predict')
  }, [status, router])

  const navLinks = [
    { label: 'ABOUT',       href: '#about' },
    { label: 'LEADERBOARD', href: '#leaderboard' },
    { label: 'REWARDS',     href: '#rewards' },
    { label: 'FAQ',         href: '#faq' },
  ]

  const s = {
    page:    { minHeight: '100vh', backgroundColor: '#111111', fontFamily: "'Space Grotesk', sans-serif", overflowX: 'hidden' as const },
    wrap:    { maxWidth: '1200px', margin: '0 auto', padding: '0 24px' },
    divider: { borderTop: '1px solid #222', margin: '0' },
    label:   { fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em', color: '#D8FF1A', marginBottom: '24px' } as const,
  }

  return (
    <main style={s.page}>

      {/* NAV */}
      <nav style={{ borderBottom: '1px solid #1a1a1a', position: 'sticky', top: 0, backgroundColor: '#111111', zIndex: 50 }}>
        <div style={{ ...s.wrap, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px' }}>
          <div style={{ fontWeight: '700', fontSize: '16px', color: '#F5F2EC', letterSpacing: '-0.03em', lineHeight: '1.2' }}>
            DUDE TRUST ME<br />
            <span style={{ color: '#D8FF1A', fontSize: '10px', fontWeight: '500', letterSpacing: '0.08em' }}>BY @STUPIDITY</span>
          </div>

          {/* Desktop nav links */}
          <div style={{ display: 'flex', gap: '28px' }} className="desktop-nav">
            {navLinks.map(l => (
              <a key={l.label} href={l.href} style={{ color: '#666666', fontSize: '12px', fontWeight: '600', letterSpacing: '0.05em', cursor: 'pointer', textDecoration: 'none' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#F5F2EC')}
                onMouseLeave={e => (e.currentTarget.style.color = '#666666')}>
                {l.label}
              </a>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => signIn('twitter', { callbackUrl: '/predict' })}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#D8FF1A', color: '#111111', fontWeight: '700', fontSize: '12px', padding: '9px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', letterSpacing: '0.03em', fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <svg viewBox="0 0 24 24" style={{ width: '13px', height: '13px', fill: '#111111' }}>
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.261 5.632 5.903-5.632Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              SIGN IN
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="mobile-menu-btn"
              style={{ display: 'none', flexDirection: 'column' as const, gap: '4px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
            >
              {[0,1,2].map(i => (
                <div key={i} style={{ width: '20px', height: '2px', backgroundColor: '#F5F2EC', borderRadius: '2px' }} />
              ))}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div className="mobile-menu" style={{ borderTop: '1px solid #222', padding: '16px 24px', display: 'flex', flexDirection: 'column' as const, gap: '16px' }}>
            {navLinks.map(l => (
              <a key={l.label} href={l.href}
                onClick={() => setMenuOpen(false)}
                style={{ color: '#666666', fontSize: '14px', fontWeight: '600', letterSpacing: '0.05em', textDecoration: 'none' }}>
                {l.label}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/* HERO */}
      <section style={{ ...s.wrap, padding: '40px 24px 0' }}>
        <div style={{ position: 'relative' }}>
          <p style={{ color: '#666666', fontSize: '12px', fontWeight: '500', letterSpacing: '0.08em', marginBottom: '16px' }}>
            NO TOKENS. NO FEES. BY <span style={{ color: '#D8FF1A', fontStyle: 'italic' }}>@STUPIDITY</span>
          </p>
          <h1 style={{ fontSize: 'clamp(48px, 12vw, 120px)', fontWeight: '700', lineHeight: '0.92', letterSpacing: '-0.04em', marginBottom: '24px' }}>
            <span style={{ color: '#F5F2EC', display: 'block' }}>PREDICT.</span>
            <span style={{ color: '#F5F2EC', display: 'block' }}>EARN POINTS.</span>
            <span style={{ color: '#D8FF1A', display: 'block' }}>GET WHITELIST.</span>
          </h1>
          <p style={{ color: '#EAE7E1', fontSize: '15px', lineHeight: '1.6', maxWidth: '380px', marginBottom: '32px' }}>
            Predict World Cup matches, earn points for each correct pick, and exchange{' '}
            <span style={{ border: '1px solid #D8FF1A', color: '#D8FF1A', padding: '1px 6px', borderRadius: '4px' }}>3 points</span>{' '}
            for a <span style={{ textDecoration: 'underline', color: '#D8FF1A' }}>whitelist spot.</span>
          </p>
          <div style={{ position: 'absolute', right: '-20px', top: '0', fontSize: 'clamp(100px, 22vw, 260px)', lineHeight: '1', opacity: '0.1', pointerEvents: 'none', userSelect: 'none' as const }}>⚽</div>
        </div>

        {/* Feature pills */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '48px' }}>
          {[
            { icon: '🎯', title: 'PREDICT MATCHES', sub: 'Pick home win, draw or away win before kick-off.' },
            { icon: '⭐', title: 'EARN POINTS', sub: '+1 point for every correct prediction.' },
            { icon: '🎟️', title: '3 POINTS = 1 SPOT', sub: 'Exchange your points for a guaranteed whitelist spot.' },
          ].map((f, i) => (
            <div key={i} style={{ backgroundColor: '#1A1A1A', border: '1px solid #222', borderRadius: '12px', padding: '14px 12px' }}>
              <div style={{ fontSize: '20px', marginBottom: '8px' }}>{f.icon}</div>
              <div style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.07em', color: '#D8FF1A', marginBottom: '4px' }}>{f.title}</div>
              <div style={{ fontSize: '11px', color: '#666666', lineHeight: '1.5' }}>{f.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" style={{ ...s.wrap, padding: '48px 24px' }}>
        <div style={s.divider} />
        <div style={{ paddingTop: '40px' }}>
          <p style={s.label}>ABOUT ←</p>
          <h2 style={{ fontSize: 'clamp(28px, 6vw, 56px)', fontWeight: '700', color: '#F5F2EC', letterSpacing: '-0.03em', lineHeight: '1.1', marginBottom: '20px' }}>
            A WORLD CUP GAME<br />
            <span style={{ color: '#D8FF1A' }}>BUILT BY IDIOTS.</span>
          </h2>
          <p style={{ color: '#666666', fontSize: '14px', lineHeight: '1.7', maxWidth: '480px', marginBottom: '24px' }}>
            Dude Trust Me is a free-to-play World Cup 2026 prediction game made by <strong style={{ color: '#F5F2EC' }}>@STUPIDITY</strong>. No tokens, no gas, no nonsense. Just predict match results, earn points, and claim your whitelist spot.
          </p>
          <div style={{ display: 'inline-block', backgroundColor: '#D8FF1A', padding: '14px 18px', borderRadius: '10px' }}>
            <div style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.08em', color: '#111111', marginBottom: '4px' }}>STUPID PICK ⚡</div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#111111', lineHeight: '1.4' }}>RISK 1 POINT.<br />WIN 2 BACK. →</div>
          </div>
        </div>
      </section>

      {/* LEADERBOARD */}
      <section id="leaderboard" style={{ ...s.wrap, padding: '48px 24px' }}>
        <div style={s.divider} />
        <div style={{ paddingTop: '40px' }}>
          <p style={s.label}>LEADERBOARD ←</p>
          <h2 style={{ fontSize: 'clamp(24px, 5vw, 48px)', fontWeight: '700', color: '#F5F2EC', letterSpacing: '-0.03em', marginBottom: '24px' }}>
            WHO'S WINNING?
          </h2>
          <div style={{ backgroundColor: '#1A1A1A', border: '1px solid #222', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #222', display: 'grid', gridTemplateColumns: '40px 1fr 60px', gap: '8px' }}>
              <span style={{ fontSize: '10px', fontWeight: '700', color: '#444', letterSpacing: '0.05em' }}>#</span>
              <span style={{ fontSize: '10px', fontWeight: '700', color: '#444', letterSpacing: '0.05em' }}>PLAYER</span>
              <span style={{ fontSize: '10px', fontWeight: '700', color: '#444', letterSpacing: '0.05em', textAlign: 'right' as const }}>PTS</span>
            </div>
            {[1,2,3].map(i => (
              <div key={i} style={{ padding: '14px 20px', borderBottom: '1px solid #1a1a1a', display: 'grid', gridTemplateColumns: '40px 1fr 60px', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: i === 1 ? '#D8FF1A' : '#444' }}>#{i}</span>
                <span style={{ fontSize: '13px', color: '#666', fontStyle: 'italic' }}>Sign in to see →</span>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#444', textAlign: 'right' as const }}>—</span>
              </div>
            ))}
            <div style={{ padding: '16px 20px', textAlign: 'center' as const }}>
              <button
                onClick={() => signIn('twitter', { callbackUrl: '/points' })}
                style={{ fontSize: '12px', fontWeight: '700', color: '#D8FF1A', background: 'none', border: '1px solid #D8FF1A', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', letterSpacing: '0.05em', fontFamily: "'Space Grotesk', sans-serif" }}
              >
                SIGN IN TO SEE FULL LEADERBOARD →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* REWARDS */}
      <section id="rewards" style={{ ...s.wrap, padding: '48px 24px' }}>
        <div style={s.divider} />
        <div style={{ paddingTop: '40px' }}>
          <p style={s.label}>REWARDS ←</p>
          <h2 style={{ fontSize: 'clamp(24px, 5vw, 48px)', fontWeight: '700', color: '#F5F2EC', letterSpacing: '-0.03em', marginBottom: '24px' }}>
            WHAT DO YOU GET?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {[
              { icon: '🎟️', title: 'WHITELIST SPOT', sub: 'Guaranteed mint allocation. Reach 3 points and it\'s yours.', highlight: true },
              { icon: '⚡', title: 'STUPID PICK BONUS', sub: 'Risk 1 point, win 2 back on a correct Stupid Pick.', highlight: false },
              { icon: '🏆', title: 'LEADERBOARD GLORY', sub: 'Top predictors get recognized. Flex your W rate.', highlight: false },
            ].map((r, i) => (
              <div key={i} style={{ backgroundColor: r.highlight ? '#D8FF1A' : '#1A1A1A', border: `1px solid ${r.highlight ? '#D8FF1A' : '#222'}`, borderRadius: '16px', padding: '24px 20px' }}>
                <div style={{ fontSize: '28px', marginBottom: '12px' }}>{r.icon}</div>
                <div style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '0.07em', color: r.highlight ? '#111111' : '#D8FF1A', marginBottom: '8px' }}>{r.title}</div>
                <div style={{ fontSize: '13px', color: r.highlight ? '#111111' : '#666666', lineHeight: '1.5' }}>{r.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{ ...s.wrap, padding: '48px 24px' }}>
        <div style={s.divider} />
        <div style={{ paddingTop: '40px' }}>
          <p style={s.label}>FAQ ←</p>
          <h2 style={{ fontSize: 'clamp(24px, 5vw, 48px)', fontWeight: '700', color: '#F5F2EC', letterSpacing: '-0.03em', marginBottom: '32px' }}>
            DUMB QUESTIONS,<br /><span style={{ color: '#D8FF1A' }}>DUMBER ANSWERS.</span>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '2px' }}>
            {[
              { q: 'Is this really free?', a: 'Yes. No tokens, no gas fees, no hidden costs. Just sign in with X and start predicting.' },
              { q: 'How do I earn points?', a: 'Predict the result of a World Cup match before kick-off. Correct prediction = +1 point. Use Stupid Pick to risk 1 point and win 2 back.' },
              { q: 'What is Stupid Pick?', a: 'Stupid Pick lets you stake 1 point on a prediction. If correct, you get +2 points (net gain). If wrong, you lose the staked point. One Stupid Pick per day.' },
              { q: 'When can I claim the whitelist?', a: 'Once you reach 3 points, follow @STU_pidityy, and like & repost our announcement tweet, the claim button unlocks.' },
              { q: 'What happens after I claim?', a: 'Submit your wallet address and you\'re in. Guaranteed allocation on mint day.' },
            ].map((item, i) => (
              <details key={i} style={{ borderTop: '1px solid #222', padding: '20px 0' }}>
                <summary style={{ fontSize: '14px', fontWeight: '600', color: '#F5F2EC', cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {item.q}
                  <span style={{ color: '#D8FF1A', fontSize: '18px', fontWeight: '300' }}>+</span>
                </summary>
                <p style={{ fontSize: '13px', color: '#666666', lineHeight: '1.7', marginTop: '12px', maxWidth: '560px' }}>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section style={{ ...s.wrap, padding: '48px 24px 60px' }}>
        <div style={s.divider} />
        <div style={{ paddingTop: '40px', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => signIn('twitter', { callbackUrl: '/predict' })}
            style={{ width: '100%', maxWidth: '480px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', backgroundColor: '#D8FF1A', color: '#111111', fontWeight: '700', fontSize: '15px', padding: '18px 32px', borderRadius: '12px', border: 'none', cursor: 'pointer', letterSpacing: '0.02em', fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <svg viewBox="0 0 24 24" style={{ width: '16px', height: '16px', fill: '#111111' }}>
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.261 5.632 5.903-5.632Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            SIGN IN WITH X — IT'S FREE
          </button>
          <p style={{ fontSize: '11px', color: '#444', letterSpacing: '0.05em' }}>
            FREE TO PLAY. NO TOKENS REQUIRED. · <span style={{ color: '#D8FF1A' }}>JUST STUPID.</span>
          </p>
        </div>
      </section>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');
        details summary::-webkit-details-marker { display: none; }
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
        @media (min-width: 641px) {
          .mobile-menu-btn { display: none !important; }
          .mobile-menu { display: none !important; }
        }
      `}</style>
    </main>
  )
}
