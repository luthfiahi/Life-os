'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { PiggyBank, CalendarCheck, Clock } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm">
              <PiggyBank className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle>{isEditing ? 'Edit Budget' : 'Tambah Budget Baru'}</DialogTitle>
              <DialogDescription>
                {isEditing ? 'Ubah batas pengeluaran kamu.' : 'Tetapkan batas pengeluaran per kategori.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Amount - prominent */}
          <div className="rounded-xl border border-[var(--c-border)] bg-[var(--c-surface)] p-4">
            <label className="block text-xs font-semibold text-[var(--c-text-muted)] uppercase tracking-wider mb-2">Jumlah Budget</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--c-text-muted)]">Rp</span>
              <input
                type="number"
                placeholder="0"
                className={
                  'flex h-12 w-full rounded-xl border bg-white text-[var(--c-text)] pl-8 pr-3 text-xl font-bold shadow-sm transition-all dark:bg-[#2e333b]'
                  + ' placeholder:text-[var(--c-text-muted)]/40'
                  + ' focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--c-accent)]/30 focus-visible:border-[var(--c-accent)]'
                  + (errors.amount ? ' border-[var(--c-accent-2)]' : ' border-[var(--c-border)]')
                }
                {...register('amount')}
              />
            </div>
            {errors.amount && <p className="mt-2 text-xs text-[var(--c-accent-2)]">{errors.amount.message}</p>}
          </div>

          {/* Period toggle */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--c-text)]">Periode</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setValue('period', 'monthly')}
                className={`flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-semibold transition-all duration-200 ${selectedPeriod === 'monthly' ? 'border-[var(--c-accent)] bg-[var(--c-accent)]/10 text-[var(--c-accent)]' : 'border-[var(--c-border)] text-[var(--c-text-muted)] hover:border-[var(--c-text-muted)]'}`}
              >
                <CalendarCheck className="h-4 w-4" />
                Bulanan
              </button>
              <button
                type="button"
                onClick={() => setValue('period', 'weekly')}
                className={`flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-semibold transition-all duration-200 ${selectedPeriod === 'weekly' ? 'border-[var(--c-accent)] bg-[var(--c-accent)]/10 text-[var(--c-accent)]' : 'border-[var(--c-border)] text-[var(--c-text-muted)] hover:border-[var(--c-text-muted)]'}`}
              >
                <Clock className="h-4 w-4" />
                Mingguan
              </button>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[var(--c-text)]">Kategori Pengeluaran</label>
            <Select value={watch('category_id')} onValueChange={(v) => setValue('category_id', v)}>
              <SelectTrigger className="w-full rounded-xl">
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category_id && <p className="text-xs text-[var(--c-accent-2)]">{errors.category_id.message}</p>}
          </div>

          {watchedAmount > 1000 && selectedPeriod === 'monthly' && (
            <div className="rounded-lg bg-violet-500/10 border border-violet-500/20 px-4 py-3">
              <p className="text-xs text-[var(--c-text-muted)]">Setara dengan ~<span className="font-semibold text-[var(--c-text)]">Rp {weeklyEquiv.toLocaleString('id-ID')}</span> per minggu</p>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" loading={isSubmitting} className="shadow-sm shadow-[var(--c-accent)]/20">
              {isEditing ? 'Simpan Perubahan' : 'Tambah Budget'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
/* eslint-enable react-hooks/incompatible-library */