import { AppShell } from '@/components/layout'

/**
 * Life OS — Dashboard Layout
 * Wraps all dashboard pages with the AppShell (Sidebar + Header + Content).
 * This layout is applied to all routes under the (dashboard) route group.
 */

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppShell>{children}</AppShell>
}
