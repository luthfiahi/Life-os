/**
 * Life OS — Sprint 6: Mission Repository
 *
 * Abstracts all Supabase data access for the Mission domain.
 * Components NEVER call Supabase directly — they go through this layer.
 *
 * Architecture:
 *   Component → TanStack Query Hook → Service → Repository → Supabase Client
 */

import { createClient } from '@/lib/supabase/client'
import type {
  MissionRow, MissionInsert, MissionUpdate,
  MilestoneRow, MilestoneInsert, MilestoneUpdate,
} from '@/lib/types/mission'

// ─── Helper ─────────────────────────────────────────────

function getClient() {
  const client = createClient()
  if (!client) return null
  return client
}

// ─── Missions Repository ──────────────────────────────────

export const missionRepo = {
  async findAll(userId: string): Promise<MissionRow[]> {
    const client = getClient()
    if (!client) return []
    const { data, error } = await client
      .from('missions')
      .select('*')
      .eq('user_id', userId)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
    if (error) throw new Error(`missionRepo.findAll: ${error.message}`)
    return (data as MissionRow[]) ?? []
  },

  async findByStatus(userId: string, status: string): Promise<MissionRow[]> {
    const client = getClient()
    if (!client) return []
    const { data, error } = await client
      .from('missions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', status)
      .order('is_pinned', { ascending: false })
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
    if (error) throw new Error(`missionRepo.findByStatus: ${error.message}`)
    return (data as MissionRow[]) ?? []
  },

  async findActive(userId: string): Promise<MissionRow[]> {
    return this.findByStatus(userId, 'active')
  },

  async findById(id: string): Promise<MissionRow | null> {
    const client = getClient()
    if (!client) return null
    const { data, error } = await client.from('missions').select('*').eq('id', id).single()
    if (error) throw new Error(`missionRepo.findById: ${error.message}`)
    return data as MissionRow | null
  },

  async create(payload: MissionInsert): Promise<MissionRow> {
    const client = getClient()
    if (!client) throw new Error('Supabase client not available')
    const { data, error } = await client
      .from('missions')
      .insert(payload)
      .select()
      .single()
    if (error) throw new Error(`missionRepo.create: ${error.message}`)
    return data as MissionRow
  },

  async update(id: string, payload: MissionUpdate): Promise<MissionRow> {
    const client = getClient()
    if (!client) throw new Error('Supabase client not available')
    const { data, error } = await client
      .from('missions')
      .update(payload)
      .eq('id', id)
      .select()
      .single()
    if (error) throw new Error(`missionRepo.update: ${error.message}`)
    return data as MissionRow
  },

  async delete(id: string): Promise<void> {
    const client = getClient()
    if (!client) return
    const { error } = await client.from('missions').delete().eq('id', id)
    if (error) throw new Error(`missionRepo.delete: ${error.message}`)
  },

  async getNextDeadline(userId: string): Promise<{ target_date: string; title: string } | null> {
    const client = getClient()
    if (!client) return null
    const { data, error } = await client
      .from('missions')
      .select('target_date, title')
      .eq('user_id', userId)
      .eq('status', 'active')
      .not('target_date', 'is', null)
      .gte('target_date', new Date().toISOString().split('T')[0])
      .order('target_date', { ascending: true })
      .limit(1)
      .maybeSingle()
    if (error) throw new Error(`missionRepo.getNextDeadline: ${error.message}`)
    return data as { target_date: string; title: string } | null
  },
}

// ─── Milestones Repository ────────────────────────────────

export const milestoneRepo = {
  async findByMission(missionId: string): Promise<MilestoneRow[]> {
    const client = getClient()
    if (!client) return []
    const { data, error } = await client
      .from('milestones')
      .select('*')
      .eq('mission_id', missionId)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })
    if (error) throw new Error(`milestoneRepo.findByMission: ${error.message}`)
    return (data as MilestoneRow[]) ?? []
  },

  async findByUserId(userId: string): Promise<MilestoneRow[]> {
    const client = getClient()
    if (!client) return []
    const { data, error } = await client
      .from('milestones')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw new Error(`milestoneRepo.findByUserId: ${error.message}`)
    return (data as MilestoneRow[]) ?? []
  },

  async findById(id: string): Promise<MilestoneRow | null> {
    const client = getClient()
    if (!client) return null
    const { data, error } = await client.from('milestones').select('*').eq('id', id).single()
    if (error) throw new Error(`milestoneRepo.findById: ${error.message}`)
    return data as MilestoneRow | null
  },

  async create(payload: MilestoneInsert): Promise<MilestoneRow> {
    const client = getClient()
    if (!client) throw new Error('Supabase client not available')
    const { data, error } = await client
      .from('milestones')
      .insert(payload)
      .select()
      .single()
    if (error) throw new Error(`milestoneRepo.create: ${error.message}`)
    return data as MilestoneRow
  },

  async update(id: string, payload: MilestoneUpdate): Promise<MilestoneRow> {
    const client = getClient()
    if (!client) throw new Error('Supabase client not available')
    const { data, error } = await client
      .from('milestones')
      .update(payload)
      .eq('id', id)
      .select()
      .single()
    if (error) throw new Error(`milestoneRepo.update: ${error.message}`)
    return data as MilestoneRow
  },

  async delete(id: string): Promise<void> {
    const client = getClient()
    if (!client) return
    const { error } = await client.from('milestones').delete().eq('id', id)
    if (error) throw new Error(`milestoneRepo.delete: ${error.message}`)
  },

  async countByMission(missionId: string): Promise<{ total: number; completed: number }> {
    const all = await this.findByMission(missionId)
    return {
      total: all.length,
      completed: all.filter((m) => m.status === 'completed').length,
    }
  },

  /** Batch count milestones for all missions of a user — single query */
  async countGroupedByMission(userId: string): Promise<Record<string, { total: number; completed: number }>> {
    const client = getClient()
    if (!client) return {}
    const { data, error } = await client
      .from('milestones')
      .select('mission_id, status')
      .eq('user_id', userId)
    if (error) throw new Error(`milestoneRepo.countGroupedByMission: ${error.message}`)
    const result: Record<string, { total: number; completed: number }> = {}
    for (const row of (data ?? [])) {
      const mid = (row as { mission_id: string; status: string }).mission_id
      if (!result[mid]) result[mid] = { total: 0, completed: 0 }
      result[mid].total++
      if ((row as { status: string }).status === 'completed') result[mid].completed++
    }
    return result
  },
}
