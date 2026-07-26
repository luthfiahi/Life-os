'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Wallet, Receipt, Target, ArrowRight, TrendingUp, TrendingDown, Minus, BarChart3, Landmark,
  Plus, ArrowDownRight, ArrowUpRight, Repeat, CircleDollarSign, PiggyBank, CreditCard,
  Search, SlidersHorizontal, FileBarChart,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

import { cn } from '@/lib/utils'
import {
  useWealthSnapshot, useAccounts, useTransactions, useBudgets,
  useCategories, useDeleteTransaction,
} from '@/lib/queries/wealth-queries'
import { useDebtSnapshot } from '@/lib/queries/debt-queries'
import { useCashFlow, useSavingsRate, useExpenseByCategory } from '@/lib/queries/analytics-queries'
import { formatRupiah, formatPercent } from '@/lib/services/wealth.service'
import { InsightPanel } from '@/components/wealth/insight-panel'
import { TransactionFormDialog } from '@/components/wealth/transaction-form-dialog'
import { AccountFormDialog } from '@/components/wealth/account-form-dialog'
import { BudgetFormDialog } from '@/components/wealth/budget-form-dialog'
import { TransactionDetailDrawer } from '@/components/wealth/transaction-detail-drawer'
import type { AccountType, TransactionRow, AccountRow, CategoryRow } from '@/lib/types/wealth'

// ─── Account type config ─────────────────────────────────

const accountTypeConfig: Record<AccountType, { label: string; icon: typeof Wallet; color: string }> = {
  bank: { label: 'Bank', icon: Wallet, color: 'text-blue-500' },
  cash: { label: 'Tunai', icon: Wallet, color: 'text-emerald-500' },
  ewallet: { label: 'E-Wallet', icon: Wallet, color: 'text-violet-500' },
  investment: { label: 'Investasi', icon: TrendingUp, color: 'text-amber-500' },
}

// ─── Skeletons ───────────────────────────────────────────

function SummaryCardSkeleton() {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-8 rounded-[var(--radius-md)]" />
      </div>
      <Skeleton className="h-7 w-28 mb-2" />
      <Skeleton className="h-3 w-24" />
    </Card>
  )
}

function TransactionRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      <Skeleton className="h-9 w-9 rounded-full" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-4 w-20" />
    </div>
  )
}

// ─── Summary Card ────────────────────────────────────────

interface SummaryCardData {
  label: string
  value: string
  icon: typeof Wallet
  iconBg: string
  iconColor: string
  change?: string | null
  changeType?: 'positive' | 'negative' | 'neutral'
  changeLabel?: string
}

function SummaryCard({ data, loading }: { data: SummaryCardData; loading?: boolean }) {
  if (loading) return <SummaryCardSkeleton />

  const Icon = data.icon
  return (
    <Card className="group p-4 transition-all duration-200 hover:shadow-[var(--shadow-elevated)] hover:border-[var(--c-accent)]/20">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-medium text-[var(--c-text-muted)] uppercase tracking-wider">
          {data.label}
        </span>
        <div className={cn('flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] transition-transform group-hover:scale-105', data.iconBg)}>
          <Icon className={cn('h-4 w-4', data.iconColor)} />
        </div>
      </div>
      <p className="text-xl font-bold text-[var(--c-text)] tabular-nums tracking-tight leading-none mb-1.5">
        {data.value}
      </p>
      {data.change && (
        <div className="flex items-center gap-1">
          {data.changeType === 'positive' ? (
            <TrendingUp className="h-3 w-3 text-emerald-500" />
          ) : data.changeType === 'negative' ? (
            <TrendingDown className="h-3 w-3 text-[var(--c-accent-2)]" />
          ) : (
            <Minus className="h-3 w-3 text-[var(--c-text-muted)]" />
          )}
          <span className={cn(
            'text-[11px] font-medium',
            data.changeType === 'positive' ? 'text-emerald-500' :
            data.changeType === 'negative' ? 'text-[var(--c-accent-2)]' : 'text-[var(--c-text-muted)]'
          )}>
            {data.change}
          </span>
          {data.changeLabel && (
            <span className="text-[11px] text-[var(--c-text-muted)]">{data.changeLabel}</span>
          )}
        </div>
      )}
    </Card>
  )
}

