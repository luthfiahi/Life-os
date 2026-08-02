'use client'

import { cn } from '@/lib/utils'
import {
  Target, Rocket, Flag, Star, Trophy, Zap, Code, BookOpen, Dumbbell, Heart,
  CalendarDays, Pin, Pencil, Archive, Trash2, CheckCircle2, Flame,
} from 'lucide-react'
import { formatDaysRemaining, getPriorityConfig, getStatusConfig, calculateMissionHealth, getCategoryConfig } from '@/lib/services/mission.service'
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

const GRADIENT_BG_LIGHT: Record<string, string> = {
  blue: 'from-blue-500/8 to-blue-600/3',
  emerald: 'from-emerald-500/8 to-emerald-600/3',
  violet: 'from-violet-500/8 to-violet-600/3',
  orange: 'from-orange-500/8 to-orange-600/3',
  rose: 'from-rose-500/8 to-rose-600/3',
  sky: 'from-sky-500/8 to-sky-600/3',
}

const GRADIENT_BG_DARK: Record<string, string> = {
  blue: 'from-blue-500/15 to-blue-600/5',
  emerald: 'from-emerald-500/15 to-emerald-600/5',
  violet: 'from-violet-500/15 to-violet-600/5',
  orange: 'from-orange-500/15 to-orange-600/5',
  rose: 'from-rose-500/15 to-rose-600/5',
  sky: 'from-sky-500/15 to-sky-600/5',
}

const ICON_GRADIENT_MAP: Record<string, string> = {
  blue: 'from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-700',
  emerald: 'from-emerald-400 to-emerald-600 dark:from-emerald-500 dark:to-emerald-700',
  violet: 'from-violet-400 to-violet-600 dark:from-violet-500 dark:to-violet-700',
  orange: 'from-orange-400 to-orange-600 dark:from-orange-500 dark:to-orange-700',
  rose: 'from-rose-400 to-rose-600 dark:from-rose-500 dark:to-rose-700',
  sky: 'from-sky-400 to-sky-600 dark:from-sky-500 dark:to-sky-700',
}

