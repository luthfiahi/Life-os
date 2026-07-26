'use client'

/**
 * Life OS — useToast hook (stub)
 * 
 * Toast notifications are handled by Sonner.
 * Import { toast } from 'sonner' directly in components.
 * This stub exists for backward compatibility but is not used.
 */

export type ToastProps = Record<string, unknown>
export type ToastActionElement = React.ReactElement

export function useToast() {
  return {
    toasts: [],
    toast: () => {},
    dismiss: () => {},
  }
}
