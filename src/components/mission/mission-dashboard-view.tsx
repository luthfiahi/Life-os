'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import {
  Activity, TrendingUp, AlertTriangle, Flame, Clock, ChevronRight,
} from 'lucide-react'
import { useMissionDashboard } from '@/lib/queries/mission-queries'
import { calculateMissionHealth, formatMissionDate, getHealthConfig } from '@/lib/services/mission.service'
import { MissionHealthBadge } from './mission-health-badge'
import { PriorityMatrix } from './priority-matrix'
import type { MissionRow } from '@/lib/types/mission'

const GRADIENT_MAP: Record<string, string> = {
  blue: 'from-blue-500 to-blue-600',
  emerald: 'from-emerald-500 to-emerald-600',
  violet: 'from-violet-500 to-violet-600',
  orange: 'from-orange-500 to-orange-600',
  rose: 'from-rose-500 to-rose-600',
  sky: 'from-sky-500 to-sky-600',
}

interface MissionDashboardViewProps {
  onMissionClick?: (mission: MissionRow) => void
}

function HealthCard({ health, count }: { health: string; count: number }) {
  const configs: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
    on_track: { icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10 dark:bg-emerald-500/15', label: 'On Track' },
    at_risk: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10 dark:bg-amber-500/15', label: 'At Risk' },
    critical: { icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10 dark:bg-orange-500/15', label: 'Critical' },
    overdue: { icon: Flame, color: 'text-rose-500', bg: 'bg-rose-500/10 dark:bg-rose-500/15', label: 'Overdue' },
    no_deadline: { icon: Clock, color: 'text-[var(--c-text-muted)]', bg: 'bg-[var(--c-surface)] dark:bg-white/[0.04]', label: 'No Deadline' },
  }
  const c = configs[health] ?? configs.no_deadline
  const Icon = c.icon
  return (
    <div className="rounded-2xl border border-[var(--c-border)] dark:border-white/[0.08] bg-[var(--c-card)] p-3.5 flex items-center gap-3 transition-all duration-200 hover:shadow-[var(--shadow-elevated)] dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:-translate-y-0.5">
      <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center', c.bg)}>
        <Icon className={cn('h-5 w-5', c.color)} />
      </div>
      <div>
        <p className="text-xl font-extrabold text-[var(--c-text)] tabular-nums leading-none">{count}</p>
        <p className="text-[10px] text-[var(--c-text-muted)] font-medium mt-0.5">{c.label}</p>
      </div>
    </div>
  )
}

export function MissionDashboardView({ onMissionClick }: MissionDashboardViewProps) {
  const { data, isLoading } = useMissionDashboard()

  if (isLoading || !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 rounded-2xl bg-[var(--c-surface)] dark:bg-white/[0.04]" />)}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-36 rounded-2xl bg-[var(--c-surface)] dark:bg-white/[0.04]" />)}
        </div>
      </div>
    )
  }

  const { healthSummary, upcomingMilestones, progressByMission, priorityMatrix } = data

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Mission Health Overview */}
      <div>
        <h2 className="text-sm font-bold text-[var(--c-text)] mb-3 flex items-center gap-2">
          <Activity className="h-4 w-4 text-[var(--c-accent)]" />
          Mission Health
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <HealthCard health="on_track" count={healthSummary.on_track} />
          <HealthCard health="at_risk" count={healthSummary.at_risk} />
          <HealthCard health="critical" count={healthSummary.critical} />
          <HealthCard health="overdue" count={healthSummary.overdue} />
          <HealthCard health="no_deadline" count={healthSummary.no_deadline} />
        </div>
      </div>

      {/* Priority Matrix + Upcoming Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Priority Matrix */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-sm font-bold text-[var(--c-text)] flex items-center gap-2">
            Priority Matrix
            <span className="text-[10px] font-bold text-[var(--c-text-muted)] bg-[var(--c-surface)] dark:bg-white/[0.04] px-1.5 py-0.5 rounded-md">Eisenhower</span>
          </h2>
          <PriorityMatrix matrix={priorityMatrix} onMissionClick={onMissionClick} />
        </div>

        {/* Upcoming Milestones */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-[var(--c-text)] flex items-center gap-2">
            <Clock className="h-4 w-4 text-[var(--c-accent)]" />
            Upcoming Milestones
          </h2>
          <div className="rounded-2xl border border-[var(--c-border)] dark:border-white/[0.08] bg-[var(--c-card)] divide-y divide-[var(--c-border)] dark:divide-white/[0.06] overflow-hidden">
            {upcomingMilestones.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-sm text-[var(--c-text-muted)]">Tidak ada milestone mendatang.</p>
              </div>
            ) : (
              upcomingMilestones.map((ms) => (
                <div key={ms.id} className="px-4 py-3 flex items-start gap-3 hover:bg-[var(--c-surface)] dark:hover:bg-white/[0.04] transition-colors">
                  <div className={cn(
                    'h-2 w-2 rounded-full mt-1.5 shrink-0',
                    ms.daysUntil <= 1 ? 'bg-rose-500' : ms.daysUntil <= 3 ? 'bg-amber-500' : 'bg-emerald-500',
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[var(--c-text)] truncate">{ms.title}</p>
                    <p className="text-[10px] text-[var(--c-text-muted)] truncate">{ms.mission_title}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={cn(
                      'text-[10px] font-bold tabular-nums',
                      ms.daysUntil <= 1 ? 'text-rose-500' : ms.daysUntil <= 3 ? 'text-amber-500' : 'text-[var(--c-text-muted)]',
                    )}>
                      {ms.daysUntil === 0 ? 'Hari ini' : ms.daysUntil === 1 ? 'Besok' : `${ms.daysUntil}h`}
                    </p>
                    <p className="text-[9px] text-[var(--c-text-muted)]/60">{formatMissionDate(ms.due_date)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Progress by Mission */}
      {progressByMission.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-[var(--c-text)] flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[var(--c-accent)]" />
            Progress per Mission
          </h2>
          <div className="rounded-2xl border border-[var(--c-border)] dark:border-white/[0.08] bg-[var(--c-card)] p-4 space-y-3">
            {progressByMission
              .sort((a, b) => b.progress - a.progress)
              .map((m) => {
                const gradient = GRADIENT_MAP[m.color ?? 'blue'] ?? GRADIENT_MAP.blue
                return (
                  <button
                    key={m.missionId}
                    type="button"
                    onClick={() => {
                      const missionEl = document.querySelector(`[data-mission-id="${m.missionId}"]`) as HTMLElement
                      missionEl?.click()
                    }}
                    className="w-full group/bar text-left"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-[var(--c-text)] group-hover/bar:text-[var(--c-accent)] transition-colors truncate flex-1">{m.title}</span>
                      <span className="text-[11px] font-extrabold text-[var(--c-text)] tabular-nums ml-2">{m.progress}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-[var(--c-border)]/40 dark:bg-white/10 overflow-hidden">
                      <div
                        className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-700', gradient)}
                        style={{ width: `${m.progress}%` }}
                      />
                    </div>
                  </button>
                )
              })}
          </div>
        </div>
      )}
    </div>
  )
}
