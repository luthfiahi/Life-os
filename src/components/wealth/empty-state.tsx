'use client'

import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="relative mb-5">
        <div className="h-20 w-20 rounded-2xl bg-[var(--c-surface)] flex items-center justify-center">
          <Icon className="h-8 w-8 text-[var(--c-text-muted)]" strokeWidth={1.5} />
        </div>
        <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-[var(--c-accent)]/10 flex items-center justify-center">
          <div className="h-2 w-2 rounded-full bg-[var(--c-accent)]" />
        </div>
      </div>
      <h3 className="text-base font-semibold text-[var(--c-text)] mb-1.5">{title}</h3>
      <p className="text-sm text-[var(--c-text-muted)] max-w-xs mb-5 leading-relaxed">{description}</p>
      {action && (
        <Button variant="primary" size="sm" className="rounded-xl" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}
