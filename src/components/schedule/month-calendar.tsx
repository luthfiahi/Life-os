'use client'

import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useScheduleMonth, useCreateEvent } from '@/lib/queries/schedule-queries'
import { EventFormDialog } from './event-form-dialog'
import {
  getMonthCalendarGrid, isToday, getTodayStr, getCategoryConfig,
} from '@/lib/services/schedule.service'
import type { ScheduleEventRow, ScheduleCategory } from '@/lib/types/schedule'

const DAY_NAMES_SHORT = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

const MAX_DOTS = 3

interface MonthCalendarProps {
  onDateSelect?: (date: string) => void
  onEventClick?: (event: ScheduleEventRow) => void
}

export function MonthCalendar({ onDateSelect, onEventClick }: MonthCalendarProps) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [formOpen, setFormOpen] = useState(false)
  const [defaultDate, setDefaultDate] = useState(getTodayStr())
  const { data, isLoading } = useScheduleMonth(year, month)

  const grid = useMemo(() => getMonthCalendarGrid(year, month), [year, month])

  function goBack() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }

  function goForward() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  function goToToday() {
    setYear(today.getFullYear())
    setMonth(today.getMonth())
  }

  function handleDayClick(date: string | null) {
    if (!date) return
    onDateSelect?.(date)
  }

  function handleDayDoubleClick(date: string | null) {
    if (!date) return
    setDefaultDate(date)
    setFormOpen(true)
  }

  function getDaySummary(date: string) {
    return data?.days.find((d) => d.date === date)
  }

  function getDayEvents(date: string) {
    return (data?.events ?? []).filter((e) => e.event_date === date)
  }

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 rounded-xl bg-[var(--c-surface)] dark:bg-white/[0.04]" />
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-[var(--c-surface)] dark:bg-white/[0.04]" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button type="button" onClick={goBack}
            className="h-9 w-9 flex items-center justify-center rounded-xl border border-[var(--c-border)] dark:border-white/10 hover:bg-[var(--c-surface)] dark:hover:bg-white/5 transition-colors">
            <ChevronLeft className="h-4 w-4 text-[var(--c-text)]" />
          </button>
          <button type="button" onClick={goToToday}
            className="h-9 px-4 rounded-xl text-xs font-bold border border-[var(--c-border)] dark:border-white/10 text-[var(--c-text-muted)] hover:text-[var(--c-text)] hover:bg-[var(--c-surface)] dark:hover:bg-white/5 transition-colors">
            Hari ini
          </button>
          <button type="button" onClick={goForward}
            className="h-9 w-9 flex items-center justify-center rounded-xl border border-[var(--c-border)] dark:border-white/10 hover:bg-[var(--c-surface)] dark:hover:bg-white/5 transition-colors">
            <ChevronRight className="h-4 w-4 text-[var(--c-text)]" />
          </button>
          <h2 className="text-sm font-bold text-[var(--c-text)] ml-2">
            {MONTH_NAMES[month]} {year}
          </h2>
        </div>
        <button type="button" onClick={() => { setDefaultDate(getTodayStr()); setFormOpen(true) }}
          className="h-9 px-4 rounded-xl bg-[var(--c-accent)] text-white text-xs font-bold shadow-md shadow-[var(--c-accent)]/25 hover:brightness-110 active:scale-[0.97] transition-all flex items-center gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Event
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-2xl border border-[var(--c-border)] dark:border-white/[0.08] bg-[var(--c-card)] overflow-hidden dark:shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-[var(--c-border)] dark:border-white/[0.08]">
          {DAY_NAMES_SHORT.map((name) => (
            <div key={name} className="py-2.5 text-center text-[10px] font-bold uppercase tracking-widest text-[var(--c-text-muted)]">
              {name}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {grid.map((dateStr, idx) => {
            if (!dateStr) {
              return <div key={`empty-${idx}`} className="min-h-[100px] border-b border-r border-[var(--c-border)]/30 dark:border-white/[0.04] bg-[var(--c-surface)]/30 dark:bg-white/[0.01]" />
            }

            const dayDate = new Date(dateStr + 'T00:00:00')
            const dayNum = dayDate.getDate()
            const today = isToday(dateStr)
            const summary = getDaySummary(dateStr)
            const events = getDayEvents(dateStr)
            const isCurrentMonth = dayDate.getMonth() === month

            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => handleDayClick(dateStr)}
                onDoubleClick={() => handleDayDoubleClick(dateStr)}
                className={cn(
                  'min-h-[100px] border-b border-r border-[var(--c-border)]/30 dark:border-white/[0.04] p-1.5 text-left transition-all duration-200 relative group',
                  'hover:bg-[var(--c-surface)] dark:hover:bg-white/[0.04]',
                  today && 'bg-[var(--c-accent)]/[0.06] dark:bg-[var(--c-accent)]/[0.08]',
                  !isCurrentMonth && 'opacity-40',
                )}
              >
                {/* Date number */}
                <div className="flex items-center justify-between mb-1">
                  <span className={cn(
                    'text-xs font-bold tabular-nums inline-flex h-6 w-6 items-center justify-center rounded-lg transition-colors',
                    today
                      ? 'bg-[var(--c-accent)] text-white shadow-sm shadow-[var(--c-accent)]/30'
                      : 'text-[var(--c-text)]',
                  )}>
                    {dayNum}
                  </span>
                  {summary && summary.totalEvents > MAX_DOTS && (
                    <span className="text-[9px] font-bold text-[var(--c-text-muted)]">+{summary.totalEvents - MAX_DOTS}</span>
                  )}
                </div>

                {/* Event dots */}
                {events.length > 0 && (
                  <div className="space-y-0.5">
                    {events.slice(0, MAX_DOTS).map((ev) => {
                      const cat = getCategoryConfig(ev.category)
                      return (
                        <div
                          key={ev.id}
                          onClick={(e) => { e.stopPropagation(); onEventClick?.(ev) }}
                          className={cn(
                            'text-[9px] font-medium px-1 py-px rounded truncate cursor-pointer transition-colors hover:opacity-80',
                            cat.bg, cat.color,
                            ev.is_completed && 'line-through opacity-50',
                          )}
                        >
                          {ev.is_all_day ? `${ev.title}` : `${ev.start_time?.slice(0, 5) ?? ''} ${ev.title}`}
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Hover add button */}
                <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="h-5 w-5 rounded-md bg-[var(--c-accent)]/10 dark:bg-[var(--c-accent)]/20 flex items-center justify-center">
                    <Plus className="h-3 w-3 text-[var(--c-accent)]" />
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Month Summary */}
      {data && (
        <div className="flex items-center gap-4 px-1">
          <span className="text-xs text-[var(--c-text-muted)]">
            Total <span className="font-bold text-[var(--c-text)]">{data.events.length}</span> event di {MONTH_NAMES[month]}
          </span>
          <span className="text-xs text-[var(--c-text-muted)]">
            Rata-rata <span className="font-bold text-[var(--c-text)]">{data.days.length > 0 ? (data.events.length / data.days.length).toFixed(1) : 0}</span> event/hari
          </span>
        </div>
      )}

      <EventFormDialog open={formOpen} onOpenChange={setFormOpen} defaultDate={defaultDate} />
    </div>
  )
}
