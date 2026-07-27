'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff, UserPlus, LogIn, Sparkles, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export function RegisterForm() {
  const { signUpWithEmail, loading, error, clearError } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    setSuccess(false)
    if (!fullName || !email || !password) return
    const { error: signUpError } = await signUpWithEmail(email, password, fullName)
    if (!signUpError) setSuccess(true)
  }

  if (success) {
    return (
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 rounded-2xl bg-emerald-500/10 items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          </div>
          <h1 className="mt-5 text-2xl font-bold text-[var(--c-text)]">Registrasi Berhasil!</h1>
          <p className="mt-1 text-sm text-[var(--c-text-muted)]">
            Cek email untuk konfirmasi akun, lalu masuk.
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--c-border)] bg-white p-6 shadow-[var(--shadow-elevated)] dark:bg-[var(--c-card)]">
          <Link href="/login">
            <Button variant="primary" size="lg" className="w-full rounded-xl">
              <LogIn className="h-4 w-4" />
              Masuk ke Life OS
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md animate-fade-in">
      {/* Brand */}
      <div className="text-center mb-8">
        <div className="relative inline-flex">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[var(--c-accent)] to-[#1a6d94] flex items-center justify-center shadow-lg">
            <span className="text-2xl font-black text-white tracking-tight">LO</span>
          </div>
          <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-emerald-400 flex items-center justify-center">
            <UserPlus className="h-3 w-3 text-white" />
          </div>
        </div>
        <h1 className="mt-5 text-2xl font-bold text-[var(--c-text)]">Buat Akun</h1>
        <p className="mt-1 text-sm text-[var(--c-text-muted)]">Daftar untuk mulai mengelola hidupmu</p>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-[var(--c-border)] bg-white p-6 shadow-[var(--shadow-elevated)] dark:bg-[var(--c-card)]">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl border border-[var(--c-accent-2)] bg-[var(--c-accent-2)]/10 p-3 text-sm text-[var(--c-accent-2)] animate-fade-in" role="alert">
              {error}
            </div>
          )}

          <Input id="fullName" label="Nama Lengkap" type="text" placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" required disabled={loading} />

          <Input id="email" label="Email" type="email" placeholder="nama@email.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required disabled={loading} />

          <div className="space-y-1.5">
            <Input id="password" label="Password" type={showPassword ? 'text' : 'password'} placeholder="Minimal 6 karakter" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required minLength={6} disabled={loading} helperText={!password ? 'Minimal 6 karakter' : undefined} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="flex items-center gap-1 text-xs text-[var(--c-text-muted)] hover:text-[var(--c-accent)] transition-colors" tabIndex={-1}>
              {showPassword ? (<><EyeOff className="h-3 w-3" /> Sembunyikan</>) : (<><Eye className="h-3 w-3" /> Tampilkan</>)}
            </button>
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full rounded-xl" loading={loading}>
            <UserPlus className="h-4 w-4" />
            Daftar
          </Button>

          <p className="text-center text-sm text-[var(--c-text-muted)]">
            Sudah punya akun?{' '}
            <Link href="/login" className="font-semibold text-[var(--c-accent)] hover:underline">Masuk</Link>
          </p>
        </form>
      </div>

      {/* Feature Pills */}
      <div className="mt-6 flex items-center justify-center gap-4 text-[10px] text-[var(--c-text-muted)]">
        <div className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Supabase Auth</div>
        <div className="flex items-center gap-1"><Sparkles className="h-3 w-3" /> Enkripsi</div>
      </div>
    </div>
  )
}
