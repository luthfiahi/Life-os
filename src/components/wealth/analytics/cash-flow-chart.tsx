'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCashFlow } from '@/lib/queries/analytics-queries'
import { formatRupiah } from '@/lib/services/wealth.service'
import { Skeleton } from '@/components/ui/skeleton'

export function CashFlowChart() {
  const { data, isLoading } = useCashFlow(6)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-h3 text-[var(--c-text)]">Cash Flow</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[280px] w-full rounded-[var(--radius-md)]" />
        ) : !data || data.length === 0 ? (
          <div className="flex items-center justify-center h-[280px] text-sm text-[var(--c-text-muted)]">
            Belum ada data transaksi
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
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
              <Bar dataKey="income" name="Pemasukan" fill="var(--c-accent)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Pengeluaran" fill="var(--c-accent-2)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
