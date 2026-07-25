import { RegisterForm } from '@/components/auth/register-form'

/**
 * Life OS — Register Page
 * Route: /auth/register
 * 
 * Public page for user registration.
 */

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--c-bg)] px-4">
      <div className="w-full max-w-md animate-fade-in">
        <RegisterForm />
      </div>
    </main>
  )
}
