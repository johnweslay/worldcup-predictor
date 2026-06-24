'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

export default function NavBar({ session }: { session: any }) {
  const path = usePathname()
  const user = session?.user as any
  const pts  = user?.points ?? 0

  const tabs = [
    { href: '/predict', label: '⚽ Matches' },
    { href: '/points',  label: '⭐ Points'  },
    { href: '/whitelist', label: '🎟️ Whitelist' },
  ]

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-xl mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-2 font-semibold text-gray-900">
            ⚽ WC Predictor
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium bg-purple-50 text-purple-800 px-2.5 py-1 rounded-full">
              {pts} pt{pts !== 1 ? 's' : ''}
            </span>
            {user?.image && (
              <img
                src={user.image}
                alt={user.handle}
                className="w-8 h-8 rounded-full border border-gray-200"
              />
            )}
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Sign out
            </button>
          </div>
        </div>
        <nav className="flex gap-1 pb-2">
          {tabs.map(t => (
            <Link
              key={t.href}
              href={t.href}
              className={`flex-1 text-center text-xs py-1.5 rounded-lg font-medium transition-colors
                ${path === t.href
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'}`}
            >
              {t.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
