'use client'

/* eslint-disable react-hooks/incompatible-library */

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/use-auth'
import { useCreateDebt, useUpdateDebt } from '@/lib/queries/debt-queries'
import type { DebtRow } from '@/lib/types/wealth'

const debtSchema = z.object({
  name: z.string().min(1, 'Nama utang wajib diisi'),
  creditor: z.string().default(''),
  total_amount: z.coerce.number().min(1000, 'Minimal Rp 1.000'),
  interest_rate: z.coerce.number().min(0).max(100).default(0),
  tenure_months: z.coerce.number().min(1, 'Minimal 1 bulan'),
  remaining_balance: z.coerce.number().min(0).default(0),
  start_date: z.string().default(new Date().toISOString().split('T')[0]),
  due_day: z.coerce.number().min(1).max(28).default(1),
  note: z.string().optional().default(''),
})

type DebtFormValues = z.infer<typeof debtSchema>

interface DebtFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editDebt?: DebtRow | null
}

export function DebtFormDialog({ open, onOpenChange, editDebt }: DebtFormDialogProps) {
  const { user } = useAuth()
  const createDebt = useCreateDebt()
  const updateDebt = useUpdateDebt()
  const [serverError, setServerError] = useState('')

  const isEditing = !!editDebt

  const { register, handleSubmit, reset, watch } = useForm<DebtFormValues>({
    resolver: zodResolver(debtSchema),
    defaultValues: editDebt
      ? {
          name: editDebt.name,
          creditor: editDebt.creditor,
          total_amount: Number(editDebt.total_amount),
          interest_rate: Number(editDebt.interest_rate),
          tenure_months: editDebt.tenure_months,
          remaining_balance: Number(editDebt.remaining_balance),
          start_date: editDebt.start_date,
          due_day: editDebt.due_day,
          note: editDebt.note ?? '',
        }
      : {
          name: '',
          creditor: '',
          total_amount: 0,
          interest_rate: 0,
          tenure_months: 1,
          remaining_balance: 0,
          start_date: new Date().toISOString().split('T')[0],
          due_day: 1,
          note: '',
        },
  })

  const totalAmount = watch('total_amount')
  const interestRate = watch('interest_rate')
  const tenureMonths = watch('tenure_months')
  const remainingBalance = watch('remaining_balance')

  // Calculate estimated monthly payment on client
  const estimatedMonthly = (() => {
    const P = totalAmount || 0
    const r = (interestRate || 0) / 100 / 12
    const n = tenureMonths || 1
    if (r === 0) return P / n
    return (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
  })()

  const onSubmit = (values: DebtFormValues) => {
    if (!user?.id) return
    setServerError('')

    const payload = {
      ...values,
      remaining_balance: values.remaining_balance || values.total_amount,
      user_id: user.id,
    }

    if (isEditing && editDebt) {
      updateDebt.mutate(
        { id: editDebt.id, payload },
        {
          onSuccess: () => {
            onOpenChange(false)
            reset()
          },
          onError: (err) => setServerError(err.message),
        },
      )
    } else {
      createDebt.mutate(payload, {
        onSuccess: () => {
          onOpenChange(false)
          reset()
        },
        onError: (err) => setServerError(err.message),
      })
    }
  }

  const isLoading = createDebt.isPending || updateDebt.isPending

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v) }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-h2">
            {isEditing ? 'Edit Utang' : 'Tambah Utang'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverError && (
            <div className="text-xs text-[var(--c-accent-2)] bg-red-500/10 p-2 rounded-[var(--radius-sm)]">
              {serverError}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--c-text)]">Nama Utang *</label>
            <Input placeholder="KPR Rumah, Pinjaman Motor..." {...register('name')} />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--c-text)]">Kreditur</label>
            <Input placeholder="Bank ABC, teman..." {...register('creditor')} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--c-text)]">Jumlah Pinjaman (Rp) *</label>
              <Input type="number" placeholder="10000000" {...register('total_amount')} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--c-text)]">Bunga (%) / tahun</label>
              <Input type="number" step="0.01" placeholder="0" {...register('interest_rate')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--c-text)]">Tenor (bulan) *</label>
              <Input type="number" placeholder="12" {...register('tenure_months')} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--c-text)]">Sisa Saldo (Rp)</label>
              <Input type="number" placeholder="= jumlah pinjaman" {...register('remaining_balance')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--c-text)]">Tanggal Mulai</label>
              <Input type="date" {...register('start_date')} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--c-text)]">Tgl Jatuh Tempo</label>
              <Input type="number" min={1} max={28} placeholder="1-28" {...register('due_day')} />
            </div>
          </div>

          {/* Preview monthly payment */}
          {totalAmount > 0 && tenureMonths > 0 && (
            <div className="bg-[var(--c-surface)] rounded-[var(--radius-md)] p-3 text-center">
              <p className="text-[10px] text-[var(--c-text-muted)]">Estimasi cicilan/bulan</p>
              <p className="text-lg font-bold text-[var(--c-text)] tabular-nums">
                Rp {Math.round(estimatedMonthly).toLocaleString('id-ID')}
              </p>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--c-text)]">Catatan</label>
            <Input placeholder="Opsional..." {...register('note')} />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => { reset(); onOpenChange(false) }}>
              Batal
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? 'Menyimpan...' : isEditing ? 'Simpan' : 'Tambah'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/* eslint-enable react-hooks/incompatible-library */
