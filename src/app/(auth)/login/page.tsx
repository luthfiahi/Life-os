import { LoginForm } from '@/components/auth/login-form'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[#D6EAF8] px-4 py-8 dark:bg-[#0f1114]">
      <div className="w-full max-w-[420px] animate-fade-in">
        <LoginForm />
      </div>
    </main>
  )
}