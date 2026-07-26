'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
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
  const isSubmitting = createBudget.isPending || updateBudget.isPending

  async function onSubmit(values: BudgetFormValues) {
    if (!user?.id) return
    try {
      if (isEditing && budget) {
        await updateBudget.mutateAsync({ id: budget.id, payload: values })
      } else {
        await createBudget.mutateAsync({ user_id: user.id, ...values })
      }
      onOpenChange(false)
    } catch {
      // Error handled by mutation
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Budget' : 'Tambah Budget Baru'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Ubah batas pengeluaran bulanan kamu.' : 'Tetapkan batas pengeluaran per kategori.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[var(--c-text)]">Kategori</label>
            <Select value={watch('category_id')} onValueChange={(v) => setValue('category_id', v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih kategori pengeluaran" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category_id && <p className="text-xs text-[var(--c-accent-2)]">{errors.category_id.message}</p>}
          </div>

          <Input
            label="Jumlah Budget"
            type="number"
            placeholder="Contoh: 500000"
            error={errors.amount?.message}
            {...register('amount')}
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[var(--c-text)]">Periode</label>
            <Select value={selectedPeriod} onValueChange={(v) => setValue('period', v as 'monthly' | 'weekly')}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Bulanan</SelectItem>
                <SelectItem value="weekly">Mingguan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {isEditing ? 'Simpan Perubahan' : 'Tambah Budget'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
/* eslint-enable react-hooks/incompatible-library */
