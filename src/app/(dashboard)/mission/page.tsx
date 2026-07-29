'use client'

import { useState, useMemo } from 'react'
import {
  Target, Plus, Filter, LayoutGrid, List, CalendarDays, Pin,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMissions, useDeleteMission, useUpdateMission } from '@/lib/queries/mission-queries'
import { MissionCard } from '@/components/mission/mission-card'
import { MissionFormDialog } from '@/components/mission/mission-form-dialog'
import { MissionDetailDrawer } from '@/components/mission/mission-detail-drawer'
import type { MissionRow } from '@/lib/types/mission'

// ─── Skeletons ───────────────────────────────────────────
function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-[var(--c-border)] bg-white dark:bg-[#22262c] p-4 space-y-3 animate-pulse">
      <div className="h-1 w-full rounded-full bg-[var(--c-border)]/30" />
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-[var(--c-surface)]" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded bg-[var(--c-surface)]" />
          <div className="h-3 w-1/2 rounded bg-[var(--c-surface)]" />
        </div>
      </div>
      <div className="h-2 w-full rounded-full bg-[var(--c-surface)]" />
      <div className="flex gap-2">
        <div className="h-5 w-12 rounded-full bg-[var(--c-surface)]" />
        <div className="h-5 w-14 rounded-full bg-[var(--c-surface)]" />
      </div>
    </div>
  )
}

// ─── Summary Card ───────────────────────────────────────
function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ElementType; color: string }) {
  return (
    <div className="rounded-2xl border border-[var(--c-border)] bg-white dark:bg-[#22262c] p-4 space-y-2">
      <div className={cn('h-9 w-9 rounded-xl flex items-center justify-center', color)}>
        <Icon className="h-4.5 w-4.5 text-white" />
      </div>
      <p className="text-2xl font-bold text-[var(--c-text)] tabular-nums">{value}</p>
      <p className="text-xs text-[var(--c-text-muted)]">{label}</p>
    </div>
  )
}

// ─── Status Tabs ─────────────────────────────────────────
const STATUS_TABS = [
  { value: 'all', label: 'Semua' },
  { value: 'active', label: 'Aktif' },
  { value: 'completed', label: 'Selesai' },
  { value: 'archived', label: 'Arsip' },
  { value: 'draft', label: 'Draft' },
] as const

type TabValue = typeof STATUS_TABS[number]['value']

