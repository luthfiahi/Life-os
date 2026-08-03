'use client'

import { cn } from '@/lib/utils'
import {
  CalendarDays, Clock, CheckCircle2, TrendingUp, Zap,
  BarChart3, Target, ArrowRight, Flame, Coffee, Calendar,
} from 'lucide-react'
import { useScheduleAnalytics, useUpcomingEvents } from '@/lib/queries/schedule-queries'
import { formatTime, formatShortDate, getCategoryConfig, getTodayStr } from '@/lib/services/schedule.service'
import type { ScheduleAnalytics } from '@/lib/services/schedule.service'

// ─── SVG Ring ───────────────────────────────────────────

function CompletionRing({ percent, size = 80 }: { percent: number; size?: number }) {
  const strokeWidth = 6
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const progress = (percent / 100) * circumference
  const color = percent >= 80 ? '#10b981' : percent >= 50 ? '#f59e0b' : '#6366f1'

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
          className="stroke-[var(--c-border)]/30 dark:stroke-white/10" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={circumference - progress}
          strokeLinecap="round" className="transition-all duration-1000 ease-out" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-extrabold tabular-nums text-[var(--c-text)]" style={{ color }}>{percent}%</p>
          <p className="text-[9px] font-bold text-[var(--c-text-muted)]">Selesai</p>
        </div>
      </div>
    </div>
  )
}

// ─── Utilization Gauge ─────────────────────────────────

function UtilizationGauge({ percent }: { percent: number }) {
  const color = percent > 80 ? 'from-rose-500 to-red-500' : percent > 50 ? 'from-amber-500 to-orange-500' : 'from-emerald-500 to-teal-500'
  const label = percent > 80 ? 'Sangat Sibuk' : percent > 50 ? 'Cukup Padat' : 'Relatif Luang'

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-[var(--c-text-muted)]">Utilisasi Hari Ini</span>
        <span className="text-xs font-extrabold text-[var(--c-text)] tabular-nums">{percent}%</span>
      </div>
      <div className="h-3 rounded-full bg-[var(--c-border)]/30 dark:bg-white/10 overflow-hidden">
        <div className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-1000 ease-out', color)}
          style={{ width: `${Math.min(100, percent)}%` }} />
      </div>
      <p className={cn('text-[10px] font-bold',
        percent > 80 ? 'text-rose-500' : percent > 50 ? 'text-amber-500' : 'text-emerald-500'
      )}>
        {label}
      </p>
    </div>
  )
}

// ─── Dashboard View ─────────────────────────────────────

