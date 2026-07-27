'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff, LogIn, Sparkles, Shield, Zap } from 'lucide-react'
import Link from 'next/link'

export function LoginForm() {
  const { signInWithEmail, loading, error, clearError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  function translateError(msg: string): string {
    const lower = msg.toLowerCase()
    if (lower.includes('invalid login credentials') || lower.includes('invalid credentials'))
      return 'Email atau password salah. Periksa kembali keduanya.'
    if (lower.includes('too many requests'))
      return 'Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.'
    if (lower.includes('email not confirmed'))
      return 'Email belum dikonfirmasi. Cek inbox atau folder spam kamu.'
    if (lower.includes('network') || lower.includes('fetch'))
      return 'Koneksi gagal. Periksa internet kamu dan coba lagi.'
    return msg
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    if (!email || !password) return
    await signInWithEmail(email, password)
  }

  return (
    <div className="w-full animate-fade-in">
      {/* Brand */}
      <div className="text-center mb-6">
        <div className="relative inline-flex">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[var(--c-accent)] via-[#3ba7d8] to-[#1a6d94] flex items-center justify-center shadow-lg shadow-[var(--c-accent)]/20">
            <span className="text-2xl font-black text-white tracking-tight">LO</span>
          </div>
          <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-sm">
            <Sparkles className="h-3 w-3 text-white" />
          </div>
        </div>
        <h1 className="mt-4 text-2xl font-bold text-[var(--c-text)]">Life OS</h1>
        <p className="mt-1 text-sm text-[var(--c-text-muted)]">Kelola hidupmu dalam satu tempat</p>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-[var(--c-border)] bg-white p-5 shadow-[var(--shadow-elevated)] dark:bg-[var(--c-card)]">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-[var(--c-text)]">Masuk</h2>
          <p className="text-sm text-[var(--c-text-muted)] mt-0.5">Masukkan email dan password</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600" role="alert">
              {translateError(error)}
            </div>
          )}

          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="nama@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            disabled={loading}
          />

          <div className="space-y-1.5">
            <Input
              id="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="flex items-center gap-1 text-xs text-[var(--c-text-muted)] hover:text-[var(--c-accent)] transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <><EyeOff className="h-3 w-3" /> Sembunyikan</>
              ) : (
                <><Eye className="h-3 w-3" /> Tampilkan</>
              )}
            </button>
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full rounded-xl h-11" loading={loading}>
            <LogIn className="h-4 w-4" />
            Masuk
          </Button>

          <p className="text-center text-sm text-[var(--c-text-muted)]">
            Belum punya akun?{' '}
            <Link href="/auth/register" className="font-semibold text-[var(--c-accent)] hover:underline">
              Daftar sekarang
            </Link>
          </p>
        </form>
      </div>

      {/* Trust badges */}
      <div className="mt-5 flex items-center justify-center gap-4 text-[10px] text-[var(--c-text-muted)]">
        <div className="flex items-center gap-1"><Shield className="h-3 w-3" /> Aman</div>
        <div className="flex items-center gap-1"><Zap className="h-3 w-3" /> Cepat</div>
        <div className="flex items-center gap-1"><Sparkles className="h-3 w-3" /> Gratis</div>
      </div>
    </div>
  )
}