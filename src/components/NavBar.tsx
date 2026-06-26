'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

export default function NavBar({ session }: { session: any }) {
  const path = usePathname()
  const user = session?.user as any
  const pts  = user?.points ?? 0

  const tabs = [
    { href: '/predict',   label: '⚽ Matches'   },
    { href: '/points',    label: '⭐ Points'    },
    { href: '/whitelist', label: '🎟️ Whitelist' },
  ]

  return (
    <header style={{ backgroundColor: '#111111', position: 'sticky', top: 0, zIndex: 10 }}>
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '0 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
          <div style={{ fontWeight: '700', color: '#F5F2EC', fontSize: '16px', letterSpacing: '-0.02em' }}>
            ⚽ WC Predictor
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', backgroundColor: '#D8FF1A', color: '#111111', padding: '4px 10px', borderRadius: '20px' }}>
              {pts} pt{pts !== 1 ? 's' : ''}
            </span>
            {user?.image && (
              <img src={user.image} alt={user.handle} style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
            )}
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              style={{ fontSize: '12px', color: '#666666', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Sign out
            </button>
          </div>
        </div>
        <nav style={{ display: 'flex', gap: '4px', paddingBottom: '10px' }}>
          {tabs.map(t => (
            <Link
              key={t.href}
              href={t.href}
              style={{
                flex: 1, textAlign: 'center', fontSize: '13px', padding: '7px 4px',
                borderRadius: '8px', fontWeight: path === t.href ? '600' : '400',
                backgroundColor: path === t.href ? '#D8FF1A' : 'transparent',
                color: path === t.href ? '#111111' : '#666666',
                textDecoration: 'none', transition: 'all 0.15s',
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              {t.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