export function ScheduleDashboardView() {
  const { data: analytics, isLoading } = useScheduleAnalytics()
  const { data: upcoming } = useUpcomingEvents(10)

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-40 rounded-2xl bg-[var(--c-surface)] dark:bg-white/[0.04]" />
        ))}
      </div>
    )
  }

  if (!analytics) return null

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <DashStatCard
          label="Event Minggu Ini" value={analytics.totalWeek} icon={CalendarDays}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <DashStatCard
          label="Selesai" value={analytics.completedWeek} icon={CheckCircle2}
          color="bg-gradient-to-br from-emerald-500 to-emerald-600"
        />
        <DashStatCard
          label="Rata-rata/Hari" value={analytics.avgEventsPerDay} icon={BarChart3}
          color="bg-gradient-to-br from-violet-500 to-violet-600"
        />
        <DashStatCard
          label="Event Mendatang" value={analytics.upcomingCount} icon={Target}
          color="bg-gradient-to-br from-sky-500 to-sky-600"
        />
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Completion Rate Ring */}
        <div className="rounded-2xl border border-[var(--c-border)] dark:border-white/[0.08] bg-[var(--c-card)] p-5 flex flex-col items-center justify-center space-y-3 relative overflow-hidden dark:shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
          <div className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-gradient-to-br from-blue-500/10 to-sky-500/10 dark:from-blue-500/5 dark:to-sky-500/5 blur-2xl pointer-events-none" />
          <h3 className="text-xs font-bold text-[var(--c-text-muted)] uppercase tracking-widest relative">Completion Rate</h3>
          <CompletionRing percent={analytics.completionRate} size={100} />
          <p className="text-xs text-[var(--c-text-muted)] relative">
            {analytics.totalWeek > 0
              ? `${analytics.completedWeek} dari ${analytics.totalWeek} event selesai`
              : 'Belum ada event minggu ini'
            }
          </p>
        </div>

        {/* Today Utilization */}
        <div className="rounded-2xl border border-[var(--c-border)] dark:border-white/[0.08] bg-[var(--c-card)] p-5 space-y-4 relative overflow-hidden dark:shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
          <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:from-amber-500/5 dark:to-orange-500/5 blur-2xl pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-sm">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-xs font-bold text-[var(--c-text-muted)] uppercase tracking-widest">Hari Ini</h3>
            </div>
            <UtilizationGauge percent={analytics.todayUtilization} />
          </div>

          {/* Mini day stats */}
          <div className="grid grid-cols-2 gap-2 relative">
            <MiniStat label="Total Hari Ini" value={analytics.totalWeek > 0 ? `${Math.round(analytics.totalWeek / 7)}` : '0'} />
            <MiniStat label="Hari Tersibuk" value={analytics.busiestDayCount > 0 ? `${analytics.busiestDayCount} event` : '-'} />
          </div>
        </div>

        {/* Category Distribution */}
        <div className="rounded-2xl border border-[var(--c-border)] dark:border-white/[0.08] bg-[var(--c-card)] p-5 space-y-4 relative overflow-hidden dark:shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
          <div className="absolute -top-8 -left-8 h-24 w-24 rounded-full bg-gradient-to-br from-violet-500/10 to-pink-500/10 dark:from-violet-500/5 dark:to-pink-500/5 blur-2xl pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-sm">
                <BarChart3 className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-xs font-bold text-[var(--c-text-muted)] uppercase tracking-widest">Distribusi Kategori</h3>
            </div>
            {analytics.byCategory.length === 0 ? (
              <p className="text-xs text-[var(--c-text-muted)] text-center py-6">Belum ada data</p>
            ) : (
              <div className="space-y-2">
                {analytics.byCategory
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 6)
                  .map(({ category, count, completed }) => {
                    const conf = getCategoryConfig(category)
                    const total = analytics.totalWeek || 1
                    const pct = Math.round((count / total) * 100)
                    return (
                      <div key={category} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className={cn('h-2 w-2 rounded-full', conf.dot)} />
                            <span className="text-[11px] font-medium text-[var(--c-text)]">{conf.label}</span>
                          </div>
                          <span className="text-[10px] font-bold text-[var(--c-text-muted)] tabular-nums">{count}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-[var(--c-border)]/30 dark:bg-white/10 overflow-hidden">
                            <div className={cn('h-full rounded-full transition-all duration-500', conf.dot)} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[9px] font-bold text-[var(--c-text-muted)] w-8 text-right tabular-nums">{pct}%</span>
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Events List */}
      {upcoming && upcoming.length > 0 && (
        <div className="rounded-2xl border border-[var(--c-border)] dark:border-white/[0.08] bg-[var(--c-card)] p-5 space-y-3 relative overflow-hidden dark:shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
          <div className="flex items-center justify-between relative">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-sky-500 to-blue-500 flex items-center justify-center shadow-sm">
                <ArrowRight className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-xs font-bold text-[var(--c-text-muted)] uppercase tracking-widest">Event Mendatang</h3>
            </div>
          </div>
          <div className="space-y-1.5">
            {upcoming.filter(e => !e.is_completed).slice(0, 8).map((ev) => {
              const cat = getCategoryConfig(ev.category)
              const isTodayEvent = ev.event_date === getTodayStr()
              return (
                <div key={ev.id}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[var(--c-surface)] dark:hover:bg-white/[0.04] transition-colors">
                  <div className={cn('w-1 h-8 rounded-full shrink-0', cat.dot)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--c-text)] truncate">{ev.title}</p>
                    <p className="text-[11px] text-[var(--c-text-muted)] flex items-center gap-1.5">
                      <span className={cn('px-1 py-px rounded text-[9px] font-bold',
                        isTodayEvent ? 'bg-[var(--c-accent)]/10 text-[var(--c-accent)]' : cat.bg, cat.color
                      )}>
                        {isTodayEvent ? 'Hari ini' : formatShortDate(ev.event_date)}
                      </span>
                      {!ev.is_all_day && ev.start_time && (
                        <span className="tabular-nums">{formatTime(ev.start_time)}</span>
                      )}
                      {ev.location && <span className="text-[var(--c-text-muted)]/50">- {ev.location}</span>}
                    </p>
                  </div>
                  {ev.repeat_type && (
                    <span className="text-[9px] font-bold text-[var(--c-text-muted)] px-1.5 py-0.5 rounded-lg bg-[var(--c-surface)] dark:bg-white/[0.06]">
                      Ulang
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Stat Card ──────────────────────────────────────────

function DashStatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ElementType; color: string }) {
  return (
    <div className="rounded-2xl border border-[var(--c-border)] dark:border-white/[0.08] bg-[var(--c-card)] p-4 space-y-3 transition-all duration-300 hover:shadow-[var(--shadow-elevated)] dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 relative overflow-hidden">
      <div className={cn('absolute -top-6 -right-6 h-20 w-20 rounded-full blur-2xl opacity-30 dark:opacity-20 pointer-events-none', color)} />
      <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center shadow-sm dark:shadow-[0_4px_16px_rgba(0,0,0,0.4)]', color)}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <p className="text-2xl font-extrabold text-[var(--c-text)] tabular-nums tracking-tight leading-none relative">{value}</p>
      <p className="text-[11px] text-[var(--c-text-muted)] font-medium relative">{label}</p>
    </div>
  )
}

// ─── Mini Stat ──────────────────────────────────────────

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[var(--c-surface)] dark:bg-white/[0.04] p-2.5">
      <p className="text-[10px] text-[var(--c-text-muted)]">{label}</p>
      <p className="text-sm font-bold text-[var(--c-text)] tabular-nums mt-0.5">{value}</p>
    </div>
  )
}
