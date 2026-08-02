/**
 * Life OS — Sprint 6: Mission Domain Types
 * Generated from Supabase schema: missions, milestones.
 * All types are database-row representations with snake_case fields.
 */

// ─── Enums ───────────────────────────────────────────────

export type MissionPriority = 'low' | 'medium' | 'high' | 'critical'
export type MissionCategory = 'general' | 'career' | 'finance' | 'health' | 'education' | 'personal' | 'creative' | 'social'
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
  notes: string | null
  category: MissionCategory
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
  notes?: string | null
  category?: MissionCategory
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

// ─── Mission Health ─────────────────────────────────────

export type MissionHealth = 'on_track' | 'at_risk' | 'critical' | 'overdue' | 'no_deadline'

export interface MissionHealthInfo {
  missionId: string
  health: MissionHealth
  label: string
  daysRemaining: number | null
  progressRate: number
}

// ─── Mission Dashboard ──────────────────────────────────

export interface UpcomingMilestone {
  id: string
  mission_id: string
  mission_title: string
  mission_color: string | null
  mission_icon: string | null
  title: string
  due_date: string
  daysUntil: number
}

export interface MissionDashboardData {
  healthSummary: { on_track: number; at_risk: number; critical: number; overdue: number; no_deadline: number }
  upcomingMilestones: UpcomingMilestone[]
  progressByMission: { missionId: string; title: string; color: string | null; progress: number }[]
  priorityMatrix: { quadrant: string; missions: MissionRow[] }[]
}
