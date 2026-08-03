import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { useAuth } from '@/hooks/use-auth'
import { missionRepo, milestoneRepo } from '@/lib/repositories/mission.repository'
import { getMissionSnapshot, recalcMissionProgress, getMissionDashboard } from '@/lib/services/mission.service'
import { missionKeys, invalidateMissionQueries } from './query-keys'
import type {
  MissionInsert, MissionUpdate,
  MilestoneInsert, MilestoneUpdate,
  MissionSnapshotData, MissionDashboardData,
} from '@/lib/types/mission'

// ─── Dashboard: Mission Snapshot ──────────────────────────

export function useMissionSnapshot() {
  const { user } = useAuth()
  const userId = user?.id

  return useQuery<MissionSnapshotData>({
    queryKey: userId ? missionKeys.snapshot(userId) : ['mission', 'snapshot', 'anonymous'],
    queryFn: async () => {
      if (!userId) {
        return { totalMissions: 0, activeMissions: 0, completedMissions: 0, overallProgress: 0, nextDeadline: null, nextDeadlineMission: null }
      }
      return getMissionSnapshot(userId)
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  })
}

// ─── Mission Dashboard (Sprint 6B) ───────────────────────

export function useMissionDashboard() {
  const { user } = useAuth()
  const userId = user?.id

  return useQuery<MissionDashboardData>({
    queryKey: userId ? missionKeys.dashboard(userId) : ['mission', 'dashboard', 'anonymous'],
    queryFn: async () => {
      if (!userId) {
        return { healthSummary: { on_track: 0, at_risk: 0, critical: 0, overdue: 0, no_deadline: 0 }, upcomingMilestones: [], progressByMission: [], priorityMatrix: [{ quadrant: 'Do First', missions: [] }, { quadrant: 'Schedule', missions: [] }, { quadrant: 'Delegate', missions: [] }, { quadrant: 'Eliminate', missions: [] }] }
      }
      return getMissionDashboard(userId)
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  })
}

// ─── Missions ────────────────────────────────────────────

export function useMissions(filters?: { status?: string }) {
  const { user } = useAuth()
  const userId = user?.id

  return useQuery({
    queryKey: userId ? missionKeys.missionList(userId, filters) : ['mission', 'missions', 'anonymous'],
    queryFn: async () => {
      if (!userId) return []
      if (filters?.status === 'active') return missionRepo.findActive(userId)
      if (filters?.status) return missionRepo.findByStatus(userId, filters.status)
      return missionRepo.findAll(userId)
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  })
}

export function useMission(id: string | null) {
  const { user } = useAuth()
  const userId = user?.id

  return useQuery({
    queryKey: userId && id ? missionKeys.missionDetail(userId, id) : ['mission', 'detail', 'anonymous'],
    queryFn: async () => {
      if (!userId || !id) return null
      return missionRepo.findById(id)
    },
    enabled: !!userId && !!id,
    staleTime: 2 * 60 * 1000,
  })
}

export function useCreateMission() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (payload: MissionInsert) => missionRepo.create(payload),
    onSuccess: () => {
      if (user?.id) {
        invalidateMissionQueries(queryClient, user.id, ['missions', 'snapshot', 'dashboard'])
      }
    },
  })
}

export function useUpdateMission() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: MissionUpdate }) => missionRepo.update(id, payload),
    onSuccess: () => {
      if (user?.id) {
        invalidateMissionQueries(queryClient, user.id, ['missions', 'milestones', 'snapshot', 'dashboard'])
      }
    },
  })
}

export function useDeleteMission() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (id: string) => missionRepo.delete(id),
    onSuccess: () => {
      if (user?.id) {
        invalidateMissionQueries(queryClient, user.id, ['missions', 'milestones', 'snapshot', 'dashboard'])
      }
    },
  })
}

// ─── Milestones ──────────────────────────────────────────

/** Batch fetch milestone counts for all missions — 1 query */
export function useMilestoneCountsByMission() {
  const { user } = useAuth()
  const userId = user?.id

  return useQuery<Record<string, { total: number; completed: number }>>({
    queryKey: userId ? [...missionKeys.milestones(userId), 'counts'] as const : ['mission', 'milestone-counts', 'anonymous'],
    queryFn: async () => {
      if (!userId) return {}
      return milestoneRepo.countGroupedByMission(userId)
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  })
}

export function useMilestones(missionId: string | null) {
  const { user } = useAuth()
  const userId = user?.id

  return useQuery({
    queryKey: userId && missionId ? missionKeys.milestoneByMission(userId, missionId) : ['mission', 'milestones', 'anonymous'],
    queryFn: async () => {
      if (!userId || !missionId) return []
      return milestoneRepo.findByMission(missionId)
    },
    enabled: !!userId && !!missionId,
    staleTime: 2 * 60 * 1000,
  })
}

export function useCreateMilestone() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (payload: MilestoneInsert) => {
      const milestone = await milestoneRepo.create(payload)
      // Recalculate mission progress
      await recalcMissionProgress(payload.mission_id, payload.user_id)
      return milestone
    },
    onSuccess: () => {
      if (user?.id) {
        invalidateMissionQueries(queryClient, user.id, ['missions', 'milestones', 'snapshot', 'dashboard'])
      }
    },
  })
}

export function useUpdateMilestone() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: MilestoneUpdate }) => {
      const milestone = await milestoneRepo.update(id, payload)
      // If status changed to/from completed, recalculate mission progress
      if (payload.status) {
        const m = milestone as { mission_id: string; user_id: string }
        await recalcMissionProgress(m.mission_id, m.user_id)
      }
      return milestone
    },
    onSuccess: () => {
      if (user?.id) {
        invalidateMissionQueries(queryClient, user.id, ['missions', 'milestones', 'snapshot', 'dashboard'])
      }
    },
  })
}

export function useDeleteMilestone() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (id: string) => {
      // Find milestone to get mission_id for progress recalc
      const milestone = await milestoneRepo.findById(id)
      await milestoneRepo.delete(id)
      if (milestone) {
        await recalcMissionProgress(milestone.mission_id, milestone.user_id)
      }
    },
    onSuccess: () => {
      if (user?.id) {
        invalidateMissionQueries(queryClient, user.id, ['missions', 'milestones', 'snapshot', 'dashboard'])
      }
    },
  })
}
