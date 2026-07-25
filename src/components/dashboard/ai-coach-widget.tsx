'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { WidgetCard } from './widget-card'
import { mockAICoachInsights, type AICoachInsight } from '@/lib/mock-data'
import { Bot, Lightbulb, MessageCircle, Sparkles, ArrowRight } from 'lucide-react'

/**
 * Life OS — AI Coach Placeholder Widget
 * Rotates through 3 mock AI insights (insight, suggestion, motivation).
 * Auto-rotates every 8s. Click to manually cycle.
 * Links to /coach for full experience (future sprint).
 */

const typeConfig = {
  insight: { icon: Lightbulb, color: 'text-amber-500', bgColor: 'bg-amber-500/10', label: 'Insight' },
  suggestion: { icon: MessageCircle, color: 'text-[var(--c-accent)]', bgColor: 'bg-[var(--c-accent)]/10', label: 'Saran' },
  motivation: { icon: Sparkles, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10', label: 'Motivasi' },
}

interface AICoachWidgetProps {
  insights?: AICoachInsight[]
  className?: string
}

export function AICoachWidget({ insights = mockAICoachInsights, className }: AICoachWidgetProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const active = insights[activeIndex]
  const config = typeConfig[active.type]
  const TypeIcon = config.icon

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % insights.length)
    }, 8000)
    return () => clearInterval(timer)
  }, [insights.length])

  return (
    <WidgetCard
      title="AI Coach"
      subtitle="Saran & insight cerdas"
      className={className}
      colSpan={2}
      action={
        <Link
          href="/coach"
          className="inline-flex items-center gap-1 text-label text-[var(--c-accent)] hover:underline"
        >
          Buka Coach
          <ArrowRight className="h-3 w-3" />
        </Link>
      }
    >
      <div
        className="cursor-pointer rounded-[var(--radius-lg)] p-3 transition-colors hover:bg-[var(--c-surface)]"
        onClick={() => setActiveIndex((prev) => (prev + 1) % insights.length)}
      >
        <div className="flex items-start gap-3">
          {/* AI Avatar */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--c-accent)]/10">
            <Bot className="h-5 w-5 text-[var(--c-accent)]" />
          </div>

          {/* Message */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className={cn('inline-flex items-center gap-1 rounded-[var(--radius-sm)] px-1.5 py-0.5 text-[10px] font-medium', config.bgColor, config.color)}>
                <TypeIcon className="h-2.5 w-2.5" />
                {config.label}
              </span>
            </div>
            <p className="text-body-small text-[var(--c-text)] leading-relaxed">
              {active.message}
            </p>
          </div>
        </div>

        {/* Dots indicator */}
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {insights.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation()
                setActiveIndex(idx)
              }}
              className={cn(
                'h-1.5 rounded-full transition-all duration-200',
                idx === activeIndex
                  ? 'w-4 bg-[var(--c-accent)]'
                  : 'w-1.5 bg-[var(--c-border)] hover:bg-[var(--c-icon)]'
              )}
              aria-label={`Insight ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </WidgetCard>
  )
}
