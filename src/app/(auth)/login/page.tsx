'use client'

import { useEffect, useState } from 'react'
import { LoginForm } from '@/components/auth/login-form'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains('dark'))
    check()
    const obs = new MutationObserver(check)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])

  return (
    <main className="flex min-h-[100dvh] items-center justify-center px-4 py-8" style={{ backgroundColor: isDark ? '#0f1114' : '#D6EAF8' }}>
      <div className="w-full max-w-[420px] animate-fade-in">
        <LoginForm />
      </div>
    </main>
  )
}