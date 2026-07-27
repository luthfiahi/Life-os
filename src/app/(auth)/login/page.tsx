import { LoginForm } from '@/components/auth/login-form'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-[var(--c-bg)] px-4 py-8 overflow-hidden">
      {/* Animated gradient background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-[var(--c-accent)]/8 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-violet-500/6 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full bg-emerald-500/4 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
      {/* Grid pattern overlay */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.015]" style={{
        backgroundImage: 'radial-gradient(circle, var(--c-text) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }} />
      <div className="relative z-10 w-full max-w-md animate-fade-in">
        <LoginForm />
      </div>
    </main>
  )
}
