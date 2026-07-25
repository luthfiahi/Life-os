'use client'

import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent } from '@/components/ui/card'
import {
  Wallet,
  Target,
  Calendar,
  Dumbbell,
  BookOpen,
  Brain,
  Bot,
  BarChart3,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'

/**
 * Life OS — Dashboard (Command Center) Page
 * Route: /dashboard
 * 
 * Landing page after login. Shows overview of all 8 modules
 * with quick access cards. Full features will be built in Sprint 2.
 */

const modules = [
  {
    name: 'Wealth',
    href: '/wealth',
    icon: Wallet,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    description: 'Kelola keuangan',
    sprint: 3,
  },
  {
    name: 'Mission',
    href: '/mission',
    icon: Target,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    description: 'Tujuan & milestone',
    sprint: 4,
  },
  {
    name: 'Schedule',
    href: '/schedule',
    icon: Calendar,
    color: 'text-violet-500',
    bgColor: 'bg-violet-500/10',
    description: 'Kalender & jadwal',
    sprint: 5,
  },
  {
    name: 'Discipline',
    href: '/discipline',
    icon: Dumbbell,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    description: 'Habit & routine',
    sprint: 6,
  },
  {
    name: 'Reflection',
    href: '/reflection',
    icon: BookOpen,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    description: 'Jurnal & refleksi',
    sprint: 7,
  },
  {
    name: 'Brain',
    href: '/brain',
    icon: Brain,
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
    description: 'Catatan & ide',
    sprint: 8,
  },
  {
    name: 'Coach',
    href: '/coach',
    icon: Bot,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
    description: 'AI coaching',
    sprint: 9,
  },
  {
    name: 'Insights',
    href: '/insights',
    icon: BarChart3,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10',
    description: 'Analitik hidup',
    sprint: 10,
  },
]

export default function DashboardPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-2 border-[var(--c-accent)] border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div>
        <h1 className="text-h1 text-[var(--c-text)]">
          Selamat datang, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Pengguna'}
        </h1>
        <p className="text-sm text-[var(--c-text-muted)] mt-1">
          Ini adalah Command Center kamu. Pilih module untuk mulai.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="border border-[var(--c-border)] bg-[var(--c-card)] shadow-[var(--shadow-card)]">
          <CardContent className="p-4">
            <p className="text-xs text-[var(--c-text-muted)]">Modul Aktif</p>
            <p className="text-2xl font-bold text-[var(--c-text)] mt-1">8</p>
          </CardContent>
        </Card>
        <Card className="border border-[var(--c-border)] bg-[var(--c-card)] shadow-[var(--shadow-card)]">
          <CardContent className="p-4">
            <p className="text-xs text-[var(--c-text-muted)]">Sprint Saat Ini</p>
            <p className="text-2xl font-bold text-[var(--c-text)] mt-1">1</p>
          </CardContent>
        </Card>
        <Card className="border border-[var(--c-border)] bg-[var(--c-card)] shadow-[var(--shadow-card)]">
          <CardContent className="p-4">
            <p className="text-xs text-[var(--c-text-muted)]">Status</p>
            <p className="text-2xl font-bold text-[var(--c-accent)] mt-1">Foundation</p>
          </CardContent>
        </Card>
        <Card className="border border-[var(--c-border)] bg-[var(--c-card)] shadow-[var(--shadow-card)]">
          <CardContent className="p-4">
            <p className="text-xs text-[var(--c-text-muted)]">Progress</p>
            <p className="text-2xl font-bold text-[var(--c-text)] mt-1">10%</p>
          </CardContent>
        </Card>
      </div>

      {/* Module Grid */}
      <div>
        <h2 className="text-base font-bold text-[var(--c-text)] mb-3">Module</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {modules.map((mod) => {
            const Icon = mod.icon
            return (
              <Link key={mod.href} href={mod.href} className="group">
                <Card className="border border-[var(--c-border)] bg-[var(--c-card)] shadow-[var(--shadow-card)] transition-all duration-200 hover:shadow-[var(--shadow-elevated)] hover:border-[var(--c-accent)]/30 h-full">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-[var(--radius-lg)] ${mod.bgColor}`}>
                        <Icon className={`h-5 w-5 ${mod.color}`} />
                      </div>
                      <ArrowRight className="h-4 w-4 text-[var(--c-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="mt-3">
                      <h3 className="text-sm font-semibold text-[var(--c-text)]">{mod.name}</h3>
                      <p className="text-xs text-[var(--c-text-muted)] mt-0.5">{mod.description}</p>
                    </div>
                    <div className="mt-2">
                      <span className="inline-flex items-center rounded-full bg-[var(--c-surface)] px-2 py-0.5 text-[10px] text-[var(--c-text-muted)]">
                        Sprint {mod.sprint}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
