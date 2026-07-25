import { redirect } from 'next/navigation'

/**
 * Life OS — Root Page
 * Redirects to /dashboard (or /login if not authenticated).
 * The middleware handles the auth check.
 */

export default function RootPage() {
  redirect('/dashboard')
}