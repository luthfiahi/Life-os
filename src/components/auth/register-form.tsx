'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Eye, EyeOff, UserPlus, LogIn } from 'lucide-react'
import Link from 'next/link'

/**
 * Life OS Registration Form
 * Email/password registration with Supabase Auth
 */

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

    if (!fullName || !email || !password) {
      return
    }

    const { error: signUpError } = await signUpWithEmail(email, password, fullName)

    if (!signUpError) {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <Card className="w-full max-w-md border-0 shadow-[var(--shadow-elevated)]">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--c-accent)]/10">
            <UserPlus className="h-7 w-7 text-[var(--c-accent)]" />
          </div>
          <h2 className="text-xl font-semibold text-[var(--c-text)] mb-2">
            Registrasi Berhasil!
          </h2>
          <p className="text-sm text-[var(--c-text-muted)] mb-6">
            Cek email Anda untuk konfirmasi akun, lalu masuk ke Life OS.
          </p>
          <Link href="/login">
            <Button variant="primary" size="lg" className="w-full">
              <LogIn className="h-4 w-4" />
              Masuk
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md border-0 shadow-[var(--shadow-elevated)]">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--c-accent)]">
          <span className="text-xl font-bold text-white font-[family-name:var(--font-playfair)]">
            LO
          </span>
        </div>
        <CardTitle className="text-xl text-[var(--c-text)]">
          Buat Akun Life OS
        </CardTitle>
        <CardDescription>
          Daftar untuk mulai mengelola hidup Anda
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
            id="fullName"
            label="Nama Lengkap"
            type="text"
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoComplete="name"
            required
            disabled={loading}
          />

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
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              minLength={6}
              disabled={loading}
              helperText={!password ? 'Minimal 6 karakter' : undefined}
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
            <UserPlus className="h-4 w-4" />
            Daftar
          </Button>

          <p className="text-center text-sm text-[var(--c-text-muted)]">
            Sudah punya akun?{' '}
            <Link
              href="/login"
              className="font-medium text-[var(--c-accent)] hover:underline"
            >
              Masuk
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}