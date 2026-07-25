import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * Life OS Button Component
 * Based on Life OS Documentation v1.2, Section 4.5
 * 
 * Variants:
 * - primary: Accent fill, white text (main actions)
 * - secondary: Transparent, accent border, accent text (secondary actions)
 * - ghost: Transparent, accent text (tertiary actions)
 * - destructive: Accent-2 fill, white text (delete/archive)
 * 
 * States: default, hover, disabled
 * Height: 36pt, padding horizontal: 16pt, border-radius: 6pt
 */

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--c-accent)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none',
  {
    variants: {
      variant: {
        primary:
          'bg-[var(--c-accent)] text-white hover:bg-[var(--c-accent)]/90 active:scale-[0.98]',
        secondary:
          'bg-transparent text-[var(--c-accent)] border border-[var(--c-accent)] hover:bg-[var(--c-accent)]/10 active:scale-[0.98]',
        ghost:
          'bg-transparent text-[var(--c-accent)] hover:bg-[var(--c-accent)]/10 active:scale-[0.98]',
        destructive:
          'bg-[var(--c-accent-2)] text-white hover:bg-[var(--c-accent-2)]/90 active:scale-[0.98]',
        outline:
          'bg-transparent text-[var(--c-text)] border border-[var(--c-border)] hover:bg-[var(--c-surface)] active:scale-[0.98]',
      },
      size: {
        sm: 'h-8 px-3 text-xs rounded-[var(--radius-sm)]',
        default: 'h-9 px-4 text-sm rounded-[var(--radius-md)]',
        md: 'h-9 px-4 text-sm rounded-[var(--radius-md)]',
        lg: 'h-10 px-6 text-base rounded-[var(--radius-md)]',
        icon: 'h-9 w-9 rounded-[var(--radius-md)]',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
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
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }