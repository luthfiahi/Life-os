import { LoginForm } from '@/components/auth/login-form'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[#D6EAF8] px-5 py-8">
      <div className="w-full max-w-sm sm:max-w-md animate-fade-in">
        <LoginForm />
      </div>
    </main>
  )
}