/**
 * Life OS — Sprint 5: Analytics Service Layer
 *
 * Transforms raw repository data into chart-ready analytics.
 * Architecture: Component → TanStack Query Hook → Service → Repository → Supabase
 *
 * Graceful degradation: returns empty arrays/defaults when data is unavailable.
 */

import { analyticsRepo, accountRepo, budgetRepo, categoryRepo, transactionRepo, debtRepo } from '@/lib/repositories/wealth.repository'
import { formatRupiah } from './wealth.service'
import type {
  AccountType,
  CashFlowPoint,
  CategoryBreakdownItem,
  BudgetAnalyticsItem,
  HeatmapCell,
  NetWorthData,
  SavingsRateData,
  FinancialInsight,
} from '@/lib/types/wealth'

// ─── Color palette for charts ─────────────────────────────

const CHART_COLORS = [
  'var(--c-accent)',   // teal / blue
  'var(--c-accent-2)', // red
  '#8b5cf6',           // violet
  '#f59e0b',           // amber
  '#10b981',           // emerald
  '#ec4899',           // pink
  '#06b6d4',           // cyan
  '#f97316',           // orange
]

const CHART_COLORS_RAW = [
  '#4db4e0',
  '#e05a72',
  '#8b5cf6',
  '#f59e0b',
  '#10b981',
  '#ec4899',
  '#06b6d4',
  '#f97316',
]

// ─── Month name helper ────────────────────────────────────

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
]

function monthKeyToLabel(key: string): string {
  const [y, m] = key.split('-').map(Number)
  return `${MONTH_SHORT[(m ?? 1) - 1]} ${y}`
}

function monthKeyToFullLabel(key: string): string {
  const [y, m] = key.split('-').map(Number)
  return `${MONTH_NAMES[(m ?? 1) - 1]} ${y}`
}

// ─── 1. Cash Flow Chart (6 months) ────────────────────────

export async function getCashFlowData(userId: string, months = 6): Promise<CashFlowPoint[]> {
  const raw = await analyticsRepo.getMonthlyTotals(userId, months)

  // Build a map of month → { income, expense }
  const map = new Map<string, { income: number; expense: number }>()
  for (const row of raw) {
    const entry = map.get(row.month) ?? { income: 0, expense: 0 }
    if (row.type === 'income') entry.income = row.total
    else entry.expense = row.total
    map.set(row.month, entry)
  }

  // Generate ordered list of last N months
  const now = new Date()
  const result: CashFlowPoint[] = []
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const data = map.get(key) ?? { income: 0, expense: 0 }
    result.push({
      month: key,
      label: monthKeyToLabel(key),
      income: data.income,
      expense: data.expense,
      net: data.income - data.expense,
    })
  }

  return result
}

// ─── 2. Monthly Trend (income/expense lines, same as cash flow but focused on trend) ───

export { getCashFlowData as getMonthlyTrendData }

// ─── 3. Expense by Category ───────────────────────────────

