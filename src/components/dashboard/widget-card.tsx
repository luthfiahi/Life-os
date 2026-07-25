'use client'

import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Life OS — Widget Card (Base Component)
 * Reusable wrapper for all dashboard widgets.
 * Provides consistent styling: border, shadow, padding, header.
 *
 * Design tokens used:
 * - --c-card, --c-border, --c-text, --c-text-muted
 * - --shadow-card, --radius-lg
 * - --transition-normal
 */

interface WidgetCardProps {
  title?: string
  subtitle?: string
  children: React.ReactNode
  className?: string
  action?: React.ReactNode
  loading?: boolean
  /** Widget spans multiple columns in the grid */
 colSpan?: 1 | 2 | 3 | 4
  /** Widget spans multiple rows in the grid */
 rowSpan?: 1 | 2 | 3
}

const colSpanClasses: Record<number, string> = {
  1: 'col-span-1',
  2: 'sm:col-span-2',
 3: 'lg:col-span-3',
  4: 'lg:col-span-4',
}

const rowSpanClasses: Record<number, string> = {
  1: 'row-span-1',
  2: 'row-span-2',
  3: 'row-span-3',
}

export function WidgetCard({
  title,
  subtitle,
  children,
  className,
  action,
  loading = false,
  colSpan = 1,
  rowSpan = 1,
}: WidgetCardProps) {
  return (
    <Card
      className={cn(
        'border border-[var(--c-border)] bg-[var(--c-card)] shadow-[var(--shadow-card)] transition-shadow duration-[var(--transition-normal)] hover:shadow-[var(--shadow-elevated)]',
        colSpanClasses[colSpan],
        rowSpanClasses[rowSpan],
        className
      )}
    >
      {(title || action) && (
        <CardHeader className="pb-0 pt-4 px-4">
          <div className="flex items-center justify-between">
            <div>
              {title && (
                <h3 className="text-h3 text-[var(--c-text)]">{title}</h3>
              )}
              {subtitle && (
                <p className="text-caption text-[var(--c-text-muted)] mt-0.5 not-italic">
                  {subtitle}
                </p>
              )}
            </div>
            {action && <div className="shrink-0">{action}</div>}
          </div>
        </CardHeader>
      )}
      <CardContent className="p-4 pt-2">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-3/4 rounded-[var(--radius-sm)]" />
            <Skeleton className="h-4 w-1/2 rounded-[var(--radius-sm)]" />
            <Skeleton className="h-8 w-full rounded-[var(--radius-sm)]" />
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  )
}
