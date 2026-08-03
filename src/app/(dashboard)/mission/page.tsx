'use client'

import { useState, useMemo } from 'react'
import {
  Target, Plus, CalendarDays, Pin, TrendingUp, CheckCircle2, Rocket, Sparkles, LayoutDashboard,
  Flame, Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMissions, useDeleteMission, useUpdateMission, useMissionDashboard, useMilestoneCountsByMission } from '@/lib/queries/mission-queries'
import { MissionCard } from '@/components/mission/mission-card'
import { MissionFormDialog } from '@/components/mission/mission-form-dialog'
import { MissionDetailDrawer } from '@/components/mission/mission-detail-drawer'
import { MissionDashboardView } from '@/components/mission/mission-dashboard-view'
import { calculateMissionHealth, daysUntil } from '@/lib/services/mission.service'
import type { MissionRow } from '@/lib/types/mission'

// ─── Skeletons ───────────────────────────────────────────
function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-[var(--c-border)] dark:border-white/[0.08] bg-[var(--c-card)] p-4 space-y-3.5 animate-pulse">
      <div className="h-[3px] w-full rounded-full bg-[var(--c-border)]/40 dark:bg-white/5" />
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-[var(--c-surface)] dark:bg-white/[0.04]" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded-lg bg-[var(--c-surface)] dark:bg-white/[0.04]" />
          <div className="h-3 w-1/2 rounded-lg bg-[var(--c-surface)] dark:bg-white/[0.04]" />
        </div>
      </div>
      <div className="h-2 w-full rounded-full bg-[var(--c-surface)] dark:bg-white/[0.04]" />
      <div className="flex gap-2">
        <div className="h-5 w-12 rounded-full bg-[var(--c-surface)] dark:bg-white/[0.04]" />
        <div className="h-5 w-14 rounded-full bg-[var(--c-surface)] dark:bg-white/[0.04]" />
      </div>
    </div>
  )
}

// ─── Stat Card (Premium) ─────────────────────────────────
function StatCard({ label, value, icon: Icon, color, sub, trend }: {
  label: string; value: string | number; icon: React.ElementType; color: string; sub?: string; trend?: 'up' | 'down' | 'neutral'
}) {
  return (
    <div className="rounded-2xl border border-[var(--c-border)] dark:border-white/[0.08] bg-[var(--c-card)] p-4 space-y-3 transition-all duration-300 hover:shadow-[var(--shadow-elevated)] dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 relative overflow-hidden">
      <div className={cn('absolute -top-6 -right-6 h-20 w-20 rounded-full blur-2xl opacity-30 dark:opacity-20 pointer-events-none', color)}></div>
      <div className="flex items-center justify-between relative">
        <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center shadow-sm dark:shadow-[0_4px_16px_rgba(0,0,0,0.4)]', color)}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        {sub && (
          <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-md', sub)}>{value}</span>
        )}
        {trend === 'up' && <TrendingUp className="h-4 w-4 text-emerald-500" />}
        {trend === 'down' && <TrendingUp className="h-4 w-4 text-rose-500 rotate-180" />}
      </div>
      {!sub && <p className="text-2xl font-extrabold text-[var(--c-text)] tabular-nums tracking-tight leading-none relative">{value}</p>}
      <p className="text-[11px] text-[var(--c-text-muted)] font-medium relative">{label}</p>
    </div>
  )
}

