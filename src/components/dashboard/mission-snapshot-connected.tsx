'use client'

import { useMissionSnapshot } from '@/lib/queries/mission-queries'
import { formatMissionDate } from '@/lib/services/mission.service'
import { SnapshotCardsWidget } from './snapshot-cards-widget'
import type { SnapshotCard } from '@/lib/mock-data'
import { mockSnapshotCards } from '@/lib/mock-data'

export function MissionSnapshotConnected() {
  const { data, isLoading, isError } = useMissionSnapshot()

  if (isLoading) return <SnapshotCardsWidget loading />
  if (isError || !data) return <SnapshotCardsWidget />

  const nextDeadlineStr = data.nextDeadline
    ? formatMissionDate(data.nextDeadline)
    : '—'

  const missionCard: SnapshotCard = {
    id: 'snap3',
    title: 'Target & Misi',
    module: 'Mission',
    href: '/mission',
    icon: 'Target',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    metrics: [
      {
        label: 'Active Missions',
        value: String(data.activeMissions),
        changeType: data.activeMissions > 0 ? 'positive' : 'neutral',
      },
      {
        label: 'Overall Progress',
        value: `${data.overallProgress}%`,
        change: data.overallProgress > 0 ? `+${data.overallProgress}%` : undefined,
        changeType: data.overallProgress > 0 ? 'positive' : 'neutral',
      },
      {
        label: 'Next Deadline',
        value: nextDeadlineStr,
        changeType: 'neutral',
      },
    ],
  }

  const cards: SnapshotCard[] = [
    ...mockSnapshotCards.filter((c) => c.id !== 'snap3'),
    missionCard,
  ]

  return <SnapshotCardsWidget cards={cards} />
}