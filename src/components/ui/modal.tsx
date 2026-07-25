'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

/**
 * Life OS Modal (Dialog) Component
 * Based on Life OS Documentation v1.2, Section 4.8
 * 
 * Specs:
 * - Overlay: opacity 50%
 * - Content: white bg, border-radius 12pt
 * - Max height: 80% viewport
 * - Close button: top right
 * - Escape key closes dialog
 * - Click overlay closes dialog
 */

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  className,
  size = 'md',
}: ModalProps) {
  const overlayRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (open) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={description ? 'modal-description' : undefined}
    >
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />

      {/* Content */}
      <div
        className={cn(
          'relative z-10 w-full rounded-[var(--radius-xl)] border border-[var(--c-border)] bg-[var(--c-card)] shadow-[var(--shadow-modal)] animate-slide-up',
          'max-h-[80vh] overflow-y-auto',
          sizeClasses[size],
          className
        )}
      >
        {/* Header */}
        {(title || description) && (
          <div className="flex items-start justify-between p-6 pb-0">
            <div className="space-y-1">
              {title && (
                <h2
                  id="modal-title"
                  className="text-lg font-semibold text-[var(--c-text)]"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p
                  id="modal-description"
                  className="text-sm text-[var(--c-text-muted)]"
                >
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="rounded-[var(--radius-sm)] p-1 text-[var(--c-text-muted)] hover:text-[var(--c-text)] hover:bg-[var(--c-surface)] transition-colors"
              aria-label="Tutup"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}