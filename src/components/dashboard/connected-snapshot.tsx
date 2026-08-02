'use client'

import { useWealthSnapshot } from '@/lib/queries/wealth-queries'
import { useMissionSnapshot } from '@/lib/queries/mission-queries'
import { formatRupiah, formatPercent } from '@/lib/services/wealth.service'
import { formatMissionDate } from '@/lib/services/mission.service'
import { SnapshotCardsWidget } from './snapshot-cards-widget'
import type { SnapshotCard } from '@/lib/mock-data'
import { mockSnapshotCards } from '@/lib/mock-data'

type ChangeType = 'positive' | 'negative' | 'neutral'

function parseChangeType(change: string | null): ChangeType {
  if (!change) return 'neutral'
  const num = parseFloat(change)
  if (num > 0) return 'positive'
  if (num < 0) return 'negative'
  return 'neutral'
}

function getExpenseChangeType(change: string | null): ChangeType {
  if (!change) return 'neutral'
  const num = parseFloat(change)
  if (num < 0) return 'positive'
  if (num > 0) return 'negative'
  return 'neutral'
}

/**
 * Combined Connected Snapshot — merges real Wealth + Mission data
 * into the SnapshotCardsWidget, replacing their mock cards.
 */
export function ConnectedSnapshot() {
  const { data: wealth, isLoading: wLoading } = useWealthSnapshot()
  const { data: mission, isLoading: mLoading } = useMissionSnapshot()
  const isLoading = wLoading || mLoading

  if (isLoading) return <SnapshotCardsWidget loading />

  // Build wealth card (snap1)
  const wealthCard: SnapshotCard = wealth
    ? {
        id: 'snap1', title: 'Keuangan', module: 'Wealth', href: '/wealth',
        icon: 'Wallet', color: 'text-emerald-500', bgColor: 'bg-emerald-500/10',
        metrics: [
          { label: 'Saldo Bulan Ini', value: formatRupiah(wealth.totalBalance),
            change: wealth.totalBalanceChange ?? undefined, changeType: parseChangeType(wealth.totalBalanceChange) },
          { label: 'Pengeluaran Hari Ini', value: formatRupiah(wealth.todayExpense),
            change: wealth.todayExpenseChange ?? undefined, changeType: getExpenseChangeType(wealth.todayExpenseChange) },
          { label: 'Budget Terpakai', value: formatPercent(wealth.budgetUtilization), changeType: 'neutral' },
        ],
      }
    : mockSnapshotCards.find((c) => c.id === 'snap1')!

  // Build mission card (snap3)
  const missionCard: SnapshotCard = mission
    ? {
        id: 'snap3', title: 'Target & Misi', module: 'Mission', href: '/mission',
        icon: 'Target', color: 'text-blue-500', bgColor: 'bg-blue-500/10',
        metrics: [
          { label: 'Active Missions', value: String(mission.activeMissions),
            changeType: mission.activeMissions > 0 ? 'positive' : 'neutral' },
          { label: 'Overall Progress', value: `${mission.overallProgress}%`,
            change: mission.overallProgress > 0 ? `+${mission.overallProgress}%` : undefined,
            changeType: mission.overallProgress > 0 ? 'positive' : 'neutral' },
          { label: 'Next Deadline', value: mission.nextDeadline ? formatMissionDate(mission.nextDeadline) : '—',
            changeType: 'neutral' },
        ],
      }
    : mockSnapshotCards.find((c) => c.id === 'snap3')!

  // Merge: replace snap1 + snap3, keep snap2 + snap4 as mock
  const cards: SnapshotCard[] = [
    wealthCard,
    mockSnapshotCards.find((c) => c.id === 'snap2')!,
    missionCard,
    mockSnapshotCards.find((c) => c.id === 'snap4')!,
  ]

  return <SnapshotCardsWidget cards={cards} />
}
