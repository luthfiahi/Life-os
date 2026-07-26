import { LoginForm } from '@/components/auth/login-form'

// Force dynamic rendering — Supabase client requires runtime env vars
export const dynamic = 'force-dynamic'

/**
 * Life OS — Login Page
 * Route: /login
 *
 * Public page for user authentication.
 * Centered card layout with Life OS branding.
 * Dynamic: not prerendered (needs Supabase env vars at runtime).
 */

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--c-bg)] px-4">
      <div className="w-full max-w-md animate-fade-in">
        <LoginForm />
      </div>
    </main>
  )
}