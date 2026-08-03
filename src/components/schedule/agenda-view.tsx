'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Plus, Clock, MapPin, CheckCircle2, Circle, Trash2, Pencil, Flame,
} from 'lucide-react'
import { useTodayEvents, useCreateEvent, useToggleEventComplete, useDeleteEvent, useUpdateEvent } from '@/lib/queries/schedule-queries'
import { EventFormDialog } from './event-form-dialog'
import {
  formatTime, formatEventDate, getTodayStr,
  getEventColor, getCategoryConfig, buildAgenda,
} from '@/lib/services/schedule.service'
import type { ScheduleEventRow } from '@/lib/types/schedule'

interface AgendaViewProps {
  onEventClick?: (event: ScheduleEventRow) => void
}

export function AgendaView({ onEventClick }: AgendaViewProps) {
  const today = getTodayStr()
  const { data: events, isLoading } = useTodayEvents()
  const toggleComplete = useToggleEventComplete()
  const deleteEvent = useDeleteEvent()
  const [formOpen, setFormOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<ScheduleEventRow | null>(null)

  const agenda = events ? buildAgenda(events, today) : []
  const allDayEvents = agenda.filter((a) => a.event.is_all_day)
  const timedEvents = agenda.filter((a) => !a.event.is_all_day)
  const completedCount = agenda.filter((a) => a.event.is_completed).length

  function handleEdit(ev: ScheduleEventRow) {
    setEditingEvent(ev)
    setFormOpen(true)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-[var(--c-text)]">{formatEventDate(today)}</h2>
          <p className="text-xs text-[var(--c-text-muted)] mt-0.5">
            {agenda.length === 0
              ? 'Tidak ada jadwal hari ini'
              : `${completedCount}/${agenda.length} selesai`
            }
          </p>
        </div>
        <button type="button" onClick={() => { setEditingEvent(null); setFormOpen(true) }}
          className="h-9 px-4 rounded-xl bg-[var(--c-accent)] text-white text-xs font-bold shadow-md shadow-[var(--c-accent)]/25 hover:brightness-110 active:scale-[0.97] transition-all flex items-center gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Event
        </button>
      </div>

      {/* Progress bar */}
      {agenda.length > 0 && (
        <div className="space-y-1.5">
          <div className="h-2 rounded-full bg-[var(--c-border)]/30 dark:bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-sky-500 transition-all duration-500"
              style={{ width: `${Math.round((completedCount / agenda.length) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-[var(--c-surface)] dark:bg-white/[0.04]" />
          ))}
        </div>
      ) : agenda.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-16 w-16 rounded-2xl bg-[var(--c-surface)] dark:bg-white/[0.04] border border-[var(--c-border)] dark:border-white/[0.08] flex items-center justify-center mb-4">
            <Clock className="h-7 w-7 text-[var(--c-text-muted)]/40 dark:text-white/20" />
          </div>
          <h3 className="text-base font-bold text-[var(--c-text)]">Hari ini kosong</h3>
          <p className="text-sm text-[var(--c-text-muted)] mt-1.5 max-w-xs leading-relaxed">
            Tidak ada jadwal untuk hari ini. Tambahkan event untuk mulai merencanakan harimu.
          </p>
          <button type="button" onClick={() => { setEditingEvent(null); setFormOpen(true) }}
            className="mt-5 h-10 px-5 rounded-xl bg-[var(--c-accent)] text-white text-sm font-bold shadow-lg shadow-[var(--c-accent)]/25 hover:brightness-110 active:scale-[0.97] transition-all flex items-center gap-2">
            <Plus className="h-4 w-4" /> Tambah Event
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* All-day events section */}
          {allDayEvents.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-[var(--c-text-muted)] uppercase tracking-widest flex items-center gap-2">
                <Clock className="h-3 w-3" /> Sepanjang Hari
              </h3>
              {allDayEvents.map((item) => (
                <EventCard
                  key={item.event.id}
                  item={item}
                  onToggle={() => toggleComplete.mutateAsync({ id: item.event.id, completed: !item.event.is_completed })}
                  onEdit={() => handleEdit(item.event)}
                  onDelete={() => deleteEvent.mutateAsync(item.event.id)}
                  onClick={() => onEventClick?.(item.event)}
                />
              ))}
            </div>
          )}

          {/* Timed events section */}
          {timedEvents.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-[var(--c-text-muted)] uppercase tracking-widest flex items-center gap-2">
                <Clock className="h-3 w-3" /> Jadwal
              </h3>
              {/* Now indicator */}
              {timedEvents.some((t) => t.isNow) && (
                <div className="flex items-center gap-2 px-1 py-1">
                  <div className="h-2 w-2 rounded-full bg-[var(--c-accent)] animate-pulse" />
                  <span className="text-[10px] font-bold text-[var(--c-accent)]">Sekarang</span>
                </div>
              )}
              {timedEvents.map((item) => (
                <EventCard
                  key={item.event.id}
                  item={item}
                  onToggle={() => toggleComplete.mutateAsync({ id: item.event.id, completed: !item.event.is_completed })}
                  onEdit={() => handleEdit(item.event)}
                  onDelete={() => deleteEvent.mutateAsync(item.event.id)}
                  onClick={() => onEventClick?.(item.event)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <EventFormDialog
        open={formOpen}
        onOpenChange={(v) => { setFormOpen(v); if (!v) setEditingEvent(null) }}
        event={editingEvent}
      />
    </div>
  )
}

// ─── Event Card ──────────────────────────────────────────

function EventCard({ item, onToggle, onEdit, onDelete, onClick }: {
  item: { event: ScheduleEventRow; timeLabel: string; isPast: boolean; isNow: boolean }
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
  onClick?: () => void
}) {
  const { event, timeLabel, isPast, isNow } = item
  const colorConf = getEventColor(event.color)
  const cat = getCategoryConfig(event.category)

  return (
    <div
      className={cn(
        'group rounded-xl border transition-all duration-200 overflow-hidden',
        'bg-[var(--c-card)] border-[var(--c-border)] dark:border-white/[0.08]',
        'hover:shadow-[var(--shadow-elevated)] dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)]',
        event.is_completed && 'opacity-60',
        isNow && 'ring-1 ring-[var(--c-accent)]/50 shadow-md shadow-[var(--c-accent)]/10',
      )}
    >
      <div className="flex items-start gap-3 p-3.5">
        {/* Color accent + checkbox */}
        <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
          <div className={cn('h-1 w-6 rounded-full', colorConf.bg.replace('/15', '/40').replace('/20', '/40'))} style={{ backgroundColor: event.color ? undefined : 'var(--c-accent)' }} />
          <button type="button" onClick={(e) => { e.stopPropagation(); onToggle() }} className="transition-transform hover:scale-110">
            {event.is_completed
              ? <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              : <Circle className={cn('h-5 w-5', isPast ? 'text-[var(--c-text-muted)]/40' : 'text-[var(--c-border)] dark:text-white/20')} />
            }
          </button>
        </div>

        {/* Content */}
        <button
          type="button"
          onClick={onClick}
          className={cn(
            'flex-1 text-left min-w-0',
            event.is_completed && 'line-through',
          )}
        >
          <div className="flex items-center gap-2">
            <p className={cn('text-sm font-bold truncate', event.is_completed ? 'text-[var(--c-text-muted)]' : 'text-[var(--c-text)]')}>
              {event.title}
            </p>
            {isNow && <Flame className="h-3.5 w-3.5 text-[var(--c-accent)] shrink-0" />}
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {timeLabel && !event.is_all_day && (
              <span className={cn(
                'flex items-center gap-1 text-[11px] tabular-nums font-medium',
                isPast && !event.is_completed ? 'text-rose-500 dark:text-rose-400' : 'text-[var(--c-text-muted)]',
              )}>
                <Clock className="h-3 w-3" />{timeLabel}
              </span>
            )}
            {event.location && (
              <span className="flex items-center gap-1 text-[10px] text-[var(--c-text-muted)]">
                <MapPin className="h-2.5 w-2.5" />{event.location}
              </span>
            )}
            <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-full dark:ring-1 dark:ring-white/5', cat.bg, cat.color)}>
              {cat.label}
            </span>
          </div>
          {event.description && (
            <p className="text-[11px] text-[var(--c-text-muted)]/70 mt-1.5 line-clamp-2 leading-relaxed">{event.description}</p>
          )}
        </button>

        {/* Actions */}
        <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button type="button" onClick={(e) => { e.stopPropagation(); onEdit() }} className="h-8 w-8 flex items-center justify-center rounded-lg text-[var(--c-text-muted)] hover:text-[var(--c-text)] hover:bg-[var(--c-surface)] dark:hover:bg-white/10 transition-all">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={(e) => { e.stopPropagation(); onDelete() }} className="h-8 w-8 flex items-center justify-center rounded-lg text-[var(--c-text-muted)] hover:text-rose-500 hover:bg-rose-500/10 dark:hover:bg-rose-500/20 transition-all">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
