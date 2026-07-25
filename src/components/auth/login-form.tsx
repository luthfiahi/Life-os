'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import Link from 'next/link'

/**
 * Life OS Login Form
 * Email/password authentication with Supabase Auth
 */

export function LoginForm() {
  const { signInWithEmail, loading, error, clearError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    if (!email || !password) {
      return
    }

    await signInWithEmail(email, password)
  }

  return (
    <Card className="w-full max-w-md border-0 shadow-[var(--shadow-elevated)]">
      <CardHeader className="text-center pb-2">
        {/* Life OS Logo / Brand */}
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--c-accent)]">
          <span className="text-xl font-bold text-white font-[family-name:var(--font-playfair)]">
            LO
          </span>
        </div>
        <CardTitle className="text-xl text-[var(--c-text)]">
          Masuk ke Life OS
        </CardTitle>
        <CardDescription>
          Masukkan email dan password untuk melanjutkan
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div
              className="rounded-[var(--radius-md)] border border-[var(--c-accent-2)]/30 bg-[var(--c-accent-2)]/5 p-3 text-sm text-[var(--c-accent-2)] animate-fade-in"
              role="alert"
            >
              {error}
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
                <>
                  <EyeOff className="h-3 w-3" />
                  Sembunyikan
                </>
              ) : (
                <>
                  <Eye className="h-3 w-3" />
                  Tampilkan
                </>
              )}
            </button>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            loading={loading}
          >
            <LogIn className="h-4 w-4" />
            Masuk
          </Button>

          <p className="text-center text-sm text-[var(--c-text-muted)]">
            Belum punya akun?{' '}
            <Link
              href="/auth/register"
              className="font-medium text-[var(--c-accent)] hover:underline"
            >
              Daftar sekarang
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}