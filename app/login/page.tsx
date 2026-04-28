import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  const signIn = async (formData: FormData) => {
    'use server'
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return redirect('/login?error=Invalid credentials')
    return redirect('/admin')
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-sm afu">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="font-display text-6xl text-white tracking-widest">PES</h1>
          <p className="text-[#6b7a99] text-sm font-medium mt-1 tracking-widest uppercase">Admin Portal</p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-8 space-y-5">
          {searchParams.error && (
            <div
              className="text-sm font-semibold px-4 py-3 rounded-lg"
              style={{ background: 'rgba(255,61,87,0.12)', color: '#ff3d57', border: '1px solid rgba(255,61,87,0.3)' }}
            >
              ⚠️ {searchParams.error}
            </div>
          )}

          <form action={signIn} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#6b7a99] uppercase tracking-widest">Email</label>
              <input
                type="email"
                name="email"
                required
                placeholder="admin@example.com"
                className="w-full px-4 py-3 rounded-xl text-sm font-medium text-white placeholder-[#3d4f6e] outline-none focus:ring-2 focus:ring-[#2979ff] transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#6b7a99] uppercase tracking-widest">Password</label>
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl text-sm font-medium text-white placeholder-[#3d4f6e] outline-none focus:ring-2 focus:ring-[#2979ff] transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl font-bold text-sm tracking-wide transition-all hover:opacity-90 active:scale-95 mt-2"
              style={{ background: 'var(--accent-green)', color: '#080c14' }}
            >
              Sign In →
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#3d4f6e] mt-6">
          Public view? <a href="/" className="text-[#6b7a99] hover:text-white transition-colors">Go to standings</a>
        </p>
      </div>
    </div>
  )
}