export async function getExpenseByCategory(
  userId: string,
  year: number,
  month: number,
): Promise<CategoryBreakdownItem[]> {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`

  const [raw, categories] = await Promise.all([
    analyticsRepo.getExpenseByCategory(userId, startDate, endDate),
    categoryRepo.findAll(userId),
  ])

  const catMap = new Map(categories.map((c) => [c.id, c.name]))
  const totalAll = raw.reduce((s, r) => s + r.total, 0)

  // Sort by amount descending, then map to items
  return raw
    .sort((a, b) => b.total - a.total)
    .map((r, i) => ({
      category_id: r.category_id,
      category_name: catMap.get(r.category_id) ?? 'Tidak diketahui',
      amount: r.total,
      percentage: totalAll > 0 ? Math.round((r.total / totalAll) * 100) : 0,
      color: CHART_COLORS_RAW[i % CHART_COLORS_RAW.length],
    }))
}

// ─── 4. Budget Analytics ──────────────────────────────────

export async function getBudgetAnalytics(
  userId: string,
  year: number,
  month: number,
): Promise<BudgetAnalyticsItem[]> {
  const [activeBudgets, categories, monthlyExpense] = await Promise.all([
    budgetRepo.findActive(userId),
    categoryRepo.findAll(userId),
    analyticsRepo.getExpenseByCategory(
      userId,
      `${year}-${String(month).padStart(2, '0')}-01`,
      `${year}-${String(month).padStart(2, '0')}-${new Date(year, month, 0).getDate()}`,
    ),
  ])

  const catMap = new Map(categories.map((c) => [c.id, c.name]))
  const expenseMap = new Map(monthlyExpense.map((e) => [e.category_id, e.total]))

  return activeBudgets
    .map((budget) => {
      const spent = expenseMap.get(budget.category_id) ?? 0
      const remaining = Math.max(budget.amount - spent, 0)
      const percentage = budget.amount > 0 ? Math.min((spent / budget.amount) * 100, 100) : 0

      let status: BudgetAnalyticsItem['status'] = 'safe'
      if (percentage > 85) status = 'danger'
      else if (percentage > 60) status = 'warning'

      return {
        category_id: budget.category_id,
        category_name: catMap.get(budget.category_id) ?? 'Tidak diketahui',
        budget_amount: Number(budget.amount),
        spent,
        remaining,
        percentage: Math.round(percentage),
        status,
      }
    })
    .sort((a, b) => b.percentage - a.percentage)
}

// ─── 5. Spending Heatmap ──────────────────────────────────

export async function getSpendingHeatmap(
  userId: string,
  year: number,
  month: number,
): Promise<HeatmapCell[]> {
  const daily = await analyticsRepo.getDailyExpenses(userId, year, month)
  const dailyMap = new Map(daily.map((d) => [d.date, d.total]))

  const lastDay = new Date(year, month, 0).getDate()
  const cells: HeatmapCell[] = []

  for (let day = 1; day <= lastDay; day++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const d = new Date(year, month - 1, day)
    // getDay(): 0=Sun ... 6=Sat. Convert to 0=Mon ... 6=Sun
    const dayOfWeek = (d.getDay() + 6) % 7
    // Week number: ceil(day / 7) roughly, but calculate properly
    const week = Math.ceil(day / 7)

    cells.push({
      date: dateStr,
      dayOfWeek,
      week,
      amount: dailyMap.get(dateStr) ?? 0,
    })
  }

  return cells
}

// ─── 6. Net Worth ─────────────────────────────────────────

const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  bank: 'Bank',
  cash: 'Tunai',
  ewallet: 'E-Wallet',
  investment: 'Investasi',
}

export async function getNetWorth(userId: string): Promise<NetWorthData> {
  const [accounts, debts] = await Promise.all([
    accountRepo.findActive(userId),
    debtRepo.findActive(userId),
  ])

  let totalAssets = 0
  const typeMap = new Map<AccountType, number>()

  for (const acc of accounts) {
    const bal = Number(acc.balance)
    totalAssets += bal
    typeMap.set(acc.type, (typeMap.get(acc.type) ?? 0) + bal)
  }

  const totalLiabilities = debts.reduce((s, d) => s + Number(d.remaining_balance), 0)

  const byAccountType = (Object.keys(ACCOUNT_TYPE_LABELS) as AccountType[])
    .filter((t) => (typeMap.get(t) ?? 0) > 0)
    .map((t) => ({
      type: t,
      label: ACCOUNT_TYPE_LABELS[t],
      balance: typeMap.get(t) ?? 0,
    }))
    .sort((a, b) => b.balance - a.balance)

  return {
    totalAssets,
    totalLiabilities,
    netWorth: totalAssets - totalLiabilities,
    byAccountType,
  }
}

// ─── 7. Savings Rate ──────────────────────────────────────

export async function getSavingsRate(
  userId: string,
  year: number,
  month: number,
): Promise<SavingsRateData> {
  const now = new Date()
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`

  const transactions = await analyticsRepo.findByDateRange(userId, startDate, endDate)

  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + Number(t.amount), 0)

  const expense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + Number(t.amount), 0)

  const savings = income - expense
  const rate = income > 0 ? Math.round((savings / income) * 1000) / 10 : 0 // 1 decimal

  return {
    period: `${MONTH_NAMES[month - 1]} ${year}`,
    income,
    expense,
    savings,
    rate,
  }
}

// ─── 8. Financial Insights ────────────────────────────────

