'use client'

import { cn } from '@/lib/utils'
import {
  Target, Rocket, Flag, Star, Trophy, Zap, Code, BookOpen, Dumbbell, Heart,
  CalendarDays, Pin, MoreVertical, Pencil, Archive, Trash2, CheckCircle2,
} from 'lucide-react'
import { formatDaysRemaining, getPriorityConfig, getStatusConfig } from '@/lib/services/mission.service'
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

interface MissionCardProps {
  mission: MissionRow
  milestoneCount?: { total: number; completed: number }
  onClick?: () => void
  onEdit?: () => void
  onArchive?: () => void
  onDelete?: () => void
}

export function MissionCard({ mission, milestoneCount, onClick, onEdit, onArchive, onDelete }: MissionCardProps) {
  const Icon = ICON_MAP[mission.icon ?? 'Target'] ?? Target
  const gradient = GRADIENT_MAP[mission.color ?? 'blue'] ?? GRADIENT_MAP.blue
  const priority = getPriorityConfig(mission.priority)
  const status = getStatusConfig(mission.status)
  const days = formatDaysRemaining(mission.target_date)
  const isOverdue = mission.target_date && new Date(mission.target_date + 'T23:59:59') < new Date() && mission.status === 'active'

  return (
    <div
      className={cn(
        'group relative rounded-2xl border border-[var(--c-border)] bg-white dark:bg-[#22262c] shadow-sm hover:shadow-[var(--shadow-card)] transition-all duration-200 overflow-hidden',
        mission.status === 'completed' && 'opacity-70',
        mission.status === 'archived' && 'opacity-50',
      )}
    >
      {/* Color accent bar */}
      <div className={cn('h-1 w-full bg-gradient-to-r', gradient)} />

      <div className="p-4 space-y-3">
        {/* Top: Icon + Title + Menu */}
        <div className="flex items-start gap-3">
          <div className={cn('h-10 w-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-sm shrink-0', gradient)}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {mission.is_pinned && <Pin className="h-3.5 w-3.5 text-[var(--c-accent)] fill-[var(--c-accent)] shrink-0" />}
              <h3 className={cn(
                'text-sm font-bold truncate text-[var(--c-text)]',
                mission.status === 'completed' && 'line-through',
              )}>
                {mission.title}
              </h3>
            </div>
            {mission.description && (
              <p className="text-xs text-[var(--c-text-muted)] line-clamp-2 mt-0.5">{mission.description}</p>
            )}
          </div>
          {/* Action menu */}
          <div className="flex items-center gap-0.5 shrink-0">
            <button type="button" onClick={(e) => { e.stopPropagation(); onEdit?.() }} className="h-8 w-8 flex items-center justify-center rounded-lg text-[var(--c-text-muted)] hover:text-[var(--c-text)] hover:bg-[var(--c-surface)] transition-all opacity-0 group-hover:opacity-100">
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button type="button" onClick={(e) => { e.stopPropagation(); onArchive?.() }} className="h-8 w-8 flex items-center justify-center rounded-lg text-[var(--c-text-muted)] hover:text-[var(--c-text)] hover:bg-[var(--c-surface)] transition-all opacity-0 group-hover:opacity-100">
              <Archive className="h-3.5 w-3.5" />
            </button>
            <button type="button" onClick={(e) => { e.stopPropagation(); onDelete?.() }} className="h-8 w-8 flex items-center justify-center rounded-lg text-[var(--c-text-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[var(--c-text-muted)]">Progress</span>
            <span className="font-bold text-[var(--c-text)] tabular-nums">{Math.round(Number(mission.progress))}%</span>
          </div>
          <div className="h-2 rounded-full bg-[var(--c-border)]/30 overflow-hidden">
            <div
              className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-500', gradient)}
              style={{ width: `${Math.min(Number(mission.progress), 100)}%` }}
            />
          </div>
        </div>

        {/* Bottom: badges + deadline + milestone count */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', priority.bg, priority.color)}>
              {priority.label}
            </span>
            <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', status.bg, status.color)}>
              {status.label}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-[var(--c-text-muted)]">
            {milestoneCount && (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                {milestoneCount.completed}/{milestoneCount.total}
              </span>
            )}
            {days && (
              <span className={cn('flex items-center gap-1', isOverdue && 'text-rose-500 font-semibold')}>
                <CalendarDays className="h-3 w-3" />
                {days}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Click overlay */}
      {onClick && (
        <button type="button" onClick={onClick} className="absolute inset-0 w-full h-full cursor-pointer" style={{ background: 'transparent' }} />
      )}
    </div>
  )
}
