'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import {
  Activity, TrendingUp, AlertTriangle, Flame, Clock, ChevronRight,
  Target, Rocket, CheckCircle2, CircleDot, Circle, Zap,
} from 'lucide-react'
import { useMissionDashboard, useMissions } from '@/lib/queries/mission-queries'
import { calculateMissionHealth, formatMissionDate, getHealthConfig, daysUntil } from '@/lib/services/mission.service'
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

const ICON_MAP: Record<string, React.ElementType> = {
  Target, Rocket, Flag: ChevronRight, Star: Zap, Trophy: CheckCircle2, Zap, Code: Rocket, BookOpen: Target, Dumbbell: Rocket, Heart: CheckCircle2,
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

// ─── Completion Rate Ring ───────────────────────────────
function CompletionRateRing({ rate, total, completed }: { rate: number; total: number; completed: number }) {
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (rate / 100) * circumference
  const color = rate >= 70 ? 'stroke-emerald-500' : rate >= 40 ? 'stroke-amber-500' : 'stroke-violet-500'
  const textColor = rate >= 70 ? 'text-emerald-500' : rate >= 40 ? 'text-amber-500' : 'text-violet-500'

  return (
    <div className="rounded-2xl border border-[var(--c-border)] dark:border-white/[0.08] bg-[var(--c-card)] p-5">
      <h3 className="text-sm font-bold text-[var(--c-text)] mb-4 flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        Completion Rate
      </h3>
      <div className="flex items-center justify-center">
        <div className="relative h-[96px] w-[96px]">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r={radius} fill="none" className="dark:stroke-white/10" stroke="var(--c-border)" strokeWidth="6" opacity="0.3" />
            <circle cx="48" cy="48" r={radius} fill="none" className={cn(color, 'transition-all duration-1000 ease-out')} strokeWidth="6" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn('text-2xl font-extrabold tabular-nums', textColor)}>{rate}%</span>
          </div>
        </div>
      </div>
      <div className="flex justify-center gap-4 mt-3 text-[11px] text-[var(--c-text-muted)]">
        <span className="font-medium">{total} total</span>
        <span className="text-emerald-500 font-bold">{completed} selesai</span>
      </div>
    </div>
  )
}

