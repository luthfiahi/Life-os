/**
 * Life OS — Wealth Snapshot Connected Widget
 *
 * Sprint 3: Connects the Wealth Snapshot card in the Dashboard
 * to real Supabase data via TanStack Query.
 *
 * Architecture:
 *   This component → useWealthSnapshot() → wealth.service → wealth.repository → Supabase
 *
 * Only the Keuangan (Wealth) snapshot card is connected.
 * All other snapshot cards (Kesehatan, Target, Habit) continue using mock data.
 *
 * Graceful degradation:
 *   - If user is not authenticated → falls back to mock data
 *   - If Supabase is unavailable → falls back to mock data
 *   - If query is loading → shows skeleton
 *   - If query errors → shows mock data (silent fallback)
 */

'use client'

import { useWealthSnapshot } from '@/lib/queries/wealth-queries'
import { formatRupiah, formatPercent } from '@/lib/services/wealth.service'
import { SnapshotCardsWidget } from './snapshot-cards-widget'
import type { SnapshotCard } from '@/lib/mock-data'
import { mockSnapshotCards } from '@/lib/mock-data'

type ChangeType = 'positive' | 'negative' | 'neutral'

/** Determine if a change value is positive, negative, or neutral */
function parseChangeType(change: string | null): ChangeType {
  if (!change) return 'neutral'
  const num = parseFloat(change)
  if (num > 0) return 'positive'
  if (num < 0) return 'negative'
  return 'neutral'
}

/** Determine if a change should be shown as positive based on context */
function getExpenseChangeType(change: string | null): ChangeType {
  if (!change) return 'neutral'
  const num = parseFloat(change)
  // For expenses, negative change is good (less spending)
  if (num < 0) return 'positive'
  if (num > 0) return 'negative'
  return 'neutral'
}

export function WealthSnapshotConnected() {
  const { data, isLoading, isError } = useWealthSnapshot()

  // Loading state — pass loading to widget
  if (isLoading) {
    return <SnapshotCardsWidget loading />
  }

  // Error or no data — fall back to full mock
  if (isError || !data) {
    return <SnapshotCardsWidget />
  }

  // Build the wealth snapshot card from real data
  const wealthCard: SnapshotCard = {
    id: 'snap1',
    title: 'Keuangan',
    module: 'Wealth',
    href: '/wealth',
    icon: 'Wallet',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    metrics: [
      {
        label: 'Saldo Bulan Ini',
        value: formatRupiah(data.totalBalance),
        change: data.totalBalanceChange ?? undefined,
        changeType: parseChangeType(data.totalBalanceChange),
      },
      {
        label: 'Pengeluaran Hari Ini',
        value: formatRupiah(data.todayExpense),
        change: data.todayExpenseChange ?? undefined,
        changeType: getExpenseChangeType(data.todayExpenseChange),
      },
      {
        label: 'Budget Terpakai',
        value: formatPercent(data.budgetUtilization),
        changeType: 'neutral',
      },
    ],
  }

  // Merge: real wealth card + mock cards for other modules
  const cards: SnapshotCard[] = [
    wealthCard,
    ...mockSnapshotCards.filter((c) => c.id !== 'snap1'),
  ]

  return <SnapshotCardsWidget cards={cards} />
}
