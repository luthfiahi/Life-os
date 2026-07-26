/**
 * Life OS — Sprint 5B: Debt Query Hooks
 *
 * TanStack Query hooks for Debt Management.
 * Architecture: Hook → Service → Repository → Supabase
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/hooks/use-auth'
import { wealthKeys, invalidateWealthQueries } from './query-keys'
import { debtRepo, debtPaymentRepo } from '@/lib/repositories/wealth.repository'
import type {
  DebtInsert,
  DebtUpdate,
  DebtPaymentInsert,
  DebtSnapshotData,
} from '@/lib/types/wealth'

// ─── Debt Snapshot (Dashboard widget) ─────────────────────

export function useDebtSnapshot() {
  const { user } = useAuth()
  const userId = user?.id

  return useQuery<DebtSnapshotData>({
    queryKey: userId
      ? [...wealthKeys.debts(userId), 'snapshot'] as const
      : ['debt', 'snapshot', 'anonymous'],
    queryFn: async () => {
      if (!userId) {
        return { totalDebt: 0, monthlyPayment: 0, totalOriginal: 0, paidOffPercentage: 0, activeDebts: 0, remainingMonths: 0 }
      }
      const debts = await debtRepo.findActive(userId)
      const totalDebt = debts.reduce((s, d) => s + Number(d.remaining_balance), 0)
      const monthlyPayment = debts.reduce((s, d) => s + Number(d.monthly_payment), 0)
      const totalOriginal = debts.reduce((s, d) => s + Number(d.total_amount), 0)
      const paidOffPercentage = totalOriginal > 0
        ? Math.round(((totalOriginal - totalDebt) / totalOriginal) * 100)
        : 0
      // Remaining months: average of remaining months per debt
      let remainingMonths = 0
      if (debts.length > 0) {
        const monthsArr = debts.map((d) => {
          if (Number(d.monthly_payment) <= 0) return 0
          return Math.ceil(Number(d.remaining_balance) / Number(d.monthly_payment))
        })
        remainingMonths = Math.max(...monthsArr)
      }
      return { totalDebt, monthlyPayment, totalOriginal, paidOffPercentage, activeDebts: debts.length, remainingMonths }
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
    placeholderData: (prev) => prev,
  })
}

// ─── Debts CRUD ────────────────────────────────────────────

export function useDebts(options?: { active?: boolean }) {
  const { user } = useAuth()
  const userId = user?.id

  return useQuery({
    queryKey: userId
      ? wealthKeys.debtList(userId, options)
      : ['debt', 'list', 'anonymous'],
    queryFn: async () => {
      if (!userId) return []
      return options?.active
        ? debtRepo.findActive(userId)
        : debtRepo.findAll(userId)
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  })
}

export function useCreateDebt() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (payload: DebtInsert) => debtRepo.create(payload),
    onSuccess: () => {
      if (user?.id) {
        invalidateWealthQueries(queryClient, user.id, ['debts', 'snapshot', 'analytics'])
      }
    },
  })
}

export function useUpdateDebt() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: DebtUpdate }) =>
      debtRepo.update(id, payload),
    onSuccess: () => {
      if (user?.id) {
        invalidateWealthQueries(queryClient, user.id, ['debts', 'snapshot', 'analytics'])
      }
    },
  })
}

export function useDeleteDebt() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (id: string) => debtRepo.delete(id),
    onSuccess: () => {
      if (user?.id) {
        invalidateWealthQueries(queryClient, user.id, ['debts', 'snapshot', 'analytics'])
      }
    },
  })
}

// ─── Debt Payments ─────────────────────────────────────────

export function useDebtPayments(debtId: string) {
  const { user } = useAuth()
  const userId = user?.id

  return useQuery({
    queryKey: userId
      ? wealthKeys.debtPayments(userId, debtId)
      : ['debt-payments', 'anonymous'],
    queryFn: async () => {
      if (!userId) return []
      return debtPaymentRepo.findByDebtId(debtId)
    },
    enabled: !!userId && !!debtId,
    staleTime: 2 * 60 * 1000,
  })
}

export function useCreateDebtPayment() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (payload: DebtPaymentInsert) => debtPaymentRepo.create(payload),
    onSuccess: () => {
      if (user?.id) {
        invalidateWealthQueries(queryClient, user.id, ['debts', 'snapshot', 'analytics'])
      }
    },
  })
}

export function useDeleteDebtPayment() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (id: string) => debtPaymentRepo.delete(id),
    onSuccess: () => {
      if (user?.id) {
        invalidateWealthQueries(queryClient, user.id, ['debts', 'snapshot', 'analytics'])
      }
    },
  })
}
