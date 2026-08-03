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

      const isPast = date < today || (date === today && !!event.start_time && isTimePast(event.start_time) && !event.is_all_day)
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

// ─── Aggregation: Month data ────────────────────────

export interface ScheduleMonthData {
  year: number
  month: number
  days: ScheduleDaySummary[]
  events: ScheduleEventRow[]
  weekStarts: string[]
}

export function getMonthDays(year: number, month: number): string[] {
  const days: string[] = []
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d)
    days.push(date.toISOString().split('T')[0])
  }
  return days
}

export function getMonthCalendarGrid(year: number, month: number): (string | null)[] {
  const firstDay = new Date(year, month, 1).getDay()
  const offset = firstDay === 0 ? 6 : firstDay - 1 // Monday start
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const grid: (string | null)[] = []
  for (let i = 0; i < offset; i++) grid.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d)
    grid.push(date.toISOString().split('T')[0])
  }
  while (grid.length % 7 !== 0) grid.push(null)
  return grid
}

export async function getScheduleMonth(userId: string, year: number, month: number): Promise<ScheduleMonthData> {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`
  const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`

  const events = await scheduleRepo.findByDateRange(userId, startDate, endDate)
  const allDays = getMonthDays(year, month)

  const days: ScheduleDaySummary[] = allDays.map((date) => {
    const dayEvents = events.filter((e) => e.event_date === date)
    return {
      date,
      totalEvents: dayEvents.length,
      completedEvents: dayEvents.filter((e) => e.is_completed).length,
      allDayEvents: dayEvents.filter((e) => e.is_all_day).length,
      timedEvents: dayEvents.filter((e) => !e.is_all_day).length,
    }
  })

  // Get week starts for this month's calendar
  const weekStarts: string[] = []
  const firstDay = new Date(year, month, 1)
  const start = getWeekStart(firstDay)
  for (let w = 0; w < 6; w++) {
    const d = new Date(start)
    d.setDate(d.getDate() + w * 7)
    const ds = d.toISOString().split('T')[0]
    if (ds > endDate) break
    weekStarts.push(ds)
  }

  return { year, month, days, events, weekStarts }
}

// ─── Aggregation: Day timeline for time blocking ───────

export interface TimeBlock {
  event: ScheduleEventRow
  startMinutes: number
  endMinutes: number
  durationMinutes: number
  top: string
  height: string
  isPast: boolean
  isNow: boolean
}

export interface DayTimeline {
  date: string
  events: ScheduleEventRow[]
  blocks: TimeBlock[]
  freeSlots: { start: string; end: string; durationMin: number }[]
  totalScheduledMin: number
  totalFreeMin: number
  utilizationPercent: number
}

const DAY_START = 5 * 60  // 05:00
const DAY_END = 23 * 60   // 23:00
const HOUR_HEIGHT = 72    // px per hour

export function buildDayTimeline(events: ScheduleEventRow[], date: string): DayTimeline {
  const timed = events.filter((e) => !e.is_all_day && e.start_time)
  const allDay = events.filter((e) => e.is_all_day)
  const today = getTodayStr()
  const now = new Date()
  const nowMin = now.getHours() * 60 + now.getMinutes()

  const blocks: TimeBlock[] = timed.map((event) => {
    const [sh, sm] = event.start_time!.split(':').map(Number)
    const startMin = sh * 60 + sm
    const endMin = event.end_time
      ? (() => { const [eh, em] = event.end_time.split(':').map(Number); return eh * 60 + em })()
      : startMin + 60
    const duration = Math.max(15, endMin - startMin)
    const clampedStart = Math.max(DAY_START, startMin)
    const clampedEnd = Math.min(DAY_END, endMin)

    return {
      event,
      startMinutes: startMin,
      endMinutes: endMin,
      durationMinutes: duration,
      top: `${((clampedStart - DAY_START) / 60) * HOUR_HEIGHT}px`,
      height: `${Math.max(20, ((clampedEnd - clampedStart) / 60) * HOUR_HEIGHT - 4)}px`,
      isPast: date < today || (date === today && endMin <= nowMin),
      isNow: date === today && startMin <= nowMin && endMin > nowMin,
    }
  }).sort((a, b) => a.startMinutes - b.startMinutes)

  // Calculate free slots
  const freeSlots: DayTimeline['freeSlots'] = []
  let cursor = DAY_START
  for (const block of blocks) {
    if (block.startMinutes > cursor && block.startMinutes - cursor >= 30) {
      freeSlots.push({
        start: `${String(Math.floor(cursor / 60)).padStart(2, '0')}:${String(cursor % 60).padStart(2, '0')}`,
        end: `${String(Math.floor(block.startMinutes / 60)).padStart(2, '0')}:${String(block.startMinutes % 60).padStart(2, '0')}`,
        durationMin: block.startMinutes - cursor,
      })
    }
    cursor = Math.max(cursor, block.endMinutes)
  }
  if (DAY_END - cursor >= 30) {
    freeSlots.push({
      start: `${String(Math.floor(cursor / 60)).padStart(2, '0')}:${String(cursor % 60).padStart(2, '0')}`,
      end: '23:00',
      durationMin: DAY_END - cursor,
    })
  }

  const totalScheduledMin = blocks.reduce((s, b) => s + Math.min(b.durationMinutes, DAY_END - Math.max(b.startMinutes, DAY_START)), 0)
  const totalFreeMin = Math.max(0, DAY_END - DAY_START - totalScheduledMin)
  const utilizationPercent = Math.round((totalScheduledMin / (DAY_END - DAY_START)) * 100)

  return {
    date,
    events,
    blocks,
    freeSlots,
    totalScheduledMin,
    totalFreeMin,
    utilizationPercent,
  }
}

