/**
 * Life OS Component Library
 * Reusable UI components based on Life OS Design System v1.2
 * 
 * Components:
 * - Button: 4 variants (primary, secondary, ghost, destructive), 4 sizes
 * - Card: Container with header, content, footer
 * - Input: Form input with label, helper text, error state
 * - Modal: Dialog overlay with title, description, close button
 * - Toast: Notification system (via sonner)
 * - Loading: Spinner, Skeleton, PageLoading
 * - ErrorDisplay: Error state with retry action
 */

export { Button, buttonVariants, type ButtonProps } from './button'
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from './card'
export { Input, type InputProps } from './input'
export { Modal } from './modal'
export {
  LoadingSpinner,
  Skeleton,
  PageLoading,
} from './loading'
export { ErrorDisplay } from './error-boundary'