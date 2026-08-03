'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  CalendarDays, Clock, MapPin, Tag, Link2, AlertCircle, Save, Sparkles, Repeat,
} from 'lucide-react'
import {
  Dialog, DialogContent, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { useCreateEvent, useUpdateEvent } from '@/lib/queries/schedule-queries'
import { getTodayStr } from '@/lib/services/schedule.service'
import type { ScheduleEventRow, ScheduleCategory, RepeatType } from '@/lib/types/schedule'

const CATEGORY_OPTIONS: { value: ScheduleCategory; label: string; icon: string }[] = [
  { value: 'general', label: 'Umum', icon: '📌' },
  { value: 'work', label: 'Kerja', icon: '💼' },
  { value: 'personal', label: 'Pribadi', icon: '🧑' },
  { value: 'health', label: 'Kesehatan', icon: '❤️' },
  { value: 'education', label: 'Pendidikan', icon: '📚' },
  { value: 'social', label: 'Sosial', icon: '🤝' },
  { value: 'finance', label: 'Keuangan', icon: '💰' },
  { value: 'creative', label: 'Kreatif', icon: '🎨' },
]

const COLOR_OPTIONS = [
  { value: 'blue', bg: 'bg-blue-500', ring: 'ring-blue-400/50 dark:ring-blue-400/30' },
  { value: 'emerald', bg: 'bg-emerald-500', ring: 'ring-emerald-400/50 dark:ring-emerald-400/30' },
  { value: 'violet', bg: 'bg-violet-500', ring: 'ring-violet-400/50 dark:ring-violet-400/30' },
  { value: 'orange', bg: 'bg-orange-500', ring: 'ring-orange-400/50 dark:ring-orange-400/30' },
  { value: 'rose', bg: 'bg-rose-500', ring: 'ring-rose-400/50 dark:ring-rose-400/30' },
  { value: 'sky', bg: 'bg-sky-500', ring: 'ring-sky-400/50 dark:ring-sky-400/30' },
  { value: 'amber', bg: 'bg-amber-500', ring: 'ring-amber-400/50 dark:ring-amber-400/30' },
  { value: 'pink', bg: 'bg-pink-500', ring: 'ring-pink-400/50 dark:ring-pink-400/30' },
]

const REPEAT_OPTIONS: { value: RepeatType; label: string }[] = [
  { value: null, label: 'Tidak berulang' },
  { value: 'daily', label: 'Setiap hari' },
  { value: 'weekday', label: 'Hari kerja' },
  { value: 'weekly', label: 'Setiap minggu' },
  { value: 'monthly', label: 'Setiap bulan' },
]

const eventSchema = z.object({
  title: z.string().min(1, 'Nama event wajib diisi'),
  description: z.string().optional(),
  event_date: z.string().min(1, 'Tanggal wajib diisi'),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  is_all_day: z.boolean(),
  category: z.enum(['general', 'work', 'personal', 'health', 'education', 'social', 'finance', 'creative'] as const),
  color: z.string().optional(),
  location: z.string().optional(),
  repeat_type: z.string().optional(),
})

type EventFormValues = z.infer<typeof eventSchema>

interface EventFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event?: ScheduleEventRow | null
  defaultDate?: string
}

