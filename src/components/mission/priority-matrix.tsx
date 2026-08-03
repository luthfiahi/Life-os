'use client'

import { cn } from '@/lib/utils'
import type { MissionRow } from '@/lib/types/mission'
import { Target, Rocket, Flag, Star, Trophy, Zap, Code, BookOpen, Dumbbell, Heart } from 'lucide-react'

const ICON_MAP: Record<string, React.ElementType> = {
  Target, Rocket, Flag, Star, Trophy, Zap, Code, BookOpen, Dumbbell, Heart,
}

const GRADIENT_MAP: Record<string, string> = {
  blue: 'from-blue-500 to-blue-600',
  emerald: 'from-emerald-500 to-emerald-600',
  violet: 'from-violet-500 to-violet-600',
  orange: 'from-orange-500 to-orange-600',
  rose: 'from-rose-500 to-rose-600',
  sky: 'from-sky-500 to-sky-600',
}

const QUADRANT_CONFIG = [
  { quadrant: 'Do First', label: 'Urgent & Important', accent: 'border-rose-500/30 dark:border-rose-500/20', bgAccent: 'from-rose-500/5', icon: '🔥' },
  { quadrant: 'Schedule', label: 'Important, Not Urgent', accent: 'border-blue-500/30 dark:border-blue-500/20', bgAccent: 'from-blue-500/5', icon: '📅' },
  { quadrant: 'Delegate', label: 'Urgent, Not Important', accent: 'border-amber-500/30 dark:border-amber-500/20', bgAccent: 'from-amber-500/5', icon: '⚡' },
  { quadrant: 'Eliminate', label: 'Not Urgent, Not Important', accent: 'border-slate-500/30 dark:border-slate-500/20', bgAccent: 'from-slate-500/5', icon: '🧹' },
]

interface PriorityMatrixProps {
  matrix: { quadrant: string; missions: MissionRow[] }[]
  onMissionClick?: (mission: MissionRow) => void
}

export function PriorityMatrix({ matrix, onMissionClick }: PriorityMatrixProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {matrix.map((q, idx) => {
        const config = QUADRANT_CONFIG[idx] ?? QUADRANT_CONFIG[3]
        return (
          <div
            key={q.quadrant}
            className={cn(
              'rounded-2xl border bg-gradient-to-br p-4 space-y-3 min-h-[140px]',
              config.accent, config.bgAccent, 'to-transparent',
              'bg-[var(--c-card)]',
            )}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">{config.icon}</span>
              <div>
                <h4 className="text-xs font-bold text-[var(--c-text)]">{q.quadrant}</h4>
                <p className="text-[10px] text-[var(--c-text-muted)]">{config.label}</p>
              </div>
              <span className="ml-auto text-[10px] font-bold text-[var(--c-text-muted)] tabular-nums bg-[var(--c-surface)] dark:bg-white/[0.04] h-5 min-w-5 flex items-center justify-center rounded-full px-1.5">
                {q.missions.length}
              </span>
            </div>
            {q.missions.length === 0 ? (
              <p className="text-[11px] text-[var(--c-text-muted)]/50 italic py-2">Kosong</p>
            ) : (
              <div className="space-y-1.5">
                {q.missions.slice(0, 4).map((m) => {
                  const Icon = ICON_MAP[m.icon ?? 'Target'] ?? Target
                  const gradient = GRADIENT_MAP[m.color ?? 'blue'] ?? GRADIENT_MAP.blue
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => onMissionClick?.(m)}
                      className="w-full flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-[var(--c-surface)] dark:hover:bg-white/[0.04] transition-colors text-left group/item"
                    >
                      <div className={cn('h-6 w-6 rounded-md bg-gradient-to-br flex items-center justify-center shrink-0', gradient)}>
                        <Icon className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-[11px] font-medium text-[var(--c-text)] truncate flex-1">{m.title}</span>
                      <span className="text-[10px] font-bold text-[var(--c-text-muted)] tabular-nums">{Math.round(Number(m.progress))}%</span>
                    </button>
                  )
                })}
                {q.missions.length > 4 && (
                  <p className="text-[10px] text-[var(--c-text-muted)] text-center pt-0.5">+{q.missions.length - 4} lainnya</p>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}