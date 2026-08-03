'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import {
  ChevronLeft, ChevronRight, Plus, Clock, MapPin, CheckCircle2, Circle,
  Pencil, Trash2, Zap, Coffee, AlertTriangle,
} from 'lucide-react'
import { useDayTimeline, useToggleEventComplete, useDeleteEvent } from '@/lib/queries/schedule-queries'
import { EventFormDialog } from './event-form-dialog'
import {
  formatTime, formatEventDate, getTodayStr, isToday, getEventColor,
  getCategoryConfig, HOUR_HEIGHT, DAY_START, DAY_END,
} from '@/lib/services/schedule.service'
import type { ScheduleEventRow } from '@/lib/types/schedule'
import type { TimeBlock } from '@/lib/services/schedule.service'

const HOURS = Array.from({ length: 18 }, (_, i) => i + 5) // 05:00 - 22:00

interface DayViewProps {
  date?: string
  onDateChange?: (date: string) => void
  onEventClick?: (event: ScheduleEventRow) => void
}

export function DayView({ date: propDate, onDateChange, onEventClick }: DayViewProps) {
  const [selectedDate, setSelectedDate] = useState(propDate ?? getTodayStr())
  const [formOpen, setFormOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<ScheduleEventRow | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const date = propDate ?? selectedDate
  const { data: timeline, isLoading } = useDayTimeline(date)
  const toggleComplete = useToggleEventComplete()
  const deleteEvent = useDeleteEvent()

  // Auto-scroll to current time on mount and date change
  useEffect(() => {
    if (isToday(date) && scrollRef.current) {
      const now = new Date()
      const scrollTarget = ((now.getHours() - 5) * 60 + now.getMinutes()) / 60 * HOUR_HEIGHT - 100
      scrollRef.current.scrollTop = Math.max(0, scrollTarget)
    }
  }, [date])

  function goBack() {
    const d = new Date(date + 'T00:00:00')
    d.setDate(d.getDate() - 1)
    const newDate = d.toISOString().split('T')[0]
    setSelectedDate(newDate)
    onDateChange?.(newDate)
  }

  function goForward() {
    const d = new Date(date + 'T00:00:00')
    d.setDate(d.getDate() + 1)
    const newDate = d.toISOString().split('T')[0]
    setSelectedDate(newDate)
    onDateChange?.(newDate)
  }

  function goToToday() {
    setSelectedDate(getTodayStr())
    onDateChange?.(getTodayStr())
  }

  function handleEdit(ev: ScheduleEventRow) {
    setEditingEvent(ev)
    setFormOpen(true)
  }

  function handleDelete(id: string) {
    if (deleteConfirm === id) {
      deleteEvent.mutateAsync(id)
      setDeleteConfirm(null)
    } else {
      setDeleteConfirm(id)
      setTimeout(() => setDeleteConfirm(null), 3000)
    }
  }

  const allDayEvents = (timeline?.events ?? []).filter((e) => e.is_all_day)
  const nowMin = new Date().getHours() * 60 + new Date().getMinutes()
  const nowTop = isToday(date) ? `${((nowMin - DAY_START) / 60) * HOUR_HEIGHT}px` : null

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 rounded-xl bg-[var(--c-surface)] dark:bg-white/[0.04]" />
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-[var(--c-surface)] dark:bg-white/[0.04]" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Day Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button type="button" onClick={goBack}
            className="h-9 w-9 flex items-center justify-center rounded-xl border border-[var(--c-border)] dark:border-white/10 hover:bg-[var(--c-surface)] dark:hover:bg-white/5 transition-colors">
            <ChevronLeft className="h-4 w-4 text-[var(--c-text)]" />
          </button>
          <button type="button" onClick={goToToday}
            className="h-9 px-4 rounded-xl text-xs font-bold border border-[var(--c-border)] dark:border-white/10 text-[var(--c-text-muted)] hover:text-[var(--c-text)] hover:bg-[var(--c-surface)] dark:hover:bg-white/5 transition-colors">
            Hari ini
          </button>
          <button type="button" onClick={goForward}
            className="h-9 w-9 flex items-center justify-center rounded-xl border border-[var(--c-border)] dark:border-white/10 hover:bg-[var(--c-surface)] dark:hover:bg-white/5 transition-colors">
            <ChevronRight className="h-4 w-4 text-[var(--c-text)]" />
          </button>
          <div className="ml-2">
            <h2 className="text-sm font-bold text-[var(--c-text)]">{formatEventDate(date)}</h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Utilization Badge */}
          {timeline && timeline.utilizationPercent > 0 && (
            <div className={cn(
              'h-8 px-3 rounded-xl text-[11px] font-bold flex items-center gap-1.5 border',
              timeline.utilizationPercent > 80
                ? 'border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                : timeline.utilizationPercent > 50
                  ? 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
            )}>
              <Zap className="h-3 w-3" />
              {timeline.utilizationPercent}% terisi
            </div>
          )}
          <button type="button" onClick={() => { setEditingEvent(null); setFormOpen(true) }}
            className="h-9 px-4 rounded-xl bg-[var(--c-accent)] text-white text-xs font-bold shadow-md shadow-[var(--c-accent)]/25 hover:brightness-110 active:scale-[0.97] transition-all flex items-center gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Event
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
        {/* Main Timeline */}
        <div className="rounded-2xl border border-[var(--c-border)] dark:border-white/[0.08] bg-[var(--c-card)] overflow-hidden dark:shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
          {/* All-day events strip */}
          {allDayEvents.length > 0 && (
            <div className="border-b border-[var(--c-border)] dark:border-white/[0.08] px-4 py-2 space-y-1 bg-[var(--c-surface)]/50 dark:bg-white/[0.02]">
              <p className="text-[10px] font-bold text-[var(--c-text-muted)] uppercase tracking-widest mb-1.5">Sepanjang Hari</p>
              <div className="flex flex-wrap gap-1.5">
                {allDayEvents.map((ev) => {
                  const cat = getCategoryConfig(ev.category)
                  return (
                    <div key={ev.id} className={cn(
                      'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer hover:scale-[1.02]',
                      cat.bg, cat.color, 'border-transparent',
                      ev.is_completed && 'line-through opacity-50',
                    )} onClick={() => onEventClick?.(ev)}>
                      <span className={cn('h-1.5 w-1.5 rounded-full', cat.dot)} />
                      {ev.title}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Hour Grid */}
          <div ref={scrollRef} className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 340px)', minHeight: '400px' }}>
            <div className="relative">
              {HOURS.map((hour) => {
                const hourMin = hour * 60
                const isNowHour = isToday(date) && nowMin >= hourMin && nowMin < hourMin + 60
                return (
                  <div key={hour} className={cn('relative flex border-b border-[var(--c-border)]/40 dark:border-white/[0.03]',
                    isNowHour && 'border-b-0'
                  )}>
                    {/* Time label */}
                    <div className="w-16 shrink-0 pr-2 pt-0 text-right">
                      <span className="text-[10px] tabular-nums font-medium text-[var(--c-text-muted)]/60">
                        {hour.toString().padStart(2, '0')}:00
                      </span>
                    </div>
                    {/* Hour slot */}
                    <div className="flex-1 relative h-[72px]">
                      {/* Free slot indicator (clickable) */}
                      <button
                        type="button"
                        onClick={() => {
                          const h = hour.toString().padStart(2, '0')
                          setEditingEvent(null)
                          setFormOpen(true)
                        }}
                        className="absolute inset-0 hover:bg-[var(--c-accent)]/[0.03] dark:hover:bg-[var(--c-accent)]/[0.05] transition-colors"
                      />
                    </div>
                  </div>
                )
              })}

              {/* Positioned Time Blocks */}
              <div className="absolute inset-0 pointer-events-none" style={{ paddingLeft: '64px' }}>
                {timeline?.blocks.map((block) => {
                  const { event } = block
                  const colorConf = getEventColor(event.color)
                  const cat = getCategoryConfig(event.category)
                  return (
                    <div
                      key={event.id}
                      className={cn(
                        'absolute left-1 right-1 rounded-xl overflow-hidden pointer-events-auto transition-all duration-200 group/block',
                        'border border-[var(--c-border)]/40 dark:border-white/[0.06]',
                        colorConf.bg,
                        event.is_completed && 'opacity-50',
                        block.isPast && !event.is_completed && 'opacity-60',
                        block.isNow && 'ring-2 ring-[var(--c-accent)]/50 shadow-lg shadow-[var(--c-accent)]/10',
                      )}
                      style={{ top: block.top, height: block.height }}
                      onClick={() => onEventClick?.(event)}
                    >
                      <div className="flex items-start gap-1 p-1.5 h-full">
                        <div className={cn('w-1 rounded-full shrink-0 self-stretch', cat.dot)} />
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            'text-[11px] font-bold truncate leading-tight',
                            event.is_completed ? 'line-through text-[var(--c-text-muted)]' : 'text-[var(--c-text)]',
                          )}>
                            {event.title}
                          </p>
                          {block.height !== '20px' && (
                            <p className="text-[9px] text-[var(--c-text-muted)] tabular-nums mt-0.5">
                              {formatTime(event.start_time)}{event.end_time ? ` - ${formatTime(event.end_time)}` : ''}
                            </p>
                          )}
                          {event.location && parseFloat(block.height) > 50 && (
                            <p className="text-[9px] text-[var(--c-text-muted)]/70 mt-0.5 flex items-center gap-0.5 truncate">
                              <MapPin className="h-2 w-2" />{event.location}
                            </p>
                          )}
                        </div>
                        {/* Block actions */}
                        <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover/block:opacity-100 transition-opacity">
                          <button type="button" onClick={(e) => { e.stopPropagation(); toggleComplete.mutateAsync({ id: event.id, completed: !event.is_completed }) }}
                            className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors">
                            {event.is_completed
                              ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                              : <Circle className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />
                            }
                          </button>
                          <button type="button" onClick={(e) => { e.stopPropagation(); handleEdit(event) }}
                            className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors">
                            <Pencil className="h-3 w-3 text-[var(--c-text-muted)]" />
                          </button>
                          <button type="button" onClick={(e) => { e.stopPropagation(); handleDelete(event.id) }}
                            className={cn('h-6 w-6 flex items-center justify-center rounded-md transition-colors',
                              deleteConfirm === event.id ? 'bg-rose-500/20 text-rose-500' : 'hover:bg-rose-500/10 text-[var(--c-text-muted)] hover:text-rose-500')
                            }>
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      {/* Now indicator pulse for current block */}
                      {block.isNow && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--c-accent)] animate-pulse" />
                      )}
                    </div>
                  )
                })}

                {/* Now line */}
                {nowTop && (
                  <div className="absolute left-0 right-0 z-20 pointer-events-none" style={{ top: nowTop }}>
                    <div className="flex items-center">
                      <div className="-ml-2 h-2.5 w-2.5 rounded-full bg-[var(--c-accent)] ring-4 ring-[var(--c-card)]" />
                      <div className="flex-1 h-[2px] bg-[var(--c-accent)]" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: Day Summary + Free Slots */}
        <div className="space-y-3">
          {/* Day Summary Card */}
          <div className="rounded-2xl border border-[var(--c-border)] dark:border-white/[0.08] bg-[var(--c-card)] p-4 space-y-3 relative overflow-hidden dark:shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
            <div className="absolute -top-8 -right-8 h-20 w-20 rounded-full bg-gradient-to-br from-blue-500/10 to-sky-500/10 dark:from-blue-500/5 dark:to-sky-500/5 blur-2xl pointer-events-none" />
            <h3 className="text-xs font-bold text-[var(--c-text-muted)] uppercase tracking-widest relative">Ringkasan Hari</h3>
            <div className="grid grid-cols-2 gap-2 relative">
              <div className="rounded-xl bg-[var(--c-surface)] dark:bg-white/[0.04] p-2.5 text-center">
                <p className="text-lg font-extrabold text-[var(--c-text)] tabular-nums">{timeline?.events.length ?? 0}</p>
                <p className="text-[10px] text-[var(--c-text-muted)]">Total Event</p>
              </div>
              <div className="rounded-xl bg-[var(--c-surface)] dark:bg-white/[0.04] p-2.5 text-center">
                <p className="text-lg font-extrabold text-emerald-500 tabular-nums">
                  {timeline?.events.filter(e => e.is_completed).length ?? 0}
                </p>
                <p className="text-[10px] text-[var(--c-text-muted)]">Selesai</p>
              </div>
              <div className="rounded-xl bg-[var(--c-surface)] dark:bg-white/[0.04] p-2.5 text-center">
                <p className="text-lg font-extrabold text-[var(--c-text)] tabular-nums">
                  {timeline ? Math.round(timeline.totalScheduledMin / 60) : 0}j
                </p>
                <p className="text-[10px] text-[var(--c-text-muted)]">Terjadwal</p>
              </div>
              <div className="rounded-xl bg-[var(--c-surface)] dark:bg-white/[0.04] p-2.5 text-center">
                <p className="text-lg font-extrabold text-[var(--c-text)] tabular-nums">
                  {timeline ? Math.round(timeline.totalFreeMin / 60) : 0}j
                </p>
                <p className="text-[10px] text-[var(--c-text-muted)]">Waktu Luang</p>
              </div>
            </div>
            {/* Utilization bar */}
            {timeline && timeline.events.length > 0 && (
              <div className="relative">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-[var(--c-text-muted)]">Utilisasi</span>
                  <span className="text-[10px] font-bold text-[var(--c-text)]">{timeline.utilizationPercent}%</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--c-border)]/30 dark:bg-white/10 overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all duration-500',
                      timeline.utilizationPercent > 80 ? 'bg-gradient-to-r from-rose-500 to-red-500'
                        : timeline.utilizationPercent > 50 ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                        : 'bg-gradient-to-r from-blue-500 to-sky-500'
                    )}
                    style={{ width: `${Math.min(100, timeline.utilizationPercent)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Free Slots Card */}
          {timeline && timeline.freeSlots.length > 0 && (
            <div className="rounded-2xl border border-[var(--c-border)] dark:border-white/[0.08] bg-[var(--c-card)] p-4 space-y-2.5 dark:shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
              <h3 className="text-xs font-bold text-[var(--c-text-muted)] uppercase tracking-widest flex items-center gap-1.5">
                <Coffee className="h-3 w-3" /> Slot Kosong
              </h3>
              <div className="space-y-1.5">
                {timeline.freeSlots.map((slot, i) => (
                  <div key={i}
                    className="flex items-center justify-between py-1.5 px-2.5 rounded-xl bg-[var(--c-surface)] dark:bg-white/[0.04] border border-dashed border-[var(--c-border)]/50 dark:border-white/[0.06]">
                    <div>
                      <p className="text-[11px] font-semibold text-[var(--c-text)] tabular-nums">
                        {slot.start} - {slot.end}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-[var(--c-text-muted)] px-1.5 py-0.5 rounded-lg bg-[var(--c-surface)] dark:bg-white/[0.06]">
                      {slot.durationMin >= 60 ? `${Math.floor(slot.durationMin / 60)}j ${slot.durationMin % 60 > 0 ? `${slot.durationMin % 60}m` : ''}` : `${slot.durationMin}m`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Category Breakdown */}
          {timeline && timeline.events.length > 0 && (
            <div className="rounded-2xl border border-[var(--c-border)] dark:border-white/[0.08] bg-[var(--c-card)] p-4 space-y-2.5 dark:shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
              <h3 className="text-xs font-bold text-[var(--c-text-muted)] uppercase tracking-widest">Kategori</h3>
              <div className="space-y-1.5">
                {(() => {
                  const catCounts = new Map<string, number>()
                  for (const e of timeline.events) {
                    catCounts.set(e.category, (catCounts.get(e.category) ?? 0) + 1)
                  }
                  return Array.from(catCounts.entries())
                    .sort((a, b) => b[1] - a[1])
                    .map(([cat, count]) => {
                      const conf = getCategoryConfig(cat)
                      const pct = Math.round((count / timeline.events.length) * 100)
                      return (
                        <div key={cat} className="flex items-center gap-2">
                          <span className={cn('h-2 w-2 rounded-full shrink-0', conf.dot)} />
                          <span className="text-[11px] font-medium text-[var(--c-text)] flex-1">{conf.label}</span>
                          <span className="text-[10px] font-bold text-[var(--c-text-muted)] tabular-nums">{count}</span>
                          <div className="w-12 h-1.5 rounded-full bg-[var(--c-border)]/30 dark:bg-white/10 overflow-hidden">
                            <div className="h-full rounded-full bg-[var(--c-accent)]/60" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      )
                    })
                })()}
              </div>
            </div>
          )}
        </div>
      </div>

      <EventFormDialog
        open={formOpen}
        onOpenChange={(v) => { setFormOpen(v); if (!v) setEditingEvent(null) }}
        event={editingEvent}
        defaultDate={date}
      />
    </div>
  )
}
