import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * Life OS Input Component
 * Based on Life OS Documentation v1.2, Section 4.7
 * 
 * Specs:
 * - Label on top, input full-width
 * - Focus: border var(--c-accent) + ring with 30% opacity
 * - Disabled: bg var(--c-card), text var(--c-text-muted)
 * - Helper text below input
 * - Error message on validation failure
 */

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  helperText?: string
  error?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, helperText, error, id, ...props }, ref) => {
    const generatedId = React.useId()
    const inputId = id || generatedId

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[var(--c-text)]"
          >
            {label}
          </label>
        )}
        <input
          type={type}
          id={inputId}
          className={cn(
            'flex h-9 w-full rounded-[var(--radius-md)] border bg-[var(--c-card)] px-3 py-1 text-sm shadow-sm transition-colors',
            'file:border-0 file:bg-transparent file:text-sm file:font-medium',
            'placeholder:text-[var(--c-text-muted)]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--c-accent)]/30 focus-visible:border-[var(--c-accent)]',
            'disabled:cursor-not-allowed disabled:bg-[var(--c-card)] disabled:text-[var(--c-text-muted)]',
            error
              ? 'border-[var(--c-accent-2)] focus-visible:ring-[var(--c-accent-2)]/30'
              : 'border-[var(--c-border)]',
            className
          )}
          ref={ref}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={
            error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
          }
          {...props}
        />
        {helperText && !error && (
          <p
            id={`${inputId}-helper`}
            className="text-xs text-[var(--c-text-muted)]"
          >
            {helperText}
          </p>
        )}
        {error && (
          <p
            id={`${inputId}-error`}
            className="text-xs text-[var(--c-accent-2)]"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }