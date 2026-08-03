/**
 * Life OS — Sprint 7: Schedule Domain Types
 * Generated from Supabase schema: schedule_events.
 */

// ─── Enums ───────────────────────────────────────────────

export type ScheduleCategory = 'general' | 'work' | 'personal' | 'health' | 'education' | 'social' | 'finance' | 'creative'
export type RepeatType = 'daily' | 'weekly' | 'monthly' | 'weekday' | null

// ─── Database Row Type ───────────────────────────────────

export interface ScheduleEventRow {
  id: string
  user_id: string
  title: string
  description: string | null
  event_date: string
  start_time: string | null
  end_time: string | null
  is_all_day: boolean
  category: ScheduleCategory
  color: string | null
  mission_id: string | null
  repeat_type: RepeatType
  repeat_end_date: string | null
  location: string | null
  is_completed: boolean
  created_at: string
  updated_at: string
}

// ─── Insert/Update Payloads ──────────────────────────────

export interface ScheduleEventInsert {
  user_id: string
  title: string
  description?: string | null
  event_date: string
  start_time?: string | null
  end_time?: string | null
  is_all_day?: boolean
  category?: ScheduleCategory
  color?: string | null
  mission_id?: string | null
  repeat_type?: RepeatType
  repeat_end_date?: string | null
  location?: string | null
  is_completed?: boolean
}

export type ScheduleEventUpdate = Partial<Omit<ScheduleEventInsert, 'user_id'>>

// ─── Aggregation Types ──────────────────────────────────

export interface ScheduleDaySummary {
  date: string
  totalEvents: number
  completedEvents: number
  allDayEvents: number
  timedEvents: number
}

export interface ScheduleWeekData {
  weekStart: string
  weekEnd: string
  days: ScheduleDaySummary[]
  events: ScheduleEventRow[]
}

export interface AgendaItem {
  event: ScheduleEventRow
  timeLabel: string
  isPast: boolean
  isNow: boolean
}
