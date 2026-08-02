'use client'

import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import {
  Target, Rocket, Flag, Star, Trophy, Zap, Code, BookOpen, Dumbbell, Heart,
  CalendarDays, Pin, Pencil, Archive, Trash2,
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
  const priority = getPriorityConfig(m.priority)
  const status = getStatusConfig(m.status)
  const days = formatDaysRemaining(m.target_date)
  const isOverdue = m.target_date && new Date(m.target_date + 'T23:59:59') < new Date() && m.status === 'active'

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
      <SheetContent side="right" className="w-full sm:max-w-[500px] p-0 flex flex-col overflow-hidden">
        {/* Color header */}
        <div className={cn('h-32 bg-gradient-to-br relative flex-shrink-0', gradient)}>
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative h-full px-6 flex items-end pb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div className="min-w-0">
                <SheetTitle className="text-lg font-bold text-white truncate">{m.title}</SheetTitle>
                <SheetDescription className="text-xs text-white/70">{m.description ?? 'Tidak ada deskripsi'}</SheetDescription>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 py-5 space-y-6">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-[var(--c-surface)] border border-[var(--c-border)] p-3 text-center">
              <p className="text-[10px] font-semibold text-[var(--c-text-muted)] uppercase">Progress</p>
              <p className="text-xl font-bold text-[var(--c-text)] mt-0.5 tabular-nums">{Math.round(Number(m.progress))}%</p>
            </div>
            <div className="rounded-xl bg-[var(--c-surface)] border border-[var(--c-border)] p-3 text-center">
              <p className="text-[10px] font-semibold text-[var(--c-text-muted)] uppercase">Priority</p>
              <p className={cn('text-xs font-bold mt-1.5', priority.color)}>{priority.label}</p>
            </div>
            <div className="rounded-xl bg-[var(--c-surface)] border border-[var(--c-border)] p-3 text-center">
              <p className="text-[10px] font-semibold text-[var(--c-text-muted)] uppercase">Status</p>
              <p className={cn('text-xs font-bold mt-1.5', status.color)}>{status.label}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="h-3 rounded-full bg-[var(--c-border)]/30 overflow-hidden">
              <div className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-500', gradient)} style={{ width: `${Math.min(Number(m.progress), 100)}%` }} />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold text-[var(--c-text-muted)] uppercase">Mulai</p>
              <p className="text-sm font-medium text-[var(--c-text)]">{formatMissionDate(m.start_date)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-semibold text-[var(--c-text-muted)] uppercase">Target</p>
              <p className={cn('text-sm font-medium', isOverdue ? 'text-rose-500' : 'text-[var(--c-text)]')}>
                {formatMissionDate(m.target_date)}
                {days && <span className="text-xs text-[var(--c-text-muted)] ml-1">({days})</span>}
              </p>
            </div>
          </div>

          {/* Milestones */}
          <div>
            <h3 className="text-sm font-bold text-[var(--c-text)] mb-3">Milestone</h3>
            <MilestonePanel missionId={m.id} />
          </div>
        </div>

        {/* Fixed footer */}
        <div className="flex-shrink-0 border-t border-[var(--c-border)] px-6 py-3">
          <div className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <button type="button" onClick={handleTogglePin}
                className={cn('h-9 px-3 rounded-xl text-xs font-semibold border transition-all',
                  m.is_pinned ? 'border-[var(--c-accent)] bg-[var(--c-accent)]/10 text-[var(--c-accent)]' : 'border-[var(--c-border)] text-[var(--c-text-muted)] hover:border-[var(--c-text-muted)]')}>
                <Pin className={cn('h-3.5 w-3.5 inline mr-1', m.is_pinned && 'fill-[var(--c-accent)]')} />
                {m.is_pinned ? 'Unpin' : 'Pin'}
              </button>
              <button type="button" onClick={handleArchive}
                className="h-9 px-3 rounded-xl text-xs font-semibold border border-[var(--c-border)] text-[var(--c-text-muted)] hover:border-[var(--c-text-muted)] transition-all">
                <Archive className="h-3.5 w-3.5 inline mr-1" />{m.status === 'archived' ? 'Unarchive' : 'Arsipkan'}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => { onOpenChange(false); onEdit?.() }}
                className="h-9 px-3 rounded-xl text-xs font-semibold border border-[var(--c-border)] text-[var(--c-text-muted)] hover:border-[var(--c-text-muted)] transition-all">
                <Pencil className="h-3.5 w-3.5 inline mr-1" />Edit
              </button>
              <Button type="button" variant="ghost" onClick={handleDelete}
                className="h-9 px-3 rounded-xl text-xs font-semibold text-rose-500 hover:text-rose-600 hover:bg-rose-500/10">
                <Trash2 className="h-3.5 w-3.5 inline mr-1" />Hapus
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
