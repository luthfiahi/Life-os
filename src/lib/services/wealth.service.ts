/**
 * Life OS — Sprint 3: Wealth Service Layer
 *
 * Business logic layer between TanStack Query hooks and the Repository.
 * Handles data transformation, aggregation, and domain rules.
 *
 * Architecture:
 *   Component → TanStack Query Hook → Service → Repository → Supabase Client
 *
 * Graceful degradation: returns safe defaults when Supabase is unavailable.
 */

import { accountRepo, transactionRepo, budgetRepo, categoryRepo } from '@/lib/repositories/wealth.repository'
import type {
  WealthSnapshotData,
  BudgetUtilizationItem,
} from '@/lib/types/wealth'

// ─── Helpers ───────────────────────────────────────────

/** Format number as Indonesian Rupiah string */
export function formatRupiah(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `Rp ${(amount / 1_000_000_000).toFixed(1).replace(/\.0$/, '')} M`
  }
  if (amount >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toFixed(1).replace(/\.0$/, '')} Jt`
  }
  if (amount >= 1_000) {
    return `Rp ${(amount / 1_000).toFixed(0).replace(/\.0$/, '')}.000`
  }
  return `Rp ${Math.round(amount)}`
}

/** Format number as percentage string */
export function formatPercent(value: number): string {
  return `${Math.round(value)}%`
}

// ─── Wealth Snapshot Service ─────────────────────────────
/**
 * Aggregates wealth data for the Dashboard Snapshot widget.
 * This is the ONLY service method consumed by the Dashboard in Sprint 3.
 *
 * Returns:
 * - totalBalance: sum of all active account balances
 * - todayExpense: sum of today's expense transactions
 * - budgetUtilization: average % of active budgets spent this month
 * - totalBalanceChange: % change vs. previous month (null if not enough data)
 * - todayExpenseChange: % change vs. same day last week (null if not enough data)
 */
export async function getWealthSnapshot(userId: string): Promise<WealthSnapshotData> {
  // Fetch all data in parallel for performance
  const [totalBalance, todayExpense, activeBudgets, categories, monthlyExpenseByCategory] =
    await Promise.all([
      accountRepo.getTotalBalance(userId),
      transactionRepo.getTodayExpense(userId),
      budgetRepo.findActive(userId),
      categoryRepo.findAll(userId),
      transactionRepo.getMonthExpenseByCategory(
        userId,
        new Date().getFullYear(),
        new Date().getMonth() + 1,
      ),
    ])

  // Calculate budget utilization
  let budgetUtilization = 0
  if (activeBudgets.length > 0) {
    const categoryMap = new Map(categories.map((c) => [c.id, c.name]))
    const expenseMap = new Map(monthlyExpenseByCategory.map((e) => [e.category_id, e.total]))

    let totalPercentage = 0
    for (const budget of activeBudgets) {
      const spent = expenseMap.get(budget.category_id) ?? 0
      const pct = budget.amount > 0 ? Math.min((spent / budget.amount) * 100, 100) : 0
      totalPercentage += pct
    }
    budgetUtilization = Math.round(totalPercentage / activeBudgets.length)
  }

  // Calculate month-over-month balance change
  let totalBalanceChange: string | null = null
  try {
    const now = new Date()
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const [thisMonthIncome, lastMonthIncome, thisMonthExpense, lastMonthExpense] =
      await Promise.all([
        getMonthTotalByType(userId, 'income', now.getFullYear(), now.getMonth() + 1),
        getMonthTotalByType(userId, 'income', lastDayLastMonth.getFullYear(), lastDayLastMonth.getMonth() + 1),
        getMonthTotalByType(userId, 'expense', now.getFullYear(), now.getMonth() + 1),
        getMonthTotalByType(userId, 'expense', lastDayLastMonth.getFullYear(), lastDayLastMonth.getMonth() + 1),
      ])

    // Net flow = income - expense
    const thisMonthNet = thisMonthIncome - thisMonthExpense
    const lastMonthNet = lastMonthIncome - lastMonthExpense

    if (lastMonthNet !== 0) {
      const changePct = ((thisMonthNet - lastMonthNet) / Math.abs(lastMonthNet)) * 100
      totalBalanceChange = `${changePct >= 0 ? '+' : ''}${changePct.toFixed(1)}%`
    }
  } catch {
    // Not enough data — leave as null
  }

  // Calculate today-vs-same-day-last-week expense change
  let todayExpenseChange: string | null = null
  try {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const dateStr = sevenDaysAgo.toISOString().split('T')[0]
    const lastWeekTransactions = await transactionRepo.findByDateRange(
      userId,
      dateStr,
      dateStr,
    )
    const lastWeekExpense = lastWeekTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0)

    if (lastWeekExpense > 0) {
      const changePct = ((todayExpense - lastWeekExpense) / lastWeekExpense) * 100
      todayExpenseChange = `${changePct >= 0 ? '+' : ''}${changePct.toFixed(0)}%`
    }
  } catch {
    // Not enough data — leave as null
  }

  return {
    totalBalance,
    todayExpense,
    budgetUtilization,
    totalBalanceChange,
    todayExpenseChange,
  }
}

// ─── Budget Detail Service ───────────────────────────────

/**
 * Returns per-category budget utilization for a given month.
 * Used by the future Wealth module detail page.
 */
export async function getBudgetUtilization(
  userId: string,
  year: number,
  month: number,
): Promise<BudgetUtilizationItem[]> {
  const [activeBudgets, categories, monthlyExpenseByCategory] = await Promise.all([
    budgetRepo.findActive(userId),
    categoryRepo.findAll(userId),
    transactionRepo.getMonthExpenseByCategory(userId, year, month),
  ])

  const categoryMap = new Map(categories.map((c) => [c.id, c.name]))
  const expenseMap = new Map(monthlyExpenseByCategory.map((e) => [e.category_id, e.total]))

  return activeBudgets.map((budget) => {
    const spent = expenseMap.get(budget.category_id) ?? 0
    const remaining = Math.max(budget.amount - spent, 0)
    const percentage = budget.amount > 0 ? Math.min((spent / budget.amount) * 100, 100) : 0

    return {
      category_id: budget.category_id,
      category_name: categoryMap.get(budget.category_id) ?? 'Tidak diketahui',
      budget_amount: Number(budget.amount),
      spent,
      remaining,
      percentage: Math.round(percentage),
    }
  })
}

// ─── Internal Helpers ────────────────────────────────────

/** Get total transaction amount for a month by type (income or expense) */
async function getMonthTotalByType(
  userId: string,
  type: 'income' | 'expense',
  year: number,
  month: number,
): Promise<number> {
  const transactions = await transactionRepo.findByDateRange(
    userId,
    `${year}-${String(month).padStart(2, '0')}-01`,
    `${year}-${String(month).padStart(2, '0')}-${new Date(year, month, 0).getDate()}`,
  )

  return transactions
    .filter((t) => t.type === type)
    .reduce((sum, t) => sum + Number(t.amount), 0)
}
