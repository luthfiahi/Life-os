'use client'

import { cn } from '@/lib/utils'
import { formatRupiah } from '@/lib/services/wealth.service'
import { Card } from '@/components/ui/card'
import type { BudgetUtilizationItem } from '@/lib/types/wealth'

interface BudgetCardProps {
  item: BudgetUtilizationItem
  onDelete?: (id: string) => void
}

export function BudgetCard({ item }: BudgetCardProps) {
  const { percentage, budget_amount, spent, remaining, category_name } = item

  const barColor = percentage >= 85
    ? 'bg-[var(--c-accent-2)]'
    : percentage >= 60
      ? 'bg-amber-500'
      : 'bg-[var(--c-accent)]'

  const textColor = percentage >= 85
    ? 'text-[var(--c-accent-2)]'
    : percentage >= 60
      ? 'text-amber-500'
      : 'text-[var(--c-accent)]'

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[var(--c-text)]">{category_name}</h3>
        <span className={cn('text-sm font-bold tabular-nums', textColor)}>{percentage}%</span>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full rounded-full bg-[var(--c-surface)] overflow-hidden mb-3">
        <div
          className={cn('h-full rounded-full transition-all duration-500', barColor)}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-[var(--c-text-muted)]">
        <div>
          <span className="font-medium text-[var(--c-text)]">{formatRupiah(spent)}</span>
          <span> terpakai</span>
        </div>
        <div>
          <span className="font-medium text-[var(--c-text)]">{formatRupiah(remaining)}</span>
          <span> tersisa</span>
        </div>
      </div>

      <div className="mt-2 text-[10px] text-[var(--c-text-muted)]">
        Budget: {formatRupiah(budget_amount)} / bulan
      </div>
    </Card>
  )
}