export async function getFinancialInsights(
  userId: string,
): Promise<FinancialInsight[]> {
  const insights: FinancialInsight[] = []
  let id = 0

  const now = new Date()
  const thisYear = now.getFullYear()
  const thisMonth = now.getMonth() + 1

  // Fetch data needed for insights
  const [cashFlow, budgetAnalytics, savingsRate, categories, netWorth] = await Promise.all([
    getCashFlowData(userId, 3),
    getBudgetAnalytics(userId, thisYear, thisMonth),
    getSavingsRate(userId, thisYear, thisMonth),
    categoryRepo.findAll(userId),
    getNetWorth(userId),
  ])

  // Insight 1: Savings rate check
  if (savingsRate.income > 0) {
    if (savingsRate.rate >= 20) {
      insights.push({
        id: String(++id),
        type: 'positive',
        icon: 'trending-up',
        title: 'Tingkat tabungan sehat',
        description: `Kamu menabung ${savingsRate.rate}% dari pendapatan bulan ini. Target ideal minimal 20%.`,
      })
    } else if (savingsRate.rate >= 0) {
      insights.push({
        id: String(++id),
        type: 'neutral',
        icon: 'info',
        title: 'Tingkat tabungan di bawah target',
        description: `Tingkat tabungan kamu ${savingsRate.rate}% bulan ini. Coba tingkatkan ke minimal 20%.`,
      })
    } else {
      insights.push({
        id: String(++id),
        type: 'negative',
        icon: 'alert-circle',
        title: 'Pengeluaran melebihi pendapatan',
        description: `Bulan ini pengeluaran lebih besar ${formatRupiah(Math.abs(savingsRate.savings))} dari pendapatan.`,
      })
    }
  }

  // Insight 2: Budget danger zones
  const dangerBudgets = budgetAnalytics.filter((b) => b.status === 'danger')
  if (dangerBudgets.length > 0) {
    const names = dangerBudgets.map((b) => b.category_name).join(', ')
    insights.push({
      id: String(++id),
      type: 'negative',
      icon: 'alert-circle',
      title: `${dangerBudgets.length} budget hampir habis`,
      description: `Budget untuk ${names} sudah melewati 85%. Pertimbangkan untuk mengurangi pengeluaran kategori ini.`,
    })
  }

  // Insight 3: Monthly trend direction
  if (cashFlow.length >= 2) {
    const latest = cashFlow[cashFlow.length - 1]
    const prev = cashFlow[cashFlow.length - 2]
    if (prev.expense > 0) {
      const expenseChange = ((latest.expense - prev.expense) / prev.expense) * 100
      if (expenseChange > 15) {
        insights.push({
          id: String(++id),
          type: 'negative',
          icon: 'trending-down',
          title: 'Pengeluaran naik signifikan',
          description: `Pengeluaran bulan ini naik ${Math.round(expenseChange)}% dibanding bulan lalu (${formatRupiah(prev.expense)} → ${formatRupiah(latest.expense)}).`,
        })
      } else if (expenseChange < -15) {
        insights.push({
          id: String(++id),
          type: 'positive',
          icon: 'trending-up',
          title: 'Pengeluaran berkurang!',
          description: `Pengeluaran turun ${Math.round(Math.abs(expenseChange))}% dari bulan lalu. Pertahankan!`,
        })
      }
    }
  }

  // Insight 4: Top spending category
  const thisMonthStart = `${thisYear}-${String(thisMonth).padStart(2, '0')}-01`
  const thisMonthEnd = `${thisYear}-${String(thisMonth).padStart(2, '0')}-${new Date(thisYear, thisMonth, 0).getDate()}`
  const topCategories = await getExpenseByCategory(userId, thisYear, thisMonth)
  if (topCategories.length > 0) {
    const top = topCategories[0]
    insights.push({
      id: String(++id),
      type: 'neutral',
      icon: 'target',
      title: `Pengeluaran terbesar: ${top.category_name}`,
      description: `${top.category_name} menyerap ${top.percentage}% total pengeluaran bulan ini (${formatRupiah(top.amount)}).`,
    })
  }

  // Insight 5: Net worth composition
  if (netWorth.byAccountType.length > 0) {
    const topType = netWorth.byAccountType[0]
    const pct = netWorth.totalAssets > 0
      ? Math.round((topType.balance / netWorth.totalAssets) * 100)
      : 0
    insights.push({
      id: String(++id),
      type: 'neutral',
      icon: 'info',
      title: `Aset terbesar: ${topType.label}`,
      description: `${topType.label} menyumbang ${pct}% total kekayaan kamu (${formatRupiah(topType.balance)}).`,
    })
  }

  // Insight 6: Debt awareness
  const activeDebts = await debtRepo.findActive(userId)
  if (activeDebts.length > 0) {
    const totalDebt = activeDebts.reduce((s, d) => s + Number(d.remaining_balance), 0)
    const monthlyPayment = activeDebts.reduce((s, d) => s + Number(d.monthly_payment), 0)
    insights.push({
      id: String(++id),
      type: 'neutral',
      icon: 'target',
      title: `${activeDebts.length} utang aktif`,
      description: `Total sisa utang ${formatRupiah(totalDebt)} dengan cicilan ${formatRupiah(monthlyPayment)}/bulan.`,
    })
  }

  return insights
}

export { CHART_COLORS, CHART_COLORS_RAW, MONTH_NAMES, MONTH_SHORT }
