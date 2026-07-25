'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { WidgetCard } from './widget-card'
import { mockSnapshotCards, type SnapshotCard } from '@/lib/mock-data'
import { Wallet, Heart, Target, Dumbbell, ArrowUpRight, ArrowDownRight, Minus, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

/**
 * Life OS — Snapshot Cards Widget
 * 4 mini-cards showing key metrics from Wealth, Health, Goals, Habits.
 * Each card links to its respective module.
 */

const iconMap: Record<string, React.ElementType> = {
  Wallet,
  Heart,
  Target,
  Dumbbell,
}

const changeIcons = {
  positive: ArrowUpRight,
  negative: ArrowDownRight,
  neutral: Minus,
}

const changeColors = {
  positive: 'text-emerald-500',
  negative: 'text-rose-500',
  neutral: 'text-[var(--c-text-muted)]',
}

interface SnapshotCardsWidgetProps {
  cards?: SnapshotCard[]
  className?: string
  /** Show skeleton loading state */
  loading?: boolean
}

export function SnapshotCardsWidget({ cards = mockSnapshotCards, className, loading }: SnapshotCardsWidgetProps) {
  return (
    <WidgetCard
      title="Snapshot"
      subtitle="Ringkasan cepat semua module"
      className={className}
      colSpan={2}
      loading={loading}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {cards.map((card) => {
          const Icon = iconMap[card.icon]
          return (
            <Link key={card.id} href={card.href} className="group block">
              <Card className="border border-[var(--c-border)] bg-[var(--c-surface)] shadow-none hover:shadow-[var(--shadow-card)] transition-all duration-150 h-full">
                <CardContent className="p-3">
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className={cn('flex h-7 w-7 items-center justify-center rounded-[var(--radius-md)]', card.bgColor)}>
                      {Icon && <Icon className={cn('h-3.5 w-3.5', card.color)} />}
                    </div>
                    <span className="text-label text-[var(--c-text)] font-semibold">{card.title}</span>
                    <ArrowRight className="h-3 w-3 text-[var(--c-text-muted)] ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {/* Metrics */}
                  <div className="space-y-1.5">
                    {card.metrics.map((metric, idx) => {
                      const ChangeIcon = changeIcons[metric.changeType || 'neutral']
                      return (
                        <div key={idx} className="flex items-center justify-between gap-2">
                          <span className="text-[11px] text-[var(--c-text-muted)] truncate">
                            {metric.label}
                          </span>
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="text-body-small font-semibold text-[var(--c-text)] tabular-nums">
                              {metric.value}
                            </span>
                            {metric.change && metric.changeType && (
                              <span className={cn('flex items-center text-[10px] tabular-nums', changeColors[metric.changeType])}>
                                <ChangeIcon className="h-2.5 w-2.5" />
                                {metric.change}
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </WidgetCard>
  )
}
