/**
 * Life OS — Sprint 7: Schedule Repository
 *
 * Abstracts all Supabase data access for the Schedule domain.
 */

import { createClient } from '@/lib/supabase/client'
import type {
  ScheduleEventRow, ScheduleEventInsert, ScheduleEventUpdate,
} from '@/lib/types/schedule'

function getClient() {
  const client = createClient()
  if (!client) return null
  return client
}

export const scheduleRepo = {
  /** Get events for a date range */
  async findByDateRange(userId: string, startDate: string, endDate: string): Promise<ScheduleEventRow[]> {
    const client = getClient()
    if (!client) return []
    const { data, error } = await client
      .from('schedule_events')
      .select('*')
      .eq('user_id', userId)
      .gte('event_date', startDate)
      .lte('event_date', endDate)
      .order('event_date', { ascending: true })
      .order('start_time', { ascending: true })
      .order('is_all_day', { ascending: false })
    if (error) throw new Error(`scheduleRepo.findByDateRange: ${error.message}`)
    return (data as ScheduleEventRow[]) ?? []
  },

  /** Get events for a single date */
  async findByDate(userId: string, date: string): Promise<ScheduleEventRow[]> {
    const client = getClient()
    if (!client) return []
    const { data, error } = await client
      .from('schedule_events')
      .select('*')
      .eq('user_id', userId)
      .eq('event_date', date)
      .order('is_all_day', { ascending: false })
      .order('start_time', { ascending: true })
    if (error) throw new Error(`scheduleRepo.findByDate: ${error.message}`)
    return (data as ScheduleEventRow[]) ?? []
  },

  /** Get upcoming events (today onwards, limited) */
  async findUpcoming(userId: string, limit = 20): Promise<ScheduleEventRow[]> {
    const client = getClient()
    if (!client) return []
    const today = new Date().toISOString().split('T')[0]
    const { data, error } = await client
      .from('schedule_events')
      .select('*')
      .eq('user_id', userId)
      .gte('event_date', today)
      .order('event_date', { ascending: true })
      .order('start_time', { ascending: true })
      .limit(limit)
    if (error) throw new Error(`scheduleRepo.findUpcoming: ${error.message}`)
    return (data as ScheduleEventRow[]) ?? []
  },

  /** Get events linked to a mission */
  async findByMission(userId: string, missionId: string): Promise<ScheduleEventRow[]> {
    const client = getClient()
    if (!client) return []
    const { data, error } = await client
      .from('schedule_events')
      .select('*')
      .eq('user_id', userId)
      .eq('mission_id', missionId)
      .order('event_date', { ascending: true })
    if (error) throw new Error(`scheduleRepo.findByMission: ${error.message}`)
    return (data as ScheduleEventRow[]) ?? []
  },

  async findById(id: string): Promise<ScheduleEventRow | null> {
    const client = getClient()
    if (!client) return null
    const { data, error } = await client
      .from('schedule_events')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw new Error(`scheduleRepo.findById: ${error.message}`)
    return data as ScheduleEventRow | null
  },

  async create(payload: ScheduleEventInsert): Promise<ScheduleEventRow> {
    const client = getClient()
    if (!client) throw new Error('Supabase client not available')
    const { data, error } = await client
      .from('schedule_events')
      .insert(payload)
      .select()
      .single()
    if (error) throw new Error(`scheduleRepo.create: ${error.message}`)
    return data as ScheduleEventRow
  },

  async update(id: string, payload: ScheduleEventUpdate): Promise<ScheduleEventRow> {
    const client = getClient()
    if (!client) throw new Error('Supabase client not available')
    const { data, error } = await client
      .from('schedule_events')
      .update(payload)
      .eq('id', id)
      .select()
      .single()
    if (error) throw new Error(`scheduleRepo.update: ${error.message}`)
    return data as ScheduleEventRow
  },

  async delete(id: string): Promise<void> {
    const client = getClient()
    if (!client) return
    const { error } = await client
      .from('schedule_events')
      .delete()
      .eq('id', id)
    if (error) throw new Error(`scheduleRepo.delete: ${error.message}`)
  },
}
