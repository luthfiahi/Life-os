'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { WidgetCard } from './widget-card'
import { mockQuickActions, type QuickAction } from '@/lib/mock-data'
import {
  PlusCircle,
  CheckCircle2,
  FileText,
  Crosshair,
  PenLine,
  MessageCircle,
} from 'lucide-react'

/**
 * Life OS — Quick Actions Widget
 * Grid of 6 quick-action buttons linking to module pages.
 * Icons are dynamically resolved from the mock data icon string.
 */

const iconMap: Record<string, React.ElementType> = {
  PlusCircle,
  CheckCircle2,
  FileText,
  Crosshair,
  PenLine,
  MessageCircle,
}

interface QuickActionsWidgetProps {
  actions?: QuickAction[]
  className?: string
}

export function QuickActionsWidget({ actions = mockQuickActions, className }: QuickActionsWidgetProps) {
  return (
    <WidgetCard title="Aksi Cepat" subtitle="Jalan pintas ke module" className={className} colSpan={2}>
      <div className="grid grid-cols-3 gap-2">
        {actions.map((action) => {
          const Icon = iconMap[action.icon]
          return (
            <Link
              key={action.id}
              href={action.href}
              className={cn(
                'flex flex-col items-center gap-1.5 rounded-[var(--radius-lg)] p-3 transition-colors duration-150',
                'hover:bg-[var(--c-surface)]',
                'active:scale-[0.97]'
              )}
            >
              <div className={cn('flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)]', action.bgColor)}>
                {Icon && <Icon className={cn('h-4.5 w-4.5', action.color)} />}
              </div>
              <span className="text-[11px] font-medium text-[var(--c-text)] text-center leading-tight">
                {action.label}
              </span>
            </Link>
          )
        })}
      </div>
    </WidgetCard>
  )
}
