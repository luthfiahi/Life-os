'use client'

import { TrendingUp, TrendingDown, AlertCircle, Zap, Lightbulb, ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { formatRupiah } from '@/lib/services/wealth.service'
import { useFinancialInsights, useExpenseByCategory, useBudgetAnalytics, useCashFlow } from '@/lib/queries/analytics-queries'
import { useTransactions, useAccounts, useBudgets } from '@/lib/queries/wealth-queries'
import { cn } from '@/lib/utils'
import { useMemo } from 'react'
import Link from 'next/link'

export function InsightPanel() {
  const { data: insights } = useFinancialInsights()
  const now = new Date()
  const { data: topCategories } = useExpenseByCategory(now.getFullYear(), now.getMonth() + 1)
  const { data: budgetAnalytics } = useBudgetAnalytics(now.getFullYear(), now.getMonth() + 1)
  const { data: cashFlow } = useCashFlow(3)
  const { data: recentTx } = useTransactions({ limit: 5 })
  const { data: accounts } = useAccounts({ active: true })
  const { data: budgets } = useBudgets({ active: true })

  const topSpendingCategory = useMemo(() => {
    if (!topCategories || topCategories.length === 0) return null
    return topCategories[0]
  }, [topCategories])

  const monthlyTrend = useMemo(() => {
    if (!cashFlow || cashFlow.length < 2) return null
    const latest = cashFlow[cashFlow.length - 1]
    const prev = cashFlow[cashFlow.length - 2]
    return { current: latest, previous: prev }
  }, [cashFlow])

  const budgetProgress = useMemo(() => {
    if (!budgetAnalytics || budgetAnalytics.length === 0) return null
    const avg = budgetAnalytics.reduce((s, b) => s + b.percentage, 0) / budgetAnalytics.length
    const dangerCount = budgetAnalytics.filter(b => b.status === 'danger').length
    return { avg: Math.round(avg), total: budgetAnalytics.length, dangerCount }
  }, [budgetAnalytics])

  const biggestExpense = useMemo(() => {
    if (!recentTx) return null
    const expenses = recentTx.filter(t => t.type === 'expense')
    if (expenses.length === 0) return null
    return expenses.reduce((max, t) => Number(t.amount) > Number(max.amount) ? t : max, expenses[0])
  }, [recentTx])

  const tips = [
    'Coba aturan 50/30/20: 50% kebutuhan, 30% keinginan, 20% tabungan.',
    'Tinjau subscription bulanan — mungkin ada yang bisa dihentikan.',
    'Sisihkan minimal 10% penghasilan sebelum dibelanjakan.',
    'Catat setiap pengeluaran kecil — mereka sering terkumpul besar.',
    'Review budget setiap awal bulan untuk menjaga fokus.',
  ]
  const randomTip = tips[Math.floor(Date.now() / 86400000) % tips.length]

  return (
    <div className="space-y-4">
      {/* Top Spending Category */}
      {topSpendingCategory && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-[var(--c-text-muted)] uppercase tracking-wider">
              Top Pengeluaran
            </h3>
            <span className="text-[10px] text-[var(--c-text-muted)]">Bulan ini</span>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
              style={{ backgroundColor: topSpendingCategory.color }}
            >
              {topSpendingCategory.category_name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--c-text)] truncate">
                {topSpendingCategory.category_name}
              </p>
              <p className="text-xs text-[var(--c-text-muted)]">
                {formatRupiah(topSpendingCategory.amount)}
              </p>
            </div>
            <span className="text-sm font-semibold text-[var(--c-accent-2)]">
              {topSpendingCategory.percentage}%
            </span>
          </div>
        </Card>
      )}

      {/* Monthly Trend */}
      {monthlyTrend && (
        <Card className="p-4">
          <h3 className="text-xs font-semibold text-[var(--c-text-muted)] uppercase tracking-wider mb-3">
            Tren Bulanan
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[var(--c-text-muted)]">Pemasukan</span>
              <span className="font-medium text-emerald-500">
                {formatRupiah(monthlyTrend.current.income)}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[var(--c-text-muted)]">Pengeluaran</span>
              <span className="font-medium text-[var(--c-accent-2)]">
                {formatRupiah(monthlyTrend.current.expense)}
              </span>
            </div>
            <div className="h-px bg-[var(--c-border)] my-1" />
            <div className="flex justify-between text-xs">
              <span className="text-[var(--c-text-muted)]">Arus Kas Bersih</span>
              <span className={cn(
                'font-semibold',
                monthlyTrend.current.net >= 0 ? 'text-emerald-500' : 'text-[var(--c-accent-2)]'
              )}>
                {formatRupiah(Math.abs(monthlyTrend.current.net))}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Budget Progress */}
      {budgetProgress && budgetProgress.total > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-[var(--c-text-muted)] uppercase tracking-wider">
              Budget Progress
            </h3>
            <span className="text-xs text-[var(--c-text-muted)]">
              {budgetProgress.total} budget
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[var(--c-text-muted)]">Rata-rata terpakai</span>
              <span className={cn(
                'font-semibold',
                budgetProgress.avg > 85 ? 'text-[var(--c-accent-2)]' :
                budgetProgress.avg > 60 ? 'text-amber-500' : 'text-emerald-500'
              )}>
                {budgetProgress.avg}%
              </span>
            </div>
            <Progress
              value={budgetProgress.avg}
              className={cn(
                'h-2',
                budgetProgress.avg > 85 ? '[&>div]:bg-[var(--c-accent-2)]' :
                budgetProgress.avg > 60 ? '[&>div]:bg-amber-500' : '[&>div]:bg-emerald-500'
              )}
            />
            {budgetProgress.dangerCount > 0 && (
              <p className="text-[10px] text-[var(--c-accent-2)] mt-1.5">
                {budgetProgress.dangerCount} budget melebihi 85% batas
              </p>
            )}
          </div>
        </Card>
      )}

      {/* Biggest Expense This Month */}
      {biggestExpense && (
        <Card className="p-4">
          <h3 className="text-xs font-semibold text-[var(--c-text-muted)] uppercase tracking-wider mb-2">
            Pengeluaran Terbesar
          </h3>
          <p className="text-sm font-medium text-[var(--c-text)] truncate">
            {biggestExpense.description || 'Tanpa deskripsi'}
          </p>
          <p className="text-lg font-bold text-[var(--c-accent-2)] mt-0.5">
            -{formatRupiah(Number(biggestExpense.amount))}
          </p>
        </Card>
      )}

      {/* Financial Tip */}
      <Card className="p-4 bg-[var(--c-accent)]/10 border-[var(--c-accent)]/30">
        <div className="flex gap-3">
          <Lightbulb className="h-4 w-4 text-[var(--c-accent)] shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-[var(--c-accent)] mb-1">Tips Keuangan</p>
            <p className="text-xs text-[var(--c-text-muted)] leading-relaxed">{randomTip}</p>
          </div>
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-2">
        <Card className="p-3">
          <p className="text-[10px] text-[var(--c-text-muted)]">Akun Aktif</p>
          <p className="text-lg font-bold text-[var(--c-text)]">{accounts?.length ?? 0}</p>
        </Card>
        <Card className="p-3">
          <p className="text-[10px] text-[var(--c-text-muted)]">Budget Aktif</p>
          <p className="text-lg font-bold text-[var(--c-text)]">{budgets?.length ?? 0}</p>
        </Card>
      </div>

      {/* Link to Analytics */}
      <Link href="/wealth/analytics" className="block">
        <Card className="p-3 group transition-colors hover:border-[var(--c-accent)]/30 cursor-pointer">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-[var(--c-accent)]" />
              <span className="text-sm font-medium text-[var(--c-text)]">Lihat Analytics</span>
            </div>
            <ArrowRight className="h-4 w-4 text-[var(--c-text-muted)] group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Card>
      </Link>
    </div>
  )
}
