'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Target, Rocket, Flag, Star, Trophy, Zap, Code, BookOpen, Dumbbell, Heart,
  PenLine, CalendarDays, AlertCircle, Save,
} from 'lucide-react'
import {
  Dialog, DialogContent, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { useCreateMission, useUpdateMission } from '@/lib/queries/mission-queries'
import type { MissionRow, MissionPriority, MissionStatus } from '@/lib/types/mission'

const ICON_PRESETS = [
  { value: 'Target', Icon: Target },
  { value: 'Rocket', Icon: Rocket },
  { value: 'Flag', Icon: Flag },
  { value: 'Star', Icon: Star },
  { value: 'Trophy', Icon: Trophy },
  { value: 'Zap', Icon: Zap },
  { value: 'Code', Icon: Code },
  { value: 'BookOpen', Icon: BookOpen },
  { value: 'Dumbbell', Icon: Dumbbell },
  { value: 'Heart', Icon: Heart },
] as const

const COLOR_PRESETS = [
  { value: 'blue', bg: 'bg-blue-500' },
  { value: 'emerald', bg: 'bg-emerald-500' },
  { value: 'violet', bg: 'bg-violet-500' },
  { value: 'orange', bg: 'bg-orange-500' },
  { value: 'rose', bg: 'bg-rose-500' },
  { value: 'sky', bg: 'bg-sky-500' },
] as const

const PRIORITY_OPTIONS: { value: MissionPriority; label: string; activeClass: string }[] = [
  { value: 'low', label: 'Low', activeClass: 'bg-sky-500 text-white' },
  { value: 'medium', label: 'Medium', activeClass: 'bg-amber-500 text-white' },
  { value: 'high', label: 'High', activeClass: 'bg-orange-500 text-white' },
  { value: 'critical', label: 'Critical', activeClass: 'bg-rose-500 text-white' },
]

const STATUS_OPTIONS: { value: MissionStatus; label: string; activeClass: string }[] = [
  { value: 'draft', label: 'Draft', activeClass: 'bg-slate-500 text-white' },
  { value: 'active', label: 'Aktif', activeClass: 'bg-blue-500 text-white' },
  { value: 'completed', label: 'Selesai', activeClass: 'bg-emerald-500 text-white' },
  { value: 'archived', label: 'Arsip', activeClass: 'bg-gray-500 text-white' },
]

const missionSchema = z.object({
  title: z.string().min(1, 'Nama mission wajib diisi'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical'] as const),
  status: z.enum(['draft', 'active', 'completed', 'archived'] as const),
  start_date: z.string().optional(),
  target_date: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
})

type MissionFormValues = z.infer<typeof missionSchema>

interface MissionFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mission?: MissionRow | null
}

/* eslint-disable react-hooks/incompatible-library */
export function MissionFormDialog({ open, onOpenChange, mission }: MissionFormDialogProps) {
  const { user } = useAuth()
  const createMission = useCreateMission()
  const updateMission = useUpdateMission()
  const isEditing = !!mission

  const {
    register, handleSubmit, reset, setValue, watch, formState: { errors },
  } = useForm<MissionFormValues>({
    resolver: zodResolver(missionSchema),
    defaultValues: {
      title: '', description: '', priority: 'medium', status: 'active',
      start_date: '', target_date: '', icon: 'Target', color: 'blue',
    },
  })

  const selectedIcon = watch('icon')
  const selectedColor = watch('color')
  const selectedPriority = watch('priority')
  const selectedStatus = watch('status')
  const isSubmitting = createMission.isPending || updateMission.isPending

  useEffect(() => {
    if (open) {
      if (mission) {
        reset({
          title: mission.title, description: mission.description ?? '',
          priority: mission.priority, status: mission.status,
          start_date: mission.start_date ?? '', target_date: mission.target_date ?? '',
          icon: mission.icon ?? 'Target', color: mission.color ?? 'blue',
        })
      } else {
        reset({
          title: '', description: '', priority: 'medium', status: 'active',
          start_date: '', target_date: '', icon: 'Target', color: 'blue',
        })
      }
    }
  }, [open, mission, reset])

  async function onSubmit(values: MissionFormValues) {
    if (!user?.id) { alert('Kamu belum login.'); return }
    try {
      if (isEditing && mission) {
        await updateMission.mutateAsync({ id: mission.id, payload: values })
      } else {
        await createMission.mutateAsync({ user_id: user.id, ...values })
      }
      onOpenChange(false)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal menyimpan mission')
    }
  }

  const inputBase = cn(
    'flex w-full rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] px-4 text-sm shadow-sm',
    'transition-all duration-200',
    'placeholder:text-[var(--c-text-muted)]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--c-accent)]/30 focus-visible:border-[var(--c-accent)]',
  )
  const inputError = 'border-red-500 focus-visible:ring-red-500/30 focus-visible:border-red-500'
  const inputStyle = { color: 'var(--c-text)' }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col gap-0 overflow-hidden p-0 sm:max-w-[560px] max-h-[97dvh] sm:max-h-[92vh]">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
          {/* Header */}
          <div className="flex-shrink-0 px-6 pt-6 pb-5 border-b border-[var(--c-border)]">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20 transition-all duration-300 flex-shrink-0">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-xl font-extrabold tracking-tight">
                  {isEditing ? 'Edit Mission' : 'Mission Baru'}
                </DialogTitle>
                <DialogDescription className="text-sm mt-0.5">
                  {isEditing ? 'Ubah detail mission kamu.' : 'Tetapkan tujuan besar yang ingin dicapai.'}
                </DialogDescription>
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 pb-6 space-y-5">
            {/* Title */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-[var(--c-text)]">
                <PenLine className="h-4 w-4 text-[var(--c-text-muted)]" />
                Nama Mission
              </label>
              <input type="text" placeholder="Contoh: Bangun Life OS" className={cn('h-12', inputBase, errors.title && inputError)} style={inputStyle} {...register('title')} />
              {errors.title && (
                <p className="flex items-center gap-1 text-xs text-red-500 pl-1" role="alert">
                  <AlertCircle className="h-3 w-3 flex-shrink-0" />{errors.title.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[var(--c-text)]">Deskripsi</label>
              <textarea placeholder="Jelaskan mission ini secara singkat..." rows={3} className={cn('min-h-[80px] resize-none', inputBase)} style={inputStyle} {...register('description')} />
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[var(--c-text)]">Priority</label>
              <div className="grid grid-cols-4 gap-2">
                {PRIORITY_OPTIONS.map((opt) => (
                  <button key={opt.value} type="button" onClick={() => setValue('priority', opt.value)}
                    className={cn('py-2.5 text-xs font-semibold rounded-xl border-2 transition-all duration-200',
                      selectedPriority === opt.value ? cn(opt.activeClass, 'border-transparent') : 'border-[var(--c-border)] text-[var(--c-text-muted)] hover:border-[var(--c-text-muted)]')}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[var(--c-text)]">Status</label>
              <div className="grid grid-cols-4 gap-2">
                {STATUS_OPTIONS.map((opt) => (
                  <button key={opt.value} type="button" onClick={() => setValue('status', opt.value)}
                    className={cn('py-2.5 text-xs font-semibold rounded-xl border-2 transition-all duration-200',
                      selectedStatus === opt.value ? cn(opt.activeClass, 'border-transparent') : 'border-[var(--c-border)] text-[var(--c-text-muted)] hover:border-[var(--c-text-muted)]')}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-[var(--c-text)]">
                  <CalendarDays className="h-4 w-4 text-[var(--c-text-muted)]" /> Mulai
                </label>
                <input type="date" className={cn('h-12', inputBase)} style={inputStyle} {...register('start_date')} />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-[var(--c-text)]">
                  <CalendarDays className="h-4 w-4 text-[var(--c-text-muted)]" /> Target
                </label>
                <input type="date" className={cn('h-12', inputBase)} style={inputStyle} {...register('target_date')} />
              </div>
            </div>

            {/* Icon Picker */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[var(--c-text)]">Ikon</label>
              <div className="flex flex-wrap gap-2">
                {ICON_PRESETS.map(({ value, Icon }) => (
                  <button key={value} type="button" onClick={() => setValue('icon', value)}
                    className={cn('h-10 w-10 rounded-xl flex items-center justify-center border-2 transition-all duration-200',
                      selectedIcon === value
                        ? 'border-[var(--c-accent)] bg-[var(--c-accent)]/10 text-[var(--c-accent)]'
                        : 'border-[var(--c-border)] text-[var(--c-text-muted)] hover:border-[var(--c-text-muted)]')}>
                    <Icon className="h-4.5 w-4.5" />
                  </button>
                ))}
              </div>
            </div>

            {/* Color Picker */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[var(--c-text)]">Warna</label>
              <div className="flex flex-wrap gap-2.5">
                {COLOR_PRESETS.map((c) => (
                  <button key={c.value} type="button" onClick={() => setValue('color', c.value)}
                    className={cn('h-8 w-8 rounded-full transition-all duration-200 ring-2 ring-offset-2 ring-offset-[var(--c-card)]',
                      c.bg,
                      selectedColor === c.value ? 'ring-[var(--c-accent)] scale-110' : 'ring-transparent')} />
                ))}
              </div>
            </div>
          </div>

          {/* Fixed Footer */}
          <div className="flex-shrink-0 border-t border-[var(--c-border)] px-6 py-4">
            <div className="flex items-center gap-3 justify-end">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl h-11 px-5">Batal</Button>
              <Button type="submit" loading={isSubmitting} className="rounded-xl h-11 px-6 shadow-lg shadow-blue-500/20">
                <Save className="h-4 w-4" />
                {isEditing ? 'Simpan Perubahan' : 'Buat Mission'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
/* eslint-enable react-hooks/incompatible-library */
