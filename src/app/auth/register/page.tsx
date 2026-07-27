import { RegisterForm } from '@/components/auth/register-form'

export const dynamic = 'force-dynamic'

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--c-bg)] px-4 py-8">
      <div className="w-full max-w-md animate-fade-in">
        <RegisterForm />
      </div>
    </main>
  )
}