'use client'

import { cn } from '@/lib/utils'
import { WidgetCard } from './widget-card'
import { mockRecentActivity, type ActivityItem } from '@/lib/mock-data'
import {
  Receipt,
  CheckCircle2,
  Target,
  PenLine,
  FileText,
  PieChart,
  Flame,
  PlusCircle,
} from 'lucide-react'

/**
 * Life OS — Recent Activity Timeline Widget
 * Vertical timeline of recent user actions across modules.
 * Each entry shows module color, icon, action text, and relative time.
 */

const iconMap: Record<string, React.ElementType> = {
  Receipt,
  CheckCircle2,
  Target,
  PenLine,
  FileText,
  PieChart,
  Flame,
  PlusCircle,
}

interface RecentActivityWidgetProps {
  items?: ActivityItem[]
  className?: string
}

export function RecentActivityWidget({ items = mockRecentActivity, className }: RecentActivityWidgetProps) {
  return (
    <WidgetCard
      title="Aktivitas Terbaru"
      subtitle="Riwayat aksi terakhir"
      className={className}
      colSpan={1}
      rowSpan={2}
    >
      <div className="relative space-y-0">
        {/* Timeline line */}
        <div className="absolute left-[13px] top-2 bottom-2 w-px bg-[var(--c-border)]" />

        {items.map((item, idx) => {
          const Icon = iconMap[item.icon]
          return (
            <div key={item.id} className="relative flex gap-3 py-2 group">
              {/* Dot / Icon node */}
              <div
                className={cn(
                  'relative z-10 flex h-[27px] w-[27px] shrink-0 items-center justify-center rounded-full bg-[var(--c-card)] border border-[var(--c-border)]',
                  'group-hover:border-[var(--c-accent)]/40 transition-colors'
                )}
              >
                {Icon && <Icon className={cn('h-3 w-3', item.moduleColor)} />}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-body-small text-[var(--c-text)] leading-snug">
                  {item.action}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={cn('text-[10px] font-medium', item.moduleColor)}>
                    {item.module}
                  </span>
                  <span className="text-[10px] text-[var(--c-text-muted)]">
                    {item.timestamp}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </WidgetCard>
  )
}
