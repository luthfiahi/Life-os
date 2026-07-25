'use client'

import { useAuth } from '@/hooks/use-auth'
import {
  LifeScoreWidget,
  TodayFocusWidget,
  QuickActionsWidget,
  SnapshotCardsWidget,
  RecentActivityWidget,
  AICoachWidget,
} from '@/components/dashboard'

/**
 * Life OS — Dashboard Command Center (Sprint 2)
 * Route: /dashboard
 *
 * Widget grid layout:
 * Row 1:  [Life Score (tall)]  [Today's Focus (tall)]  [Quick Actions (wide)]
 * Row 2:  [  (cont.)       ]  [    (cont.)           ]  [AI Coach (wide)     ]
 * Row 3:  [Recent Activity (tall)]  [Snapshot Cards (wide)                     ]
 * Row 4:  [    (cont.)              ]  [    (cont.)                             ]
 *
 * Responsive:
 * - Mobile: single column, all widgets stacked
 * - Tablet (sm): 2 columns
 * - Desktop (lg): 4 columns, row-spanning layout
 */

export default function DashboardPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-2 border-[var(--c-accent)] border-t-transparent rounded-full" />
      </div>
    )
  }

  const displayName =
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'Pengguna'

  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Selamat pagi' : hour < 17 ? 'Selamat siang' : 'Selamat malam'

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Welcome Header */}
      <div>
        <h1 className="text-h1 text-[var(--c-text)]">
          {greeting}, {displayName}
        </h1>
        <p className="text-sm text-[var(--c-text-muted)] mt-1">
          Command Center kamu — semua module dalam satu pandangan.
        </p>
      </div>

      {/* Widget Grid — 4 columns on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-auto">
        {/* Row 1-2: Life Score | Today's Focus | Quick Actions */}
        <LifeScoreWidget colSpan={1} rowSpan={2} />
        <TodayFocusWidget colSpan={1} rowSpan={2} />
        <QuickActionsWidget colSpan={2} rowSpan={1} />

        {/* Row 2 right: AI Coach */}
        <AICoachWidget colSpan={2} rowSpan={1} />

        {/* Row 3-4: Recent Activity | Snapshot Cards */}
        <RecentActivityWidget colSpan={1} rowSpan={2} />
        <SnapshotCardsWidget colSpan={3} rowSpan={1} />
      </div>
    </div>
  )
}