export { HOUR_HEIGHT, DAY_START, DAY_END }

// ─── Dashboard Analytics ────────────────────────────────

export interface ScheduleAnalytics {
  totalWeek: number
  completedWeek: number
  completionRate: number
  byCategory: { category: string; count: number; completed: number }[]
  busiestDay: string
  busiestDayCount: number
  avgEventsPerDay: number
  todayUtilization: number
  upcomingCount: number
}

export async function getScheduleAnalytics(userId: string): Promise<ScheduleAnalytics> {
  const today = getTodayStr()
  const weekStart = getWeekStart(new Date())
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)
  const weekEndStr = weekEnd.toISOString().split('T')[0]

  const weekEvents = await scheduleRepo.findByDateRange(userId, weekStart.toISOString().split('T')[0], weekEndStr)
  const upcoming = await scheduleRepo.findUpcoming(userId, 50)

  const totalWeek = weekEvents.length
  const completedWeek = weekEvents.filter((e) => e.is_completed).length
  const completionRate = totalWeek > 0 ? Math.round((completedWeek / totalWeek) * 100) : 0

  // Category breakdown
  const catMap = new Map<string, { count: number; completed: number }>()
  for (const e of weekEvents) {
    const c = catMap.get(e.category) ?? { count: 0, completed: 0 }
    c.count++
    if (e.is_completed) c.completed++
    catMap.set(e.category, c)
  }
  const byCategory = Array.from(catMap.entries()).map(([category, data]) => ({ category, ...data }))

  // Busiest day
  const dayCounts = new Map<string, number>()
  for (const e of weekEvents) {
    dayCounts.set(e.event_date, (dayCounts.get(e.event_date) ?? 0) + 1)
  }
  let busiestDay = today
  let busiestDayCount = 0
  for (const [date, count] of dayCounts) {
    if (count > busiestDayCount) { busiestDay = date; busiestDayCount = count }
  }

  const avgEventsPerDay = totalWeek > 0 ? Math.round(totalWeek / 7) : 0

  // Today utilization
  const todayEvents = weekEvents.filter((e) => e.event_date === today && !e.is_all_day && e.start_time)
  let todayScheduled = 0
  for (const e of todayEvents) {
    const [sh, sm] = e.start_time!.split(':').map(Number)
    const [eh, em] = e.end_time ? e.end_time.split(':').map(Number) : [sh + 1, sm]
    todayScheduled += Math.max(0, (eh * 60 + em) - (sh * 60 + sm))
  }
  const todayUtilization = Math.min(100, Math.round((todayScheduled / (DAY_END - DAY_START)) * 100))

  const upcomingCount = upcoming.filter((e) => !e.is_completed).length

  return {
    totalWeek, completedWeek, completionRate, byCategory,
    busiestDay, busiestDayCount, avgEventsPerDay,
    todayUtilization, upcomingCount,
  }
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
