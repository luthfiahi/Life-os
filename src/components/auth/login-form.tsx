'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { User, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export function LoginForm() {
  const { signInWithEmail, loading, error, clearError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

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
    <div className="w-full rounded-2xl bg-white p-8 shadow-lg">
      {/* Brand Logo */}
      <div className="text-center mb-5">
        <div className="h-16 w-16 rounded-2xl bg-[#2E86DE] mx-auto flex items-center justify-center shadow-lg">
          <span className="text-2xl font-black text-white tracking-tight">LO</span>
        </div>
        <h1 className="mt-3 text-[26px] font-bold" style={{ color: '#1A202C' }}>Life OS</h1>
        <p className="mt-1 text-[15px]" style={{ color: '#718096' }}>Kelola hidupmu dalam satu tempat</p>
      </div>

      {/* User Avatar Circle */}
      <div className="flex justify-center mb-7">
        <div className="h-[88px] w-[88px] rounded-full border-[3px] border-[#2E86DE] flex items-center justify-center bg-white">
          <User className="h-11 w-11 text-[#2E86DE]" strokeWidth={1.5} />
        </div>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-[14px] text-red-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{translateError(error)}</span>
          </div>
        )}

        {/* Email Input */}
        <div className="relative">
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
            <User className="h-[22px] w-[22px] text-[#2E86DE]" strokeWidth={1.5} />
          </div>
          <input
            id="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            disabled={loading}
            style={{ color: '#1A202C', height: '56px', fontSize: '17px' }}
            className="w-full rounded-xl border-2 border-[#2E86DE] bg-white pl-[52px] pr-4 font-medium focus:outline-none focus:ring-2 focus:ring-[#2E86DE]/20 disabled:opacity-50"
          />
          <style>{`#email::placeholder { color: #718096; font-weight: 400; font-size: 16px; }`}</style>
        </div>

        {/* Password Input */}
        <div className="relative">
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
            <Lock className="h-[22px] w-[22px] text-[#2E86DE]" strokeWidth={1.5} />
          </div>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            disabled={loading}
            style={{ color: '#1A202C', height: '56px', fontSize: '17px' }}
            className="w-full rounded-xl border-2 border-[#2E86DE] bg-white pl-[52px] pr-[52px] font-medium focus:outline-none focus:ring-2 focus:ring-[#2E86DE]/20 disabled:opacity-50"
          />
          <style>{`#password::placeholder { color: #718096; font-weight: 400; font-size: 16px; }`}</style>
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#2E86DE] hover:text-[#1a6bb5] transition-colors p-1"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" strokeWidth={1.5} />
            ) : (
              <Eye className="h-5 w-5" strokeWidth={1.5} />
            )}
          </button>
        </div>

        {/* Options Row */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => setRememberMe(!rememberMe)}
            className="flex items-center gap-2"
          >
            <div className={"h-[22px] w-[22px] rounded-[4px] border-2 border-[#2E86DE] flex items-center justify-center transition-colors " + (rememberMe ? "bg-[#2E86DE]" : "bg-white")}>
              {rememberMe && (
                <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className="text-[14px] font-medium text-[#2E86DE]">Ingat saya</span>
          </button>
          <Link href="/auth/forgot-password" className="text-[14px] font-medium text-[#2E86DE] hover:text-[#1a6bb5] transition-colors">
            Lupa password?
          </Link>
        </div>

        {/* Login Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            style={{ height: '56px', fontSize: '18px' }}
            className="w-full rounded-xl bg-[#2E86DE] text-white font-bold tracking-wide shadow-[0_4px_14px_rgba(46,134,222,0.35)] hover:bg-[#2574c4] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            MASUK
          </button>
        </div>

        {/* Register Link */}
        <p className="text-center text-[14px] pt-1" style={{ color: '#4A5568' }}>
          Belum punya akun?{' '}
          <Link href="/auth/register" className="font-semibold text-[#2E86DE] hover:text-[#1a6bb5] transition-colors">
            Daftar sekarang
          </Link>
        </p>
      </form>
    </div>
  )
}