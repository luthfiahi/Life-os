/**
 * Life OS — Sprint 5: Analytics Query Hooks
 *
 * TanStack Query hooks for all Wealth Analytics features.
 * Follows the same pattern as wealth-queries.ts:
 *   Hook → Service → Repository → Supabase
 */

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/hooks/use-auth'
import { wealthKeys } from './query-keys'
import {
  getCashFlowData,
  getMonthlyTrendData,
  getExpenseByCategory,
  getBudgetAnalytics,
  getSpendingHeatmap,
  getNetWorth,
  getSavingsRate,
  getFinancialInsights,
} from '@/lib/services/analytics.service'
import type {
  CashFlowPoint,
  CategoryBreakdownItem,
  BudgetAnalyticsItem,
  HeatmapCell,
  NetWorthData,
  SavingsRateData,
  FinancialInsight,
} from '@/lib/types/wealth'

// ─── Cash Flow Chart ─────────────────────────────────────

export function useCashFlow(months = 6) {
  const { user } = useAuth()
  const userId = user?.id

  return useQuery<CashFlowPoint[]>({
    queryKey: userId
      ? wealthKeys.cashFlow(userId, months)
      : ['analytics', 'cash-flow', 'anonymous'],
    queryFn: async () => {
      if (!userId) return []
      return getCashFlowData(userId, months)
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  })
}

// ─── Monthly Trend (alias for cash flow data) ────────────

export function useMonthlyTrend(months = 6) {
  const { user } = useAuth()
  const userId = user?.id

  return useQuery<CashFlowPoint[]>({
    queryKey: userId
      ? wealthKeys.cashFlow(userId, months)
      : ['analytics', 'monthly-trend', 'anonymous'],
    queryFn: async () => {
      if (!userId) return []
      return getMonthlyTrendData(userId, months)
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  })
}

// ─── Expense by Category ─────────────────────────────────

export function useExpenseByCategory(year: number, month: number) {
  const { user } = useAuth()
  const userId = user?.id

  return useQuery<CategoryBreakdownItem[]>({
    queryKey: userId
      ? wealthKeys.expenseByCategory(userId, year, month)
      : ['analytics', 'expense-cat', 'anonymous'],
    queryFn: async () => {
      if (!userId) return []
      return getExpenseByCategory(userId, year, month)
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  })
}

// ─── Budget Analytics ─────────────────────────────────────

export function useBudgetAnalytics(year: number, month: number) {
  const { user } = useAuth()
  const userId = user?.id

  return useQuery<BudgetAnalyticsItem[]>({
    queryKey: userId
      ? wealthKeys.budgetAnalytics(userId, year, month)
      : ['analytics', 'budget-analytics', 'anonymous'],
    queryFn: async () => {
      if (!userId) return []
      return getBudgetAnalytics(userId, year, month)
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  })
}

// ─── Spending Heatmap ─────────────────────────────────────

export function useSpendingHeatmap(year: number, month: number) {
  const { user } = useAuth()
  const userId = user?.id

  return useQuery<HeatmapCell[]>({
    queryKey: userId
      ? wealthKeys.spendingHeatmap(userId, year, month)
      : ['analytics', 'heatmap', 'anonymous'],
    queryFn: async () => {
      if (!userId) return []
      return getSpendingHeatmap(userId, year, month)
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  })
}

// ─── Net Worth ────────────────────────────────────────────

export function useNetWorth() {
  const { user } = useAuth()
  const userId = user?.id

  return useQuery<NetWorthData>({
    queryKey: userId
      ? wealthKeys.netWorth(userId)
      : ['analytics', 'net-worth', 'anonymous'],
    queryFn: async () => {
      if (!userId) return { totalAssets: 0, totalLiabilities: 0, netWorth: 0, byAccountType: [] }
      return getNetWorth(userId)
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  })
}

// ─── Savings Rate ─────────────────────────────────────────

export function useSavingsRate(year: number, month: number) {
  const { user } = useAuth()
  const userId = user?.id

  return useQuery<SavingsRateData>({
    queryKey: userId
      ? wealthKeys.savingsRate(userId, year, month)
      : ['analytics', 'savings-rate', 'anonymous'],
    queryFn: async () => {
      if (!userId) return { period: '', income: 0, expense: 0, savings: 0, rate: 0 }
      return getSavingsRate(userId, year, month)
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  })
}

// ─── Financial Insights ───────────────────────────────────

export function useFinancialInsights() {
  const { user } = useAuth()
  const userId = user?.id

  return useQuery<FinancialInsight[]>({
    queryKey: userId
      ? wealthKeys.financialInsights(userId)
      : ['analytics', 'insights', 'anonymous'],
    queryFn: async () => {
      if (!userId) return []
      return getFinancialInsights(userId)
    },
    enabled: !!userId,
    staleTime: 10 * 60 * 1000,
  })
}
