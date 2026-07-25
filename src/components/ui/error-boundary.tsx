'use client'

import { cn } from '@/lib/utils'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from './button'

/**
 * Life OS Error Display Component
 * For displaying error states in the UI.
 */

interface ErrorDisplayProps {
  title?: string
  message: string
  onRetry?: () => void
  className?: string
}

export function ErrorDisplay({
  title = 'Terjadi Kesalahan',
  message,
  onRetry,
  className,
}: ErrorDisplayProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 p-8 text-center',
        className
      )}
      role="alert"
    >
      <div className="rounded-full bg-[var(--c-accent-2)]/10 p-3">
        <AlertTriangle className="h-6 w-6 text-[var(--c-accent-2)]" />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-[var(--c-text)]">{title}</h3>
        <p className="text-sm text-[var(--c-text-muted)] max-w-md">{message}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          <RefreshCw className="h-3.5 w-3.5" />
          Coba Lagi
        </Button>
      )}
    </div>
  )
}