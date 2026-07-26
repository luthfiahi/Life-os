'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useBudgetAnalytics } from '@/lib/queries/analytics-queries'
import { formatRupiah } from '@/lib/services/wealth.service'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

const STATUS_CONFIG = {
  safe: { color: 'bg-emerald-500', label: 'Aman' },
  warning: { color: 'bg-amber-500', label: 'Hati-hati' },
  danger: { color: 'bg-red-500', label: 'Bahaya' },
} as const

export function BudgetAnalytics({ year, month }: { year: number; month: number }) {
  const { data, isLoading } = useBudgetAnalytics(year, month)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-h3 text-[var(--c-text)]">Budget Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-[var(--radius-md)]" />
            ))}
          </div>
        ) : !data || data.length === 0 ? (
          <div className="flex items-center justify-center h-24 text-sm text-[var(--c-text-muted)]">
            Belum ada budget aktif
          </div>
        ) : (
          <div className="space-y-3">
            {data.map((item) => {
              const status = STATUS_CONFIG[item.status]
              return (
                <div key={item.category_id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-[var(--c-text)]">{item.category_name}</span>
                      <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full text-white font-medium', status.color)}>
                        {status.label}
                      </span>
                    </div>
                    <span className="text-xs text-[var(--c-text-muted)] tabular-nums">
                      {formatRupiah(item.spent)} / {formatRupiah(item.budget_amount)}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--c-surface)] overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        item.status === 'safe' && 'bg-emerald-500',
                        item.status === 'warning' && 'bg-amber-500',
                        item.status === 'danger' && 'bg-red-500',
                      )}
                      style={{ width: `${Math.min(item.percentage, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-[var(--c-text-muted)]">
                    <span>Sisa: {formatRupiah(item.remaining)}</span>
                    <span className="tabular-nums">{item.percentage}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