// ─── Main Page ───────────────────────────────────────────
export default function MissionPage() {
  const [activeTab, setActiveTab] = useState<TabValue>('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editingMission, setEditingMission] = useState<MissionRow | null>(null)
  const [detailMission, setDetailMission] = useState<MissionRow | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const { data: allMissions, isLoading } = useMissions()
  const deleteMission = useDeleteMission()
  const updateMission = useUpdateMission()

  // Stats
  const stats = useMemo(() => {
    if (!allMissions) return { total: 0, active: 0, completed: 0, progress: 0 }
    const active = allMissions.filter((m) => m.status === 'active')
    const completed = allMissions.filter((m) => m.status === 'completed')
    const progress = active.length > 0
      ? Math.round(active.reduce((s, m) => s + Number(m.progress), 0) / active.length)
      : 0
    return { total: allMissions.length, active: active.length, completed: completed.length, progress }
  }, [allMissions])

  // Filtered + sorted
  const filtered = useMemo(() => {
    if (!allMissions) return []
    let list = activeTab === 'all' ? allMissions : allMissions.filter((m) => m.status === activeTab)
    // Pinned first, then by priority weight, then by target_date
    const priorityWeight: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 }
    return [...list].sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1
      const pw = (priorityWeight[b.priority] ?? 0) - (priorityWeight[a.priority] ?? 0)
      if (pw !== 0) return pw
      if (a.target_date && b.target_date) return a.target_date.localeCompare(b.target_date)
      return b.created_at.localeCompare(a.created_at)
    })
  }, [allMissions, activeTab])

  function handleEdit(mission: MissionRow) {
    setEditingMission(mission)
    setFormOpen(true)
  }

  function handleArchive(mission: MissionRow) {
    const newStatus = mission.status === 'archived' ? 'active' : 'archived'
    updateMission.mutateAsync({ id: mission.id, payload: { status: newStatus } })
  }

  async function handleDelete(mission: MissionRow) {
    if (!confirm('Hapus mission ini beserta semua milestone-nya?')) return
    await deleteMission.mutateAsync(mission.id)
  }

  function handleCardClick(mission: MissionRow) {
    setDetailMission(mission)
    setDrawerOpen(true)
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 text-[var(--c-text)]">Mission</h1>
          <p className="text-sm text-[var(--c-text-muted)]">Kelola tujuan besar dan milestone-mu.</p>
        </div>
        <button type="button" onClick={() => { setEditingMission(null); setFormOpen(true) }}
          className="h-10 px-4 rounded-xl bg-[var(--c-accent)] text-white text-sm font-semibold shadow-lg shadow-[var(--c-accent)]/20 hover:opacity-90 active:scale-[0.97] transition-all flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Mission Baru</span>
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Mission" value={stats.total} icon={Target} color="bg-blue-500" />
        <StatCard label="Aktif" value={stats.active} icon={Pin} color="bg-emerald-500" />
        <StatCard label="Selesai" value={stats.completed} icon={CalendarDays} color="bg-violet-500" />
        <StatCard label="Rata-rata Progress" value={`${stats.progress}%`} icon={Filter} color="bg-orange-500" />
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
        {STATUS_TABS.map((tab) => (
          <button key={tab.value} type="button" onClick={() => setActiveTab(tab.value)}
            className={cn(
              'px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all duration-200',
              activeTab === tab.value
                ? 'bg-[var(--c-accent)] text-white shadow-sm'
                : 'text-[var(--c-text-muted)] hover:text-[var(--c-text)] hover:bg-[var(--c-surface)]',
            )}>
            {tab.label}
            {tab.value !== 'all' && allMissions && (
              <span className="ml-1.5 opacity-70">{allMissions.filter((m) => m.status === tab.value).length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Mission Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-16 w-16 rounded-2xl bg-[var(--c-surface)] flex items-center justify-center mb-4">
            <Target className="h-8 w-8 text-[var(--c-text-muted)]/50" />
          </div>
          <h3 className="text-base font-semibold text-[var(--c-text)]">Belum ada mission</h3>
          <p className="text-sm text-[var(--c-text-muted)] mt-1 max-w-xs">
            Mulai dengan membuat mission pertamamu. Pecah menjadi milestone kecil.
          </p>
          <button type="button" onClick={() => { setEditingMission(null); setFormOpen(true) }}
            className="mt-4 h-10 px-5 rounded-xl bg-[var(--c-accent)] text-white text-sm font-semibold shadow-lg shadow-[var(--c-accent)]/20 hover:opacity-90 active:scale-[0.97] transition-all flex items-center gap-2">
            <Plus className="h-4 w-4" /> Buat Mission Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((mission) => (
            <MissionCard
              key={mission.id}
              mission={mission}
              onClick={() => handleCardClick(mission)}
              onEdit={() => handleEdit(mission)}
              onArchive={() => handleArchive(mission)}
              onDelete={() => handleDelete(mission)}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <MissionFormDialog
        open={formOpen}
        onOpenChange={(v) => { setFormOpen(v); if (!v) setEditingMission(null) }}
        mission={editingMission}
      />
      <MissionDetailDrawer
        mission={detailMission}
        open={drawerOpen}
        onOpenChange={(v) => { setDrawerOpen(v); if (!v) setDetailMission(null) }}
        onEdit={() => { if (detailMission) handleEdit(detailMission) }}
      />
    </div>
  )
}