// ─── Transaction Row for Overview ────────────────────────

function OverviewTransactionRow({
  transaction,
  account,
  category,
  onClick,
}: {
  transaction: TransactionRow
  account?: AccountRow
  category?: CategoryRow
  onClick?: () => void
}) {
  const isExpense = transaction.type === 'expense'
  const isTransfer = transaction.type === 'transfer'

  function formatDate(dateStr: string): string {
    try {
      const d = new Date(dateStr + 'T00:00:00')
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
      return `${d.getDate()} ${months[d.getMonth()]}`
    } catch {
      return dateStr
    }
  }

  return (
    <button
      onClick={onClick}
      className="w-full group flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 transition-colors hover:bg-[var(--c-surface)] text-left"
    >
      {/* Icon */}
      {category ? (
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{ backgroundColor: category.color || 'var(--c-border)' }}
        >
          {category.name.charAt(0).toUpperCase()}
        </div>
      ) : (
        <div className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
          isTransfer ? 'bg-[var(--c-accent)]/10' :
          isExpense ? 'bg-[var(--c-accent-2)]/10' : 'bg-emerald-500/10'
        )}>
          {isTransfer ? (
            <Repeat className="h-4 w-4 text-[var(--c-accent)]" />
          ) : isExpense ? (
            <ArrowDownRight className="h-4 w-4 text-[var(--c-accent-2)]" />
          ) : (
            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
          )}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--c-text)] truncate">
          {transaction.description || 'Tanpa deskripsi'}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          {category && (
            <span className="text-[10px] text-[var(--c-text-muted)]">{category.name}</span>
          )}
          {category && account && <span className="text-[10px] text-[var(--c-border)]">/</span>}
          {account && (
            <span className="text-[10px] text-[var(--c-text-muted)]">{account.name}</span>
          )}
          <span className="text-[10px] text-[var(--c-text-muted)]">{formatDate(transaction.date)}</span>
        </div>
      </div>

      {/* Amount */}
      <span className={cn(
        'text-sm font-semibold tabular-nums shrink-0 group-hover:translate-x-0.5 transition-transform',
        isTransfer ? 'text-[var(--c-accent)]' :
        isExpense ? 'text-[var(--c-accent-2)]' : 'text-emerald-500'
      )}>
        {isExpense ? '-' : isTransfer ? '' : '+'}{formatRupiah(Number(transaction.amount))}
      </span>
    </button>
  )
}

// ─── Mini Cash Flow Chart Placeholder ────────────────────

