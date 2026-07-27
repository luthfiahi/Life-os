'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff, LogIn, Sparkles, Shield, Zap, Wallet, Brain, Target, CalendarDays } from 'lucide-react'
import Link from 'next/link'

const features = [
  { icon: Wallet, label: 'Wealth', color: 'from-emerald-400 to-teal-500' },
  { icon: Brain, label: 'Brain', color: 'from-violet-400 to-purple-500' },
  { icon: Target, label: 'Mission', color: 'from-amber-400 to-orange-500' },
  { icon: CalendarDays, label: 'Schedule', color: 'from-blue-400 to-cyan-500' },
]

function FeatureIcon({ icon: Icon }: { icon: typeof Wallet }) {
  return <Icon className="h-2.5 w-2.5 text-white" />
}

export function LoginForm() {
  const { signInWithEmail, loading, error, clearError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [focused, setFocused] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    if (!email || !password) return
    await signInWithEmail(email, password)
  }

  return (
    <div className="w-full max-w-md animate-fade-in">
      {/* Brand Section */}
      <div className="text-center mb-8">
        <div className="relative inline-flex">
          <div className="relative">
            <div className="h-18 w-18 rounded-2xl bg-gradient-to-br from-[var(--c-accent)] via-[#3ba7d8] to-[#1a6d94] flex items-center justify-center shadow-lg shadow-[var(--c-accent)]/25">
              <span className="text-2xl font-black text-white tracking-tight">LO</span>
            </div>
            <div className="absolute -top-1.5 -right-1.5 h-6 w-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-sm shadow-amber-400/40">
              <Sparkles className="h-3 w-3 text-white" />
            </div>
          </div>
        </div>
        <h1 className="mt-5 text-2xl font-bold text-[var(--c-text)] tracking-tight">Life OS</h1>
        <p className="mt-1.5 text-sm text-[var(--c-text-muted)]">Kelola hidupmu dalam satu tempat</p>
      </div>

      {/* Card */}
      <div className="relative rounded-2xl border border-[var(--c-border)] bg-white p-7 shadow-[var(--shadow-elevated)] dark:bg-[var(--c-card)]">
        {/* Subtle gradient border accent at top */}
        <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[var(--c-accent)]/40 to-transparent" />

        <div className="mb-6">
          <h2 className="text-lg font-bold text-[var(--c-text)]">Selamat Datang</h2>
          <p className="text-sm text-[var(--c-text-muted)] mt-1">Masukkan email dan password untuk melanjutkan</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-xl border border-[var(--c-accent-2)]/20 bg-[var(--c-accent-2)]/5 p-3.5 text-sm text-[var(--c-accent-2)] animate-fade-in flex items-start gap-2.5" role="alert">
              <div className="mt-0.5 h-5 w-5 rounded-full bg-[var(--c-accent-2)]/10 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold">!</span>
              </div>
              {error}
            </div>
          )}

          <div className={`space-y-1.5 transition-all duration-200 ${focused === 'email' ? 'scale-[1.01]' : ''}`}>
            <Input
              id="email"
              label="Email"
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused(null)}
              autoComplete="email"
              required
              disabled={loading}
            />
          </div>

          <div className={`space-y-1.5 transition-all duration-200 ${focused === 'password' ? 'scale-[1.01]' : ''}`}>
            <Input
              id="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocused('password')}
              onBlur={() => setFocused(null)}
              autoComplete="current-password"
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="flex items-center gap-1.5 text-xs text-[var(--c-text-muted)] hover:text-[var(--c-accent)] transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <><EyeOff className="h-3 w-3" /> Sembunyikan</>
              ) : (
                <><Eye className="h-3 w-3" /> Tampilkan</>
              )}
            </button>
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full rounded-xl h-11 text-sm font-semibold shadow-md shadow-[var(--c-accent)]/20 hover:shadow-lg hover:shadow-[var(--c-accent)]/30 transition-shadow duration-200" loading={loading}>
            <LogIn className="h-4 w-4" />
            Masuk
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--c-border)]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white dark:bg-[var(--c-card)] px-3 text-[var(--c-text-muted)]">atau</span>
            </div>
          </div>

          <p className="text-center text-sm text-[var(--c-text-muted)]">
            Belum punya akun?{' '}
            <Link href="/auth/register" className="font-semibold text-[var(--c-accent)] hover:underline underline-offset-2">
              Daftar sekarang
            </Link>
          </p>
        </form>
      </div>

      {/* Feature Pills */}
      <div className="mt-8 flex items-center justify-center gap-3">
        {features.map((f) => (
          <div
            key={f.label}
            className="group flex items-center gap-1.5 rounded-full bg-[var(--c-surface)] border border-[var(--c-border)] px-3 py-1.5 text-[10px] font-medium text-[var(--c-text-muted)] transition-all duration-200 hover:border-[var(--c-accent)]/30 hover:text-[var(--c-text)]"
          >
            <div className={`h-4 w-4 rounded-full bg-gradient-to-br ${f.color} flex items-center justify-center shadow-sm`}
            >
              <FeatureIcon icon={f.icon} />
            </div>
            {f.label}
          </div>
        ))}
      </div>

      {/* Bottom trust badges */}
      <div className="mt-5 flex items-center justify-center gap-5 text-[10px] text-[var(--c-text-muted)]">
        <div className="flex items-center gap-1"><Shield className="h-3 w-3" /> Aman & Terenkripsi</div>
        <div className="flex items-center gap-1"><Zap className="h-3 w-3" /> Ringan & Cepat</div>
        <div className="flex items-center gap-1"><Sparkles className="h-3 w-3" /> 100% Gratis</div>
      </div>
    </div>
  )
}