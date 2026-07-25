'use client'

import { cn } from '@/lib/utils'
import { WidgetCard } from './widget-card'
import { mockLifeScore, type LifeScoreData } from '@/lib/mock-data'
import {
  Wallet,
  Target,
  Heart,
  Dumbbell,
  BookOpen,
  Brain,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react'

/**
 * Life OS — Life Score Widget
 * Circular SVG gauge showing overall life score (0–100)
 * with per-category breakdown bars.
 *
 * Gauge colors:
 * - 0–39: --c-accent-2 (red)
 * - 40–69: amber-500
 * - 70–100: --c-accent (teal)
 */

const iconMap: Record<string, React.ElementType> = {
  Wallet,
  Target,
  Heart,
  Dumbbell,
  BookOpen,
  Brain,
}

const trendIcon = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus,
}

function getScoreColor(score: number): string {
  if (score >= 70) return 'var(--c-accent)'
  if (score >= 40) return '#f59e0b'
  return 'var(--c-accent-2)'
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Sangat Baik'
  if (score >= 70) return 'Baik'
  if (score >= 55) return 'Cukup'
  if (score >= 40) return 'Perlu Perhatian'
  return 'Perlu Perbaikan'
}

interface LifeScoreWidgetProps {
  data?: LifeScoreData
  className?: string
}

export function LifeScoreWidget({ data = mockLifeScore, className }: LifeScoreWidgetProps) {
  const { overall, categories } = data
  const scoreColor = getScoreColor(overall)
  const scoreLabel = getScoreLabel(overall)

  // SVG circular gauge math
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (overall / 100) * circumference

  return (
    <WidgetCard
      title="Life Score"
      subtitle="Skor keseluruhan hidup kamu"
      className={cn('row-span-2', className)}
      colSpan={1}
      rowSpan={2}
    >
      <div className="flex flex-col items-center gap-4">
        {/* Circular Gauge */}
        <div className="relative flex items-center justify-center">
          <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
            {/* Background track */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="var(--c-border)"
              strokeWidth="8"
              strokeLinecap="round"
            />
            {/* Score arc */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke={scoreColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-700 ease-out"
            />
          </svg>
          {/* Center text */}
          <div className="absolute flex flex-col items-center justify-center">
            <span
              className="text-3xl font-bold leading-none"
              style={{ color: scoreColor }}
            >
              {overall}
            </span>
            <span className="text-[10px] text-[var(--c-text-muted)] mt-1">
              {scoreLabel}
            </span>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="w-full space-y-2.5">
          {categories.map((cat) => {
            const Icon = iconMap[cat.icon]
            const TrendIcon = trendIcon[cat.trend]
            return (
              <div key={cat.name} className="flex items-center gap-2">
                {Icon && (
                  <Icon className={cn('h-3.5 w-3.5 shrink-0', cat.color)} />
                )}
                <span className="text-body-small text-[var(--c-text)] flex-1 truncate">
                  {cat.name}
                </span>
                <TrendIcon
                  className={cn(
                    'h-3 w-3 shrink-0',
                    cat.trend === 'up' && 'text-emerald-500',
                    cat.trend === 'down' && 'text-rose-500',
                    cat.trend === 'stable' && 'text-[var(--c-text-muted)]'
                  )}
                />
                <span className="text-label text-[var(--c-text-muted)] w-6 text-right tabular-nums">
                  {cat.score}
                </span>
                <div className="h-1.5 w-16 rounded-full bg-[var(--c-surface)] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${cat.score}%`,
                      backgroundColor: getScoreColor(cat.score),
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </WidgetCard>
  )
}
