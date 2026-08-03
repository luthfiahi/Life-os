/**
 * Life OS — TanStack Query Key Factory
 *
 * Centralized query key management.
 * All query keys are defined here to prevent key collisions
 * and enable targeted cache invalidation.
 *
 * Pattern: [domain, entity, ...identifiers, filters]
 *
 * Usage:
 *   queryKey: wealthKeys.snapshot(userId)
 *   invalidate: queryClient.invalidateQueries({ queryKey: wealthKeys.all() })
 */

export const wealthKeys = {
  /** Base key for all wealth queries */
  all: ['wealth'] as const,

  /** Accounts */
  accounts: (userId: string) => [...wealthKeys.all, 'accounts', userId] as const,
  accountList: (userId: string, filters?: { active?: boolean }) =>
    [...wealthKeys.accounts(userId), 'list', filters] as const,
  accountDetail: (userId: string, id: string) =>
    [...wealthKeys.accounts(userId), 'detail', id] as const,

  /** Categories */
  categories: (userId: string) => [...wealthKeys.all, 'categories', userId] as const,
  categoryList: (userId: string, type?: 'income' | 'expense') =>
    [...wealthKeys.categories(userId), 'list', type] as const,

  /** Transactions */
  transactions: (userId: string) => [...wealthKeys.all, 'transactions', userId] as const,
  transactionList: (userId: string, filters?: { limit?: number; offset?: number }) =>
    [...wealthKeys.transactions(userId), 'list', filters] as const,
  transactionByDateRange: (userId: string, start: string, end: string) =>
    [...wealthKeys.transactions(userId), 'date-range', start, end] as const,

  /** Budgets */
  budgets: (userId: string) => [...wealthKeys.all, 'budgets', userId] as const,
  budgetList: (userId: string, filters?: { active?: boolean }) =>
    [...wealthKeys.budgets(userId), 'list', filters] as const,

  /** Dashboard Snapshot — the primary Sprint 3 query */
  snapshot: (userId: string) => [...wealthKeys.all, 'snapshot', userId] as const,

  /** Budget Utilization detail */
  budgetUtilization: (userId: string, year: number, month: number) =>
    [...wealthKeys.all, 'budget-utilization', userId, year, month] as const,

  /** Analytics (Sprint 5) */
  analytics: (userId: string) => [...wealthKeys.all, 'analytics', userId] as const,
  cashFlow: (userId: string, months: number) =>
    [...wealthKeys.analytics(userId), 'cash-flow', months] as const,
  expenseByCategory: (userId: string, year: number, month: number) =>
    [...wealthKeys.analytics(userId), 'expense-by-cat', year, month] as const,
  budgetAnalytics: (userId: string, year: number, month: number) =>
    [...wealthKeys.analytics(userId), 'budget-analytics', year, month] as const,
  spendingHeatmap: (userId: string, year: number, month: number) =>
    [...wealthKeys.analytics(userId), 'heatmap', year, month] as const,
  netWorth: (userId: string) =>
    [...wealthKeys.analytics(userId), 'net-worth'] as const,
  savingsRate: (userId: string, year: number, month: number) =>
    [...wealthKeys.analytics(userId), 'savings-rate', year, month] as const,
  financialInsights: (userId: string) =>
    [...wealthKeys.analytics(userId), 'insights'] as const,

  /** Debts (Sprint 5B) */
  debts: (userId: string) => [...wealthKeys.all, 'debts', userId] as const,
  debtList: (userId: string, filters?: { active?: boolean }) =>
    [...wealthKeys.debts(userId), 'list', filters] as const,
  debtPayments: (userId: string, debtId: string) =>
    [...wealthKeys.all, 'debt-payments', userId, debtId] as const,
}

// ─── Mission Domain (Sprint 6) ─────────────────────────────

export const missionKeys = {
  /** Base key for all mission queries */
  all: ['mission'] as const,

  /** Missions */
  missions: (userId: string) => [...missionKeys.all, 'missions', userId] as const,
  missionList: (userId: string, filters?: { status?: string }) =>
    [...missionKeys.missions(userId), 'list', filters] as const,
  missionDetail: (userId: string, id: string) =>
    [...missionKeys.missions(userId), 'detail', id] as const,

  /** Milestones */
  milestones: (userId: string) => [...missionKeys.all, 'milestones', userId] as const,
  milestoneByMission: (userId: string, missionId: string) =>
    [...missionKeys.milestones(userId), 'by-mission', missionId] as const,

  /** Dashboard Snapshot */
  snapshot: (userId: string) => [...missionKeys.all, 'snapshot', userId] as const,

  /** Dashboard (Sprint 6B) */
  dashboard: (userId: string) => [...missionKeys.all, 'dashboard', userId] as const,
}

/**
 * Invalidation helpers for Mission domain.
 */
export function invalidateMissionQueries(
  queryClient: import('@tanstack/react-query').QueryClient,
  userId: string,
  scopes: Array<'missions' | 'milestones' | 'snapshot' | 'dashboard'>,
) {
  for (const scope of scopes) {
    switch (scope) {
      case 'missions':
        queryClient.invalidateQueries({ queryKey: missionKeys.missions(userId) })
        break
      case 'milestones':
        queryClient.invalidateQueries({ queryKey: missionKeys.milestones(userId) })
        break
      case 'snapshot':
        queryClient.invalidateQueries({ queryKey: missionKeys.snapshot(userId) })
        break
      case 'dashboard':
        queryClient.invalidateQueries({ queryKey: missionKeys.dashboard(userId) })
        break
    }
  }
  // Always invalidate snapshot and dashboard when mission data changes
  if (!scopes.includes('snapshot')) {
    queryClient.invalidateQueries({ queryKey: missionKeys.snapshot(userId) })
  }
  if (!scopes.includes('dashboard')) {
    queryClient.invalidateQueries({ queryKey: missionKeys.dashboard(userId) })
  }
}

/**
 * Invalidation helpers — use after mutations to refresh related queries.
 *
 * Example:
 *   after creating a transaction:
 *   invalidateWealthQueries(queryClient, userId, ['transactions', 'snapshot'])
 */
export function invalidateWealthQueries(
  queryClient: import('@tanstack/react-query').QueryClient,
  userId: string,
  scopes: Array<'accounts' | 'categories' | 'transactions' | 'budgets' | 'snapshot' | 'analytics' | 'debts'>,
) {
  for (const scope of scopes) {
    switch (scope) {
      case 'accounts':
        queryClient.invalidateQueries({ queryKey: wealthKeys.accounts(userId) })
        break
      case 'categories':
        queryClient.invalidateQueries({ queryKey: wealthKeys.categories(userId) })
        break
      case 'transactions':
        queryClient.invalidateQueries({ queryKey: wealthKeys.transactions(userId) })
        break
      case 'budgets':
        queryClient.invalidateQueries({ queryKey: wealthKeys.budgets(userId) })
        break
      case 'snapshot':
        queryClient.invalidateQueries({ queryKey: wealthKeys.snapshot(userId) })
        break
      case 'analytics':
        queryClient.invalidateQueries({ queryKey: wealthKeys.analytics(userId) })
        break
      case 'debts':
        queryClient.invalidateQueries({ queryKey: wealthKeys.debts(userId) })
        break
    }
  }
  // Always invalidate snapshot when any wealth data changes
  if (!scopes.includes('snapshot')) {
    queryClient.invalidateQueries({ queryKey: wealthKeys.snapshot(userId) })
  }
}
