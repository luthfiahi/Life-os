'use client'

import { useState } from 'react'
import {
  CheckCircle2, Circle, CircleDot, Plus, GripVertical, Trash2, Sparkles,
  CalendarDays, ChevronDown, ChevronRight, FileText, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import {
  useMilestones, useCreateMilestone, useUpdateMilestone, useDeleteMilestone,
} from '@/lib/queries/mission-queries'
import { Button } from '@/components/ui/button'
import { formatMissionDate, daysUntil } from '@/lib/services/mission.service'
import type { MilestoneRow, MilestoneStatus } from '@/lib/types/mission'

interface MilestonePanelProps {
  missionId: string
}

const STATUS_CYCLE: MilestoneStatus[] = ['pending', 'in_progress', 'completed']

const STATUS_CONFIG: Record<MilestoneStatus, { label: string; icon: React.ElementType; color: string; ring: string }> = {
  pending: {
    label: 'Pending',
    icon: Circle,
    color: 'text-[var(--c-text-muted)] dark:text-white/30',
    ring: 'hover:ring-2 hover:ring-amber-400/30',
  },
  in_progress: {
    label: 'In Progress',
    icon: CircleDot,
    color: 'text-amber-500 dark:text-amber-400',
    ring: 'ring-2 ring-amber-400/40',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle2,
    color: 'text-emerald-500 dark:text-emerald-400 drop-shadow-sm dark:drop-shadow-[0_0_6px_rgba(52,211,153,0.3)]',
    ring: '',
  },
}

export function MilestonePanel({ missionId }: MilestonePanelProps) {
  const { user } = useAuth()
  const { data: milestones, isLoading } = useMilestones(missionId)
  const createMilestone = useCreateMilestone()
  const updateMilestone = useUpdateMilestone()
  const deleteMilestone = useDeleteMilestone()

  const [newTitle, setNewTitle] = useState('')
  const [newDueDate, setNewDueDate] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editingDueDateId, setEditingDueDateId] = useState<string | null>(null)
  const [editDueDate, setEditDueDate] = useState('')
  const [editingDescId, setEditingDescId] = useState<string | null>(null)
  const [editDesc, setEditDesc] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const completedCount = milestones?.filter((m) => m.status === 'completed').length ?? 0
  const inProgressCount = milestones?.filter((m) => m.status === 'in_progress').length ?? 0
  const totalCount = milestones?.length ?? 0
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  async function handleAdd() {
    if (!user?.id || !newTitle.trim()) return
    try {
      const maxSort = milestones && milestones.length > 0
        ? Math.max(...milestones.map((m) => m.sort_order)) + 1
        : 0
      await createMilestone.mutateAsync({
        user_id: user.id, mission_id: missionId,
        title: newTitle.trim(), sort_order: maxSort,
        due_date: newDueDate || null,
      })
      setNewTitle('')
      setNewDueDate('')
      setIsAdding(false)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal menambah milestone')
    }
  }

  function handleCycleStatus(milestone: MilestoneRow) {
    if (!user?.id) return
    const currentIdx = STATUS_CYCLE.indexOf(milestone.status)
    const nextStatus = STATUS_CYCLE[(currentIdx + 1) % STATUS_CYCLE.length]
    updateMilestone.mutateAsync({
      id: milestone.id,
      payload: {
        status: nextStatus,
        completed_at: nextStatus === 'completed' ? new Date().toISOString() : null,
      },
    })
  }

  async function handleDelete(id: string) {
    await deleteMilestone.mutateAsync(id)
    if (expandedId === id) setExpandedId(null)
  }

  async function handleEditSave(id: string) {
    if (!editTitle.trim()) return
    await updateMilestone.mutateAsync({ id, payload: { title: editTitle.trim() } })
    setEditingId(null)
    setEditTitle('')
  }

  async function handleDueDateSave(id: string) {
    await updateMilestone.mutateAsync({ id, payload: { due_date: editDueDate || null } })
    setEditingDueDateId(null)
    setEditDueDate('')
  }

  async function handleDescSave(id: string) {
    await updateMilestone.mutateAsync({ id, payload: { description: editDesc.trim() || null } })
    setEditingDescId(null)
    setEditDesc('')
  }

  function getMilestoneDueInfo(ms: MilestoneRow) {
    if (!ms.due_date) return null
    if (ms.status === 'completed') return { text: formatMissionDate(ms.due_date), urgent: false }
    const days = daysUntil(ms.due_date)
    if (days === null) return null
    if (days < 0) return { text: `${Math.abs(days)}h lalu`, urgent: true }
    if (days === 0) return { text: 'Hari ini', urgent: true }
    if (days === 1) return { text: 'Besok', urgent: true }
    if (days <= 3) return { text: `${days}h lagi`, urgent: true }
    return { text: `${days}h lagi`, urgent: false }
  }

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 rounded-xl bg-[var(--c-surface)] dark:bg-white/[0.04] animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Progress summary — 3-state breakdown */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-[var(--c-text-muted)]">
            {completedCount}<span className="opacity-50">/{totalCount}</span> selesai
          </span>
          {inProgressCount > 0 && (
            <span className="flex items-center gap-1 text-amber-500 dark:text-amber-400 font-medium">
              <CircleDot className="h-3 w-3" />{inProgressCount} aktif
            </span>
          )}
        </div>
        <span className="font-bold text-[var(--c-text)] tabular-nums">{progressPercent}%</span>
      </div>
      <div className="h-2 rounded-full bg-[var(--c-border)]/30 dark:bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 via-violet-500 to-violet-500 dark:from-blue-400 dark:via-violet-400 dark:to-violet-400 transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Milestone list */}
      <div className="space-y-1 mt-4">
        {milestones && milestones.map((ms) => {
          const config = STATUS_CONFIG[ms.status]
          const StatusIcon = config.icon
          const dueInfo = getMilestoneDueInfo(ms)
          const isExpanded = expandedId === ms.id
          const hasDesc = !!ms.description

          return (
            <div
              key={ms.id}
              className={cn(
                'group rounded-xl transition-all duration-150',
                'bg-[var(--c-surface)]/50 dark:bg-white/[0.02] hover:bg-[var(--c-surface)] dark:hover:bg-white/[0.04]',
              )}
            >
              {/* Main row */}
              <div className="flex items-center gap-2.5 px-3 py-2.5">
                <GripVertical className="h-3.5 w-3.5 text-[var(--c-text-muted)]/20 dark:text-white/5 shrink-0 cursor-grab" />

                <button
                  type="button"
                  onClick={() => handleCycleStatus(ms)}
                  className={cn('shrink-0 transition-all duration-200 hover:scale-110', config.ring, 'rounded-full')}
                  title={config.label}
                >
                  <StatusIcon className={cn('h-5 w-5', config.color)} />
                </button>

                {editingId === ms.id ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleEditSave(ms.id); if (e.key === 'Escape') setEditingId(null) }}
                    onBlur={() => handleEditSave(ms.id)}
                    autoFocus
                    className="flex-1 h-8 rounded-lg border border-[var(--c-border)] dark:border-white/10 bg-[var(--c-card)] dark:bg-white/[0.06] px-2 text-sm outline-none focus:ring-2 focus:ring-[var(--c-accent)]/30 dark:shadow-[0_1px_4px_rgba(0,0,0,0.2)]"
                    style={{ color: 'var(--c-text)' }}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => { setEditingId(ms.id); setEditTitle(ms.title) }}
                    className={cn(
                      'flex-1 text-left text-sm transition-colors min-w-0',
                      ms.status === 'completed'
                        ? 'line-through text-[var(--c-text-muted)]/70'
                        : ms.status === 'in_progress'
                          ? 'text-[var(--c-text)] font-semibold'
                          : 'text-[var(--c-text)] font-medium',
                    )}
                  >
                    <span className="truncate block">{ms.title}</span>
                  </button>
                )}

                {/* Due date badge */}
                {editingDueDateId === ms.id ? (
                  <div className="flex items-center gap-1 shrink-0">
                    <input
                      type="date"
                      value={editDueDate}
                      onChange={(e) => setEditDueDate(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleDueDateSave(ms.id); if (e.key === 'Escape') setEditingDueDateId(null) }}
                      onBlur={() => handleDueDateSave(ms.id)}
                      autoFocus
                      className="h-7 rounded-lg border border-[var(--c-border)] dark:border-white/10 bg-[var(--c-card)] dark:bg-white/[0.06] px-1.5 text-[10px] outline-none focus:ring-2 focus:ring-[var(--c-accent)]/30"
                      style={{ color: 'var(--c-text)' }}
                    />
                  </div>
                ) : dueInfo ? (
                  <button
                    type="button"
                    onClick={() => { setEditingDueDateId(ms.id); setEditDueDate(ms.due_date ?? '') }}
                    className={cn(
                      'flex items-center gap-1 shrink-0 text-[10px] font-medium tabular-nums px-1.5 py-0.5 rounded-md transition-colors hover:bg-[var(--c-border)]/30 dark:hover:bg-white/5',
                      dueInfo.urgent
                        ? 'text-rose-500 dark:text-rose-400'
                        : 'text-[var(--c-text-muted)]',
                    )}
                  >
                    <CalendarDays className="h-2.5 w-2.5" />
                    {dueInfo.text}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setEditingDueDateId(ms.id); setEditDueDate('') }}
                    className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Tambah deadline"
                  >
                    <CalendarDays className="h-3 w-3 text-[var(--c-text-muted)]/40 hover:text-[var(--c-text-muted)]" />
                  </button>
                )}

                {/* Expand toggle (show if has description or for adding notes) */}
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : ms.id)}
                  className={cn(
                    'shrink-0 transition-all duration-200',
                    hasDesc ? 'text-[var(--c-text-muted)]' : 'text-[var(--c-text-muted)]/30 opacity-0 group-hover:opacity-100',
                  )}
                >
                  {isExpanded
                    ? <ChevronDown className="h-3.5 w-3.5" />
                    : <ChevronRight className="h-3.5 w-3.5" />
                  }
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(ms.id)}
                  className="opacity-0 group-hover:opacity-100 h-7 w-7 flex items-center justify-center rounded-lg text-[var(--c-text-muted)] hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/10 dark:hover:bg-rose-500/20 transition-all shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Expanded section — description + notes */}
              {isExpanded && (
                <div className="px-3 pb-3 pl-[52px]">
                  <div className="rounded-lg border border-[var(--c-border)]/50 dark:border-white/[0.06] bg-[var(--c-card)]/50 dark:bg-white/[0.02] p-3 space-y-2">
                    {editingDescId === ms.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editDesc}
                          onChange={(e) => setEditDesc(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Escape') { setEditingDescId(null); setEditDesc('') } }}
                          placeholder="Tambahkan catatan untuk milestone ini..."
                          rows={2}
                          autoFocus
                          className="w-full min-h-[60px] rounded-lg border border-[var(--c-border)] dark:border-white/10 bg-[var(--c-card)] dark:bg-white/[0.06] px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[var(--c-accent)]/30 resize-none"
                          style={{ color: 'var(--c-text)' }}
                        />
                        <div className="flex justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => { setEditingDescId(null); setEditDesc('') }}
                            className="h-6 px-2 rounded-md text-[10px] font-medium text-[var(--c-text-muted)] hover:bg-[var(--c-surface)] dark:hover:bg-white/5 transition-colors"
                          >Batal</button>
                          <button
                            type="button"
                            onClick={() => handleDescSave(ms.id)}
                            className="h-6 px-2.5 rounded-md text-[10px] font-bold bg-[var(--c-accent)] text-white hover:brightness-110 transition-all"
                          >Simpan</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {ms.description ? (
                          <p className="text-xs text-[var(--c-text-muted)] leading-relaxed whitespace-pre-wrap">{ms.description}</p>
                        ) : (
                          <p className="text-xs text-[var(--c-text-muted)]/40 italic">Belum ada catatan.</p>
                        )}
                        <button
                          type="button"
                          onClick={() => { setEditingDescId(ms.id); setEditDesc(ms.description ?? '') }}
                          className="flex items-center gap-1 text-[10px] font-medium text-[var(--c-accent)] hover:text-[var(--c-accent)]/80 transition-colors"
                        >
                          <FileText className="h-3 w-3" />
                          {ms.description ? 'Edit catatan' : 'Tambah catatan'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {totalCount === 0 && !isAdding && (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="h-12 w-12 rounded-2xl bg-[var(--c-surface)] dark:bg-white/[0.04] border border-[var(--c-border)] dark:border-white/[0.08] flex items-center justify-center mb-3">
              <Sparkles className="h-5 w-5 text-[var(--c-text-muted)]/50 dark:text-white/20" />
            </div>
            <p className="text-sm text-[var(--c-text-muted)]">
              Belum ada milestone. Pecah mission ini menjadi langkah-langkah kecil!
            </p>
          </div>
        )}
      </div>

      {/* Add milestone — expanded form with optional due date */}
      {isAdding ? (
        <div className="space-y-2.5 mt-2 rounded-xl border-2 border-dashed border-[var(--c-accent)]/30 dark:border-[var(--c-accent)]/20 p-3 bg-[var(--c-accent)]/3 dark:bg-[var(--c-accent)]/5">
          <input
            type="text"
            placeholder="Nama milestone..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setIsAdding(false) }}
            autoFocus
            className="w-full h-10 rounded-xl border border-[var(--c-border)] dark:border-white/10 bg-[var(--c-card)] dark:bg-white/[0.06] px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--c-accent)]/30 dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
            style={{ color: 'var(--c-text)' }}
          />
          <div className="flex items-center gap-2">
            <CalendarDays className="h-3.5 w-3.5 text-[var(--c-text-muted)] shrink-0" />
            <input
              type="date"
              placeholder="Deadline (opsional)"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              className="flex-1 h-9 rounded-lg border border-[var(--c-border)] dark:border-white/10 bg-[var(--c-card)] dark:bg-white/[0.06] px-2.5 text-xs outline-none focus:ring-2 focus:ring-[var(--c-accent)]/30"
              style={{ color: 'var(--c-text)' }}
            />
          </div>
          <div className="flex items-center justify-end gap-2">
            <button type="button" onClick={() => { setIsAdding(false); setNewTitle(''); setNewDueDate('') }}
              className="h-9 px-3 rounded-xl text-xs font-medium border border-[var(--c-border)] dark:border-white/10 text-[var(--c-text-muted)] hover:bg-[var(--c-surface)] dark:hover:bg-white/5 transition-colors"
            >Batal</button>
            <Button type="button" size="sm" variant="primary" onClick={handleAdd} loading={createMilestone.isPending} className="rounded-xl h-9 px-4 shadow-sm shadow-blue-500/20 dark:shadow-blue-500/10">
              Tambah
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--c-border)] dark:border-white/10 py-2.5 text-xs font-semibold text-[var(--c-text-muted)] hover:border-[var(--c-accent)] dark:hover:border-[var(--c-accent)]/50 hover:text-[var(--c-accent)] dark:hover:bg-[var(--c-accent)]/5 transition-all duration-200 mt-2"
        >
          <Plus className="h-3.5 w-3.5" />
          Tambah Milestone
        </button>
      )}
    </div>
  )
}
