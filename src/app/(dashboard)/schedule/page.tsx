'use client'

import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import {
  CalendarDays, List, LayoutDashboard, Plus, Clock, CheckCircle2, TrendingUp,
  Calendar, CalendarRange, Filter, X,
} from 'lucide-react'
import { useScheduleWeek, useCreateEvent } from '@/lib/queries/schedule-queries'
import { WeeklyCalendar } from '@/components/schedule/weekly-calendar'
import { AgendaView } from '@/components/schedule/agenda-view'
import { MonthCalendar } from '@/components/schedule/month-calendar'
import { DayView } from '@/components/schedule/day-view'
import { ScheduleDashboardView } from '@/components/schedule/schedule-dashboard-view'
import { EventDetailDrawer } from '@/components/schedule/event-detail-drawer'
import { EventFormDialog } from '@/components/schedule/event-form-dialog'
import { getTodayStr, getCategoryConfig } from '@/lib/services/schedule.service'
import type { ScheduleEventRow, ScheduleCategory } from '@/lib/types/schedule'

type ViewMode = 'month' | 'week' | 'day' | 'agenda' | 'dashboard'

const VIEW_TABS: { value: ViewMode; label: string; icon: React.ElementType; shortLabel: string }[] = [
  { value: 'month', label: 'Bulan', icon: Calendar, shortLabel: 'Bln' },
  { value: 'week', label: 'Minggu', icon: CalendarRange, shortLabel: 'Mgg' },
  { value: 'day', label: 'Hari (Time Block)', icon: Clock, shortLabel: 'Hari' },
  { value: 'agenda', label: 'Hari Ini', icon: List, shortLabel: 'Agenda' },
  { value: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, shortLabel: 'Dash' },
]

const CATEGORY_FILTERS: { value: ScheduleCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'Semua' },
  { value: 'work', label: 'Kerja' },
  { value: 'personal', label: 'Pribadi' },
  { value: 'health', label: 'Kesehatan' },
  { value: 'education', label: 'Pendidikan' },
  { value: 'social', label: 'Sosial' },
  { value: 'finance', label: 'Keuangan' },
  { value: 'creative', label: 'Kreatif' },
  { value: 'general', label: 'Umum' },
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

// ─── Page ──────────────────────────────────────────────

export default function SchedulePage() {
  const [viewMode, setViewMode] = useState<ViewMode>('week')
  const [drawerEvent, setDrawerEvent] = useState<ScheduleEventRow | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<ScheduleEventRow | null>(null)
  const [selectedDayDate, setSelectedDayDate] = useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<ScheduleCategory | 'all'>('all')
  const [showFilter, setShowFilter] = useState(false)
  const { data: weekData } = useScheduleWeek()

  // Stats from week data
  const todayStr = getTodayStr()
  const todaySummary = weekData?.days.find((d) => d.date === todayStr)
  const totalWeek = weekData?.days.reduce((s, d) => s + d.totalEvents, 0) ?? 0
  const completedWeek = weekData?.days.reduce((s, d) => s + d.completedEvents, 0) ?? 0

  const handleEventClick = useCallback((event: ScheduleEventRow) => {
    setDrawerEvent(event)
    setDrawerOpen(true)
  }, [])

  const handleEdit = useCallback((event: ScheduleEventRow) => {
    setDrawerOpen(false)
    setEditingEvent(event)
    setFormOpen(true)
  }, [])

  const handleMonthDateSelect = useCallback((date: string) => {
    setSelectedDayDate(date)
    setViewMode('day')
  }, [])

  const hasActiveFilter = categoryFilter !== 'all'

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 text-[var(--c-text)]">Schedule</h1>
          <p className="text-sm text-[var(--c-text-muted)] mt-0.5">Kalender, time blocking, dan agenda harian.</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Category Filter Toggle */}
          <button type="button" onClick={() => setShowFilter(!showFilter)}
            className={cn(
              'h-10 w-10 flex items-center justify-center rounded-xl border transition-all',
              hasActiveFilter
                ? 'border-[var(--c-accent)] bg-[var(--c-accent)]/10 text-[var(--c-accent)]'
                : 'border-[var(--c-border)] dark:border-white/10 text-[var(--c-text-muted)] hover:text-[var(--c-text)] hover:bg-[var(--c-surface)] dark:hover:bg-white/5',
            )}>
            <Filter className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => { setEditingEvent(null); setFormOpen(true) }}
            className="h-10 px-5 rounded-xl bg-[var(--c-accent)] text-white text-sm font-bold shadow-lg shadow-[var(--c-accent)]/25 dark:shadow-[var(--c-accent)]/15 hover:shadow-xl hover:shadow-[var(--c-accent)]/30 hover:brightness-110 active:scale-[0.97] transition-all flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Event Baru</span>
          </button>
        </div>
      </div>

      {/* Category Filter Bar */}
      {showFilter && (
        <div className="rounded-xl border border-[var(--c-border)] dark:border-white/[0.08] bg-[var(--c-card)] p-2 flex flex-wrap items-center gap-1.5 animate-fade-in">
          {CATEGORY_FILTERS.map((cat) => {
            const conf = cat.value !== 'all' ? getCategoryConfig(cat.value) : null
            const isActive = categoryFilter === cat.value
            return (
              <button key={cat.value} type="button" onClick={() => setCategoryFilter(cat.value)}
                className={cn(
                  'px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-all duration-200 flex items-center gap-1.5',
                  isActive
                    ? 'bg-[var(--c-accent)] text-white shadow-sm shadow-[var(--c-accent)]/25'
                    : 'text-[var(--c-text-muted)] hover:text-[var(--c-text)] hover:bg-[var(--c-surface)] dark:hover:bg-white/5',
                )}>
                {conf && <span className={cn('h-2 w-2 rounded-full', conf.dot)} />}
                {cat.label}
              </button>
            )
          })}
          {hasActiveFilter && (
            <button type="button" onClick={() => setCategoryFilter('all')}
              className="ml-auto h-6 w-6 flex items-center justify-center rounded-lg text-[var(--c-text-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition-colors">
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      )}

      {/* Stats Row (hidden in dashboard mode) */}
      {viewMode !== 'dashboard' && (
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
      )}

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
                <span className="hidden md:inline">{tab.label}</span>
                <span className="md:hidden">{tab.shortLabel}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* View Content */}
      {viewMode === 'month' && (
        <MonthCalendar
          onDateSelect={handleMonthDateSelect}
          onEventClick={handleEventClick}
        />
      )}
      {viewMode === 'week' && (
        <WeeklyCalendar onEventClick={handleEventClick} />
      )}
      {viewMode === 'day' && (
        <DayView
          date={selectedDayDate ?? undefined}
          onDateChange={setSelectedDayDate}
          onEventClick={handleEventClick}
        />
      )}
      {viewMode === 'agenda' && (
        <AgendaView onEventClick={handleEventClick} />
      )}
      {viewMode === 'dashboard' && (
        <ScheduleDashboardView />
      )}

      {/* Event Detail Drawer */}
      <EventDetailDrawer
        event={drawerEvent}
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setDrawerEvent(null) }}
        onEdit={handleEdit}
      />

      {/* Event Form Dialog (for editing from drawer or page) */}
      <EventFormDialog
        open={formOpen}
        onOpenChange={(v) => { setFormOpen(v); if (!v) setEditingEvent(null) }}
        event={editingEvent}
      />
    </div>
  )
}