// ─── Mission Timeline ──────────────────────────────────
function MissionTimeline({ missions, onMissionClick }: { missions: MissionRow[]; onMissionClick?: (m: MissionRow) => void }) {
  const sorted = useMemo(() => {
    return [...missions]
      .filter((m) => m.target_date)
      .sort((a, b) => a.target_date!.localeCompare(b.target_date!))
  }, [missions])

  if (sorted.length === 0) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString().split('T')[0]

  // Find date range
  const dates = sorted.map((m) => m.target_date!).sort()
  const minDate = new Date(dates[0] + 'T00:00:00')
  const maxDate = new Date(dates[dates.length - 1] + 'T00:00:00')
  const totalDays = Math.max(1, Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)))

  return (
    <div className="rounded-2xl border border-[var(--c-border)] dark:border-white/[0.08] bg-[var(--c-card)] p-5 space-y-4">
      <h3 className="text-sm font-bold text-[var(--c-text)] flex items-center gap-2">
        <Activity className="h-4 w-4 text-[var(--c-accent)]" />
        Timeline Mission
      </h3>

      {/* Visual timeline bar */}
      <div className="relative">
        {/* Base line */}
        <div className="h-2 rounded-full bg-[var(--c-border)]/30 dark:bg-white/10 w-full" />

        {/* Today marker */}
        {todayStr >= dates[0] && todayStr <= dates[dates.length - 1] && (
          <div
            className="absolute top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[var(--c-accent)] rounded-full z-10"
            style={{ left: `${Math.min(100, Math.max(0, ((today.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) / totalDays * 100))}%` }}
          >
            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-[var(--c-accent)] whitespace-nowrap">Hari ini</span>
          </div>
        )}

        {/* Mission dots */}
        {sorted.map((m) => {
          const pos = Math.min(100, Math.max(0, ((new Date(m.target_date! + 'T00:00:00').getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) / totalDays * 100))
          const gradient = GRADIENT_MAP[m.color ?? 'blue'] ?? GRADIENT_MAP.blue
          const isCompleted = m.status === 'completed'
          const isOverdue = m.status === 'active' && m.target_date && new Date(m.target_date + 'T23:59:59') < new Date()

          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onMissionClick?.(m)}
              className={cn(
                'absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-4 w-4 rounded-full border-2 border-[var(--c-card)] z-20 transition-all hover:scale-150 hover:z-30',
                isCompleted ? 'bg-emerald-500' : isOverdue ? 'bg-rose-500' : `bg-gradient-to-br ${gradient}`,
              )}
              style={{ left: `${pos}%` }}
              title={`${m.title} — ${formatMissionDate(m.target_date)}`}
            />
          )
        })}
      </div>

      {/* Mission list under timeline */}
      <div className="space-y-2 mt-4">
        {sorted.map((m) => {
          const isCompleted = m.status === 'completed'
          const isOverdue = m.status === 'active' && m.target_date && new Date(m.target_date + 'T23:59:59') < new Date()
          const health = calculateMissionHealth(m)
          const progressVal = Math.min(Math.round(Number(m.progress)), 100)
          const gradient = GRADIENT_MAP[m.color ?? 'blue'] ?? GRADIENT_MAP.blue

          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onMissionClick?.(m)}
              className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-[var(--c-surface)] dark:hover:bg-white/[0.04] transition-colors text-left group/row"
            >
              <div className={cn(
                'h-2 w-2 rounded-full shrink-0',
                isCompleted ? 'bg-emerald-500' : isOverdue ? 'bg-rose-500' : `bg-gradient-to-br ${gradient}`,
              )} />
              <div className="flex-1 min-w-0">
                <p className={cn(
                  'text-xs font-medium truncate transition-colors group-hover/row:text-[var(--c-accent)]',
                  isCompleted && 'line-through text-[var(--c-text-muted)]',
                  !isCompleted && 'text-[var(--c-text)]',
                )}>{m.title}</p>
              </div>
              {m.status === 'active' && <MissionHealthBadge health={health.health} size="sm" />}
              <span className="text-[10px] text-[var(--c-text-muted)] tabular-nums shrink-0">{formatMissionDate(m.target_date)}</span>
              <div className="w-16 h-1.5 rounded-full bg-[var(--c-border)]/30 dark:bg-white/10 overflow-hidden shrink-0">
                <div className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-700', gradient)} style={{ width: `${progressVal}%` }} />
              </div>
              <span className="text-[10px] font-bold text-[var(--c-text)] tabular-nums w-7 text-right shrink-0">{progressVal}%</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main Dashboard View ────────────────────────────────

export function MissionDashboardView({ onMissionClick }: MissionDashboardViewProps) {
  const { data, isLoading } = useMissionDashboard()
  const { data: allMissions } = useMissions()

  // Compute completion rate
  const completionRate = useMemo(() => {
    if (!allMissions || allMissions.length === 0) return { rate: 0, total: 0, completed: 0 }
    const total = allMissions.length
    const completed = allMissions.filter((m) => m.status === 'completed').length
    return { rate: total > 0 ? Math.round((completed / total) * 100) : 0, total, completed }
  }, [allMissions])

  if (isLoading || !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-20 rounded-2xl bg-[var(--c-surface)] dark:bg-white/[0.04]" />)}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-36 rounded-2xl bg-[var(--c-surface)] dark:bg-white/[0.04]" />)}
        </div>
      </div>
    )
  }

  const { healthSummary, upcomingMilestones, progressByMission, priorityMatrix } = data
  const activeMissions = allMissions?.filter((m) => m.status === 'active') ?? []

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

      {/* Completion Rate + Priority Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-3">
          <CompletionRateRing
            rate={completionRate.rate}
            total={completionRate.total}
            completed={completionRate.completed}
          />
        </div>

        {/* Priority Matrix */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-sm font-bold text-[var(--c-text)] flex items-center gap-2">
            Priority Matrix
            <span className="text-[10px] font-bold text-[var(--c-text-muted)] bg-[var(--c-surface)] dark:bg-white/[0.04] px-1.5 py-0.5 rounded-md">Eisenhower</span>
          </h2>
          <PriorityMatrix matrix={priorityMatrix} onMissionClick={onMissionClick} />
        </div>
      </div>

      {/* Timeline */}
      {allMissions && allMissions.length > 0 && (
        <MissionTimeline missions={allMissions} onMissionClick={onMissionClick} />
      )}

      {/* Upcoming Milestones + Progress by Mission */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

        {/* Progress by Mission */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-sm font-bold text-[var(--c-text)] flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[var(--c-accent)]" />
            Progress per Mission
          </h2>
          <div className="rounded-2xl border border-[var(--c-border)] dark:border-white/[0.08] bg-[var(--c-card)] p-4 space-y-3">
            {progressByMission.length > 0
              ? progressByMission
                  .sort((a, b) => b.progress - a.progress)
                  .map((m) => {
                    const gradient = GRADIENT_MAP[m.color ?? 'blue'] ?? GRADIENT_MAP.blue
                    return (
                      <button
                        key={m.missionId}
                        type="button"
                        onClick={() => onMissionClick?.(activeMissions.find((am) => am.id === m.missionId) ?? { id: m.missionId, user_id: '', title: m.title, description: null, priority: 'medium' as const, status: 'active' as const, icon: null, color: m.color, start_date: null, target_date: null, progress: m.progress, is_pinned: false, notes: null, category: 'general' as const, created_at: '', updated_at: '' })}
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
                  })
              : (
                <div className="py-6 text-center">
                  <p className="text-sm text-[var(--c-text-muted)]">Belum ada mission aktif.</p>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  )
}