// ─── Health Score Ring ────────────────────────────────────
function HealthScoreRing({ score, label }: { score: number; label: string }) {
  const radius = 28
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference
  const color = score >= 70 ? 'text-emerald-500' : score >= 40 ? 'text-amber-500' : 'text-rose-500'
  const strokeColor = score >= 70 ? 'stroke-emerald-500' : score >= 40 ? 'stroke-amber-500' : 'stroke-rose-500'

  return (
    <div className="rounded-2xl border border-[var(--c-border)] dark:border-white/[0.08] bg-[var(--c-card)] p-4 flex items-center gap-4 transition-all duration-300 hover:shadow-[var(--shadow-elevated)] dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:-translate-y-0.5">
      <div className="relative h-[72px] w-[72px] shrink-0">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r={radius} fill="none" stroke="var(--c-border)" strokeWidth="5" opacity="0.3" className="dark:stroke-white/10" />
          <circle cx="36" cy="36" r={radius} fill="none" className={cn(strokeColor, 'transition-all duration-1000 ease-out')} strokeWidth="5" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn('text-lg font-extrabold tabular-nums', color)}>{score}</span>
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-sm font-bold text-[var(--c-text)]">{label}</p>
        <p className="text-[11px] text-[var(--c-text-muted)] leading-relaxed">
          {score >= 70 ? 'Mission kamu sehat!' : score >= 40 ? 'Beberapa perlu perhatian.' : 'Ada yang perlu segera ditangani.'}
        </p>
      </div>
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
type ViewMode = 'missions' | 'dashboard'

// ─── Main Page ───────────────────────────────────────────
export default function MissionPage() {
  const [activeTab, setActiveTab] = useState<TabValue>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('missions')
  const [formOpen, setFormOpen] = useState(false)
  const [editingMission, setEditingMission] = useState<MissionRow | null>(null)
  const [detailMission, setDetailMission] = useState<MissionRow | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const { data: allMissions, isLoading } = useMissions()
  const { data: milestoneCounts } = useMilestoneCountsByMission()
  const deleteMission = useDeleteMission()
  const updateMission = useUpdateMission()

  // Enhanced stats with health data
  const stats = useMemo(() => {
    if (!allMissions) return { total: 0, active: 0, completed: 0, progress: 0, overdue: 0, healthScore: 0, nextDeadline: null, totalMilestones: 0, completedMilestones: 0 }
    const active = allMissions.filter((m) => m.status === 'active')
    const completed = allMissions.filter((m) => m.status === 'completed')
    const progress = active.length > 0
      ? Math.round(active.reduce((s, m) => s + Number(m.progress), 0) / active.length)
      : 0

    // Health calculation
    const overdue = active.filter((m) => {
      if (!m.target_date) return false
      return new Date(m.target_date + 'T23:59:59') < new Date()
    }).length

    // Health score: 100 base, -20 per overdue, -10 per at_risk, -5 per critical
    let healthScore = 100
    for (const m of active) {
      const h = calculateMissionHealth(m)
      if (h.health === 'overdue') healthScore -= 20
      else if (h.health === 'critical') healthScore -= 15
      else if (h.health === 'at_risk') healthScore -= 8
    }
    healthScore = Math.max(0, Math.min(100, healthScore))

    // Find nearest deadline
    const activeWithDeadlines = active
      .filter((m) => m.target_date && daysUntil(m.target_date) !== null && daysUntil(m.target_date)! >= 0)
      .sort((a, b) => (daysUntil(a.target_date) ?? 999) - (daysUntil(b.target_date) ?? 999))
    const nextDeadline = activeWithDeadlines[0]?.target_date ?? null

    return { total: allMissions.length, active: active.length, completed: completed.length, progress, overdue, healthScore, nextDeadline }
  }, [allMissions])

  // Filtered + sorted
  const filtered = useMemo(() => {
    if (!allMissions) return []
    let list = activeTab === 'all' ? allMissions : allMissions.filter((m) => m.status === activeTab)
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

  function handleDashboardMissionClick(mission: MissionRow) {
    setViewMode('missions')
    setActiveTab('all')
    handleCardClick(mission)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 text-[var(--c-text)]">Mission</h1>
          <p className="text-sm text-[var(--c-text-muted)] mt-0.5">Project management pribadi — tujuan besar, milestone nyata.</p>
        </div>
        <button type="button" onClick={() => { setEditingMission(null); setFormOpen(true) }}
          className="h-10 px-5 rounded-xl bg-[var(--c-accent)] text-white text-sm font-bold shadow-lg shadow-[var(--c-accent)]/25 dark:shadow-[var(--c-accent)]/15 hover:shadow-xl hover:shadow-[var(--c-accent)]/30 hover:brightness-110 active:scale-[0.97] transition-all flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Mission Baru</span>
        </button>
      </div>

      {/* Summary Stats — Premium row with Health Score */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Total Mission" value={stats.total} icon={Target} color="bg-gradient-to-br from-blue-500 to-blue-600" />
        <StatCard label="Aktif" value={stats.active} icon={Rocket} color="bg-gradient-to-br from-emerald-500 to-emerald-600" />
        <StatCard label="Selesai" value={stats.completed} icon={CheckCircle2} color="bg-gradient-to-br from-violet-500 to-violet-600" trend={stats.completed > 0 ? 'up' : undefined} />
        <StatCard label="Avg Progress" value={`${stats.progress}%`} icon={TrendingUp} color="bg-gradient-to-br from-orange-500 to-orange-600" trend={stats.progress >= 50 ? 'up' : stats.progress > 0 ? 'neutral' : undefined} />
        {stats.overdue > 0 && (
          <StatCard label="Overdue" value={stats.overdue} icon={Flame} color="bg-gradient-to-br from-rose-500 to-rose-600" trend="down" />
        )}
        {stats.nextDeadline && (
          <StatCard
            label="Deadline Terdekat"
            value={`${daysUntil(stats.nextDeadline) ?? 0}h`}
            icon={CalendarDays}
            color="bg-gradient-to-br from-sky-500 to-sky-600"
          />
        )}
      </div>

      {/* Health Score Bar — only show when active missions exist */}
      {stats.active > 0 && (
        <HealthScoreRing
          score={stats.healthScore}
          label={stats.healthScore >= 70 ? 'Mission Health: Baik' : stats.healthScore >= 40 ? 'Mission Health: Perlu Perhatian' : 'Mission Health: Kritis'}
        />
      )}

      {/* View Mode Toggle + Status Tabs */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--c-surface)] dark:bg-white/[0.04] border border-[var(--c-border)] dark:border-white/[0.08]">
          <button type="button" onClick={() => setViewMode('missions')}
            className={cn(
              'px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center gap-1.5',
              viewMode === 'missions'
                ? 'bg-[var(--c-accent)] text-white shadow-sm shadow-[var(--c-accent)]/25'
                : 'text-[var(--c-text-muted)] hover:text-[var(--c-text)]',
            )}>
            <Target className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Misi</span>
          </button>
          <button type="button" onClick={() => setViewMode('dashboard')}
            className={cn(
              'px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center gap-1.5',
              viewMode === 'dashboard'
                ? 'bg-[var(--c-accent)] text-white shadow-sm shadow-[var(--c-accent)]/25'
                : 'text-[var(--c-text-muted)] hover:text-[var(--c-text)]',
            )}>
            <LayoutDashboard className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
        </div>
        {viewMode === 'missions' && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
            {STATUS_TABS.map((tab) => (
              <button key={tab.value} type="button" onClick={() => setActiveTab(tab.value)}
                className={cn(
                  'px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all duration-200',
                  activeTab === tab.value
                    ? 'bg-[var(--c-accent)] text-white shadow-md shadow-[var(--c-accent)]/25 dark:shadow-[var(--c-accent)]/15'
                    : 'text-[var(--c-text-muted)] hover:text-[var(--c-text)] hover:bg-[var(--c-surface)] dark:hover:bg-white/[0.05] border border-transparent hover:border-[var(--c-border)] dark:hover:border-white/10',
                )}>
                {tab.label}
                {tab.value !== 'all' && allMissions && (
                  <span className="ml-1.5 opacity-60 tabular-nums">{allMissions.filter((m) => m.status === tab.value).length}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>


      {viewMode === 'dashboard' ? (
        <MissionDashboardView onMissionClick={handleDashboardMissionClick} />
      ) : isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="relative mb-5">
            <div className="h-20 w-20 rounded-3xl bg-[var(--c-surface)] dark:bg-white/[0.04] border border-[var(--c-border)] dark:border-white/[0.08] flex items-center justify-center dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
              <Target className="h-9 w-9 text-[var(--c-text-muted)]/40 dark:text-white/15" />
            </div>
            <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-[var(--c-accent)]/10 dark:bg-[var(--c-accent)]/20 border border-[var(--c-accent)]/20 dark:border-[var(--c-accent)]/30 flex items-center justify-center">
              <Plus className="h-3 w-3 text-[var(--c-accent)]" />
            </div>
          </div>
          <h3 className="text-base font-bold text-[var(--c-text)]">Belum ada mission</h3>
          <p className="text-sm text-[var(--c-text-muted)] mt-1.5 max-w-xs leading-relaxed">
            Mulai dengan membuat mission pertamamu. Pecah menjadi milestone kecil yang bisa dicapai.
          </p>
          <button type="button" onClick={() => { setEditingMission(null); setFormOpen(true) }}
            className="mt-5 h-11 px-6 rounded-xl bg-[var(--c-accent)] text-white text-sm font-bold shadow-lg shadow-[var(--c-accent)]/25 dark:shadow-[var(--c-accent)]/15 hover:shadow-xl hover:brightness-110 active:scale-[0.97] transition-all flex items-center gap-2">
            <Sparkles className="h-4 w-4" /> Buat Mission Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((mission) => (
            <MissionCard
              key={mission.id}
              mission={mission}
              milestoneCount={milestoneCounts?.[mission.id]}
              data-mission-id={mission.id}
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
