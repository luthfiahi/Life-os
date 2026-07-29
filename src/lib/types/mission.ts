/**
 * Life OS — Sprint 6: Mission Domain Types
 * Generated from Supabase schema: missions, milestones.
 * All types are database-row representations with snake_case fields.
 */

// ─── Enums ───────────────────────────────────────────────

export type MissionPriority = 'low' | 'medium' | 'high' | 'critical'
export type MissionStatus = 'active' | 'completed' | 'archived' | 'draft'
export type MilestoneStatus = 'pending' | 'in_progress' | 'completed'

// ─── Database Row Types ───────────────────────────────────

export interface MissionRow {
  id: string
  user_id: string
  title: string
  description: string | null
  priority: MissionPriority
  status: MissionStatus
  icon: string | null
  color: string | null
  start_date: string | null
  target_date: string | null
  progress: number
  is_pinned: boolean
  created_at: string
  updated_at: string
}

export interface MilestoneRow {
  id: string
  user_id: string
  mission_id: string
  title: string
  description: string | null
  status: MilestoneStatus
  sort_order: number
  due_date: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

// ─── Insert Payloads ──────────────────────────────────────

export interface MissionInsert {
  user_id: string
  title: string
  description?: string | null
  priority?: MissionPriority
  status?: MissionStatus
  icon?: string | null
  color?: string | null
  start_date?: string | null
  target_date?: string | null
  progress?: number
  is_pinned?: boolean
}

export interface MilestoneInsert {
  user_id: string
  mission_id: string
  title: string
  description?: string | null
  status?: MilestoneStatus
  sort_order?: number
  due_date?: string | null
}

// ─── Update Payloads ──────────────────────────────────────

export type MissionUpdate = Partial<Omit<MissionInsert, 'user_id'>> & {
 progress?: number
  status?: MissionStatus
}

export type MilestoneUpdate = Partial<Omit<MilestoneInsert, 'user_id'>> & {
  status?: MilestoneStatus
  completed_at?: string | null
}

// ─── Dashboard Aggregation Types ──────────────────────────

export interface MissionSnapshotData {
  totalMissions: number
  activeMissions: number
  completedMissions: number
  overallProgress: number
  nextDeadline: string | null
  nextDeadlineMission: string | null
}
