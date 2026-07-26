/**
 * Life OS — Sprint 3: Wealth Domain Types
 * Generated from Supabase schema: accounts, categories, transactions, budgets.
 * All types are database-row representations with snake_case fields.
 */

// ─── Enums ───────────────────────────────────────────────

export type AccountType = 'bank' | 'cash' | 'ewallet' | 'investment'
export type TransactionType = 'income' | 'expense' | 'transfer'
export type CategoryType = 'income' | 'expense'
export type BudgetPeriod = 'monthly' | 'weekly'

// ─── Database Row Types ───────────────────────────────────

export interface AccountRow {
  id: string
  user_id: string
  name: string
  type: AccountType
  balance: number
  currency: string
  is_active: boolean
  icon: string | null
  color: string | null
  created_at: string
  updated_at: string
}

export interface CategoryRow {
  id: string
  user_id: string
  name: string
  type: CategoryType
  icon: string | null
  color: string | null
  is_default: boolean
  created_at: string
}

export interface TransactionRow {
  id: string
  user_id: string
  account_id: string
  category_id: string | null
  type: TransactionType
  amount: number
  description: string
  date: string
  note: string | null
  created_at: string
}

export interface BudgetRow {
  id: string
  user_id: string
  category_id: string
  amount: number
  period: BudgetPeriod
  is_active: boolean
  created_at: string
  updated_at: string
}

// ─── Insert Payloads ──────────────────────────────────────
/** Fields required when creating a new row (id/timestamps auto-generated) */

export interface AccountInsert {
  user_id: string
  name: string
  type: AccountType
  balance?: number
  currency?: string
  is_active?: boolean
  icon?: string | null
  color?: string | null
}

export interface CategoryInsert {
  user_id: string
  name: string
  type: CategoryType
  icon?: string | null
  color?: string | null
  is_default?: boolean
}

export interface TransactionInsert {
  user_id: string
  account_id: string
  category_id?: string | null
  type: TransactionType
  amount: number
  description?: string
  date?: string
  note?: string | null
}

export interface BudgetInsert {
  user_id: string
  category_id: string
  amount: number
  period?: BudgetPeriod
  is_active?: boolean
}

// ─── Update Payloads ──────────────────────────────────────
/** All fields optional — only provided fields will be patched */

export type AccountUpdate = Partial<Omit<AccountInsert, 'user_id'>>
export type CategoryUpdate = Partial<Omit<CategoryInsert, 'user_id'>>
export type TransactionUpdate = Partial<Omit<TransactionInsert, 'user_id'>>
export type BudgetUpdate = Partial<Omit<BudgetInsert, 'user_id'> & { is_active?: boolean }>

// ─── Debt Types (Sprint 5B) ───────────────────────────────

export interface DebtRow {
  id: string
  user_id: string
  name: string
  creditor: string
  total_amount: number
  interest_rate: number
  tenure_months: number
  monthly_payment: number
  remaining_balance: number
  start_date: string
  due_day: number
  is_paid_off: boolean
  paid_off_at: string | null
  note: string | null
  created_at: string
  updated_at: string
}

export interface DebtPaymentRow {
  id: string
  user_id: string
  debt_id: string
  amount: number
  date: string
  note: string | null
  created_at: string
}

export interface DebtInsert {
  user_id: string
  name: string
  creditor?: string
  total_amount: number
  interest_rate?: number
  tenure_months: number
  remaining_balance?: number
  start_date?: string
  due_day?: number
  note?: string | null
}

export interface DebtPaymentInsert {
  user_id: string
  debt_id: string
  amount: number
  date?: string
  note?: string | null
}

export type DebtUpdate = Partial<Omit<DebtInsert, 'user_id'>> & { is_paid_off?: boolean; paid_off_at?: string | null; remaining_balance?: number }

export interface DebtSnapshotData {
  totalDebt: number
  monthlyPayment: number
  totalOriginal: number
  paidOffPercentage: number
  activeDebts: number
  remainingMonths: number
}

// ─── Analytics Types (Sprint 5A) ─────────────────────────────

/** Single data point for Cash Flow / Monthly Trend charts */
export interface CashFlowPoint {
  month: string       // '2026-07'
  label: string       // 'Jul 2026'
  income: number
  expense: number
  net: number
}

/** Expense breakdown by category (for donut/bar chart) */
export interface CategoryBreakdownItem {
  category_id: string
  category_name: string
  amount: number
  percentage: number
  color: string
}

/** Budget analytics per category */
export interface BudgetAnalyticsItem {
  category_id: string
  category_name: string
  budget_amount: number
  spent: number
  remaining: number
  percentage: number
  status: 'safe' | 'warning' | 'danger'
}

/** Heatmap cell — one day */
export interface HeatmapCell {
  date: string   // '2026-07-14'
  dayOfWeek: number // 0=Mon ... 6=Sun
  week: number    // week index in month
  amount: number  // total expense that day
}

/** Net worth snapshot */
export interface NetWorthData {
  totalAssets: number
  totalLiabilities: number
  netWorth: number
  byAccountType: { type: AccountType; label: string; balance: number }[]
}

/** Savings rate for a period */
export interface SavingsRateData {
  period: string     // 'Juli 2026'
  income: number
  expense: number
  savings: number
  rate: number       // percentage, e.g. 35.2
}

/** A single financial insight generated from data */
export interface FinancialInsight {
  id: string
  type: 'positive' | 'negative' | 'neutral'
  icon: 'trending-up' | 'trending-down' | 'alert-circle' | 'info' | 'zap' | 'target'
  title: string
  description: string
}

// ─── Dashboard Aggregation Types ──────────────────────────
/** Used by the Wealth Snapshot widget on the Dashboard */

export interface WealthSnapshotData {
  totalBalance: number
  todayExpense: number
  budgetUtilization: number
  totalBalanceChange: string | null
  todayExpenseChange: string | null
}

export interface BudgetUtilizationItem {
  category_id: string
  category_name: string
  budget_amount: number
  spent: number
  remaining: number
  percentage: number
}
