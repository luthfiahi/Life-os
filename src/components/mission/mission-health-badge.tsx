'use client'

import { cn } from '@/lib/utils'
import type { MissionHealth } from '@/lib/types/mission'
import { getHealthConfig } from '@/lib/services/mission.service'

interface MissionHealthBadgeProps {
  health: MissionHealth
  size?: 'sm' | 'md'
}

export function MissionHealthBadge({ health, size = 'sm' }: MissionHealthBadgeProps) {
  const config = getHealthConfig(health)
  return (
    <span className={cn(
      'inline-flex items-center gap-1 font-bold rounded-full',
      config.bg, config.color,
      size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1',
    )}>
      <span className={cn('rounded-full', config.dot, size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2')} />
      {config.label}
    </span>
  )
}
