export { createQueryClient } from './query-client'
export { wealthKeys, invalidateWealthQueries } from './query-keys'
export {
  useWealthSnapshot,
  useAccounts,
  useCreateAccount,
  useCategories,
  useCreateCategory,
  useTransactions,
  useCreateTransaction,
  useBudgets,
  useCreateBudget,
} from './wealth-queries'

// Sprint 5: Analytics
export {
  useCashFlow,
  useMonthlyTrend,
  useExpenseByCategory,
  useBudgetAnalytics,
  useSpendingHeatmap,
  useNetWorth,
  useSavingsRate,
  useFinancialInsights,
} from './analytics-queries'

// Sprint 5B: Debt
export {
  useDebtSnapshot,
  useDebts,
  useCreateDebt,
  useUpdateDebt,
  useDeleteDebt,
  useDebtPayments,
  useCreateDebtPayment,
  useDeleteDebtPayment,
} from './debt-queries'