export function EventFormDialog({ open, onOpenChange, event, defaultDate }: EventFormDialogProps) {
  const { user } = useAuth()
  const createEvent = useCreateEvent()
  const updateEvent = useUpdateEvent()
  const isEditing = !!event

  const {
    register, handleSubmit, reset, setValue, watch, formState: { errors },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '', description: '', event_date: defaultDate ?? getTodayStr(),
      start_time: '', end_time: '', is_all_day: false,
      category: 'general', color: 'blue', location: '', repeat_type: '',
    },
  })

  const isAllDay = watch('is_all_day')
  const selectedColor = watch('color')
  const selectedCategory = watch('category')
  const selectedRepeat = watch('repeat_type')
  const isSubmitting = createEvent.isPending || updateEvent.isPending

  useEffect(() => {
    if (open) {
      if (event) {
        reset({
          title: event.title, description: event.description ?? '',
          event_date: event.event_date, start_time: event.start_time ?? '',
          end_time: event.end_time ?? '', is_all_day: event.is_all_day,
          category: event.category, color: event.color ?? 'blue',
          location: event.location ?? '', repeat_type: event.repeat_type ?? '',
        })
      } else {
        reset({
          title: '', description: '', event_date: defaultDate ?? getTodayStr(),
          start_time: '', end_time: '', is_all_day: false,
          category: 'general', color: 'blue', location: '', repeat_type: '',
        })
      }
    }
  }, [open, event, defaultDate, reset])

  async function onSubmit(values: EventFormValues) {
    if (!user?.id) { alert('Kamu belum login.'); return }
    try {
      const payload = {
        ...values,
        start_time: values.start_time || null,
        end_time: values.end_time || null,
        repeat_type: (values.repeat_type || null) as RepeatType,
      }
      if (isEditing && event) {
        await updateEvent.mutateAsync({ id: event.id, payload })
      } else {
        await createEvent.mutateAsync({ user_id: user.id, ...payload })
      }
      onOpenChange(false)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal menyimpan event')
    }
  }

  const inputBase = cn(
    'flex w-full rounded-xl border border-[var(--c-border)] dark:border-white/10 bg-[var(--c-card)] dark:bg-white/[0.04] px-4 text-sm',
    'shadow-sm dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]',
    'transition-all duration-200',
    'placeholder:text-[var(--c-text-muted)]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--c-accent)]/30 dark:focus-visible:ring-[var(--c-accent)]/20 focus-visible:border-[var(--c-accent)]',
  )
  const inputError = 'border-red-500 focus-visible:ring-red-500/30 focus-visible:border-red-500'
  const inputStyle = { color: 'var(--c-text)' }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col gap-0 overflow-hidden p-0 sm:max-w-[520px] max-h-[97dvh] sm:max-h-[92vh]">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
          {/* Header */}
          <div className="flex-shrink-0 px-6 pt-6 pb-5 border-b border-[var(--c-border)] dark:border-white/[0.08] relative overflow-hidden">
            <div className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-gradient-to-br from-blue-500/10 to-sky-500/10 dark:from-blue-500/5 dark:to-sky-500/5 blur-2xl pointer-events-none" />
            <div className="relative flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-sky-600 dark:from-blue-400 dark:to-sky-500 flex items-center justify-center shadow-lg shadow-blue-500/20 dark:shadow-blue-500/10 transition-all duration-300 flex-shrink-0">
                {isEditing ? <CalendarDays className="h-6 w-6 text-white" /> : <Sparkles className="h-6 w-6 text-white" />}
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-xl font-extrabold tracking-tight text-[var(--c-text)]">
                  {isEditing ? 'Edit Event' : 'Event Baru'}
                </DialogTitle>
                <DialogDescription className="text-sm mt-0.5 text-[var(--c-text-muted)]">
                  {isEditing ? 'Ubah detail event kamu.' : 'Tambahkan jadwal baru ke kalender.'}
                </DialogDescription>
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 pb-6 space-y-5">
            {/* Title */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-[var(--c-text)]">
                <CalendarDays className="h-4 w-4 text-[var(--c-text-muted)]" />
                Nama Event
              </label>
              <input type="text" placeholder="Contoh: Meeting dengan tim" className={cn('h-12', inputBase, errors.title && inputError)} style={inputStyle} {...register('title')} />
              {errors.title && (
                <p className="flex items-center gap-1 text-xs text-red-500 dark:text-red-400 pl-1" role="alert">
                  <AlertCircle className="h-3 w-3 flex-shrink-0" />{errors.title.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[var(--c-text)]">Deskripsi</label>
              <textarea placeholder="Detail event..." rows={2} className={cn('min-h-[60px] resize-none', inputBase)} style={inputStyle} {...register('description')} />
            </div>

            {/* Date + All Day Toggle */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-[var(--c-text)]">
                  <CalendarDays className="h-4 w-4 text-[var(--c-text-muted)]" /> Tanggal
                </label>
                <input type="date" className={cn('h-12', inputBase, errors.event_date && inputError)} style={inputStyle} {...register('event_date')} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[var(--c-text)]">Seharian?</label>
                <button
                  type="button"
                  onClick={() => setValue('is_all_day', !isAllDay)}
                  className={cn(
                    'h-12 w-full rounded-xl border-2 text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2',
                    isAllDay
                      ? 'border-[var(--c-accent)] bg-[var(--c-accent)]/10 dark:bg-[var(--c-accent)]/15 text-[var(--c-accent)]'
                      : 'border-[var(--c-border)] dark:border-white/10 text-[var(--c-text-muted)] hover:border-[var(--c-text-muted)] dark:hover:border-white/20',
                  )}
                >
                  <Clock className="h-3.5 w-3.5" />
                  {isAllDay ? 'Ya, Seharian' : 'Tidak'}
                </button>
              </div>
            </div>

            {/* Time Range (hidden for all-day) */}
            {!isAllDay && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-[var(--c-text)]">
                    <Clock className="h-4 w-4 text-[var(--c-text-muted)]" /> Mulai
                  </label>
                  <input type="time" className={cn('h-12', inputBase)} style={inputStyle} {...register('start_time')} />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-[var(--c-text)]">
                    <Clock className="h-4 w-4 text-[var(--c-text-muted)]" /> Selesai
                  </label>
                  <input type="time" className={cn('h-12', inputBase)} style={inputStyle} {...register('end_time')} />
                </div>
              </div>
            )}

            {/* Category */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-[var(--c-text)]">
                <Tag className="h-4 w-4 text-[var(--c-text-muted)]" /> Kategori
              </label>
              <div className="grid grid-cols-4 gap-2">
                {CATEGORY_OPTIONS.map((opt) => (
                  <button key={opt.value} type="button" onClick={() => setValue('category', opt.value)}
                    className={cn('py-2 text-[11px] font-semibold rounded-xl border-2 transition-all duration-200 flex items-center gap-1.5 justify-center',
                      selectedCategory === opt.value
                        ? 'border-[var(--c-accent)] bg-[var(--c-accent)]/10 dark:bg-[var(--c-accent)]/15 text-[var(--c-accent)] shadow-sm shadow-[var(--c-accent)]/10 scale-[1.02]'
                        : 'border-[var(--c-border)] dark:border-white/10 text-[var(--c-text-muted)] hover:border-[var(--c-text-muted)] dark:hover:border-white/20 dark:hover:bg-white/5')}>
                    <span className="text-xs">{opt.icon}</span>
                    <span className="hidden sm:inline">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[var(--c-text)]">Warna</label>
              <div className="flex flex-wrap gap-2.5">
                {COLOR_OPTIONS.map((c) => (
                  <button key={c.value} type="button" onClick={() => setValue('color', c.value)}
                    className={cn('h-8 w-8 rounded-full transition-all duration-200 ring-2 ring-offset-2 ring-offset-[var(--c-card)] dark:ring-offset-[var(--c-card)]',
                      c.bg,
                      selectedColor === c.value
                        ? cn(c.ring, 'scale-110')
                        : 'ring-transparent hover:scale-105')} />
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-[var(--c-text)]">
                <MapPin className="h-4 w-4 text-[var(--c-text-muted)]" /> Lokasi
              </label>
              <input type="text" placeholder="Online, kantor, cafe..." className={inputBase} style={inputStyle} {...register('location')} />
            </div>

            {/* Repeat */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-[var(--c-text)]">
                <Repeat className="h-4 w-4 text-[var(--c-text-muted)]" /> Pengulangan
              </label>
              <div className="grid grid-cols-3 gap-2">
                {REPEAT_OPTIONS.map((opt) => (
                  <button key={opt.value ?? 'none'} type="button" onClick={() => setValue('repeat_type', opt.value ?? '')}
                    className={cn('py-2 text-[11px] font-semibold rounded-xl border-2 transition-all duration-200',
                      selectedRepeat === (opt.value ?? '')
                        ? 'border-[var(--c-accent)] bg-[var(--c-accent)]/10 dark:bg-[var(--c-accent)]/15 text-[var(--c-accent)] shadow-sm shadow-[var(--c-accent)]/10 scale-[1.02]'
                        : 'border-[var(--c-border)] dark:border-white/10 text-[var(--c-text-muted)] hover:border-[var(--c-text-muted)] dark:hover:border-white/20 dark:hover:bg-white/5')}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 border-t border-[var(--c-border)] dark:border-white/[0.08] px-6 py-4 bg-[var(--c-card)] dark:bg-[var(--c-card)]/80 dark:backdrop-blur-xl">
            <div className="flex items-center gap-3 justify-end">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl h-11 px-5 border-[var(--c-border)] dark:border-white/10 dark:hover:bg-white/5">Batal</Button>
              <Button type="submit" loading={isSubmitting} className="rounded-xl h-11 px-6 shadow-lg shadow-blue-500/20 dark:shadow-blue-500/10">
                <Save className="h-4 w-4" />
                {isEditing ? 'Simpan' : 'Buat Event'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
