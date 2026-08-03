import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { useAuth } from '@/hooks/use-auth'
import { scheduleRepo } from '@/lib/repositories/schedule.repository'
import { getScheduleWeek, getScheduleSnapshot, getTodayStr, getWeekStart } from '@/lib/services/schedule.service'
import { scheduleKeys, invalidateScheduleQueries } from './query-keys'
import type {
  ScheduleEventInsert, ScheduleEventUpdate,
  ScheduleWeekData,
} from '@/lib/types/schedule'

// ─── Week View ──────────────────────────────────────────

export function useScheduleWeek(referenceDate?: string) {
  const { user } = useAuth()
  const userId = user?.id
  const refDate = referenceDate ?? getTodayStr()
  const weekStart = getWeekStart(new Date(refDate + 'T00:00:00')).toISOString().split('T')[0]

  return useQuery<ScheduleWeekData>({
    queryKey: userId ? scheduleKeys.week(userId, weekStart) : ['schedule', 'week', 'anonymous'],
    queryFn: async () => {
      if (!userId) {
        const days = Array.from({ length: 7 }).map((_, i) => {
          const d = new Date(); d.setDate(d.getDate() - d.getDay() + (d.getDay() === 0 ? -6 : 1) + i)
          return d.toISOString().split('T')[0]
        })
        return { weekStart: days[0], weekEnd: days[6], days: days.map(d => ({ date: d, totalEvents: 0, completedEvents: 0, allDayEvents: 0, timedEvents: 0 })), events: [] }
      }
      return getScheduleWeek(userId, refDate)
    },
    enabled: !!userId,
    staleTime: 30 * 1000,
  })
}

// ─── Today's Events ─────────────────────────────────────

export function useTodayEvents() {
  const { user } = useAuth()
  const userId = user?.id
  const today = getTodayStr()

  return useQuery({
    queryKey: userId ? scheduleKeys.eventsByDate(userId, today) : ['schedule', 'today', 'anonymous'],
    queryFn: async () => {
      if (!userId) return []
      return scheduleRepo.findByDate(userId, today)
    },
    enabled: !!userId,
    staleTime: 30 * 1000,
  })
}

// ─── Upcoming Events ───────────────────────────────────

export function useUpcomingEvents(limit = 20) {
  const { user } = useAuth()
  const userId = user?.id

  return useQuery({
    queryKey: userId ? scheduleKeys.upcoming(userId) : ['schedule', 'upcoming', 'anonymous'],
    queryFn: async () => {
      if (!userId) return []
      return scheduleRepo.findUpcoming(userId, limit)
    },
    enabled: !!userId,
    staleTime: 60 * 1000,
  })
}

// ─── Schedule Snapshot (Dashboard) ─────────────────────

export function useScheduleSnapshot() {
  const { user } = useAuth()
  const userId = user?.id

  return useQuery({
    queryKey: userId ? scheduleKeys.snapshot(userId) : ['schedule', 'snapshot', 'anonymous'],
    queryFn: async () => {
      if (!userId) return { totalToday: 0, completedToday: 0, nextEventTitle: null, nextEventTime: null, nextEventDate: null }
      return getScheduleSnapshot(userId)
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  })
}

// ─── Mutations ──────────────────────────────────────────

export function useCreateEvent() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (payload: ScheduleEventInsert) => scheduleRepo.create(payload),
    onSuccess: () => {
      if (user?.id) invalidateScheduleQueries(queryClient, user.id)
    },
  })
}

export function useUpdateEvent() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ScheduleEventUpdate }) => scheduleRepo.update(id, payload),
    onSuccess: () => {
      if (user?.id) invalidateScheduleQueries(queryClient, user.id)
    },
  })
}

export function useDeleteEvent() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (id: string) => scheduleRepo.delete(id),
    onSuccess: () => {
      if (user?.id) invalidateScheduleQueries(queryClient, user.id)
    },
  })
}

export function useToggleEventComplete() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      scheduleRepo.update(id, { is_completed: completed }),
    onSuccess: () => {
      if (user?.id) invalidateScheduleQueries(queryClient, user.id)
    },
  })
}
