'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSavingsRate } from '@/lib/queries/analytics-queries'
import { formatRupiah } from '@/lib/services/wealth.service'
import { Skeleton } from '@/components/ui/skeleton'
import { PiggyBank, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export function SavingsRateCard({ year, month }: { year: number; month: number }) {
  const { data, isLoading } = useSavingsRate(year, month)

  const isPositive = (data?.savings ?? 0) >= 0
  const rateColor = !data || data.rate < 0
    ? 'text-[var(--c-accent-2)]'
    : data.rate >= 20
      ? 'text-emerald-500'
      : 'text-amber-500'

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-h3 text-[var(--c-text)]">Savings Rate</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[160px] w-full rounded-[var(--radius-md)]" />
        ) : !data || data.income === 0 ? (
          <div className="flex items-center justify-center h-[160px] text-sm text-[var(--c-text-muted)]">
            Belum ada pendapatan bulan ini
          </div>
        ) : (
          <div className="space-y-3">
            {/* Big rate number */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5">
                {isPositive ? (
                  <PiggyBank className="h-5 w-5 text-emerald-500" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-[var(--c-accent-2)]" />
                )}
                <span className={cn('text-2xl font-bold', rateColor)}>
                  {data.rate}%
                </span>
              </div>
              <p className="text-[10px] text-[var(--c-text-muted)] mt-0.5">{data.period}</p>
            </div>

            {/* Income / Expense / Savings breakdown */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-[10px] text-[var(--c-text-muted)]">Pemasukan</p>
                <p className="text-xs font-semibold text-emerald-600 tabular-nums mt-0.5">
                  {formatRupiah(data.income)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-[var(--c-text-muted)]">Pengeluaran</p>
                <p className="text-xs font-semibold text-[var(--c-accent-2)] tabular-nums mt-0.5">
                  {formatRupiah(data.expense)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-[var(--c-text-muted)]">Tabungan</p>
                <p className={cn('text-xs font-semibold tabular-nums mt-0.5', isPositive ? 'text-emerald-600' : 'text-[var(--c-accent-2)]')}>
                  {isPositive ? '+' : ''}{formatRupiah(data.savings)}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}