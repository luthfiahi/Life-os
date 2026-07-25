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
