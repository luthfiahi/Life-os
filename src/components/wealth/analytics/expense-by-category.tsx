'use client'

import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useExpenseByCategory } from '@/lib/queries/analytics-queries'
import { formatRupiah } from '@/lib/services/wealth.service'
import { Skeleton } from '@/components/ui/skeleton'
import type { CategoryBreakdownItem } from '@/lib/types/wealth'

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: CategoryBreakdownItem }> }) {
  if (!active || !payload || payload.length === 0) return null
  const item = payload[0].payload
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--c-border)] bg-[var(--c-card)] p-2 text-xs">
      <p className="font-medium text-[var(--c-text)]">{item.category_name}</p>
      <p className="text-[var(--c-text-muted)]">{formatRupiah(item.amount)} ({item.percentage}%)</p>
    </div>
  )
}

export function ExpenseByCategory({ year, month }: { year: number; month: number }) {
  const { data, isLoading } = useExpenseByCategory(year, month)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-h3 text-[var(--c-text)]">Pengeluaran per Kategori</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[320px] w-full rounded-[var(--radius-md)]" />
        ) : !data || data.length === 0 ? (
          <div className="flex items-center justify-center h-[320px] text-sm text-[var(--c-text-muted)]">
            Belum ada pengeluaran bulan ini
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-shrink-0">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="amount"
                    nameKey="category_name"
                    strokeWidth={0}
                  >
                    {data.map((entry, i) => (
                      <Cell key={entry.category_id} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 w-full space-y-2">
              {data.slice(0, 5).map((item) => (
                <div key={item.category_id} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-[var(--c-text)] truncate">{item.category_name}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-medium text-[var(--c-text)] tabular-nums">
                      {formatRupiah(item.amount)}
                    </span>
                    <span className="text-[10px] text-[var(--c-text-muted)] tabular-nums w-8 text-right">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}