'use client'

import { useState } from 'react'
import {
  Sheet, SheetContent, SheetTitle, SheetDescription,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import {
  Target, Rocket, Flag, Star, Trophy, Zap, Code, BookOpen, Dumbbell, Heart,
  CalendarDays, Pin, Pencil, Archive, Trash2, Flame, Clock,
  LayoutList, ListChecks, FileText, Link2,
  Calendar, Dumbbell as HabitIcon, Brain, Lightbulb, Lock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDeleteMission, useUpdateMission, useMilestones } from '@/lib/queries/mission-queries'
import { MilestonePanel } from './milestone-panel'
import { MissionHealthBadge } from './mission-health-badge'
import { formatMissionDate, formatDaysRemaining, getPriorityConfig, getStatusConfig, calculateMissionHealth, getCategoryConfig, daysUntil } from '@/lib/services/mission.service'
import type { MissionRow } from '@/lib/types/mission'

const ICON_MAP: Record<string, React.ElementType> = {
  Target, Rocket, Flag, Star, Trophy, Zap, Code, BookOpen, Dumbbell, Heart,
}

const GRADIENT_MAP: Record<string, string> = {
  blue: 'from-blue-500 to-blue-600',
  emerald: 'from-emerald-500 to-emerald-600',
  violet: 'from-violet-500 to-violet-600',
  orange: 'from-orange-500 to-orange-600',
  rose: 'from-rose-500 to-rose-600',
  sky: 'from-sky-500 to-sky-600',
}

const HEADER_GRADIENT_MAP: Record<string, string> = {
  blue: 'from-blue-500 via-blue-600 to-indigo-700 dark:from-blue-600 dark:via-blue-800 dark:to-indigo-900',
  emerald: 'from-emerald-500 via-emerald-600 to-teal-700 dark:from-emerald-600 dark:via-emerald-800 dark:to-teal-900',
  violet: 'from-violet-500 via-violet-600 to-purple-700 dark:from-violet-600 dark:via-violet-800 dark:to-purple-900',
  orange: 'from-orange-500 via-orange-600 to-amber-700 dark:from-orange-600 dark:via-orange-800 dark:to-amber-900',
  rose: 'from-rose-500 via-rose-600 to-pink-700 dark:from-rose-600 dark:via-rose-800 dark:to-pink-900',
  sky: 'from-sky-500 via-sky-600 to-cyan-700 dark:from-sky-600 dark:via-sky-800 dark:to-cyan-900',
}

const PROGRESS_GLOW_MAP: Record<string, string> = {
  blue: 'shadow-blue-500/30 dark:shadow-blue-500/20',
  emerald: 'shadow-emerald-500/30 dark:shadow-emerald-500/20',
  violet: 'shadow-violet-500/30 dark:shadow-violet-500/20',
  orange: 'shadow-orange-500/30 dark:shadow-orange-500/20',
  rose: 'shadow-rose-500/30 dark:shadow-rose-500/20',
  sky: 'shadow-sky-500/30 dark:shadow-sky-500/20',
}

type DetailTab = 'overview' | 'milestones' | 'notes' | 'related'

const TABS: { value: DetailTab; label: string; icon: React.ElementType }[] = [
  { value: 'overview', label: 'Overview', icon: LayoutList },
  { value: 'milestones', label: 'Milestones', icon: ListChecks },
  { value: 'notes', label: 'Catatan', icon: FileText },
  { value: 'related', label: 'Terkait', icon: Link2 },
]

interface MissionDetailDrawerProps {
  mission: MissionRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: () => void
}

export function MissionDetailDrawer({ mission, open, onOpenChange, onEdit }: MissionDetailDrawerProps) {
  const updateMission = useUpdateMission()
  const deleteMission = useDeleteMission()
  const [activeTab, setActiveTab] = useState<DetailTab>('overview')
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [notesValue, setNotesValue] = useState('')
  const { data: milestones } = useMilestones(mission?.id ?? null)

  if (!mission) return null
  const m: MissionRow = mission

  const Icon = ICON_MAP[m.icon ?? 'Target'] ?? Target
  const gradient = GRADIENT_MAP[m.color ?? 'blue'] ?? GRADIENT_MAP.blue
  const headerGradient = HEADER_GRADIENT_MAP[m.color ?? 'blue'] ?? HEADER_GRADIENT_MAP.blue
  const progressGlow = PROGRESS_GLOW_MAP[m.color ?? 'blue'] ?? PROGRESS_GLOW_MAP.blue
  const priority = getPriorityConfig(m.priority)
  const status = getStatusConfig(m.status)
  const category = getCategoryConfig(m.category)
  const health = calculateMissionHealth(m)
  const days = formatDaysRemaining(m.target_date)
  const isOverdue = m.target_date && new Date(m.target_date + 'T23:59:59') < new Date() && m.status === 'active'
  const progressVal = Math.min(Math.round(Number(m.progress)), 100)
  const milestoneTotal = milestones?.length ?? 0
  const milestoneCompleted = milestones?.filter((ms) => ms.status === 'completed').length ?? 0
  const milestoneInProgress = milestones?.filter((ms) => ms.status === 'in_progress').length ?? 0
  const nextMilestone = milestones?.find((ms) => ms.status !== 'completed' && ms.due_date)

  async function handleArchive() {
    const newStatus = m.status === 'archived' ? 'active' : 'archived'
    await updateMission.mutateAsync({ id: m.id, payload: { status: newStatus } })
    onOpenChange(false)
  }

  async function handleDelete() {
    if (!confirm('Hapus mission ini beserta semua milestone-nya?')) return
    await deleteMission.mutateAsync(m.id)
    onOpenChange(false)
  }

  async function handleTogglePin() {
    await updateMission.mutateAsync({ id: m.id, payload: { is_pinned: !m.is_pinned } })
  }

  function handleTabChange(tab: DetailTab) {
    if (tab === 'notes' && !isEditingNotes) {
      setNotesValue(m.notes ?? '')
    }
    setActiveTab(tab)
  }

  async function handleSaveNotes() {
    await updateMission.mutateAsync({ id: m.id, payload: { notes: notesValue || null } })
    setIsEditingNotes(false)
  }

  // Reset tab when mission changes
  const handleOpenChange = (v: boolean) => {
    if (!v) {
      setActiveTab('overview')
      setIsEditingNotes(false)
    }
    onOpenChange(v)
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[560px] p-0 flex flex-col overflow-hidden">
        {/* Premium color header with glassmorphism */}
        <div className={cn('h-40 bg-gradient-to-br relative flex-shrink-0', headerGradient)}>
          <div className="absolute -top-8 -right-8 h-36 w-36 rounded-full bg-white/10 dark:bg-white/5" />
          <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-white/5 dark:bg-white/5" />
          <div className="absolute top-6 right-16 h-12 w-12 rounded-full bg-white/5 dark:bg-white/5" />
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[var(--c-card)] to-transparent" />
          <div className="relative h-full px-6 flex flex-col justify-end pb-6">
            <div className="flex items-center gap-3.5">
              <div className="h-14 w-14 rounded-2xl bg-white/20 dark:bg-white/10 backdrop-blur-md flex items-center justify-center shadow-xl border border-white/25 dark:border-white/10">
                <Icon className="h-7 w-7 text-white drop-shadow-sm" />
              </div>
              <div className="min-w-0 flex-1">
                <SheetTitle className="text-lg font-extrabold text-white truncate drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]">{m.title}</SheetTitle>
                <SheetDescription className="text-xs text-white/80 dark:text-white/60 mt-0.5 line-clamp-1">{m.description ?? 'Tidak ada deskripsi'}</SheetDescription>
              </div>
            </div>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex-shrink-0 border-b border-[var(--c-border)] dark:border-white/[0.08] px-6">
          <div className="flex items-center gap-1 -mb-px overflow-x-auto">
            {TABS.map((tab) => {
              const TabIcon = tab.icon
              const isActive = activeTab === tab.value
              const badge = tab.value === 'milestones' && milestoneTotal > 0
                  ? `${milestoneCompleted}/${milestoneTotal}`
                  : null
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => handleTabChange(tab.value)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-3 text-xs font-semibold whitespace-nowrap transition-all duration-200 border-b-2',
                    isActive
                      ? 'border-[var(--c-accent)] text-[var(--c-accent)]'
                      : 'border-transparent text-[var(--c-text-muted)] hover:text-[var(--c-text)]',
                  )}
                >
                  <TabIcon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {badge && (
                    <span className={cn(
                      'text-[10px] font-bold px-1.5 py-0.5 rounded-md',
                      isActive ? 'bg-[var(--c-accent)]/10' : 'bg-[var(--c-surface)] dark:bg-white/[0.04]',
                    )}>{badge}</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 py-5">
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              {/* Stats row — premium glass cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-[var(--c-surface)] dark:bg-white/[0.04] border border-[var(--c-border)] dark:border-white/[0.08] p-3.5 text-center space-y-1.5 dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
                  <p className="text-[10px] font-bold text-[var(--c-text-muted)] uppercase tracking-widest">Progress</p>
                  <p className="text-2xl font-extrabold text-[var(--c-text)] tabular-nums tracking-tight leading-none">{progressVal}<span className="text-sm font-bold text-[var(--c-text-muted)]">%</span></p>
                </div>
                <div className="rounded-2xl bg-[var(--c-surface)] dark:bg-white/[0.04] border border-[var(--c-border)] dark:border-white/[0.08] p-3.5 text-center space-y-1.5 dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
                  <p className="text-[10px] font-bold text-[var(--c-text-muted)] uppercase tracking-widest">Priority</p>
                  <p className={cn('text-sm font-bold mt-0.5', priority.color)}>{priority.label}</p>
                </div>
                <div className="rounded-2xl bg-[var(--c-surface)] dark:bg-white/[0.04] border border-[var(--c-border)] dark:border-white/[0.08] p-3.5 text-center space-y-1.5 dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
                  <p className="text-[10px] font-bold text-[var(--c-text-muted)] uppercase tracking-widest">Status</p>
                  <p className={cn('text-sm font-bold mt-0.5', status.color)}>{status.label}</p>
                </div>
              </div>

              {/* Health + Category row */}
              <div className="flex items-center gap-2 flex-wrap">
                {m.status === 'active' && <MissionHealthBadge health={health.health} size="md" />}
                {m.category && m.category !== 'general' && (
                  <span className={cn('text-[10px] font-bold px-2 py-1 rounded-full dark:ring-1 dark:ring-white/5', category.bg, category.color)}>{category.label}</span>
                )}
              </div>

              {/* Progress bar with glow */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--c-text-muted)] font-medium">Milestone Progress</span>
                  <span className="font-extrabold text-[var(--c-text)] tabular-nums">{progressVal}%</span>
                </div>
                <div className="h-3 rounded-full bg-[var(--c-border)]/40 dark:bg-white/10 overflow-hidden">
                  <div className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out shadow-sm', gradient, progressGlow)} style={{ width: `${progressVal}%` }} />
                </div>
              </div>

              {/* Dates — premium cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-[var(--c-surface)] dark:bg-white/[0.04] border border-[var(--c-border)] dark:border-white/[0.08] p-3.5 space-y-2 dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />
                    <p className="text-[10px] font-bold text-[var(--c-text-muted)] uppercase tracking-widest">Mulai</p>
                  </div>
                  <p className="text-sm font-semibold text-[var(--c-text)]">{formatMissionDate(m.start_date)}</p>
                </div>
                <div className="rounded-2xl bg-[var(--c-surface)] dark:bg-white/[0.04] border border-[var(--c-border)] dark:border-white/[0.08] p-3.5 space-y-2 dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
                  <div className="flex items-center gap-1.5">
                    {isOverdue ? <Flame className="h-3.5 w-3.5 text-rose-500" /> : <CalendarDays className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />}
                    <p className="text-[10px] font-bold text-[var(--c-text-muted)] uppercase tracking-widest">Target</p>
                  </div>
                  <p className={cn('text-sm font-semibold', isOverdue ? 'text-rose-500' : 'text-[var(--c-text)]')}>
                    {formatMissionDate(m.target_date)}
                  </p>
                  {days && (
                    <p className={cn('text-[11px] tabular-nums', isOverdue ? 'text-rose-400 dark:text-rose-300 font-bold' : 'text-[var(--c-text-muted)]')}>
                      {days}
                    </p>
                  )}
                </div>
              </div>

              {/* Quick milestone summary */}
              {milestoneTotal > 0 && (
                <div className="rounded-2xl bg-[var(--c-surface)] dark:bg-white/[0.04] border border-[var(--c-border)] dark:border-white/[0.08] p-4 space-y-3 dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[var(--c-text)] flex items-center gap-2">
                      <span className="h-1 w-4 rounded-full bg-[var(--c-accent)]" />
                      Ringkasan Milestone
                    </h3>
                    <button type="button" onClick={() => setActiveTab('milestones')} className="text-[10px] font-bold text-[var(--c-accent)] hover:text-[var(--c-accent)]/80 transition-colors">
                      Lihat semua
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <p className="text-lg font-extrabold text-emerald-500 tabular-nums">{milestoneCompleted}</p>
                      <p className="text-[10px] text-[var(--c-text-muted)] font-medium">Selesai</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-extrabold text-amber-500 tabular-nums">{milestoneInProgress}</p>
                      <p className="text-[10px] text-[var(--c-text-muted)] font-medium">Aktif</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-extrabold text-[var(--c-text)] tabular-nums">{milestoneTotal - milestoneCompleted - milestoneInProgress}</p>
                      <p className="text-[10px] text-[var(--c-text-muted)] font-medium">Pending</p>
                    </div>
                  </div>
                  {nextMilestone && (
                    <div className="flex items-center gap-2 pt-2 border-t border-[var(--c-border)]/50 dark:border-white/[0.06]">
                      <CalendarDays className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />
                      <span className="text-[11px] text-[var(--c-text-muted)]">Milestone berikutnya:</span>
                      <span className="text-[11px] font-bold text-[var(--c-text)] truncate">{nextMilestone.title}</span>
                      <span className="text-[10px] font-bold tabular-nums ml-auto shrink-0">{formatMissionDate(nextMilestone.due_date)}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Quick notes preview */}
              {m.notes && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-[var(--c-text)] flex items-center gap-2">
                      <span className="h-1 w-4 rounded-full bg-violet-500" />
                      Catatan
                    </h3>
                    <button type="button" onClick={() => { setNotesValue(m.notes ?? ''); setActiveTab('notes') }} className="text-[10px] font-bold text-[var(--c-accent)] hover:text-[var(--c-accent)]/80 transition-colors">
                      Edit
                    </button>
                  </div>
                  <div className="rounded-xl bg-[var(--c-surface)] dark:bg-white/[0.04] border border-[var(--c-border)] dark:border-white/[0.08] p-3.5 text-sm text-[var(--c-text)] whitespace-pre-wrap leading-relaxed line-clamp-4 dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
                    {m.notes}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'milestones' && (
            <div className="animate-fade-in">
              <MilestonePanel missionId={m.id} />
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[var(--c-text)] flex items-center gap-2">
                  <FileText className="h-4 w-4 text-violet-500" />
                  Catatan Mission
                </h3>
                {!isEditingNotes && (
                  <button
                    type="button"
                    onClick={() => { setNotesValue(m.notes ?? ''); setIsEditingNotes(true) }}
                    className="text-xs font-bold text-[var(--c-accent)] hover:text-[var(--c-accent)]/80 transition-colors"
                  >Edit</button>
                )}
              </div>
              {isEditingNotes ? (
                <div className="space-y-3">
                  <textarea
                    value={notesValue}
                    onChange={(e) => setNotesValue(e.target.value)}
                    placeholder="Tulis catatan, strategi, link penting, atau apa saja yang relevan dengan mission ini..."
                    rows={12}
                    autoFocus
                    className="w-full rounded-xl border border-[var(--c-border)] dark:border-white/10 bg-[var(--c-card)] dark:bg-white/[0.04] p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--c-accent)]/30 resize-none leading-relaxed dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
                    style={{ color: 'var(--c-text)' }}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingNotes(false)}
                      className="h-9 px-4 rounded-xl text-xs font-medium border border-[var(--c-border)] dark:border-white/10 text-[var(--c-text-muted)] hover:bg-[var(--c-surface)] dark:hover:bg-white/5 transition-colors"
                    >Batal</button>
                    <Button
                      type="button"
                      size="sm"
                      variant="primary"
                      onClick={handleSaveNotes}
                      loading={updateMission.isPending}
                      className="rounded-xl h-9 px-4"
                    >Simpan</Button>
                  </div>
                </div>
              ) : m.notes ? (
                <div className="rounded-xl bg-[var(--c-surface)] dark:bg-white/[0.04] border border-[var(--c-border)] dark:border-white/[0.08] p-4 text-sm text-[var(--c-text)] whitespace-pre-wrap leading-relaxed dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
                  {m.notes}
                </div>
              ) : (
                <div className="flex flex-col items-center py-12 text-center">
                  <div className="h-12 w-12 rounded-2xl bg-[var(--c-surface)] dark:bg-white/[0.04] border border-[var(--c-border)] dark:border-white/[0.08] flex items-center justify-center mb-3">
                    <FileText className="h-5 w-5 text-[var(--c-text-muted)]/40 dark:text-white/20" />
                  </div>
                  <p className="text-sm text-[var(--c-text-muted)] mb-4">Belum ada catatan untuk mission ini.</p>
                  <button
                    type="button"
                    onClick={() => { setNotesValue(''); setIsEditingNotes(true) }}
                    className="h-9 px-4 rounded-xl text-xs font-bold bg-[var(--c-accent)]/10 dark:bg-[var(--c-accent)]/15 text-[var(--c-accent)] hover:bg-[var(--c-accent)]/20 transition-colors"
                  >
                    <Pencil className="h-3 w-3 inline mr-1.5" />Tambah Catatan
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'related' && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-sm font-bold text-[var(--c-text)] flex items-center gap-2">
                <Link2 className="h-4 w-4 text-[var(--c-accent)]" />
                Koneksi Module
              </h3>
              <p className="text-xs text-[var(--c-text-muted)] leading-relaxed">
                Hubungkan mission ini dengan module Life OS lainnya untuk integrasi data yang lebih powerful.
              </p>

              {/* Related modules — integration teasers */}
              <div className="space-y-3">
                <RelatedModuleCard
                  icon={Calendar}
                  name="Schedule"
                  description="Hubungkan milestone dengan jadwal kalender dan time blocks."
                  sprint="Sprint 7"
                  color="text-blue-500"
                  accentColor="bg-blue-500/10 dark:bg-blue-500/15"
                />
                <RelatedModuleCard
                  icon={HabitIcon}
                  name="Discipline"
                  description="Track habits yang mendukung mission ini. Lihat korelasi antara kebiasaan dan progress."
                  sprint="Sprint 8"
                  color="text-emerald-500"
                  accentColor="bg-emerald-500/10 dark:bg-emerald-500/15"
                />
                <RelatedModuleCard
                  icon={Brain}
                  name="Reflection"
                  description="Tulis jurnal refleksi terkait progress dan pembelajaran dari mission ini."
                  sprint="Sprint 9"
                  color="text-violet-500"
                  accentColor="bg-violet-500/10 dark:bg-violet-500/15"
                />
                <RelatedModuleCard
                  icon={Lightbulb}
                  name="AI Coach"
                  description="Dapatkan saran AI untuk strategi, roadblock, dan optimasi mission."
                  sprint="Sprint 10+"
                  color="text-amber-500"
                  accentColor="bg-amber-500/10 dark:bg-amber-500/15"
                />
              </div>
            </div>
          )}
        </div>

        {/* Fixed footer — premium glass */}
        <div className="flex-shrink-0 border-t border-[var(--c-border)] dark:border-white/[0.08] px-6 py-3.5 bg-[var(--c-card)] dark:bg-[var(--c-card)]/80 dark:backdrop-blur-xl">
          <div className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <button type="button" onClick={handleTogglePin}
                className={cn('h-9 px-3.5 rounded-xl text-xs font-bold border transition-all duration-200',
                  m.is_pinned
                    ? 'border-[var(--c-accent)] bg-[var(--c-accent)]/10 dark:bg-[var(--c-accent)]/15 text-[var(--c-accent)] shadow-sm shadow-[var(--c-accent)]/10'
                    : 'border-[var(--c-border)] dark:border-white/10 text-[var(--c-text-muted)] hover:text-[var(--c-text)] hover:border-[var(--c-text-muted)] dark:hover:border-white/20 dark:hover:bg-white/5')}>
                <Pin className={cn('h-3.5 w-3.5 inline mr-1', m.is_pinned && 'fill-[var(--c-accent)]')} />
                {m.is_pinned ? 'Unpin' : 'Pin'}
              </button>
              <button type="button" onClick={handleArchive}
                className="h-9 px-3.5 rounded-xl text-xs font-bold border border-[var(--c-border)] dark:border-white/10 text-[var(--c-text-muted)] hover:text-[var(--c-text)] hover:border-[var(--c-text-muted)] dark:hover:border-white/20 dark:hover:bg-white/5 transition-all duration-200">
                <Archive className="h-3.5 w-3.5 inline mr-1" />{m.status === 'archived' ? 'Unarchive' : 'Arsipkan'}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => { onOpenChange(false); onEdit?.() }}
                className="h-9 px-3.5 rounded-xl text-xs font-bold border border-[var(--c-border)] dark:border-white/10 text-[var(--c-text-muted)] hover:text-[var(--c-text)] hover:border-[var(--c-text-muted)] dark:hover:border-white/20 dark:hover:bg-white/5 transition-all duration-200">
                <Pencil className="h-3.5 w-3.5 inline mr-1" />Edit
              </button>
              <Button type="button" variant="ghost" onClick={handleDelete}
                className="h-9 px-3.5 rounded-xl text-xs font-bold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 dark:hover:bg-rose-500/20">
                <Trash2 className="h-3.5 w-3.5 inline mr-1" />Hapus
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// ─── Related Module Card ───────────────────────────────────

function RelatedModuleCard({
  icon: CardIcon, name, description, sprint, color, accentColor,
}: {
  icon: React.ElementType; name: string; description: string; sprint: string; color: string; accentColor: string
}) {
  return (
    <div className="rounded-2xl bg-[var(--c-surface)] dark:bg-white/[0.04] border border-[var(--c-border)] dark:border-white/[0.08] p-4 transition-all duration-200 hover:shadow-[var(--shadow-elevated)] dark:hover:shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
      <div className="flex items-start gap-3">
        <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center shrink-0', accentColor)}>
          <CardIcon className={cn('h-5 w-5', color)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-[var(--c-text)]">{name}</h4>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-[var(--c-accent)]/10 dark:bg-[var(--c-accent)]/15 text-[var(--c-accent)]">{sprint}</span>
          </div>
          <p className="text-[11px] text-[var(--c-text-muted)] mt-1 leading-relaxed">{description}</p>
        </div>
        <Lock className="h-3.5 w-3.5 text-[var(--c-text-muted)]/40 shrink-0 mt-0.5" />
      </div>
    </div>
  )
}
