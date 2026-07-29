'use client'

import { useState } from 'react'
import { CheckCircle2, Circle, Plus, GripVertical, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import {
  useMilestones, useCreateMilestone, useUpdateMilestone, useDeleteMilestone,
} from '@/lib/queries/mission-queries'
import { Button } from '@/components/ui/button'
import type { MilestoneRow, MilestoneStatus } from '@/lib/types/mission'

interface MilestonePanelProps {
  missionId: string
}

export function MilestonePanel({ missionId }: MilestonePanelProps) {
  const { user } = useAuth()
  const { data: milestones, isLoading } = useMilestones(missionId)
  const createMilestone = useCreateMilestone()
  const updateMilestone = useUpdateMilestone()
  const deleteMilestone = useDeleteMilestone()
  const [newTitle, setNewTitle] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')

  const completedCount = milestones?.filter((m) => m.status === 'completed').length ?? 0
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
      })
      setNewTitle('')
      setIsAdding(false)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal menambah milestone')
    }
  }

  async function handleToggleStatus(milestone: MilestoneRow) {
    if (!user?.id) return
    const newStatus: MilestoneStatus = milestone.status === 'completed' ? 'pending' : 'completed'
    await updateMilestone.mutateAsync({
      id: milestone.id,
      payload: {
        status: newStatus,
        completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
      },
    })
  }

  async function handleDelete(id: string) {
    await deleteMilestone.mutateAsync(id)
  }

  async function handleEditSave(id: string) {
    if (!editTitle.trim()) return
    await updateMilestone.mutateAsync({ id, payload: { title: editTitle.trim() } })
    setEditingId(null)
    setEditTitle('')
  }

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 rounded-lg bg-[var(--c-surface)] animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Progress summary */}
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-[var(--c-text-muted)]">
          {completedCount} / {totalCount} milestone
        </span>
        <span className="font-bold text-[var(--c-text)]">{progressPercent}%</span>
      </div>
      <div className="h-2 rounded-full bg-[var(--c-border)]/30 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Milestone list */}
      <div className="space-y-1.5 mt-4">
        {milestones && milestones.map((ms) => (
          <div
            key={ms.id}
            className={cn(
              'group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-150',
              'hover:bg-[var(--c-surface)]',
            )}
          >
            <GripVertical className="h-3.5 w-3.5 text-[var(--c-text-muted)]/40 shrink-0" />

            <button type="button" onClick={() => handleToggleStatus(ms)} className="shrink-0">
              {ms.status === 'completed' ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              ) : (
                <Circle className="h-5 w-5 text-[var(--c-border)]" />
              )}
            </button>

            {editingId === ms.id ? (
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleEditSave(ms.id); if (e.key === 'Escape') setEditingId(null) }}
                onBlur={() => handleEditSave(ms.id)}
                autoFocus
                className="flex-1 h-8 rounded-lg border border-[var(--c-border)] bg-white dark:bg-[#2e333b] px-2 text-sm outline-none focus:ring-2 focus:ring-[var(--c-accent)]/30"
                style={{ color: 'var(--c-text)' }}
              />
            ) : (
              <button
                type="button"
                onClick={() => { setEditingId(ms.id); setEditTitle(ms.title) }}
                className={cn(
                  'flex-1 text-left text-sm transition-colors',
                  ms.status === 'completed'
                    ? 'line-through text-[var(--c-text-muted)]'
                    : 'text-[var(--c-text)] font-medium',
                )}
              >
                {ms.title}
              </button>
            )}

            <button
              type="button"
              onClick={() => handleDelete(ms.id)}
              className="opacity-0 group-hover:opacity-100 h-7 w-7 flex items-center justify-center rounded-lg text-[var(--c-text-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition-all shrink-0"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        {totalCount === 0 && !isAdding && (
          <p className="text-center text-sm text-[var(--c-text-muted)] py-6">
            Belum ada milestone. Tambahkan yang pertama!
          </p>
        )}
      </div>

      {/* Add milestone */}
      {isAdding ? (
        <div className="flex items-center gap-2 mt-2">
          <input
            type="text"
            placeholder="Nama milestone..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setIsAdding(false) }}
            autoFocus
            className="flex-1 h-10 rounded-xl border border-[var(--c-border)] bg-white dark:bg-[#2e333b] px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--c-accent)]/30"
            style={{ color: 'var(--c-text)' }}
          />
          <Button type="button" size="sm" variant="primary" onClick={handleAdd} loading={createMilestone.isPending} className="rounded-xl h-10 px-4">
            Tambah
          </Button>
          <button type="button" onClick={() => { setIsAdding(false); setNewTitle('') }}
            className="h-10 w-10 flex items-center justify-center rounded-xl border border-[var(--c-border)] hover:bg-[var(--c-surface)] transition-colors">
            <span className="text-[var(--c-text-muted)] text-sm">✕</span>
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--c-border)] py-2.5 text-xs font-semibold text-[var(--c-text-muted)] hover:border-[var(--c-accent)] hover:text-[var(--c-accent)] transition-all duration-200 mt-2"
        >
          <Plus className="h-3.5 w-3.5" />
          Tambah Milestone
        </button>
      )}
    </div>
  )
}
