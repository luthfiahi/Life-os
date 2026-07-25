'use client'

import { cn } from '@/lib/utils'

/**
 * Life OS Loading Spinner
 * Simple, minimal spinner for loading states.
 */

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  label?: string
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
}

export function LoadingSpinner({
  size = 'md',
  className,
  label = 'Memuat...',
}: LoadingSpinnerProps) {
  return (
    <div className={cn('flex items-center gap-2', className)} role="status">
      <svg
        className={cn('animate-spin text-[var(--c-accent)]', sizeClasses[size])}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  )
}

/**
 * Life OS Loading Skeleton
 * For content placeholder loading states.
 */

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-[var(--radius-md)] bg-[var(--c-surface)]',
        className
      )}
      aria-hidden="true"
    />
  )
}

/**
 * Full page loading state
 */
export function PageLoading() {
  return (
    <div className="flex h-full min-h-[400px] items-center justify-center">
      <LoadingSpinner size="lg" label="Memuat halaman..." />
    </div>
  )
}