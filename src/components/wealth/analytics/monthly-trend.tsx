'use client'

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useMonthlyTrend } from '@/lib/queries/analytics-queries'
import { formatRupiah } from '@/lib/services/wealth.service'
import { Skeleton } from '@/components/ui/skeleton'

export function MonthlyTrend() {
  const { data, isLoading } = useMonthlyTrend(6)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-h3 text-[var(--c-text)]">Tren Bulanan</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[280px] w-full rounded-[var(--radius-md)]" />
        ) : !data || data.length === 0 ? (
          <div className="flex items-center justify-center h-[280px] text-sm text-[var(--c-text-muted)]">
            Belum ada data tren
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--c-accent)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--c-accent)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--c-accent-2)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--c-accent-2)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--c-border)" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: 'var(--c-text-muted)' }}
                axisLine={{ stroke: 'var(--c-border)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--c-text-muted)' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(0)}jt` : v >= 1_000 ? `${(v / 1_000).toFixed(0)}rb` : String(v)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--c-card)',
                  border: '1px solid var(--c-border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 12,
                }}
                formatter={(value: number) => formatRupiah(value)}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11, color: 'var(--c-text-muted)' }}
              />
              <Area type="monotone" dataKey="income" name="Pemasukan" stroke="var(--c-accent)" fill="url(#incomeGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="expense" name="Pengeluaran" stroke="var(--c-accent-2)" fill="url(#expenseGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}