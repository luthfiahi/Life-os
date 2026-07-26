'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useFinancialInsights } from '@/lib/queries/analytics-queries'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, TrendingDown, AlertCircle, Info, Zap, Target } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FinancialInsight } from '@/lib/types/wealth'

const ICON_MAP: Record<FinancialInsight['icon'], typeof Info> = {
  'trending-up': TrendingUp,
  'trending-down': TrendingDown,
  'alert-circle': AlertCircle,
  'info': Info,
  'zap': Zap,
  'target': Target,
}

const TYPE_STYLES = {
  positive: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  negative: 'bg-red-500/10 text-[var(--c-accent-2)]',
  neutral: 'bg-[var(--c-accent)]/10 text-[var(--c-accent)]',
} as const

export function FinancialInsights() {
  const { data, isLoading } = useFinancialInsights()

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-h3 text-[var(--c-text)]">Financial Insights</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-[var(--radius-md)]" />
            ))}
          </div>
        ) : !data || data.length === 0 ? (
          <div className="flex items-center justify-center h-24 text-sm text-[var(--c-text-muted)]">
            Tambahkan transaksi untuk melihat insights
          </div>
        ) : (
          <div className="space-y-2">
            {data.map((insight) => {
              const Icon = ICON_MAP[insight.icon]
              return (
                <div
                  key={insight.id}
                  className="flex gap-3 p-3 rounded-[var(--radius-md)] bg-[var(--c-surface)]"
                >
                  <div className={cn(
                    'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full',
                    TYPE_STYLES[insight.type],
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[var(--c-text)]">{insight.title}</p>
                    <p className="text-[11px] text-[var(--c-text-muted)] mt-0.5 leading-relaxed">
                      {insight.description}
                    </p>
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