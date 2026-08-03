'use client'

import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import {
  ChevronLeft, ChevronRight, Plus, Check, Clock, MapPin,
} from 'lucide-react'
import { useScheduleWeek, useCreateEvent, useToggleEventComplete, useDeleteEvent } from '@/lib/queries/schedule-queries'
import { EventFormDialog } from './event-form-dialog'
import {
  formatTime, formatShortDate, isToday, getTodayStr,
  getWeekDays, getWeekStart, getEventColor, getCategoryConfig,
  isTimePast, isTimeNow, buildAgenda,
} from '@/lib/services/schedule.service'
import type { ScheduleEventRow, ScheduleCategory } from '@/lib/types/schedule'

const DAY_NAMES = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
const HOURS = Array.from({ length: 16 }, (_, i) => i + 6) // 06:00 - 21:00

interface WeeklyCalendarProps {
  onEventClick?: (event: ScheduleEventRow) => void
}

export function WeeklyCalendar({ onEventClick }: WeeklyCalendarProps) {
  const [referenceDate, setReferenceDate] = useState(getTodayStr())
  const [formOpen, setFormOpen] = useState(false)
  const [defaultDate, setDefaultDate] = useState(getTodayStr())
  const { data, isLoading } = useScheduleWeek(referenceDate)
  const toggleComplete = useToggleEventComplete()
  const deleteEvent = useDeleteEvent()

  const weekDays = useMemo(() => getWeekDays(new Date(referenceDate + 'T00:00:00')), [referenceDate])

  function goToToday() {
    setReferenceDate(getTodayStr())
  }

  function goBack() {
    const d = new Date(referenceDate + 'T00:00:00')
    d.setDate(d.getDate() - 7)
    setReferenceDate(d.toISOString().split('T')[0])
  }

  function goForward() {
    const d = new Date(referenceDate + 'T00:00:00')
    d.setDate(d.getDate() + 7)
    setReferenceDate(d.toISOString().split('T')[0])
  }

  function handleDayClick(date: string) {
    setDefaultDate(date)
    setFormOpen(true)
  }

  // Get events for a specific day
  function getEventsForDay(date: string) {
    return (data?.events ?? []).filter((e) => e.event_date === date)
  }

  // Get timed events for the time grid
  function getTimedEventsForDay(date: string) {
    return getEventsForDay(date).filter((e) => !e.is_all_day)
  }

  function getAllDayEventsForDay(date: string) {
    return getEventsForDay(date).filter((e) => e.is_all_day)
  }

  function getEventTop(event: ScheduleEventRow): string {
    if (!event.start_time) return '0px'
    const [h, m] = event.start_time.split(':').map(Number)
    const minutesFrom6 = (h - 6) * 60 + m
    return `${(minutesFrom6 / 60) * 64}px` // 64px per hour
  }

  function getEventHeight(event: ScheduleEventRow): string {
    if (!event.start_time || !event.end_time) return '56px'
    const [sh, sm] = event.start_time.split(':').map(Number)
    const [eh, em] = event.end_time.split(':').map(Number)
    const durationMin = Math.max(30, (eh * 60 + em) - (sh * 60 + sm))
    return `${Math.max(28, (durationMin / 60) * 64 - 8)}px`
  }

  const weekLabel = useMemo(() => {
    const ws = weekDays[0]
    const we = weekDays[6]
    const startD = new Date(ws + 'T00:00:00')
    const endD = new Date(we + 'T00:00:00')
    const sameMonth = startD.getMonth() === endD.getMonth()
    if (sameMonth) {
      return `${startD.getDate()} - ${endD.getDate()} ${startD.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`
    }
    return `${formatShortDate(ws)} - ${formatShortDate(we)}`
  }, [weekDays])

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 rounded-xl bg-[var(--c-surface)] dark:bg-white/[0.04]" />
        <div className="grid grid-cols-7 gap-px">
          {Array.from({ length: 7 }).map((_, i) => <div key={i} className="h-24 rounded-lg bg-[var(--c-surface)] dark:bg-white/[0.04]" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button type="button" onClick={goBack} className="h-9 w-9 flex items-center justify-center rounded-xl border border-[var(--c-border)] dark:border-white/10 hover:bg-[var(--c-surface)] dark:hover:bg-white/5 transition-colors">
            <ChevronLeft className="h-4 w-4 text-[var(--c-text)]" />
          </button>
          <button type="button" onClick={goToToday}
            className="h-9 px-4 rounded-xl text-xs font-bold border border-[var(--c-border)] dark:border-white/10 text-[var(--c-text-muted)] hover:text-[var(--c-text)] hover:bg-[var(--c-surface)] dark:hover:bg-white/5 transition-colors">
            Hari ini
          </button>
          <button type="button" onClick={goForward} className="h-9 w-9 flex items-center justify-center rounded-xl border border-[var(--c-border)] dark:border-white/10 hover:bg-[var(--c-surface)] dark:hover:bg-white/5 transition-colors">
            <ChevronRight className="h-4 w-4 text-[var(--c-text)]" />
          </button>
          <h2 className="text-sm font-bold text-[var(--c-text)] ml-2">{weekLabel}</h2>
        </div>
        <button type="button" onClick={() => { setDefaultDate(getTodayStr()); setFormOpen(true) }}
          className="h-9 px-4 rounded-xl bg-[var(--c-accent)] text-white text-xs font-bold shadow-md shadow-[var(--c-accent)]/25 hover:brightness-110 active:scale-[0.97] transition-all flex items-center gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Event
        </button>
      </div>

      {/* Week Grid */}
      <div className="rounded-2xl border border-[var(--c-border)] dark:border-white/[0.08] bg-[var(--c-card)] overflow-hidden dark:shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
        {/* Day Headers */}
        <div className="grid grid-cols-8 border-b border-[var(--c-border)] dark:border-white/[0.08]">
          <div className="p-2 text-[10px] font-bold text-[var(--c-text-muted)] uppercase tracking-widest border-r border-[var(--c-border)] dark:border-white/[0.06]">
            Waktu
          </div>
          {weekDays.map((date, idx) => {
            const daySummary = data?.days.find((d) => d.date === date)
            const today = isToday(date)
            return (
              <button
                key={date}
                type="button"
                onClick={() => handleDayClick(date)}
                className={cn(
                  'p-2 text-center transition-colors hover:bg-[var(--c-surface)] dark:hover:bg-white/[0.04] relative',
                  today && 'bg-[var(--c-accent)]/5 dark:bg-[var(--c-accent)]/10',
                )}
              >
                <p className={cn('text-[10px] font-bold uppercase tracking-widest', today ? 'text-[var(--c-accent)]' : 'text-[var(--c-text-muted)]')}>{DAY_NAMES[idx]}</p>
                <p className={cn('text-lg font-extrabold tabular-nums mt-0.5', today ? 'text-[var(--c-accent)]' : 'text-[var(--c-text)]')}>{new Date(date + 'T00:00:00').getDate()}</p>
                {daySummary && daySummary.totalEvents > 0 && (
                  <div className="flex justify-center gap-0.5 mt-1">
                    {daySummary.allDayEvents > 0 && <span className="h-1 w-1 rounded-full bg-amber-500" />}
                    {daySummary.timedEvents > 0 && <span className="h-1 w-1 rounded-full bg-blue-500" />}
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Time Grid */}
        <div className="overflow-x-auto">
          <div className="grid grid-cols-8 min-w-[640px]">
            {/* Hour labels */}
            <div className="border-r border-[var(--c-border)] dark:border-white/[0.06]">
              {HOURS.map((hour) => (
                <div key={hour} className="h-16 border-b border-[var(--c-border)]/50 dark:border-white/[0.04] px-2 pt-0">
                  <span className="text-[10px] text-[var(--c-text-muted)] tabular-nums font-medium">
                    {hour.toString().padStart(2, '0')}:00
                  </span>
                </div>
              ))}
            </div>

            {/* Day columns */}
            {weekDays.map((date) => {
              const today = isToday(date)
              const allDay = getAllDayEventsForDay(date)
              const timed = getTimedEventsForDay(date)
              const nowHour = new Date().getHours()

              return (
                <div key={date} className={cn('relative border-r border-[var(--c-border)]/50 dark:border-white/[0.04] last:border-r-0',
                  today && 'bg-[var(--c-accent)]/[0.02]'
                )}>
                  {/* All-day events strip */}
                  {allDay.length > 0 && (
                    <div className="px-1 py-1 space-y-0.5 border-b border-[var(--c-border)]/50 dark:border-white/[0.04] bg-[var(--c-surface)]/50 dark:bg-white/[0.02]">
                      {allDay.slice(0, 3).map((ev) => {
                        const cat = getCategoryConfig(ev.category)
                        return (
                          <button
                            key={ev.id}
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onEventClick?.(ev) }}
                            className={cn('w-full text-left text-[10px] font-medium px-1.5 py-0.5 rounded-md truncate transition-colors hover:bg-white/10',
                              ev.is_completed ? 'line-through text-[var(--c-text-muted)]' : 'text-[var(--c-text)]'
                            )}
                            title={ev.title}
                          >
                            <span className={cn('inline-block h-1.5 w-1.5 rounded-full mr-1', cat.dot)} />
                            {ev.title}
                          </button>
                        )
                      })}
                      {allDay.length > 3 && (
                        <p className="text-[9px] text-[var(--c-text-muted)] px-1.5">+{allDay.length - 3} lagi</p>
                      )}
                    </div>
                  )}

                  {/* Hour rows */}
                  {HOURS.map((hour) => (
                    <div key={hour} className="h-16 border-b border-[var(--c-border)]/50 dark:border-white/[0.04] relative">
                      {/* Now indicator */}
                      {today && hour === nowHour && (
                        <div className="absolute left-0 right-0 top-0 z-10">
                          <div className="h-[2px] bg-[var(--c-accent)] w-full" />
                          <div className="absolute -left-1 -top-[3px] h-2 w-2 rounded-full bg-[var(--c-accent)]" />
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Positioned events */}
                  <div className="absolute inset-0 top-0 pointer-events-none">
                    {timed.map((ev) => {
                      const colorConf = getEventColor(ev.color)
                      const past = isToday(ev.event_date) && ev.start_time && isTimePast(ev.start_time) && !ev.is_completed
                      const now = isToday(ev.event_date) && isTimeNow(ev.start_time, ev.end_time) && !ev.is_completed
                      return (
                        <button
                          key={ev.id}
                          type="button"
                          onClick={() => onEventClick?.(ev)}
                          className={cn(
                            'absolute left-0.5 right-0.5 rounded-lg px-1.5 py-0.5 text-left overflow-hidden transition-all hover:opacity-90 hover:z-20 pointer-events-auto',
                            colorConf.bg, colorConf.border, 'border-l-[3px]',
                            ev.is_completed && 'opacity-50',
                            past && 'opacity-40',
                            now && 'ring-1 ring-[var(--c-accent)]/50 shadow-sm',
                          )}
                          style={{
                            top: getEventTop(ev),
                            height: getEventHeight(ev),
                          }}
                        >
                          <p className={cn('text-[10px] font-semibold truncate leading-tight', ev.is_completed ? 'line-through text-[var(--c-text-muted)]' : colorConf.text)}>{ev.title}</p>
                          <p className="text-[9px] text-[var(--c-text-muted)]/70 tabular-nums">
                            {ev.start_time ? formatTime(ev.start_time) : ''}{ev.end_time ? ` - ${formatTime(ev.end_time)}` : ''}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <EventFormDialog open={formOpen} onOpenChange={setFormOpen} defaultDate={defaultDate} />
    </div>
  )
}
