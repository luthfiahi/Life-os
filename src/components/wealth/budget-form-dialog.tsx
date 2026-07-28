'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { PiggyBank, CalendarCheck, Clock, Tag, Hash, AlertCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { useCategories, useCreateBudget, useUpdateBudget } from '@/lib/queries/wealth-queries'
import type { BudgetRow } from '@/lib/types/wealth'

const budgetSchema = z.object({
  category_id: z.string().min(1, 'Pilih kategori'),
  amount: z.coerce.number().min(1000, 'Minimal Rp 1.000'),
  period: z.enum(['monthly', 'weekly'] as const),
})

type BudgetFormValues = z.infer<typeof budgetSchema>

interface BudgetFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  budget?: BudgetRow | null
}

/* eslint-disable react-hooks/incompatible-library */
export function BudgetFormDialog({ open, onOpenChange, budget }: BudgetFormDialogProps) {
  const { user } = useAuth()
  const createBudget = useCreateBudget()
  const updateBudget = useUpdateBudget()
  const { data: categories } = useCategories('expense')
  const isEditing = !!budget

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      category_id: '',
      amount: 0,
      period: 'monthly',
    },
  })

  useEffect(() => {
    if (budget) {
      reset({
        category_id: budget.category_id,
        amount: Number(budget.amount),
        period: budget.period,
      })
    } else {
      reset({ category_id: '', amount: 0, period: 'monthly' })
    }
  }, [budget, reset])

  const selectedPeriod = watch('period')
  const watchedAmount = watch('amount')
  const isSubmitting = createBudget.isPending || updateBudget.isPending

  async function onSubmit(values: BudgetFormValues) {
    if (!user?.id) {
      alert('Kamu belum login atau sesi sudah habis. Silakan login ulang.')
      return
    }
    try {
      if (isEditing && budget) {
        await updateBudget.mutateAsync({ id: budget.id, payload: values })
      } else {
        await createBudget.mutateAsync({ user_id: user.id, ...values })
      }
      onOpenChange(false)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan budget'
      alert(msg)
    }
  }

  const weeklyEquiv = watchedAmount ? Math.round(watchedAmount / 4) : 0

  /* - Shared Styles - */
  const inputBase = cn(
    'flex w-full rounded-xl border border-[var(--c-border)] bg-white px-4 text-sm shadow-sm',
    'transition-all duration-200 dark:bg-[#2e333b]',
    'placeholder:text-[var(--c-text-muted)]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--c-accent)]/30 focus-visible:border-[var(--c-accent)]',
  )
  const inputError = 'border-red-500 focus-visible:ring-red-500/30 focus-visible:border-red-500'
  const inputStyle = { color: 'var(--c-text)' }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col gap-0 overflow-hidden p-0 sm:max-w-[500px] max-h-[97dvh] sm:max-h-[92vh]">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">

          
          <div className="flex-shrink-0 px-6 pt-6 pb-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg transition-all duration-300 flex-shrink-0">
                <PiggyBank className="h-6 w-6 text-white" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-xl font-bold tracking-tight">
                  {isEditing ? 'Edit Budget' : 'Tambah Budget Baru'}
                </DialogTitle>
                <DialogDescription className="text-sm mt-0.5">
                  {isEditing ? 'Ubah batas pengeluaran kamu.' : 'Tetapkan batas pengeluaran per kategori.'}
                </DialogDescription>
              </div>
            </div>
          </div>

          
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 pb-6 space-y-6">

            
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-[var(--c-text-muted)] uppercase tracking-wider">
                <Hash className="h-3.5 w-3.5" />
                Jumlah Budget
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-[var(--c-text-muted)] select-none pointer-events-none">Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  className={cn(
                    'h-14 pl-12 pr-4 text-2xl font-bold tabular-nums',
                    inputBase,
                    errors.amount && inputError,
                  )}
                  style={inputStyle}
                  {...register('amount')}
                />
              </div>
              <p className="text-xs text-[var(--c-text-muted)] pl-1">Batas maksimal pengeluaran untuk kategori ini.</p>
              {errors.amount && (
                <p className="flex items-center gap-1 text-xs text-red-500 pl-1" role="alert">
                  <AlertCircle className="h-3 w-3 flex-shrink-0" />
                  {errors.amount.message}
                </p>
              )}
            </div>

            
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-[var(--c-text)]">
                <CalendarCheck className="h-4 w-4 text-[var(--c-text-muted)]" />
                Periode
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setValue('period', 'monthly')}
                  className={cn(
                    'flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-semibold transition-all duration-200',
                    selectedPeriod === 'monthly'
                      ? 'border-[var(--c-accent)] bg-[var(--c-accent)]/10 text-[var(--c-accent)]'
                      : 'border-[var(--c-border)] text-[var(--c-text-muted)] hover:border-[var(--c-text-muted)]',
                  )}
                >
                  <CalendarCheck className="h-4 w-4" />
                  Bulanan
                </button>
                <button
                  type="button"
                  onClick={() => setValue('period', 'weekly')}
                  className={cn(
                    'flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-semibold transition-all duration-200',
                    selectedPeriod === 'weekly'
                      ? 'border-[var(--c-accent)] bg-[var(--c-accent)]/10 text-[var(--c-accent)]'
                      : 'border-[var(--c-border)] text-[var(--c-text-muted)] hover:border-[var(--c-text-muted)]',
                  )}
                >
                  <Clock className="h-4 w-4" />
                  Mingguan
                </button>
              </div>
              <p className="text-xs text-[var(--c-text-muted)] pl-1">Frekuensi reset anggaran.</p>
            </div>

            
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-[var(--c-text)]">
                <Tag className="h-4 w-4 text-[var(--c-text-muted)]" />
                Kategori Pengeluaran
              </label>
              <Select value={watch('category_id')} onValueChange={(v) => setValue('category_id', v)}>
                <SelectTrigger className="w-full h-12 rounded-xl">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-[var(--c-text-muted)] pl-1">Pilih kategori yang ingin dibatasi.</p>
              {errors.category_id && (
                <p className="flex items-center gap-1 text-xs text-red-500 pl-1" role="alert">
                  <AlertCircle className="h-3 w-3 flex-shrink-0" />
                  {errors.category_id.message}
                </p>
              )}
            </div>

            
            {watchedAmount > 1000 && selectedPeriod === 'monthly' && (
              <div className="rounded-xl bg-violet-500/10 border border-violet-500/20 px-4 py-3">
                <p className="text-xs text-[var(--c-text-muted)]">
                  Setara dengan ~<span className="font-semibold text-[var(--c-text)]">Rp {weeklyEquiv.toLocaleString('id-ID')}</span> per minggu
                </p>
              </div>
            )}

          </div>

          
          <div className="flex-shrink-0 border-t border-[var(--c-border)] px-6 py-4">
            <div className="flex items-center gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="rounded-xl h-11 px-5"
              >
                Batal
              </Button>
              <Button
                type="submit"
                loading={isSubmitting}
                className="rounded-xl h-11 px-6 shadow-lg shadow-violet-500/20"
              >
                {isEditing ? 'Simpan Perubahan' : 'Tambah Budget'}
              </Button>
            </div>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  )
}
/* eslint-enable react-hooks/incompatible-library */
