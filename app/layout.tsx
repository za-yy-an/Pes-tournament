import './globals.css'
import { DM_Sans } from 'next/font/google'
import Link from 'next/link'

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm' })

export const metadata = {
  title: 'PES League',
  description: 'Live tournament standings and fixtures',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body className="min-h-screen pitch-lines">
        {/* Top Nav */}
        <nav className="sticky top-0 z-40 border-b border-white/5 bg-[#080c14]/80 backdrop-blur-xl">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-display text-white tracking-widest">PES</span>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded"
                style={{ background: 'var(--accent-green)', color: '#080c14' }}
              >
                LEAGUE
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/history"
                className="text-sm font-semibold text-[#6b7a99] hover:text-white transition-colors"
              >
                History
              </Link>
              <Link
                href="/admin"
                className="text-sm font-bold px-3 py-1.5 rounded-lg border border-white/10 text-white hover:border-white/30 transition-colors"
              >
                Admin
              </Link>
            </div>
          </div>
        </nav>

        <main className="max-w-5xl mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
