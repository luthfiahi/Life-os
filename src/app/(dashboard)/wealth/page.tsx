'use client'

import Link from 'next/link'
import { Plus, Wallet, Receipt, Target, ArrowRight, TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useWealthSnapshot, useAccounts, useTransactions, useBudgets } from '@/lib/queries/wealth-queries'
import { formatRupiah, formatPercent } from '@/lib/services/wealth.service'
import type { AccountType } from '@/lib/types/wealth'

const accountTypeConfig: Record<AccountType, { label: string; icon: typeof Wallet; color: string }> = {
  bank: { label: 'Bank', icon: Wallet, color: 'text-blue-500' },
  cash: { label: 'Tunai', icon: Wallet, color: 'text-emerald-500' },
  ewallet: { label: 'E-Wallet', icon: Wallet, color: 'text-violet-500' },
  investment: { label: 'Investasi', icon: TrendingUp, color: 'text-amber-500' },
}

export default function WealthPage() {
  const { data: snapshot, isLoading: snapLoading } = useWealthSnapshot()
  const { data: accounts, isLoading: accLoading } = useAccounts({ active: true })
  const { data: budgets, isLoading: budLoading } = useBudgets({ active: true })

  const totalAccounts = accounts?.length ?? 0
  const activeBudgets = budgets?.length ?? 0

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 text-[var(--c-text)]">Wealth</h1>
          <p className="text-sm text-[var(--c-text-muted)] mt-1">
            Kelola keuangan: akun, transaksi, budget, tabungan, dan hutang.
          </p>
        </div>
        <Link href="/wealth/transactions">
          <Button variant="primary" size="default">
            <Plus className="h-4 w-4" />
            Transaksi
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Balance */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-[var(--c-text-muted)] uppercase tracking-wider">
              Total Saldo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {snapLoading ? (
              <div className="h-8 w-32 bg-[var(--c-surface)] rounded animate-pulse" />
            ) : (
              <>
                <p className="text-2xl font-bold text-[var(--c-text)]">
                  {formatRupiah(snapshot?.totalBalance ?? 0)}
                </p>
                {snapshot?.totalBalanceChange && (
                  <p className={cn(
                    'text-xs font-medium mt-1 flex items-center gap-1',
                    snapshot.totalBalanceChange.startsWith('+') ? 'text-emerald-500' : 'text-[var(--c-accent-2)]'
                  )}>
                    {snapshot.totalBalanceChange.startsWith('+') ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {snapshot.totalBalanceChange} vs bulan lalu
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Today Expense */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-[var(--c-text-muted)] uppercase tracking-wider">
              Pengeluaran Hari Ini
            </CardTitle>
          </CardHeader>
          <CardContent>
            {snapLoading ? (
              <div className="h-8 w-32 bg-[var(--c-surface)] rounded animate-pulse" />
            ) : (
              <>
                <p className="text-2xl font-bold text-[var(--c-accent-2)]">
                  {formatRupiah(snapshot?.todayExpense ?? 0)}
                </p>
                {snapshot?.todayExpenseChange && (
                  <p className={cn(
                    'text-xs font-medium mt-1 flex items-center gap-1',
                    snapshot.todayExpenseChange.startsWith('-') ? 'text-emerald-500' : 'text-amber-500'
                  )}>
                    {snapshot.todayExpenseChange.startsWith('-') ? (
                      <TrendingDown className="h-3 w-3" />
                    ) : (
                      <TrendingUp className="h-3 w-3" />
                    )}
                    {snapshot.todayExpenseChange} vs minggu lalu
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Budget Utilization */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-[var(--c-text-muted)] uppercase tracking-wider">
              Budget Terpakai
            </CardTitle>
          </CardHeader>
          <CardContent>
            {snapLoading ? (
              <div className="h-8 w-32 bg-[var(--c-surface)] rounded animate-pulse" />
            ) : (
              <>
                <p className="text-2xl font-bold text-[var(--c-text)]">
                  {formatPercent(snapshot?.budgetUtilization ?? 0)}
                </p>
                <p className="text-xs text-[var(--c-text-muted)] mt-1">
                  {activeBudgets} budget aktif
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link href="/wealth/accounts" className="group">
          <Card className="h-full transition-colors hover:border-[var(--c-accent)]/30">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--c-accent)]/10">
                  <Wallet className="h-5 w-5 text-[var(--c-accent)]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--c-text)]">Akun</p>
                  <p className="text-xs text-[var(--c-text-muted)]">{accLoading ? '...' : `${totalAccounts} aktif`}</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-[var(--c-text-muted)] group-hover:translate-x-0.5 transition-transform" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/wealth/transactions" className="group">
          <Card className="h-full transition-colors hover:border-[var(--c-accent)]/30">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--c-accent)]/10">
                  <Receipt className="h-5 w-5 text-[var(--c-accent)]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--c-text)]">Transaksi</p>
                  <p className="text-xs text-[var(--c-text-muted)]">Riwayat & catat</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-[var(--c-text-muted)] group-hover:translate-x-0.5 transition-transform" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/wealth/budgets" className="group">
          <Card className="h-full transition-colors hover:border-[var(--c-accent)]/30">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--c-accent)]/10">
                  <Target className="h-5 w-5 text-[var(--c-accent)]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--c-text)]">Budget</p>
                  <p className="text-xs text-[var(--c-text-muted)]">{budLoading ? '...' : `${activeBudgets} aktif`}</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-[var(--c-text-muted)] group-hover:translate-x-0.5 transition-transform" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/wealth/analytics" className="group">
          <Card className="h-full transition-colors hover:border-[var(--c-accent)]/30">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--c-accent)]/10">
                  <BarChart3 className="h-5 w-5 text-[var(--c-accent)]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--c-text)]">Analytics</p>
                  <p className="text-xs text-[var(--c-text-muted)]">Insight & chart</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-[var(--c-text-muted)] group-hover:translate-x-0.5 transition-transform" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Accounts (if any) */}
      {accounts && accounts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[var(--c-text)]">Akun Kamu</h2>
            <Link href="/wealth/accounts" className="text-xs text-[var(--c-accent)] hover:underline">
              Lihat semua
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {accounts.slice(0, 3).map((account) => {
              const config = accountTypeConfig[account.type]
              return (
                <Card key={account.id} className="p-3">
                  <div className="flex items-center gap-3">
                    <div className={cn('flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)]', 'bg-[var(--c-surface)]')}>
                      <config.icon className={cn('h-4 w-4', config.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--c-text)] truncate">{account.name}</p>
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
  )
}
