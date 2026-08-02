'use client'

import {
  Sheet, SheetContent, SheetTitle, SheetDescription,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import {
  Target, Rocket, Flag, Star, Trophy, Zap, Code, BookOpen, Dumbbell, Heart,
  CalendarDays, Pin, Pencil, Archive, Trash2, Flame, Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDeleteMission, useUpdateMission } from '@/lib/queries/mission-queries'
import { MilestonePanel } from './milestone-panel'
import { formatMissionDate, formatDaysRemaining, getPriorityConfig, getStatusConfig } from '@/lib/services/mission.service'
import type { MissionRow } from '@/lib/types/mission'

const ICON_MAP: Record<string, React.ElementType> = {
  Target, Rocket, Flag, Star, Trophy, Zap, Code, BookOpen, Dumbbell, Heart,
}

const GRADIENT_MAP: Record<string, string> = {
  blue: 'from-blue-500 to-blue-600',
  emerald: 'from-emerald-500 to-emerald-600',
  violet: 'from-violet-500 to-violet-600',
  orange: 'from-orange-500 to-orange-600',
  rose: 'from-rose-500 to-rose-600',
  sky: 'from-sky-500 to-sky-600',
}

const HEADER_GRADIENT_MAP: Record<string, string> = {
  blue: 'from-blue-500 via-blue-600 to-indigo-700 dark:from-blue-600 dark:via-blue-800 dark:to-indigo-900',
  emerald: 'from-emerald-500 via-emerald-600 to-teal-700 dark:from-emerald-600 dark:via-emerald-800 dark:to-teal-900',
  violet: 'from-violet-500 via-violet-600 to-purple-700 dark:from-violet-600 dark:via-violet-800 dark:to-purple-900',
  orange: 'from-orange-500 via-orange-600 to-amber-700 dark:from-orange-600 dark:via-orange-800 dark:to-amber-900',
  rose: 'from-rose-500 via-rose-600 to-pink-700 dark:from-rose-600 dark:via-rose-800 dark:to-pink-900',
  sky: 'from-sky-500 via-sky-600 to-cyan-700 dark:from-sky-600 dark:via-sky-800 dark:to-cyan-900',
}

const PROGRESS_GLOW_MAP: Record<string, string> = {
  blue: 'shadow-blue-500/30 dark:shadow-blue-500/20',
  emerald: 'shadow-emerald-500/30 dark:shadow-emerald-500/20',
  violet: 'shadow-violet-500/30 dark:shadow-violet-500/20',
  orange: 'shadow-orange-500/30 dark:shadow-orange-500/20',
  rose: 'shadow-rose-500/30 dark:shadow-rose-500/20',
  sky: 'shadow-sky-500/30 dark:shadow-sky-500/20',
}

interface MissionDetailDrawerProps {
  mission: MissionRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: () => void
}

export function MissionDetailDrawer({ mission, open, onOpenChange, onEdit }: MissionDetailDrawerProps) {
  const updateMission = useUpdateMission()
  const deleteMission = useDeleteMission()

  if (!mission) return null
  const m: MissionRow = mission

  const Icon = ICON_MAP[m.icon ?? 'Target'] ?? Target
  const gradient = GRADIENT_MAP[m.color ?? 'blue'] ?? GRADIENT_MAP.blue
  const headerGradient = HEADER_GRADIENT_MAP[m.color ?? 'blue'] ?? HEADER_GRADIENT_MAP.blue
  const progressGlow = PROGRESS_GLOW_MAP[m.color ?? 'blue'] ?? PROGRESS_GLOW_MAP.blue
  const priority = getPriorityConfig(m.priority)
  const status = getStatusConfig(m.status)
  const days = formatDaysRemaining(m.target_date)
  const isOverdue = m.target_date && new Date(m.target_date + 'T23:59:59') < new Date() && m.status === 'active'
  const progressVal = Math.min(Math.round(Number(m.progress)), 100)

  async function handleArchive() {
    const newStatus = m.status === 'archived' ? 'active' : 'archived'
    await updateMission.mutateAsync({ id: m.id, payload: { status: newStatus } })
    onOpenChange(false)
  }

  async function handleDelete() {
    if (!confirm('Hapus mission ini beserta semua milestone-nya?')) return
    await deleteMission.mutateAsync(m.id)
    onOpenChange(false)
  }

  async function handleTogglePin() {
    await updateMission.mutateAsync({ id: m.id, payload: { is_pinned: !m.is_pinned } })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[520px] p-0 flex flex-col overflow-hidden">
        {/* Premium color header with glassmorphism */}
        <div className={cn('h-40 bg-gradient-to-br relative flex-shrink-0', headerGradient)}>
          {/* Decorative circles — more prominent in dark */}
          <div className="absolute -top-8 -right-8 h-36 w-36 rounded-full bg-white/10 dark:bg-white/5" />
          <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-white/5 dark:bg-white/5" />
          <div className="absolute top-6 right-16 h-12 w-12 rounded-full bg-white/5 dark:bg-white/5" />
          {/* Bottom fade to card bg */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[var(--c-card)] to-transparent" />
          <div className="relative h-full px-6 flex flex-col justify-end pb-6">
            <div className="flex items-center gap-3.5">
              <div className="h-14 w-14 rounded-2xl bg-white/20 dark:bg-white/10 backdrop-blur-md flex items-center justify-center shadow-xl border border-white/25 dark:border-white/10">
                <Icon className="h-7 w-7 text-white drop-shadow-sm" />
              </div>
              <div className="min-w-0">
                <SheetTitle className="text-lg font-extrabold text-white truncate drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]">{m.title}</SheetTitle>
                <SheetDescription className="text-xs text-white/80 dark:text-white/60 mt-0.5 line-clamp-1">{m.description ?? 'Tidak ada deskripsi'}</SheetDescription>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 py-5 space-y-6">
          {/* Stats row — premium glass cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-[var(--c-surface)] dark:bg-white/[0.04] border border-[var(--c-border)] dark:border-white/[0.08] p-3.5 text-center space-y-1.5 dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
              <p className="text-[10px] font-bold text-[var(--c-text-muted)] uppercase tracking-widest">Progress</p>
              <p className="text-2xl font-extrabold text-[var(--c-text)] tabular-nums tracking-tight leading-none">{progressVal}<span className="text-sm font-bold text-[var(--c-text-muted)]">%</span></p>
            </div>
            <div className="rounded-2xl bg-[var(--c-surface)] dark:bg-white/[0.04] border border-[var(--c-border)] dark:border-white/[0.08] p-3.5 text-center space-y-1.5 dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
              <p className="text-[10px] font-bold text-[var(--c-text-muted)] uppercase tracking-widest">Priority</p>
              <p className={cn('text-sm font-bold mt-0.5', priority.color)}>{priority.label}</p>
            </div>
            <div className="rounded-2xl bg-[var(--c-surface)] dark:bg-white/[0.04] border border-[var(--c-border)] dark:border-white/[0.08] p-3.5 text-center space-y-1.5 dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
              <p className="text-[10px] font-bold text-[var(--c-text-muted)] uppercase tracking-widest">Status</p>
              <p className={cn('text-sm font-bold mt-0.5', status.color)}>{status.label}</p>
            </div>
          </div>

          {/* Progress bar with glow */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--c-text-muted)] font-medium">Milestone Progress</span>
              <span className="font-extrabold text-[var(--c-text)] tabular-nums">{progressVal}%</span>
            </div>
            <div className="h-3 rounded-full bg-[var(--c-border)]/40 dark:bg-white/10 overflow-hidden">
              <div className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out shadow-sm', gradient, progressGlow)} style={{ width: `${progressVal}%` }} />
            </div>
          </div>

          {/* Dates — premium cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-[var(--c-surface)] dark:bg-white/[0.04] border border-[var(--c-border)] dark:border-white/[0.08] p-3.5 space-y-2 dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />
                <p className="text-[10px] font-bold text-[var(--c-text-muted)] uppercase tracking-widest">Mulai</p>
              </div>
              <p className="text-sm font-semibold text-[var(--c-text)]">{formatMissionDate(m.start_date)}</p>
            </div>
            <div className="rounded-2xl bg-[var(--c-surface)] dark:bg-white/[0.04] border border-[var(--c-border)] dark:border-white/[0.08] p-3.5 space-y-2 dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
              <div className="flex items-center gap-1.5">
                {isOverdue ? <Flame className="h-3.5 w-3.5 text-rose-500" /> : <CalendarDays className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />}
                <p className="text-[10px] font-bold text-[var(--c-text-muted)] uppercase tracking-widest">Target</p>
              </div>
              <p className={cn('text-sm font-semibold', isOverdue ? 'text-rose-500' : 'text-[var(--c-text)]')}>
                {formatMissionDate(m.target_date)}
              </p>
              {days && (
                <p className={cn('text-[11px] tabular-nums', isOverdue ? 'text-rose-400 dark:text-rose-300 font-bold' : 'text-[var(--c-text-muted)]')}>
                  {days}
                </p>
              )}
            </div>
          </div>

          {/* Milestones */}
          <div>
            <h3 className="text-sm font-bold text-[var(--c-text)] mb-3 flex items-center gap-2">
              <span className="h-1 w-4 rounded-full bg-[var(--c-accent)]" />
              Milestone
              <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full dark:ring-1 dark:ring-white/5', status.bg, status.color)}>{status.label}</span>
            </h3>
            <MilestonePanel missionId={m.id} />
          </div>
        </div>

        {/* Fixed footer — premium glass */}
        <div className="flex-shrink-0 border-t border-[var(--c-border)] dark:border-white/[0.08] px-6 py-3.5 bg-[var(--c-card)] dark:bg-[var(--c-card)]/80 dark:backdrop-blur-xl">
          <div className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <button type="button" onClick={handleTogglePin}
                className={cn('h-9 px-3.5 rounded-xl text-xs font-bold border transition-all duration-200',
                  m.is_pinned
                    ? 'border-[var(--c-accent)] bg-[var(--c-accent)]/10 dark:bg-[var(--c-accent)]/15 text-[var(--c-accent)] shadow-sm shadow-[var(--c-accent)]/10'
                    : 'border-[var(--c-border)] dark:border-white/10 text-[var(--c-text-muted)] hover:text-[var(--c-text)] hover:border-[var(--c-text-muted)] dark:hover:border-white/20 dark:hover:bg-white/5')}>
                <Pin className={cn('h-3.5 w-3.5 inline mr-1', m.is_pinned && 'fill-[var(--c-accent)]')} />
                {m.is_pinned ? 'Unpin' : 'Pin'}
              </button>
              <button type="button" onClick={handleArchive}
                className="h-9 px-3.5 rounded-xl text-xs font-bold border border-[var(--c-border)] dark:border-white/10 text-[var(--c-text-muted)] hover:text-[var(--c-text)] hover:border-[var(--c-text-muted)] dark:hover:border-white/20 dark:hover:bg-white/5 transition-all duration-200">
                <Archive className="h-3.5 w-3.5 inline mr-1" />{m.status === 'archived' ? 'Unarchive' : 'Arsipkan'}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => { onOpenChange(false); onEdit?.() }}
                className="h-9 px-3.5 rounded-xl text-xs font-bold border border-[var(--c-border)] dark:border-white/10 text-[var(--c-text-muted)] hover:text-[var(--c-text)] hover:border-[var(--c-text-muted)] dark:hover:border-white/20 dark:hover:bg-white/5 transition-all duration-200">
                <Pencil className="h-3.5 w-3.5 inline mr-1" />Edit
              </button>
              <Button type="button" variant="ghost" onClick={handleDelete}
                className="h-9 px-3.5 rounded-xl text-xs font-bold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 dark:hover:bg-rose-500/20">
                <Trash2 className="h-3.5 w-3.5 inline mr-1" />Hapus
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
