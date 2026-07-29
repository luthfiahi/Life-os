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
import type { MissionSnapshotData } from '@/lib/types/mission'

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
