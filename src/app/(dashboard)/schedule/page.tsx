'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  CalendarDays, List, LayoutDashboard, Plus, Clock, CheckCircle2, TrendingUp,
} from 'lucide-react'
import { useScheduleWeek, useCreateEvent } from '@/lib/queries/schedule-queries'
import { WeeklyCalendar } from '@/components/schedule/weekly-calendar'
import { AgendaView } from '@/components/schedule/agenda-view'
import { EventFormDialog } from '@/components/schedule/event-form-dialog'
import { getTodayStr, getEventColor, formatTime, getCategoryConfig, isToday } from '@/lib/services/schedule.service'
import type { ScheduleEventRow } from '@/lib/types/schedule'

type ViewMode = 'week' | 'agenda'

const VIEW_TABS: { value: ViewMode; label: string; icon: React.ElementType }[] = [
  { value: 'week', label: 'Minggu', icon: CalendarDays },
  { value: 'agenda', label: 'Hari Ini', icon: List },
]

// ─── Stat Card ─────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ElementType; color: string }) {
  return (
    <div className="rounded-2xl border border-[var(--c-border)] dark:border-white/[0.08] bg-[var(--c-card)] p-4 space-y-3 transition-all duration-300 hover:shadow-[var(--shadow-elevated)] dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 relative overflow-hidden">
      <div className={cn('absolute -top-6 -right-6 h-20 w-20 rounded-full blur-2xl opacity-30 dark:opacity-20 pointer-events-none', color)}></div>
      <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center shadow-sm dark:shadow-[0_4px_16px_rgba(0,0,0,0.4)]', color)}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <p className="text-2xl font-extrabold text-[var(--c-text)] tabular-nums tracking-tight leading-none relative">{value}</p>
      <p className="text-[11px] text-[var(--c-text-muted)] font-medium relative">{label}</p>
    </div>
  )
}

export default function SchedulePage() {
  const [viewMode, setViewMode] = useState<ViewMode>('week')
  const [detailEvent, setDetailEvent] = useState<ScheduleEventRow | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const { data: weekData } = useScheduleWeek()

  // Stats from week data
  const todayStr = getTodayStr()
  const todaySummary = weekData?.days.find((d) => d.date === todayStr)
  const totalWeek = weekData?.days.reduce((s, d) => s + d.totalEvents, 0) ?? 0
  const completedWeek = weekData?.days.reduce((s, d) => s + d.completedEvents, 0) ?? 0

  function handleEventClick(event: ScheduleEventRow) {
    setDetailEvent(event)
    setFormOpen(true)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 text-[var(--c-text)]">Schedule</h1>
          <p className="text-sm text-[var(--c-text-muted)] mt-0.5">Kalender, time blocking, dan agenda harian.</p>
        </div>
        <button type="button" onClick={() => { setDetailEvent(null); setFormOpen(true) }}
          className="h-10 px-5 rounded-xl bg-[var(--c-accent)] text-white text-sm font-bold shadow-lg shadow-[var(--c-accent)]/25 dark:shadow-[var(--c-accent)]/15 hover:shadow-xl hover:shadow-[var(--c-accent)]/30 hover:brightness-110 active:scale-[0.97] transition-all flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Event Baru</span>
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Event Minggu Ini" value={totalWeek} icon={CalendarDays} color="bg-gradient-to-br from-blue-500 to-blue-600" />
        <StatCard label="Hari Ini" value={todaySummary?.totalEvents ?? 0} icon={Clock} color="bg-gradient-to-br from-sky-500 to-sky-600" />
        <StatCard label="Selesai Minggu Ini" value={completedWeek} icon={CheckCircle2} color="bg-gradient-to-br from-emerald-500 to-emerald-600" />
        <StatCard
          label="Completion Rate"
          value={totalWeek > 0 ? `${Math.round((completedWeek / totalWeek) * 100)}%` : '0%'}
          icon={TrendingUp}
          color="bg-gradient-to-br from-violet-500 to-violet-600"
        />
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--c-surface)] dark:bg-white/[0.04] border border-[var(--c-border)] dark:border-white/[0.08]">
          {VIEW_TABS.map((tab) => {
            const TabIcon = tab.icon
            return (
              <button key={tab.value} type="button" onClick={() => setViewMode(tab.value)}
                className={cn(
                  'px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center gap-1.5',
                  viewMode === tab.value
                    ? 'bg-[var(--c-accent)] text-white shadow-sm shadow-[var(--c-accent)]/25'
                    : 'text-[var(--c-text-muted)] hover:text-[var(--c-text)]',
                )}>
                <TabIcon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* View Content */}
      {viewMode === 'week' ? (
        <WeeklyCalendar onEventClick={handleEventClick} />
      ) : (
        <AgendaView onEventClick={handleEventClick} />
      )}

      {/* Event Form (for editing from calendar) */}
      <EventFormDialog
        open={formOpen}
        onOpenChange={(v) => { setFormOpen(v); if (!v) setDetailEvent(null) }}
        event={detailEvent}
      />
    </div>
  )
}
