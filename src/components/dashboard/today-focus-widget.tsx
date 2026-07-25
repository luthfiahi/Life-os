'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { WidgetCard } from './widget-card'
import { mockFocusItems, type FocusItem } from '@/lib/mock-data'
import { Check, Circle, Clock, AlertCircle } from 'lucide-react'

/**
 * Life OS — Today's Focus Widget
 * Shows top 5 priority items for today with check-off interaction.
 * Categories color-coded by module.
 */

const priorityConfig = {
  high: { icon: AlertCircle, color: 'text-rose-500', label: 'Tinggi' },
  medium: { icon: Circle, color: 'text-amber-500', label: 'Sedang' },
  low: { icon: Circle, color: 'text-[var(--c-text-muted)]', label: 'Rendah' },
}

interface TodayFocusWidgetProps {
  items?: FocusItem[]
  className?: string
}

export function TodayFocusWidget({ items = mockFocusItems, className }: TodayFocusWidgetProps) {
  const [focusItems, setFocusItems] = useState(items)
  const doneCount = focusItems.filter((i) => i.done).length

  const toggleDone = (id: string) => {
    setFocusItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item
      )
    )
  }

  return (
    <WidgetCard
      title="Fokus Hari Ini"
      subtitle={`${doneCount}/${focusItems.length} selesai`}
      className={className}
      colSpan={1}
      rowSpan={2}
      action={
        <div className="flex items-center gap-1">
          <div className="h-1.5 w-20 rounded-full bg-[var(--c-surface)] overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--c-accent)] transition-all duration-300"
              style={{ width: `${(doneCount / focusItems.length) * 100}%` }}
            />
          </div>
          <span className="text-[10px] text-[var(--c-text-muted)] tabular-nums">
            {Math.round((doneCount / focusItems.length) * 100)}%
          </span>
        </div>
      }
    >
      <div className="space-y-1">
        {focusItems.map((item) => {
          const PriorityIcon = priorityConfig[item.priority].icon
          return (
            <button
              key={item.id}
              onClick={() => toggleDone(item.id)}
              className={cn(
                'flex items-start gap-2.5 w-full rounded-[var(--radius-md)] p-2 text-left transition-colors duration-150',
                'hover:bg-[var(--c-surface)]',
                item.done && 'opacity-60'
              )}
            >
              {/* Checkbox */}
              <div
                className={cn(
                  'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border transition-colors',
                  item.done
                    ? 'bg-[var(--c-accent)] border-[var(--c-accent)]'
                    : 'border-[var(--c-border)]'
                )}
              >
                {item.done && <Check className="h-3 w-3 text-white" />}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    'text-body-small text-[var(--c-text)] leading-snug',
                    item.done && 'line-through'
                  )}
                >
                  {item.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={cn(
                      'inline-flex items-center rounded-[var(--radius-sm)] px-1.5 py-0.5 text-[10px] font-medium',
                      item.categoryColor
                    )}
                  >
                    {item.category}
                  </span>
                  {item.time && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] text-[var(--c-text-muted)]">
                      <Clock className="h-2.5 w-2.5" />
                      {item.time}
                    </span>
                  )}
                </div>
              </div>

              {/* Priority indicator */}
              <PriorityIcon
                className={cn(
                  'h-3.5 w-3.5 shrink-0 mt-0.5',
                  priorityConfig[item.priority].color
                )}
              />
            </button>
          )
        })}
      </div>
    </WidgetCard>
  )
}
