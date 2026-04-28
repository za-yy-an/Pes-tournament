import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default function LoginPage() {
  const signIn = async (formData: FormData) => {
    'use server'
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return redirect('/login?error=Could not authenticate user')
    return redirect('/admin')
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <form action={signIn} className="p-8 bg-white rounded-lg shadow-md w-96 space-y-4">
        <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
        <input type="email" name="email" placeholder="Email" required className="w-full p-3 border rounded" />
        <input type="password" name="password" placeholder="Password" required className="w-full p-3 border rounded" />
        <button type="submit" className="w-full bg-black text-white p-3 rounded font-bold hover:bg-gray-800">
          Sign In
        </button>
      </form>
    </div>
  )
}