function MiniCashFlowChart({ data }: { data?: { income: number; expense: number; net: number; label: string }[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-[var(--c-text-muted)]">
        <div className="text-center">
          <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p className="text-xs">Belum ada data</p>
        </div>
      </div>
    )
  }

  const maxVal = Math.max(...data.flatMap(d => [d.income, d.expense]), 1)
  const bars = data.slice(-6)

  return (
    <div className="flex items-end justify-between gap-2 h-32 px-1">
      {bars.map((d, i) => {
        const incomeH = (d.income / maxVal) * 100
        const expenseH = (d.expense / maxVal) * 100
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="flex items-end gap-0.5 w-full h-24">
              <div
                className="flex-1 bg-emerald-500/80 rounded-t-sm transition-all duration-500"
                style={{ height: `${Math.max(incomeH, 2)}%` }}
              />
              <div
                className="flex-1 bg-[var(--c-accent-2)]/80 rounded-t-sm transition-all duration-500"
                style={{ height: `${Math.max(expenseH, 2)}%` }}
              />
            </div>
            <span className="text-[9px] text-[var(--c-text-muted)]">{d.label}</span>
          </div>
        )
      })}
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────

export default function WealthPage() {
  const { data: snapshot, isLoading: snapLoading } = useWealthSnapshot()
  const { data: accounts, isLoading: accLoading } = useAccounts({ active: true })
  const { data: transactions, isLoading: txLoading } = useTransactions({ limit: 50 })
  const { data: budgets, isLoading: budLoading } = useBudgets({ active: true })
  const { data: categories } = useCategories()
  const { data: debtSnap } = useDebtSnapshot()
  const { data: cashFlow } = useCashFlow(6)
  const now = new Date()
  const { data: savingsRate } = useSavingsRate(now.getFullYear(), now.getMonth() + 1)
  const { data: topCategories } = useExpenseByCategory(now.getFullYear(), now.getMonth() + 1)

  // Form states
  const [txFormOpen, setTxFormOpen] = useState(false)
  const [accFormOpen, setAccFormOpen] = useState(false)
  const [budgetFormOpen, setBudgetFormOpen] = useState(false)

  // Detail drawer
  const [detailTx, setDetailTx] = useState<TransactionRow | null>(null)
  const [editingTx, setEditingTx] = useState<TransactionRow | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Quick actions sheet (mobile)
  const [quickActionsOpen, setQuickActionsOpen] = useState(false)

  // Mobile FAB
  const [fabOpen, setFabOpen] = useState(false)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterAccount, setFilterAccount] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  // Delete transaction
  const deleteTx = useDeleteTransaction()

  // Maps
  const accountsMap = useMemo(() => {
    const map = new Map<string, AccountRow>()
    accounts?.forEach((a) => map.set(a.id, a))
    return map
  }, [accounts])

  const categoriesMap = useMemo(() => {
    const map = new Map<string, CategoryRow>()
    categories?.forEach((c) => map.set(c.id, c))
    return map
  }, [categories])

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    if (!transactions) return []
    return transactions.filter((tx) => {
      if (filterType !== 'all' && tx.type !== filterType) return false
      if (filterAccount !== 'all' && tx.account_id !== filterAccount) return false
      if (filterCategory !== 'all' && tx.category_id !== filterCategory) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const desc = (tx.description || '').toLowerCase()
        const catName = tx.category_id ? (categoriesMap.get(tx.category_id)?.name || '').toLowerCase() : ''
        if (!desc.includes(q) && !catName.includes(q)) return false
      }
      return true
    }).slice(0, 15)
  }, [transactions, filterType, filterAccount, filterCategory, searchQuery, categoriesMap])

  // Monthly income/expense from snapshot
  const monthlyIncome = useMemo(() => {
    if (!transactions) return 0
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    return transactions
      .filter(t => t.type === 'income' && t.date.startsWith(month))
      .reduce((s, t) => s + Number(t.amount), 0)
  }, [transactions, now])

  const monthlyExpense = useMemo(() => {
    if (!transactions) return 0
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    return transactions
      .filter(t => t.type === 'expense' && t.date.startsWith(month))
      .reduce((s, t) => s + Number(t.amount), 0)
  }, [transactions, now])

  const netCashFlow = monthlyIncome - monthlyExpense
  const savingsRateValue = monthlyIncome > 0 ? Math.round((netCashFlow / monthlyIncome) * 100) : 0

  // Summary cards data
  const summaryCards: SummaryCardData[] = [
    {
      label: 'Total Saldo',
      value: formatRupiah(snapshot?.totalBalance ?? 0),
      icon: CircleDollarSign,
      iconBg: 'bg-[var(--c-accent)]/10',
      iconColor: 'text-[var(--c-accent)]',
      change: snapshot?.totalBalanceChange ?? undefined,
      changeType: snapshot?.totalBalanceChange?.startsWith('+') ? 'positive' : snapshot?.totalBalanceChange?.startsWith('-') ? 'negative' : 'neutral',
      changeLabel: 'vs bulan lalu',
    },
    {
      label: 'Pemasukan Bulan Ini',
      value: formatRupiah(monthlyIncome),
      icon: ArrowUpRight,
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-500',
    },
    {
      label: 'Pengeluaran Bulan Ini',
      value: formatRupiah(monthlyExpense),
      icon: ArrowDownRight,
      iconBg: 'bg-[var(--c-accent-2)]/10',
      iconColor: 'text-[var(--c-accent-2)]',
    },
    {
      label: 'Arus Kas Bersih',
      value: (netCashFlow >= 0 ? '+' : '-') + formatRupiah(Math.abs(netCashFlow)),
      icon: TrendingUp,
      iconBg: netCashFlow >= 0 ? 'bg-emerald-500/10' : 'bg-[var(--c-accent-2)]/10',
      iconColor: netCashFlow >= 0 ? 'text-emerald-500' : 'text-[var(--c-accent-2)]',
    },
    {
      label: 'Savings Rate',
      value: formatPercent(savingsRateValue),
      icon: PiggyBank,
      iconBg: savingsRateValue >= 20 ? 'bg-emerald-500/10' : savingsRateValue >= 10 ? 'bg-amber-500/10' : 'bg-[var(--c-accent-2)]/10',
      iconColor: savingsRateValue >= 20 ? 'text-emerald-500' : savingsRateValue >= 10 ? 'text-amber-500' : 'text-[var(--c-accent-2)]',
    },
    {
      label: 'Akun Aktif',
      value: String(accounts?.length ?? 0),
      icon: Wallet,
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
    },
    {
      label: 'Budget Aktif',
      value: String(budgets?.length ?? 0),
      icon: Target,
      iconBg: 'bg-violet-500/10',
      iconColor: 'text-violet-500',
    },
    {
      label: 'Total Utang',
      value: formatRupiah(debtSnap?.totalDebt ?? 0),
      icon: CreditCard,
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-500',
    },
  ]

  const hasActiveFilters = filterType !== 'all' || filterAccount !== 'all' || filterCategory !== 'all' || searchQuery !== ''

  const isLoading = snapLoading || accLoading || txLoading || budLoading

  function handleEditTx(tx: TransactionRow) {
    setEditingTx(tx)
    setTxFormOpen(true)
  }

  function handleAddTx() {
    setEditingTx(null)
    setTxFormOpen(true)
  }

  function handleTxFormClose(open: boolean) {
    setTxFormOpen(open)
    if (!open) setEditingTx(null)
  }

  async function handleDeleteTx() {
    if (!deletingId) return
    try {
      await deleteTx.mutateAsync(deletingId)
      setDeletingId(null)
    } catch {
      // handled by mutation
    }
  }

  function resetFilters() {
    setSearchQuery('')
    setFilterType('all')
    setFilterAccount('all')
    setFilterCategory('all')
  }

  function formatGroupDate(dateStr: string): string {
    try {
      const d = new Date(dateStr + 'T00:00:00')
      const today = new Date()
      const yesterday = new Date()
      yesterday.setDate(today.getDate() - 1)
      const dStr = d.toISOString().split('T')[0]
      const todayStr = today.toISOString().split('T')[0]
      const yestStr = yesterday.toISOString().split('T')[0]
      const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
      if (dStr === todayStr) return 'Hari Ini'
      if (dStr === yestStr) return 'Kemarin'
      return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
    } catch {
      return dateStr
    }
  }

  // Group filtered transactions by date
  const groupedTransactions = useMemo(() => {
    const groups: { date: string; items: TransactionRow[] }[] = []
    const dateMap = new Map<string, TransactionRow[]>()
    filteredTransactions.forEach((tx) => {
      const d = tx.date
      if (!dateMap.has(d)) dateMap.set(d, [])
      dateMap.get(d)!.push(tx)
    })
    dateMap.forEach((items, date) => groups.push({ date, items }))
    groups.sort((a, b) => b.date.localeCompare(a.date))
    return groups
  }, [filteredTransactions])

  const expenseCategories = categories?.filter(c => c.type === 'expense') ?? []

  return (
    <div className="animate-fade-in -m-4 lg:-m-6">
      {/* ─── Header Bar ─── */}
      <div className="sticky top-0 z-10 bg-[var(--c-bg)]/80 backdrop-blur-md border-b border-[var(--c-border)] px-4 lg:px-6 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-h1 text-[var(--c-text)]">Wealth</h1>
              <Badge variant="outline" className="text-[10px] font-normal">
                Overview
              </Badge>
            </div>
            <p className="text-xs text-[var(--c-text-muted)] mt-0.5">
              Kelola keuangan: akun, transaksi, budget, tabungan, dan hutang.
            </p>
          </div>

          {/* Quick Actions — Desktop */}
          <div className="hidden md:flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setTxFormOpen(true)}>
              <Plus className="h-3.5 w-3.5" />
              Transaksi
            </Button>
            <Button variant="outline" size="sm" onClick={() => setAccFormOpen(true)}>
              <Plus className="h-3.5 w-3.5" />
              Akun
            </Button>
            <Button variant="outline" size="sm" onClick={() => setBudgetFormOpen(true)}>
              <Plus className="h-3.5 w-3.5" />
              Budget
            </Button>
          </div>

          {/* Quick Actions — Mobile trigger */}
          <Button
            variant="primary" size="sm"
            className="md:hidden"
            onClick={() => setQuickActionsOpen(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <div className="flex gap-6">
        {/* Left Column — Main dashboard */}
        <div className="flex-1 min-w-0 px-4 lg:px-6 py-4 space-y-5">

          {/* ─── 8 Summary Cards ─── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {summaryCards.map((card) => (
              <SummaryCard key={card.label} data={card} loading={isLoading} />
            ))}
          </div>

          {/* ─── Quick Navigation (compact) ─── */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {[
              { href: '/wealth/accounts', icon: Wallet, label: 'Akun', count: accounts?.length ?? 0 },
              { href: '/wealth/transactions', icon: Receipt, label: 'Transaksi', count: transactions?.length ?? 0 },
              { href: '/wealth/budgets', icon: Target, label: 'Budget', count: budgets?.length ?? 0 },
              { href: '/wealth/debts', icon: Landmark, label: 'Utang' },
              { href: '/wealth/analytics', icon: BarChart3, label: 'Analytics' },
              { href: '/wealth/reports', icon: FileBarChart, label: 'Reports' },
            ].map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.href} href={item.href} className="group">
                  <Card className="p-3 transition-all duration-200 hover:border-[var(--c-accent)]/30 hover:shadow-[var(--shadow-elevated)]">
                    <div className="flex flex-col items-center gap-1.5 text-center">
                      <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--c-accent)]/10 group-hover:bg-[var(--c-accent)]/15 transition-colors">
                        <Icon className="h-4 w-4 text-[var(--c-accent)]" />
                      </div>
                      <span className="text-[11px] font-medium text-[var(--c-text)]">{item.label}</span>
                      {'count' in item && item.count !== undefined && (
                        <span className="text-[10px] text-[var(--c-text-muted)]">{item.count}</span>
                      )}
                    </div>
                  </Card>
                </Link>
              )
            })}
          </div>

          {/* ─── Mini Cash Flow Chart ─── */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[var(--c-text)]">Cash Flow</h2>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] text-[var(--c-text-muted)]">Masuk</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-[var(--c-accent-2)]" />
                  <span className="text-[10px] text-[var(--c-text-muted)]">Keluar</span>
                </div>
                <Link href="/wealth/analytics" className="text-[10px] text-[var(--c-accent)] hover:underline">
                  Detail
                </Link>
              </div>
            </div>
            <MiniCashFlowChart data={cashFlow} />
          </Card>

          {/* ─── Recent Transactions ─── */}
          <Card className="overflow-hidden">
            <div className="p-4 pb-2">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-[var(--c-text)]">Transaksi Terbaru</h2>
                <div className="flex items-center gap-2">
                  {/* Filter toggle */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={cn(
                      'flex items-center gap-1.5 h-7 px-2.5 rounded-[var(--radius-md)] text-xs font-medium transition-colors',
                      showFilters || hasActiveFilters
                        ? 'bg-[var(--c-accent)]/10 text-[var(--c-accent)]'
                        : 'text-[var(--c-text-muted)] hover:bg-[var(--c-surface)]'
                    )}
                  >
                    <SlidersHorizontal className="h-3 w-3" />
                    Filter
                    {hasActiveFilters && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--c-accent)]" />
                    )}
                  </button>
                  <Link href="/wealth/transactions" className="flex items-center gap-1 text-xs text-[var(--c-accent)] hover:underline">
                    Semua
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>

              {/* Filter bar */}
              {showFilters && (
                <div className="flex flex-wrap items-center gap-2 mb-3 animate-slide-up">
                  {/* Search */}
                  <div className="relative flex-1 min-w-[140px]">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--c-text-muted)]" />
                    <input
                      type="text"
                      placeholder="Cari transaksi..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-8 w-full rounded-[var(--radius-md)] border border-[var(--c-border)] bg-[var(--c-surface)] pl-8 pr-3 text-xs text-[var(--c-text)] placeholder:text-[var(--c-text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--c-accent)] focus:border-[var(--c-accent)]"
                    />
                  </div>

                  {/* Type filter */}
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="h-8 w-auto text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Tipe</SelectItem>
                      <SelectItem value="income">Pemasukan</SelectItem>
                      <SelectItem value="expense">Pengeluaran</SelectItem>
                      <SelectItem value="transfer">Transfer</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Account filter */}
                  {(accounts && accounts.length > 1) && (
                    <Select value={filterAccount} onValueChange={setFilterAccount}>
                      <SelectTrigger className="h-8 w-auto text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Akun</SelectItem>
                        {accounts.map((a) => (
                          <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {/* Category filter */}
                  {expenseCategories.length > 0 && (
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger className="h-8 w-auto text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Kategori</SelectItem>
                        {expenseCategories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {/* Reset */}
                  {hasActiveFilters && (
                    <button
                      onClick={resetFilters}
                      className="h-8 px-2.5 rounded-[var(--radius-md)] text-xs font-medium text-[var(--c-accent-2)] hover:bg-[var(--c-accent-2)]/10 transition-colors"
                    >
                      Reset
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Transaction list */}
            <div className="max-h-[400px] overflow-y-auto">
              {txLoading ? (
                <div className="space-y-1 px-4 pb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <TransactionRowSkeleton key={i} />
                  ))}
                </div>
              ) : filteredTransactions.length > 0 ? (
                <div>
                  {groupedTransactions.map((group) => (
                    <div key={group.date}>
                      <p className="text-[10px] font-semibold text-[var(--c-text-muted)] uppercase tracking-wider px-4 pt-2 pb-1">
                        {formatGroupDate(group.date)}
                      </p>
                      <div className="divide-y divide-[var(--c-border)]/50">
                        {group.items.map((tx) => (
                          <div key={tx.id} className="px-1">
                            <OverviewTransactionRow
                              transaction={tx}
                              account={accountsMap.get(tx.account_id)}
                              category={tx.category_id ? categoriesMap.get(tx.category_id) : undefined}
                              onClick={() => setDetailTx(tx)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="h-2" />
                </div>
              ) : hasActiveFilters ? (
                <div className="flex flex-col items-center justify-center py-10 px-4">
                  <Search className="h-8 w-8 text-[var(--c-text-muted)] mb-3 opacity-40" />
                  <p className="text-sm font-medium text-[var(--c-text)] mb-1">Tidak ada hasil</p>
                  <p className="text-xs text-[var(--c-text-muted)] mb-3">
                    Coba ubah filter pencarian kamu.
                  </p>
                  <Button variant="ghost" size="sm" onClick={resetFilters}>
                    Reset Filter
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 px-4">
                  <div className="h-14 w-14 rounded-full bg-[var(--c-surface)] flex items-center justify-center mb-3">
                    <Receipt className="h-6 w-6 text-[var(--c-text-muted)]" />
                  </div>
                  <p className="text-sm font-semibold text-[var(--c-text)] mb-1">Belum ada transaksi</p>
                  <p className="text-xs text-[var(--c-text-muted)] mb-3 text-center max-w-[240px]">
                    Mulai catat pemasukan dan pengeluaran pertamamu untuk melihat riwayat di sini.
                  </p>
                  <Button variant="primary" size="sm" onClick={handleAddTx}>
                    <Plus className="h-3.5 w-3.5" />
                    Tambah Transaksi
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* ─── Recent Accounts (compact) ─── */}
          {accounts && accounts.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-[var(--c-text)]">Akun Kamu</h2>
                <Link href="/wealth/accounts" className="text-xs text-[var(--c-accent)] hover:underline flex items-center gap-1">
                  Lihat semua <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {accounts.slice(0, 3).map((account) => {
                  const config = accountTypeConfig[account.type]
                  const TypeIcon = config.icon
                  return (
                    <Card key={account.id} className="group p-3 transition-all duration-200 hover:border-[var(--c-accent)]/30 hover:shadow-[var(--shadow-elevated)]">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] transition-transform group-hover:scale-105',
                          'bg-[var(--c-surface)]'
                        )}>
                          <TypeIcon className={cn('h-4 w-4', config.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-[var(--c-text)] truncate">{account.name}</p>
                            <span className={cn(
                              'h-1.5 w-1.5 shrink-0 rounded-full',
                              account.is_active ? 'bg-emerald-400' : 'bg-[var(--c-text-muted)]'
                            )} />
                          </div>
                          <p className="text-[10px] text-[var(--c-text-muted)]">{config.label}</p>
                        </div>
                        <p className="text-sm font-semibold text-[var(--c-text)] tabular-nums">
                          {formatRupiah(Number(account.balance))}
                        </p>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* ─── Right Column — Insight Panel (desktop only) ─── */}
        <div className="hidden xl:block w-72 shrink-0 py-4 pr-6">
          <div className="sticky top-16">
            <h2 className="text-xs font-semibold text-[var(--c-text-muted)] uppercase tracking-wider mb-3">
              Insights
            </h2>
            <InsightPanel />
          </div>
        </div>
      </div>

      {/* ─── Mobile FAB ─── */}
      <div className="fixed bottom-20 right-4 z-30 lg:hidden">
        {fabOpen && (
          <div className="absolute bottom-14 right-0 flex flex-col gap-2 animate-slide-up mb-2">
            <button
              onClick={() => { setFabOpen(false); setBudgetFormOpen(true) }}
              className="flex items-center gap-2 bg-[var(--c-card)] border border-[var(--c-border)] rounded-[var(--radius-lg)] px-3 py-2 shadow-[var(--shadow-elevated)] text-sm text-[var(--c-text)] hover:bg-[var(--c-surface)] transition-colors"
            >
              <Target className="h-4 w-4 text-violet-500" />
              Budget
            </button>
            <button
              onClick={() => { setFabOpen(false); setAccFormOpen(true) }}
              className="flex items-center gap-2 bg-[var(--c-card)] border border-[var(--c-border)] rounded-[var(--radius-lg)] px-3 py-2 shadow-[var(--shadow-elevated)] text-sm text-[var(--c-text)] hover:bg-[var(--c-surface)] transition-colors"
            >
              <Wallet className="h-4 w-4 text-blue-500" />
              Akun
            </button>
            <button
              onClick={() => { setFabOpen(false); handleAddTx() }}
              className="flex items-center gap-2 bg-[var(--c-card)] border border-[var(--c-border)] rounded-[var(--radius-lg)] px-3 py-2 shadow-[var(--shadow-elevated)] text-sm text-[var(--c-text)] hover:bg-[var(--c-surface)] transition-colors"
            >
              <Receipt className="h-4 w-4 text-emerald-500" />
              Transaksi
            </button>
          </div>
        )}
        <button
          onClick={() => setFabOpen(!fabOpen)}
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all duration-200',
            fabOpen
              ? 'bg-[var(--c-card)] text-[var(--c-text)] rotate-45'
              : 'bg-[var(--c-accent)] text-white hover:scale-105'
          )}
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {/* ─── Form Dialogs ─── */}
      <TransactionFormDialog
        open={txFormOpen}
        onOpenChange={handleTxFormClose}
        transaction={editingTx}
      />
      <AccountFormDialog
        open={accFormOpen}
        onOpenChange={setAccFormOpen}
      />
      <BudgetFormDialog
        open={budgetFormOpen}
        onOpenChange={setBudgetFormOpen}
      />

      {/* ─── Transaction Detail Drawer ─── */}
      <TransactionDetailDrawer
        open={!!detailTx}
        onOpenChange={(open) => !open && setDetailTx(null)}
        transaction={detailTx}
        account={detailTx ? accountsMap.get(detailTx.account_id) : undefined}
        category={detailTx?.category_id ? categoriesMap.get(detailTx.category_id) : undefined}
        onEdit={handleEditTx}
        onDelete={(id) => setDeletingId(id)}
      />

      {/* ─── Quick Actions Sheet (mobile) ─── */}
      <Sheet open={quickActionsOpen} onOpenChange={setQuickActionsOpen}>
        <SheetContent side="bottom" className="bg-[var(--c-surface)] border-[var(--c-border)] rounded-t-xl">
          <SheetHeader>
            <SheetTitle className="text-sm text-center">Quick Actions</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-3 gap-3 p-4">
            <button
              onClick={() => { setQuickActionsOpen(false); handleAddTx() }}
              className="flex flex-col items-center gap-2 p-4 rounded-[var(--radius-lg)] bg-[var(--c-card)] hover:bg-[var(--c-surface)] transition-colors"
            >
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-emerald-500/10">
                <Receipt className="h-5 w-5 text-emerald-500" />
              </div>
              <span className="text-xs font-medium text-[var(--c-text)]">Transaksi</span>
            </button>
            <button
              onClick={() => { setQuickActionsOpen(false); setAccFormOpen(true) }}
              className="flex flex-col items-center gap-2 p-4 rounded-[var(--radius-lg)] bg-[var(--c-card)] hover:bg-[var(--c-surface)] transition-colors"
            >
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-500/10">
                <Wallet className="h-5 w-5 text-blue-500" />
              </div>
              <span className="text-xs font-medium text-[var(--c-text)]">Akun</span>
            </button>
            <button
              onClick={() => { setQuickActionsOpen(false); setBudgetFormOpen(true) }}
              className="flex flex-col items-center gap-2 p-4 rounded-[var(--radius-lg)] bg-[var(--c-card)] hover:bg-[var(--c-surface)] transition-colors"
            >
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-violet-500/10">
                <Target className="h-5 w-5 text-violet-500" />
              </div>
              <span className="text-xs font-medium text-[var(--c-text)]">Budget</span>
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* ─── Delete Confirmation ─── */}
      {/* Using inline confirmation to avoid import issues */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setDeletingId(null)} />
          <div className="relative bg-[var(--c-surface)] border border-[var(--c-border)] rounded-[var(--radius-xl)] p-5 w-full max-w-sm shadow-[var(--shadow-modal)] animate-scale-in">
            <h3 className="text-base font-semibold text-[var(--c-text)] mb-1">Hapus Transaksi?</h3>
            <p className="text-sm text-[var(--c-text-muted)] mb-4">
              Transaksi ini akan dihapus permanen dan tidak bisa dikembalikan.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setDeletingId(null)}>
                Batal
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteTx}
                loading={deleteTx.isPending}
              >
                Hapus
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Helper: useDeleteTransaction (local alias) ───────────


