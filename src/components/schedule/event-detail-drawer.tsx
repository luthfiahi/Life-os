'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  CalendarDays, Clock, MapPin, Tag, Repeat, CheckCircle2, Circle,
  Pencil, Trash2, Link2, X,
} from 'lucide-react'
import { useToggleEventComplete, useDeleteEvent } from '@/lib/queries/schedule-queries'
import {
  formatTime, formatEventDate, isToday, getEventColor, getCategoryConfig,
  isTimePast, isTimeNow,
} from '@/lib/services/schedule.service'
import type { ScheduleEventRow } from '@/lib/types/schedule'

interface EventDetailDrawerProps {
  event: ScheduleEventRow | null
  open: boolean
  onClose: () => void
  onEdit: (event: ScheduleEventRow) => void
}

const REPEAT_LABELS: Record<string, string> = {
  daily: 'Setiap hari',
  weekday: 'Hari kerja (Sen-Jum)',
  weekly: 'Setiap minggu',
  monthly: 'Setiap bulan',
}

export function EventDetailDrawer({ event, open, onClose, onEdit }: EventDetailDrawerProps) {
  const toggleComplete = useToggleEventComplete()
  const deleteEvent = useDeleteEvent()
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (!event || !open) return null

  // Capture in local const for use in closures (TS narrowing)
  const ev = event

  function handleToggleComplete() {
    toggleComplete.mutateAsync({ id: ev.id, completed: !ev.is_completed })
  }

  function handleDelete() {
    if (confirmDelete) {
      deleteEvent.mutateAsync(ev.id)
      setConfirmDelete(false)
      onClose()
    } else {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
    }
  }

  const colorConf = getEventColor(ev.color)
  const cat = getCategoryConfig(ev.category)
  const isPast = isToday(ev.event_date) && ev.start_time && isTimePast(ev.start_time) && !ev.is_completed
  const isNow = isToday(ev.event_date) && isTimeNow(ev.start_time, ev.end_time) && !ev.is_all_day

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/30 dark:bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className={cn(
        'fixed top-0 right-0 z-50 h-full w-full sm:w-[400px] bg-[var(--c-card)] border-l border-[var(--c-border)] dark:border-white/[0.08]',
        'shadow-2xl dark:shadow-[-8px_0_40px_rgba(0,0,0,0.4)]',
        'flex flex-col animate-slide-in-right',
      )}>
        {/* Header */}
        <div className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-[var(--c-border)] dark:border-white/[0.08] relative overflow-hidden">
          <div className="absolute -top-10 -right-10 h-28 w-28 rounded-full blur-2xl opacity-30 dark:opacity-20 pointer-events-none bg-blue-500/30" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center shadow-lg',
                ev.is_completed
                  ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/20'
                  : 'bg-gradient-to-br from-blue-500 to-sky-600 shadow-blue-500/20'
              )}>
                {ev.is_completed
                  ? <CheckCircle2 className="h-5 w-5 text-white" />
                  : <CalendarDays className="h-5 w-5 text-white" />
                }
              </div>
              <div className="min-w-0">
                <h2 className={cn('text-base font-extrabold text-[var(--c-text)] truncate',
                  ev.is_completed && 'line-through text-[var(--c-text-muted)]'
                )}>
                  {ev.title}
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-full', cat.bg, cat.color)}>
                    {cat.label}
                  </span>
                  {isNow && (
                    <span className="text-[10px] font-bold text-[var(--c-accent)] flex items-center gap-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--c-accent)] animate-pulse" />
                      Sedang berlangsung
                    </span>
                  )}
                  {isPast && !ev.is_completed && (
                    <span className="text-[10px] font-bold text-rose-500">Sudah lewat</span>
                  )}
                </div>
              </div>
            </div>
            <button type="button" onClick={onClose}
              className="h-8 w-8 flex items-center justify-center rounded-xl text-[var(--c-text-muted)] hover:text-[var(--c-text)] hover:bg-[var(--c-surface)] dark:hover:bg-white/10 transition-all">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 py-5 space-y-5">
          {/* Status Toggle */}
          <button type="button" onClick={handleToggleComplete}
            className={cn(
              'w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200',
              ev.is_completed
                ? 'border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/10'
                : 'border-[var(--c-border)] dark:border-white/[0.08] hover:border-[var(--c-accent)]/30 hover:bg-[var(--c-accent)]/5 dark:hover:bg-[var(--c-accent)]/10',
            )}>
            {ev.is_completed
              ? <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              : <Circle className="h-5 w-5 text-[var(--c-text-muted)]" />
            }
            <div className="text-left">
              <p className={cn('text-sm font-bold', ev.is_completed ? 'text-emerald-600 dark:text-emerald-400' : 'text-[var(--c-text)]')}>
                {ev.is_completed ? 'Sudah Selesai' : 'Belum Selesai'}
              </p>
              <p className="text-[11px] text-[var(--c-text-muted)]">
                {ev.is_completed ? 'Klik untuk tandai belum selesai' : 'Klik untuk tandai selesai'}
              </p>
            </div>
          </button>

          {/* Time */}
          <div className="space-y-3">
            <DetailRow icon={CalendarDays} label="Tanggal" value={formatEventDate(ev.event_date)} />
            {!ev.is_all_day && (
              <DetailRow
                icon={Clock}
                label="Waktu"
                value={ev.start_time
                  ? ev.end_time
                    ? `${formatTime(ev.start_time)} - ${formatTime(ev.end_time)}`
                    : formatTime(ev.start_time)
                  : 'Tidak ditentukan'
                }
              />
            )}
            {ev.is_all_day && (
              <DetailRow icon={Clock} label="Durasi" value="Sepanjang hari" />
            )}
            {ev.location && (
              <DetailRow icon={MapPin} label="Lokasi" value={ev.location} />
            )}
            <DetailRow icon={Tag} label="Kategori" value={cat.label} />
            {ev.repeat_type && (
              <DetailRow icon={Repeat} label="Pengulangan" value={REPEAT_LABELS[ev.repeat_type] ?? ev.repeat_type} />
            )}
            {ev.mission_id && (
              <DetailRow icon={Link2} label="Mission" value="Terkait dengan mission" />
            )}
          </div>

          {/* Description */}
          {ev.description && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-[var(--c-text-muted)] uppercase tracking-widest">Deskripsi</h3>
              <div className="rounded-xl bg-[var(--c-surface)] dark:bg-white/[0.04] border border-[var(--c-border)] dark:border-white/[0.06] p-3">
                <p className="text-sm text-[var(--c-text)] leading-relaxed whitespace-pre-wrap">{ev.description}</p>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-[var(--c-text-muted)] uppercase tracking-widest">Detail</h3>
            <div className="rounded-xl bg-[var(--c-surface)] dark:bg-white/[0.04] border border-[var(--c-border)] dark:border-white/[0.06] divide-y divide-[var(--c-border)]/40 dark:divide-white/[0.04]">
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-[11px] text-[var(--c-text-muted)]">Dibuat</span>
                <span className="text-[11px] font-medium text-[var(--c-text)] tabular-nums">
                  {new Date(ev.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-[11px] text-[var(--c-text-muted)]">Diubah</span>
                <span className="text-[11px] font-medium text-[var(--c-text)] tabular-nums">
                  {new Date(ev.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex-shrink-0 border-t border-[var(--c-border)] dark:border-white/[0.08] px-6 py-4 bg-[var(--c-card)] dark:bg-[var(--c-card)]/80 dark:backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => onEdit(ev)}
              className="flex-1 h-11 rounded-xl border-2 border-[var(--c-border)] dark:border-white/10 text-[var(--c-text)] text-sm font-bold flex items-center justify-center gap-2 hover:bg-[var(--c-surface)] dark:hover:bg-white/5 transition-all">
              <Pencil className="h-4 w-4" /> Edit
            </button>
            <button type="button" onClick={handleDelete}
              className={cn(
                'flex-1 h-11 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all',
                confirmDelete
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25'
                  : 'border-2 border-rose-500/30 text-rose-500 hover:bg-rose-500/10 dark:hover:bg-rose-500/20',
              )}>
              <Trash2 className="h-4 w-4" />
              {confirmDelete ? 'Konfirmasi Hapus' : 'Hapus'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Detail Row ─────────────────────────────────────────

function DetailRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-8 w-8 rounded-lg bg-[var(--c-surface)] dark:bg-white/[0.04] flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-[var(--c-text-muted)]" />
      </div>
      <div>
        <p className="text-[10px] text-[var(--c-text-muted)]">{label}</p>
        <p className="text-sm font-semibold text-[var(--c-text)]">{value}</p>
      </div>
    </div>
  )
}