const PROGRESS_GLOW_MAP: Record<string, string> = {
  blue: 'shadow-blue-500/40',
  emerald: 'shadow-emerald-500/40',
  violet: 'shadow-violet-500/40',
  orange: 'shadow-orange-500/40',
  rose: 'shadow-rose-500/40',
  sky: 'shadow-sky-500/40',
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
  const gradientBgLight = GRADIENT_BG_LIGHT[mission.color ?? 'blue'] ?? GRADIENT_BG_LIGHT.blue
  const gradientBgDark = GRADIENT_BG_DARK[mission.color ?? 'blue'] ?? GRADIENT_BG_DARK.blue
  const iconGradient = ICON_GRADIENT_MAP[mission.color ?? 'blue'] ?? ICON_GRADIENT_MAP.blue
  const progressGlow = PROGRESS_GLOW_MAP[mission.color ?? 'blue'] ?? PROGRESS_GLOW_MAP.blue
  const priority = getPriorityConfig(mission.priority)
  const status = getStatusConfig(mission.status)
  const category = getCategoryConfig(mission.category)
  const health = calculateMissionHealth(mission)
  const days = formatDaysRemaining(mission.target_date)
  const isOverdue = mission.target_date && new Date(mission.target_date + 'T23:59:59') < new Date() && mission.status === 'active'
  const progressVal = Math.min(Math.round(Number(mission.progress)), 100)

  return (
    <div
      className={cn(
        'group relative rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] transition-all duration-300 overflow-hidden',
        'hover:shadow-[var(--shadow-elevated)] hover:border-[var(--c-accent)]/30 hover:-translate-y-1',
        'dark:shadow-none dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]',
        mission.status === 'completed' && 'opacity-60',
        mission.status === 'archived' && 'opacity-40',
      )}
    >
      {/* Subtle gradient background tint — light & dark aware */}
      <div className={cn('absolute inset-0 bg-gradient-to-br opacity-60 pointer-events-none', gradientBgLight, 'dark:' + gradientBgDark)} />

      {/* Top color accent bar with glow */}
      <div className={cn('h-[3px] w-full bg-gradient-to-r relative z-10', gradient)} />
      <div className={cn('absolute top-0 left-1/4 right-1/4 h-[3px] blur-md bg-gradient-to-r opacity-60', gradient)} />

      <div className="relative z-10 p-4 space-y-3.5">
        {/* Top: Icon + Title + Actions */}
        <div className="flex items-start gap-3">
          <div className={cn(
            'h-11 w-11 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0',
            iconGradient,
            'shadow-lg',
            'dark:shadow-[0_4px_16px_rgba(0,0,0,0.5)]',
          )}>
            <Icon className="h-5 w-5 text-white drop-shadow-sm" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {mission.is_pinned && <Pin className="h-3 w-3 text-[var(--c-accent)] fill-[var(--c-accent)] shrink-0" />}
              <h3 className={cn(
                'text-[13px] font-bold truncate text-[var(--c-text)]',
                'dark:drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]',
                mission.status === 'completed' && 'line-through opacity-70',
              )}>
                {mission.title}
              </h3>
            </div>
            {mission.description && (
              <p className="text-[11px] text-[var(--c-text-muted)] line-clamp-2 mt-1 leading-relaxed">{mission.description}</p>
            )}
          </div>
          {/* Action buttons */}
          <div className="flex items-center gap-0.5 shrink-0">
            <button type="button" onClick={(e) => { e.stopPropagation(); onEdit?.() }} className="h-8 w-8 flex items-center justify-center rounded-lg text-[var(--c-text-muted)] hover:text-[var(--c-text)] hover:bg-[var(--c-surface)] dark:hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100">
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button type="button" onClick={(e) => { e.stopPropagation(); onArchive?.() }} className="h-8 w-8 flex items-center justify-center rounded-lg text-[var(--c-text-muted)] hover:text-[var(--c-text)] hover:bg-[var(--c-surface)] dark:hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100">
              <Archive className="h-3.5 w-3.5" />
            </button>
            <button type="button" onClick={(e) => { e.stopPropagation(); onDelete?.() }} className="h-8 w-8 flex items-center justify-center rounded-lg text-[var(--c-text-muted)] hover:text-rose-500 hover:bg-rose-500/10 dark:hover:bg-rose-500/20 transition-all opacity-0 group-hover:opacity-100">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Progress bar with glow effect */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[var(--c-text-muted)] font-medium">Progress</span>
            <span className="font-extrabold text-[var(--c-text)] tabular-nums tracking-tight">{progressVal}%</span>
          </div>
          <div className="h-2 rounded-full bg-[var(--c-border)]/40 dark:bg-white/10 overflow-hidden">
            <div
              className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out', gradient)}
              style={{ width: `${progressVal}%` }}
            />
          </div>
          {/* Glow line under progress */}
          <div className="h-[2px] rounded-full overflow-hidden -mt-0.5">
            <div
              className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out blur-sm opacity-40', gradient, progressGlow)}
              style={{ width: `${progressVal}%` }}
            />
          </div>
        </div>

        {/* Bottom: badges + deadline + milestone count */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {mission.status === 'active' && (
              <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-full dark:ring-1 dark:ring-white/5',
                health.health === 'on_track' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : health.health === 'at_risk' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                : health.health === 'critical' ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                : health.health === 'overdue' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                : 'bg-[var(--c-surface)] text-[var(--c-text-muted)]'
              )}>
                <span className={cn('inline-block rounded-full mr-1',
                  health.health === 'on_track' ? 'bg-emerald-500'
                  : health.health === 'at_risk' ? 'bg-amber-500'
                  : health.health === 'critical' ? 'bg-orange-500'
                  : health.health === 'overdue' ? 'bg-rose-500'
                  : 'bg-[var(--c-text-muted)]',
                  'h-1.5 w-1.5')} />
                {health.label}
              </span>
            )}
            <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full dark:ring-1 dark:ring-white/5', priority.bg, priority.color)}>
              {priority.label}
            </span>
            <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full dark:ring-1 dark:ring-white/5', status.bg, status.color)}>
              {status.label}
            </span>
            {mission.category && mission.category !== 'general' && (
              <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full dark:ring-1 dark:ring-white/5', category.bg, category.color)}>
                {category.label}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-[11px] text-[var(--c-text-muted)]">
            {milestoneCount && (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                <span className="tabular-nums">{milestoneCount.completed}/{milestoneCount.total}</span>
              </span>
            )}
            {isOverdue && <Flame className="h-3 w-3 text-rose-500" />}
            {days && (
              <span className={cn('flex items-center gap-1 tabular-nums', isOverdue && 'text-rose-500 font-bold')}>
                {!isOverdue && <CalendarDays className="h-3 w-3" />}
                {days}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Click overlay */}
      {onClick && (
        <button type="button" onClick={onClick} className="absolute inset-0 w-full h-full cursor-pointer z-20" style={{ background: 'transparent' }} />
      )}
    </div>
  )
}
