import { RegisterForm } from '@/components/auth/register-form'

export const dynamic = 'force-dynamic'

export default function RegisterPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-[var(--c-bg)] px-4 py-8">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-72 w-72 rounded-full bg-emerald-500/8 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-72 w-72 rounded-full bg-[var(--c-accent)]/5 blur-3xl" />
      </div>
      <div className="relative z-10 w-full max-w-md animate-fade-in">
        <RegisterForm />
      </div>
    </main>
  )
}