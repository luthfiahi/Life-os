/**
 * Life OS — Sprint 6: Mission Service Layer
 *
 * Business logic layer between TanStack Query hooks and the Repository.
 * Handles data transformation, aggregation, and domain rules.
 *
 * Architecture:
 *   Component → TanStack Query Hook → Service → Repository → Supabase Client
 */

import { missionRepo, milestoneRepo } from '@/lib/repositories/mission.repository'
import type {
  MissionRow, MissionSnapshotData, MissionHealth,
  MissionHealthInfo, UpcomingMilestone, MissionDashboardData,
} from '@/lib/types/mission'

// ─── Helpers ───────────────────────────────────────────

/** Format a date string to Indonesian locale */
export function formatMissionDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

/** Calculate days remaining until a date */
export function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null
  const target = new Date(dateStr + 'T23:59:59')
  const now = new Date()
  const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return diff
}

/** Format days remaining into human-readable string */
export function formatDaysRemaining(dateStr: string | null): string {
  const days = daysUntil(dateStr)
  if (days === null) return ''
  if (days < 0) return `${Math.abs(days)} hari lalu`
  if (days === 0) return 'Hari ini'
  if (days === 1) return 'Besok'
  return `${days} hari lagi`
}

/** Get priority config */
export function getPriorityConfig(priority: string) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    low: { label: 'Low', color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-500/10' },
    medium: { label: 'Medium', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
    high: { label: 'High', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-500/10' },
    critical: { label: 'Critical', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/10' },
  }
  return map[priority] ?? map.medium
}

/** Get status config */
export function getStatusConfig(status: string) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    active: { label: 'Aktif', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10' },
    completed: { label: 'Selesai', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
    archived: { label: 'Diarsipkan', color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-500/10' },
    draft: { label: 'Draft', color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-500/10' },
  }
  return map[status] ?? map.active
}

/** Get category config */
export function getCategoryConfig(category: string) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    general: { label: 'Umum', color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-500/10' },
    career: { label: 'Karir', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10' },
    finance: { label: 'Keuangan', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
    health: { label: 'Kesehatan', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/10' },
    education: { label: 'Pendidikan', color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-500/10' },
    personal: { label: 'Pribadi', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
    creative: { label: 'Kreatif', color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-500/10' },
    social: { label: 'Sosial', color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-500/10' },
  }
  return map[category] ?? map.general
}

/** Get health config for display */
export function getHealthConfig(health: MissionHealth) {
  const map: Record<MissionHealth, { label: string; color: string; bg: string; dot: string }> = {
    on_track: { label: 'On Track', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10 dark:bg-emerald-500/15', dot: 'bg-emerald-500' },
    at_risk: { label: 'At Risk', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10 dark:bg-amber-500/15', dot: 'bg-amber-500' },
    critical: { label: 'Critical', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-500/10 dark:bg-orange-500/15', dot: 'bg-orange-500' },
    overdue: { label: 'Overdue', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/10 dark:bg-rose-500/15', dot: 'bg-rose-500' },
    no_deadline: { label: 'No Deadline', color: 'text-[var(--c-text-muted)]', bg: 'bg-[var(--c-surface)] dark:bg-white/[0.04]', dot: 'bg-[var(--c-text-muted)]' },
  }
  return map[health]
}

/** Calculate mission health based on progress vs time */
export function calculateMissionHealth(mission: MissionRow): MissionHealthInfo {
  if (!mission.target_date || mission.status !== 'active') {
    return { missionId: mission.id, health: 'no_deadline', label: 'No Deadline', daysRemaining: null, progressRate: 0 }
  }

  const now = new Date()
  const target = new Date(mission.target_date + 'T23:59:59')
  const start = mission.start_date ? new Date(mission.start_date + 'T00:00:00') : null
  const daysTotal = Math.ceil((target.getTime() - (start?.getTime() ?? now.getTime())) / (1000 * 60 * 60 * 24))
  const daysRemaining = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  const progress = Number(mission.progress)

  if (daysRemaining < 0) {
    return { missionId: mission.id, health: 'overdue', label: 'Overdue', daysRemaining, progressRate: progress }
  }

  const expectedProgress = daysTotal > 0 ? Math.min(Math.round(((daysTotal - daysRemaining) / daysTotal) * 100), 100) : 100
  const gap = progress - expectedProgress

  let health: MissionHealth
  if (gap >= -10) health = 'on_track'
  else if (gap >= -30) health = 'at_risk'
  else health = 'critical'

  const labelMap: Record<MissionHealth, string> = { on_track: 'On Track', at_risk: 'At Risk', critical: 'Critical', overdue: 'Overdue', no_deadline: 'No Deadline' }

  return { missionId: mission.id, health, label: labelMap[health], daysRemaining, progressRate: progress }
}

// ─── Mission Snapshot Service ─────────────────────────────
/**
 * Aggregates mission data for the Dashboard Snapshot widget.
 */
export async function getMissionSnapshot(userId: string): Promise<MissionSnapshotData> {
  const [allMissions, activeMissions, nextDeadline] = await Promise.all([
    missionRepo.findAll(userId),
    missionRepo.findActive(userId),
    missionRepo.getNextDeadline(userId),
  ])

  const completedMissions = allMissions.filter((m) => m.status === 'completed')
  const totalMissions = allMissions.length
  const activeCount = activeMissions.length
  const completedCount = completedMissions.length

  // Overall progress = average progress of active missions
  const overallProgress = activeCount > 0
    ? Math.round(activeMissions.reduce((sum, m) => sum + Number(m.progress), 0) / activeCount)
    : 0

  return {
    totalMissions,
    activeMissions: activeCount,
    completedMissions: completedCount,
    overallProgress,
    nextDeadline: nextDeadline?.target_date ?? null,
    nextDeadlineMission: nextDeadline?.title ?? null,
  }
}

/** Recalculate mission progress from its milestones */
export async function recalcMissionProgress(missionId: string, userId: string): Promise<number> {
  const { total, completed } = await milestoneRepo.countByMission(missionId)
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0
  await missionRepo.update(missionId, { progress })
  return progress
}

// ─── Mission Dashboard Aggregator ───────────────────────

/** Get upcoming milestones across all active missions */
export async function getUpcomingMilestones(userId: string, limit = 10): Promise<UpcomingMilestone[]> {
  const allMilestones = await milestoneRepo.findByUserId(userId)
  const activeMissions = await missionRepo.findActive(userId)
  const missionMap = new Map(activeMissions.map((m) => [m.id, m]))

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const upcoming = allMilestones
    .filter((ms) => {
      if (ms.status === 'completed') return false
      if (!ms.due_date) return false
      return new Date(ms.due_date + 'T23:59:59') >= today
    })
    .map((ms) => {
      const mission = missionMap.get(ms.mission_id)
      const dueDate = new Date(ms.due_date + 'T23:59:59')
      const daysUntilMs = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      return {
        id: ms.id,
        mission_id: ms.mission_id,
        mission_title: mission?.title ?? 'Unknown',
        mission_color: mission?.color ?? null,
        mission_icon: mission?.icon ?? null,
        title: ms.title,
        due_date: ms.due_date,
        daysUntil: daysUntilMs,
      }
    })
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, limit)

  return upcoming
}

/** Build the full mission dashboard data */
export async function getMissionDashboard(userId: string): Promise<MissionDashboardData> {
  const [allMissions, activeMissions, upcoming] = await Promise.all([
    missionRepo.findAll(userId),
    missionRepo.findActive(userId),
    getUpcomingMilestones(userId, 10),
  ])

  // Health summary
  const healthSummary = { on_track: 0, at_risk: 0, critical: 0, overdue: 0, no_deadline: 0 }
  for (const m of activeMissions) {
    const h = calculateMissionHealth(m)
    healthSummary[h.health]++
  }

  // Progress by mission (active only)
  const progressByMission = activeMissions.map((m) => ({
    missionId: m.id,
    title: m.title,
    color: m.color,
    progress: Number(m.progress),
  }))

  // Priority matrix (Eisenhower)
  const isUrgent = (m: MissionRow) => {
    if (!m.target_date) return false
    return daysUntil(m.target_date) !== null && daysUntil(m.target_date)! <= 7
  }
  const isImportant = (m: MissionRow) => m.priority === 'high' || m.priority === 'critical'

  const q1 = allMissions.filter((m) => m.status === 'active' && isUrgent(m) && isImportant(m))
  const q2 = allMissions.filter((m) => m.status === 'active' && !isUrgent(m) && isImportant(m))
  const q3 = allMissions.filter((m) => m.status === 'active' && isUrgent(m) && !isImportant(m))
  const q4 = allMissions.filter((m) => m.status === 'active' && !isUrgent(m) && !isImportant(m))

  const priorityMatrix = [
    { quadrant: 'Do First', missions: q1 },
    { quadrant: 'Schedule', missions: q2 },
    { quadrant: 'Delegate', missions: q3 },
    { quadrant: 'Eliminate', missions: q4 },
  ]

  return { healthSummary, upcomingMilestones: upcoming, progressByMission, priorityMatrix }
}
