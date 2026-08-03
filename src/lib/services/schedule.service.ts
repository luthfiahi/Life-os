/**
 * Life OS — Sprint 7: Schedule Service Layer
 *
 * Pure helpers + aggregation for Schedule domain.
 */

import { scheduleRepo } from '@/lib/repositories/schedule.repository'
import type {
  ScheduleEventRow, ScheduleCategory,
  ScheduleDaySummary, ScheduleWeekData, AgendaItem,
} from '@/lib/types/schedule'

// ─── Helpers ───────────────────────────────────────────

export function formatTime(time: string | null): string {
  if (!time) return ''
  const [h, m] = time.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${h12}:${m.toString().padStart(2, '0')} ${period}`
}

export function formatEventDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'short', year: 'numeric',
  })
}

export function formatShortDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short',
  })
}

export function getTodayStr(): string {
  return new Date().toISOString().split('T')[0]
}

/** Get Monday of the week containing the given date */
export function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Monday
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

/** Get array of 7 date strings for the week */
export function getWeekDays(date: Date): string[] {
  const start = getWeekStart(date)
  const days: string[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    days.push(d.toISOString().split('T')[0])
  }
  return days
}

export function isSameDay(d1: string, d2: string): boolean {
  return d1 === d2
}

export function isToday(dateStr: string): boolean {
  return dateStr === getTodayStr()
}

export function isPastDate(dateStr: string): boolean {
  return dateStr < getTodayStr()
}

export function isTimePast(time: string | null): boolean {
  if (!time) return false
  const now = new Date()
  const [h, m] = time.split(':').map(Number)
  return now.getHours() > h || (now.getHours() === h && now.getMinutes() >= m)
}

export function isTimeNow(startTime: string | null, endTime: string | null): boolean {
  if (!startTime || !endTime) return false
  const now = new Date()
  const [sh, sm] = startTime.split(':').map(Number)
  const [eh, em] = endTime.split(':').map(Number)
  const nowMin = now.getHours() * 60 + now.getMinutes()
  return nowMin >= sh * 60 + sm && nowMin <= eh * 60 + em
}

// ─── Category Config ───────────────────────────────────

export function getCategoryConfig(category: string) {
  const map: Record<string, { label: string; color: string; bg: string; dot: string }> = {
    general:  { label: 'Umum',     color: 'text-slate-600 dark:text-slate-400',   bg: 'bg-slate-500/10',   dot: 'bg-slate-500' },
    work:     { label: 'Kerja',    color: 'text-blue-600 dark:text-blue-400',     bg: 'bg-blue-500/10',    dot: 'bg-blue-500' },
    personal: { label: 'Pribadi',  color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-500/10',  dot: 'bg-violet-500' },
    health:   { label: 'Kesehatan',color: 'text-emerald-600 dark:text-emerald-400',bg: 'bg-emerald-500/10', dot: 'bg-emerald-500' },
    education:{ label: 'Pendidikan',color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10',  dot: 'bg-amber-500' },
    social:   { label: 'Sosial',   color: 'text-sky-600 dark:text-sky-400',     bg: 'bg-sky-500/10',    dot: 'bg-sky-500' },
    finance:  { label: 'Keuangan', color: 'text-emerald-600 dark:text-emerald-400',bg: 'bg-emerald-500/10', dot: 'bg-emerald-500' },
    creative: { label: 'Kreatif',  color: 'text-pink-600 dark:text-pink-400',   bg: 'bg-pink-500/10',    dot: 'bg-pink-500' },
  }
  return map[category] ?? map.general
}

// ─── Event Color ───────────────────────────────────────

const EVENT_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  blue:    { bg: 'bg-blue-500/15 dark:bg-blue-500/20',    border: 'border-l-blue-500',    text: 'text-blue-700 dark:text-blue-300' },
  emerald: { bg: 'bg-emerald-500/15 dark:bg-emerald-500/20', border: 'border-l-emerald-500', text: 'text-emerald-700 dark:text-emerald-300' },
  violet:  { bg: 'bg-violet-500/15 dark:bg-violet-500/20',  border: 'border-l-violet-500',  text: 'text-violet-700 dark:text-violet-300' },
  orange:  { bg: 'bg-orange-500/15 dark:bg-orange-500/20',  border: 'border-l-orange-500',  text: 'text-orange-700 dark:text-orange-300' },
  rose:    { bg: 'bg-rose-500/15 dark:bg-rose-500/20',    border: 'border-l-rose-500',    text: 'text-rose-700 dark:text-rose-300' },
  sky:     { bg: 'bg-sky-500/15 dark:bg-sky-500/20',     border: 'border-l-sky-500',     text: 'text-sky-700 dark:text-sky-300' },
  amber:   { bg: 'bg-amber-500/15 dark:bg-amber-500/20',  border: 'border-l-amber-500',  text: 'text-amber-700 dark:text-amber-300' },
  pink:    { bg: 'bg-pink-500/15 dark:bg-pink-500/20',    border: 'border-l-pink-500',    text: 'text-pink-700 dark:text-pink-300' },
}

export function getEventColor(color: string | null) {
  return EVENT_COLORS[color ?? 'blue'] ?? EVENT_COLORS.blue
}

// ─── Aggregation: Week data ─────────────────────────────

export async function getScheduleWeek(userId: string, referenceDate: string): Promise<ScheduleWeekData> {
  const refDate = new Date(referenceDate + 'T00:00:00')
  const weekDays = getWeekDays(refDate)
  const weekStart = weekDays[0]
  const weekEnd = weekDays[6]

  const events = await scheduleRepo.findByDateRange(userId, weekStart, weekEnd)

  const days: ScheduleDaySummary[] = weekDays.map((date) => {
    const dayEvents = events.filter((e) => e.event_date === date)
    return {
      date,
      totalEvents: dayEvents.length,
      completedEvents: dayEvents.filter((e) => e.is_completed).length,
      allDayEvents: dayEvents.filter((e) => e.is_all_day).length,
      timedEvents: dayEvents.filter((e) => !e.is_all_day).length,
    }
  })

  return { weekStart, weekEnd, days, events }
}

// ─── Aggregation: Agenda (today's events sorted) ────────

export function buildAgenda(events: ScheduleEventRow[], date: string): AgendaItem[] {
  const today = getTodayStr()
  const dayEvents = events.filter((e) => e.event_date === date)

  return dayEvents
    .map((event) => {
      let timeLabel = ''
      if (event.is_all_day) {
        timeLabel = 'Sepanjang hari'
      } else if (event.start_time && event.end_time) {
        timeLabel = `${formatTime(event.start_time)} - ${formatTime(event.end_time)}`
      } else if (event.start_time) {
        timeLabel = formatTime(event.start_time)
      }

      const isPast = date < today || (date === today && event.start_time && isTimePast(event.start_time) && !event.is_all_day)
      const isNow = date === today && isTimeNow(event.start_time, event.end_time) && !event.is_all_day

      return { event, timeLabel, isPast, isNow }
    })
    .sort((a, b) => {
      if (a.event.is_all_day && !b.event.is_all_day) return -1
      if (!a.event.is_all_day && b.event.is_all_day) return 1
      if (a.event.start_time && b.event.start_time) return a.event.start_time.localeCompare(b.event.start_time)
      return 0
    })
}

// ─── Snapshot for dashboard ────────────────────────────

export async function getScheduleSnapshot(userId: string) {
  const today = getTodayStr()
  const upcoming = await scheduleRepo.findUpcoming(userId, 5)
  const todayEvents = upcoming.filter((e) => e.event_date === today)
  const totalToday = todayEvents.length
  const completedToday = todayEvents.filter((e) => e.is_completed).length
  const nextEvent = upcoming.find((e) => {
    if (e.event_date > today) return true
    if (e.event_date === today && !e.is_completed) {
      if (e.is_all_day) return true
      return e.start_time && !isTimePast(e.start_time)
    }
    return false
  })

  return {
    totalToday,
    completedToday,
    nextEventTitle: nextEvent?.title ?? null,
    nextEventTime: nextEvent?.start_time ? formatTime(nextEvent.start_time) : null,
    nextEventDate: nextEvent?.event_date ?? null,
  }
}
