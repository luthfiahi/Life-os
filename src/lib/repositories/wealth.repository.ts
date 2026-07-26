/**
 * Life OS — Sprint 3: Wealth Repository
 * 
 * Abstracts all Supabase data access for the Wealth domain.
 * Components NEVER call Supabase directly — they go through this layer.
 * 
 * Architecture:
 *   Component → TanStack Query Hook → Service → Repository → Supabase Client
 * 
 * Graceful degradation: if Supabase client is null (env vars missing),
 * all methods return empty arrays / null so the UI falls back gracefully.
 */

import { createClient } from '@/lib/supabase/client'
import type {
  AccountRow,
  AccountInsert,
  AccountUpdate,
  CategoryRow,
  CategoryInsert,
  CategoryUpdate,
  TransactionRow,
  TransactionInsert,
  TransactionUpdate,
  BudgetRow,
  BudgetInsert,
  BudgetUpdate,
  WealthSnapshotData,
  BudgetUtilizationItem,
} from '@/lib/types/wealth'

// ─── Helper ─────────────────────────────────────────────

function getClient() {
  const client = createClient()
  if (!client) return null
  return client
}

// ─── Accounts Repository ──────────────────────────────────

export const accountRepo = {
  async findAll(userId: string): Promise<AccountRow[]> {
    const client = getClient()
    if (!client) return []

    const { data, error } = await client
      .from('accounts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`accountRepo.findAll: ${error.message}`)
    return (data as AccountRow[]) ?? []
  },

  async findActive(userId: string): Promise<AccountRow[]> {
    const client = getClient()
    if (!client) return []

    const { data, error } = await client
      .from('accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (error) throw new Error(`accountRepo.findActive: ${error.message}`)
    return (data as AccountRow[]) ?? []
  },

  async findById(id: string): Promise<AccountRow | null> {
    const client = getClient()
    if (!client) return null

    const { data, error } = await client
      .from('accounts')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw new Error(`accountRepo.findById: ${error.message}`)
    return data as AccountRow | null
  },

  async create(payload: AccountInsert): Promise<AccountRow> {
    const client = getClient()
    if (!client) throw new Error('Supabase client not available')

    const { data, error } = await client
      .from('accounts')
      .insert(payload)
      .select()
      .single()

    if (error) throw new Error(`accountRepo.create: ${error.message}`)
    return data as AccountRow
  },

  async update(id: string, payload: AccountUpdate): Promise<AccountRow> {
    const client = getClient()
    if (!client) throw new Error('Supabase client not available')

    const { data, error } = await client
      .from('accounts')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`accountRepo.update: ${error.message}`)
    return data as AccountRow
  },

  async delete(id: string): Promise<void> {
    const client = getClient()
    if (!client) return

    const { error } = await client.from('accounts').delete().eq('id', id)
    if (error) throw new Error(`accountRepo.delete: ${error.message}`)
  },

  async getTotalBalance(userId: string): Promise<number> {
    const accounts = await this.findActive(userId)
    return accounts.reduce((sum, a) => sum + Number(a.balance), 0)
  },
}

// ─── Categories Repository ────────────────────────────────

export const categoryRepo = {
  async findAll(userId: string): Promise<CategoryRow[]> {
    const client = getClient()
    if (!client) return []

    const { data, error } = await client
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('type', { ascending: true })

    if (error) throw new Error(`categoryRepo.findAll: ${error.message}`)
    return (data as CategoryRow[]) ?? []
  },

  async findByType(userId: string, type: 'income' | 'expense'): Promise<CategoryRow[]> {
    const client = getClient()
    if (!client) return []

    const { data, error } = await client
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .eq('type', type)
      .order('name', { ascending: true })

    if (error) throw new Error(`categoryRepo.findByType: ${error.message}`)
    return (data as CategoryRow[]) ?? []
  },

  async create(payload: CategoryInsert): Promise<CategoryRow> {
    const client = getClient()
    if (!client) throw new Error('Supabase client not available')

    const { data, error } = await client
      .from('categories')
      .insert(payload)
      .select()
      .single()

    if (error) throw new Error(`categoryRepo.create: ${error.message}`)
    return data as CategoryRow
  },

  async update(id: string, payload: CategoryUpdate): Promise<CategoryRow> {
    const client = getClient()
    if (!client) throw new Error('Supabase client not available')

    const { data, error } = await client
      .from('categories')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`categoryRepo.update: ${error.message}`)
    return data as CategoryRow
  },

  async delete(id: string): Promise<void> {
    const client = getClient()
    if (!client) return

    const { error } = await client.from('categories').delete().eq('id', id)
    if (error) throw new Error(`categoryRepo.delete: ${error.message}`)
  },
}

