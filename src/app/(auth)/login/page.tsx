import { LoginForm } from '@/components/auth/login-form'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  return (
    <main className="relative flex min-h-[100dvh] items-center justify-center bg-[var(--c-bg)] px-5 py-8 overflow-hidden">
      {/* Animated gradient background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-[var(--c-accent)]/8 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-violet-500/6 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      <div className="relative z-10 w-full max-w-sm sm:max-w-md animate-fade-in">
        <LoginForm />
      </div>
    </main>
  )
}
