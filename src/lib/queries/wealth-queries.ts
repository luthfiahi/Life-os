/**
 * Life OS — TanStack Query Hooks for Wealth Domain
 *
 * These hooks encapsulate all data fetching for the Wealth module.
 * Components call hooks → hooks call service → service calls repository → repository calls Supabase.
 *
 * NO direct Supabase calls in components.
 * NO direct Supabase calls in hooks.
 *
 * Graceful degradation: when user is not authenticated or Supabase
 * is unavailable, hooks return empty data instead of throwing.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/hooks/use-auth'
import { getWealthSnapshot, formatRupiah, formatPercent } from '@/lib/services/wealth.service'
import { accountRepo, transactionRepo, budgetRepo, categoryRepo } from '@/lib/repositories/wealth.repository'
import { wealthKeys, invalidateWealthQueries } from './query-keys'
import type {
  AccountInsert,
  AccountUpdate,
  CategoryInsert,
  CategoryUpdate,
  TransactionInsert,
  TransactionUpdate,
  BudgetInsert,
  BudgetUpdate,
  WealthSnapshotData,
} from '@/lib/types/wealth'

// ─── Dashboard: Wealth Snapshot ──────────────────────────

/**
 * useWealthSnapshot
 *
 * Fetches aggregated wealth data for the Dashboard Snapshot widget.
 * This is the PRIMARY hook used in Sprint 3 to connect the
 * Wealth Snapshot card to real Supabase data.
 *
 * Returns WealthSnapshotData or falls back to safe defaults.
 */
export function useWealthSnapshot() {
  const { user } = useAuth()
  const userId = user?.id

  return useQuery<WealthSnapshotData>({  
    queryKey: userId ? wealthKeys.snapshot(userId) : ['wealth', 'snapshot', 'anonymous'],
    queryFn: async () => {
      if (!userId) {
        // Unauthenticated fallback
        return { totalBalance: 0, todayExpense: 0, budgetUtilization: 0, totalBalanceChange: null, todayExpenseChange: null }
      }
      return getWealthSnapshot(userId)
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    placeholderData: (previousData) => previousData, // Keep previous data while refetching
  })
}

// ─── Accounts ────────────────────────────────────────────

export function useAccounts(options?: { active?: boolean }) {
  const { user } = useAuth()
  const userId = user?.id

  return useQuery({
    queryKey: userId ? wealthKeys.accountList(userId, options) : ['wealth', 'accounts', 'anonymous'],
    queryFn: async () => {
      if (!userId) return []
      return options?.active
        ? accountRepo.findActive(userId)
        : accountRepo.findAll(userId)
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateAccount() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (payload: AccountInsert) => accountRepo.create(payload),
    onSuccess: () => {
      if (user?.id) {
        invalidateWealthQueries(queryClient, user.id, ['accounts', 'snapshot'])
      }
    },
  })
}

export function useUpdateAccount() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AccountUpdate }) =>
      accountRepo.update(id, payload),
    onSuccess: () => {
      if (user?.id) {
        invalidateWealthQueries(queryClient, user.id, ['accounts', 'snapshot'])
      }
    },
  })
}

export function useDeleteAccount() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (id: string) => accountRepo.delete(id),
    onSuccess: () => {
      if (user?.id) {
        invalidateWealthQueries(queryClient, user.id, ['accounts', 'transactions', 'snapshot'])
      }
    },
  })
}

// ─── Categories ──────────────────────────────────────────

export function useCategories(type?: 'income' | 'expense') {
  const { user } = useAuth()
  const userId = user?.id

  return useQuery({
    queryKey: userId ? wealthKeys.categoryList(userId, type) : ['wealth', 'categories', 'anonymous'],
    queryFn: async () => {
      if (!userId) return []
      return type
        ? categoryRepo.findByType(userId, type)
        : categoryRepo.findAll(userId)
    },
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // Categories change rarely
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (payload: CategoryInsert) => categoryRepo.create(payload),
    onSuccess: () => {
      if (user?.id) {
        invalidateWealthQueries(queryClient, user.id, ['categories'])
      }
    },
  })
}

// ─── Transactions ────────────────────────────────────────

export function useTransactions(options?: { limit?: number; offset?: number }) {
  const { user } = useAuth()
  const userId = user?.id

  return useQuery({
    queryKey: userId ? wealthKeys.transactionList(userId, options) : ['wealth', 'transactions', 'anonymous'],
    queryFn: async () => {
      if (!userId) return []
      return transactionRepo.findAll(userId, options)
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  })
}

export function useCreateTransaction() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (payload: TransactionInsert) => transactionRepo.create(payload),
    onSuccess: () => {
      if (user?.id) {
        invalidateWealthQueries(queryClient, user.id, ['transactions', 'snapshot', 'budgets'])
      }
    },
  })
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TransactionUpdate }) =>
      transactionRepo.update(id, payload),
    onSuccess: () => {
      if (user?.id) {
        invalidateWealthQueries(queryClient, user.id, ['transactions', 'snapshot', 'budgets'])
      }
    },
  })
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (id: string) => transactionRepo.delete(id),
    onSuccess: () => {
      if (user?.id) {
        invalidateWealthQueries(queryClient, user.id, ['transactions', 'snapshot', 'budgets'])
      }
    },
  })
}

// ─── Budgets ─────────────────────────────────────────────

export function useBudgets(options?: { active?: boolean }) {
  const { user } = useAuth()
  const userId = user?.id

  return useQuery({
    queryKey: userId ? wealthKeys.budgetList(userId, options) : ['wealth', 'budgets', 'anonymous'],
    queryFn: async () => {
      if (!userId) return []
      return options?.active
        ? budgetRepo.findActive(userId)
        : budgetRepo.findAll(userId)
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useBudgetUtilization(year: number, month: number) {
  const { user } = useAuth()
  const userId = user?.id

  return useQuery({
    queryKey: userId
      ? wealthKeys.budgetUtilization(userId, year, month)
      : ['wealth', 'budget-util', 'anonymous'],
    queryFn: async () => {
      if (!userId) return []
      const { getBudgetUtilization } = await import('@/lib/services/wealth.service')
      return getBudgetUtilization(userId, year, month)
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  })
}

export function useCreateBudget() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (payload: BudgetInsert) => budgetRepo.create(payload),
    onSuccess: () => {
      if (user?.id) {
        invalidateWealthQueries(queryClient, user.id, ['budgets', 'snapshot'])
      }
    },
  })
}

export function useUpdateBudget() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: BudgetUpdate }) =>
      budgetRepo.update(id, payload),
    onSuccess: () => {
      if (user?.id) {
        invalidateWealthQueries(queryClient, user.id, ['budgets', 'snapshot'])
      }
    },
  })
}

export function useDeleteBudget() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (id: string) => budgetRepo.delete(id),
    onSuccess: () => {
      if (user?.id) {
        invalidateWealthQueries(queryClient, user.id, ['budgets', 'snapshot'])
      }
    },
  })
}