// ─── Transactions Repository ──────────────────────────────

export const transactionRepo = {
  async findAll(userId: string, options?: { limit?: number; offset?: number }): Promise<TransactionRow[]> {
    const client = getClient()
    if (!client) return []

    let query = client
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })

    if (options?.limit) query = query.limit(options.limit)
    if (options?.offset) query = query.range(options.offset, options.offset + (options.limit ?? 20) - 1)

    const { data, error } = await query

    if (error) throw new Error(`transactionRepo.findAll: ${error.message}`)
    return (data as TransactionRow[]) ?? []
  },

  async findByDateRange(userId: string, startDate: string, endDate: string): Promise<TransactionRow[]> {
    const client = getClient()
    if (!client) return []

    const { data, error } = await client
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false })

    if (error) throw new Error(`transactionRepo.findByDateRange: ${error.message}`)
    return (data as TransactionRow[]) ?? []
  },

  async findByAccount(userId: string, accountId: string): Promise<TransactionRow[]> {
    const client = getClient()
    if (!client) return []

    const { data, error } = await client
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .eq('account_id', accountId)
      .order('date', { ascending: false })

    if (error) throw new Error(`transactionRepo.findByAccount: ${error.message}`)
    return (data as TransactionRow[]) ?? []
  },

  async getTodayExpense(userId: string): Promise<number> {
    const client = getClient()
    if (!client) return 0

    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await client
      .from('transactions')
      .select('amount')
      .eq('user_id', userId)
      .eq('type', 'expense')
      .eq('date', today)

    if (error) throw new Error(`transactionRepo.getTodayExpense: ${error.message}`)
    if (!data) return 0

    return data.reduce((sum, row) => sum + Number(row.amount), 0)
  },

  async getMonthExpenseByCategory(userId: string, year: number, month: number): Promise<{ category_id: string; total: number }[]> {
    const client = getClient()
    if (!client) return []

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    // Last day of month
    const lastDay = new Date(year, month, 0).getDate()
    const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`

    const { data, error } = await client
      .from('transactions')
      .select('category_id, amount')
      .eq('user_id', userId)
      .eq('type', 'expense')
      .gte('date', startDate)
      .lte('date', endDate)
      .not('category_id', 'is', null)

    if (error) throw new Error(`transactionRepo.getMonthExpenseByCategory: ${error.message}`)
    if (!data) return []

    // Aggregate by category_id
    const map = new Map<string, number>()
    for (const row of data) {
      const catId = row.category_id as string
      map.set(catId, (map.get(catId) ?? 0) + Number(row.amount))
    }

    return Array.from(map.entries()).map(([category_id, total]) => ({
      category_id,
      total,
    }))
  },

  async create(payload: TransactionInsert): Promise<TransactionRow> {
    const client = getClient()
    if (!client) throw new Error('Supabase client not available')

    const { data, error } = await client
      .from('transactions')
      .insert(payload)
      .select()
      .single()

    if (error) throw new Error(`transactionRepo.create: ${error.message}`)
    return data as TransactionRow
  },

  async update(id: string, payload: TransactionUpdate): Promise<TransactionRow> {
    const client = getClient()
    if (!client) throw new Error('Supabase client not available')

    const { data, error } = await client
      .from('transactions')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`transactionRepo.update: ${error.message}`)
    return data as TransactionRow
  },

  async delete(id: string): Promise<void> {
    const client = getClient()
    if (!client) return

    const { error } = await client.from('transactions').delete().eq('id', id)
    if (error) throw new Error(`transactionRepo.delete: ${error.message}`)
  },
}

// ─── Budgets Repository ───────────────────────────────────

export const budgetRepo = {
  async findAll(userId: string): Promise<BudgetRow[]> {
    const client = getClient()
    if (!client) return []

    const { data, error } = await client
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`budgetRepo.findAll: ${error.message}`)
    return (data as BudgetRow[]) ?? []
  },

  async findActive(userId: string): Promise<BudgetRow[]> {
    const client = getClient()
    if (!client) return []

    const { data, error } = await client
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('amount', { ascending: false })

    if (error) throw new Error(`budgetRepo.findActive: ${error.message}`)
    return (data as BudgetRow[]) ?? []
  },

  async create(payload: BudgetInsert): Promise<BudgetRow> {
    const client = getClient()
    if (!client) throw new Error('Supabase client not available')

    const { data, error } = await client
      .from('budgets')
      .insert(payload)
      .select()
      .single()

    if (error) throw new Error(`budgetRepo.create: ${error.message}`)
    return data as BudgetRow
  },

  async update(id: string, payload: BudgetUpdate): Promise<BudgetRow> {
    const client = getClient()
    if (!client) throw new Error('Supabase client not available')

    const { data, error } = await client
      .from('budgets')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`budgetRepo.update: ${error.message}`)
    return data as BudgetRow
  },

  async delete(id: string): Promise<void> {
    const client = getClient()
    if (!client) return

    const { error } = await client.from('budgets').delete().eq('id', id)
    if (error) throw new Error(`budgetRepo.delete: ${error.message}`)
  },
}

// ─── Analytics Repository (Sprint 5) ────────────────────────

export const analyticsRepo = {
  /** Get all transactions in a date range (for cash flow, trends) */
  async findByDateRange(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<TransactionRow[]> {
    return transactionRepo.findByDateRange(userId, startDate, endDate)
  },

  /** Get total amount grouped by category for expense in a date range */
  async getExpenseByCategory(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<{ category_id: string; total: number }[]> {
    const client = getClient()
    if (!client) return []

    const { data, error } = await client
      .from('transactions')
      .select('category_id, amount')
      .eq('user_id', userId)
      .eq('type', 'expense')
      .gte('date', startDate)
      .lte('date', endDate)
      .not('category_id', 'is', null)

    if (error) throw new Error(`analyticsRepo.getExpenseByCategory: ${error.message}`)
    if (!data) return []

    const map = new Map<string, number>()
    for (const row of data) {
      const catId = row.category_id as string
      map.set(catId, (map.get(catId) ?? 0) + Number(row.amount))
    }

    return Array.from(map.entries()).map(([category_id, total]) => ({
      category_id,
      total,
    }))
  },

  /** Get daily expense totals for a month (for heatmap) */
  async getDailyExpenses(
    userId: string,
    year: number,
    month: number,
  ): Promise<{ date: string; total: number }[]> {
    const client = getClient()
    if (!client) return []

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const lastDay = new Date(year, month, 0).getDate()
    const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`

    const { data, error } = await client
      .from('transactions')
      .select('date, amount')
      .eq('user_id', userId)
      .eq('type', 'expense')
      .gte('date', startDate)
      .lte('date', endDate)

    if (error) throw new Error(`analyticsRepo.getDailyExpenses: ${error.message}`)
    if (!data) return []

    const map = new Map<string, number>()
    for (const row of data) {
      const d = row.date as string
      map.set(d, (map.get(d) ?? 0) + Number(row.amount))
    }

    return Array.from(map.entries()).map(([date, total]) => ({ date, total }))
  },

  /** Get monthly totals by type for N months back */
  async getMonthlyTotals(
    userId: string,
    months: number,
  ): Promise<{ month: string; type: string; total: number }[]> {
    const client = getClient()
    if (!client) return []

    const now = new Date()
    const startDate = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1)
    const startStr = startDate.toISOString().split('T')[0]
    const endStr = now.toISOString().split('T')[0]

    const { data, error } = await client
      .from('transactions')
      .select('date, type, amount')
      .eq('user_id', userId)
      .in('type', ['income', 'expense'])
      .gte('date', startStr)
      .lte('date', endStr)

    if (error) throw new Error(`analyticsRepo.getMonthlyTotals: ${error.message}`)
    if (!data) return []

    // Group by YYYY-MM + type
    const map = new Map<string, number>()
    for (const row of data) {
      const monthKey = (row.date as string).substring(0, 7)
      const key = `${monthKey}|${row.type}`
      map.set(key, (map.get(key) ?? 0) + Number(row.amount))
    }

    return Array.from(map.entries()).map(([key, total]) => {
      const [month, type] = key.split('|')
      return { month, type, total }
    })
  },
}
