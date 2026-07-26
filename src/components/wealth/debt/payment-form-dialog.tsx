'use client'

/* eslint-disable react-hooks/incompatible-library */

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { useCreateDebtPayment, useUpdateDebt } from '@/lib/queries/debt-queries'
import { formatRupiah } from '@/lib/services/wealth.service'
import type { DebtRow } from '@/lib/types/wealth'

const paymentSchema = z.object({
  amount: z.coerce.number().min(1, 'Minimal Rp 1'),
  date: z.string().default(new Date().toISOString().split('T')[0]),
  note: z.string().optional().default(''),
})

type PaymentFormValues = z.infer<typeof paymentSchema>

interface PaymentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  debt: DebtRow | null
}

export function PaymentFormDialog({ open, onOpenChange, debt }: PaymentFormDialogProps) {
  const { user } = useAuth()
  const createPayment = useCreateDebtPayment()
  const updateDebt = useUpdateDebt()
  const [serverError, setServerError] = useState('')

  const { register, handleSubmit, reset, watch } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: debt ? Number(debt.monthly_payment) : 0,
      date: new Date().toISOString().split('T')[0],
      note: '',
    },
  })

  const watchedAmount = watch('amount')
  const remaining = debt ? Number(debt.remaining_balance) : 0
  const afterPayment = remaining - (watchedAmount || 0)
  const willBePaidOff = afterPayment <= 0

  const onSubmit = (values: PaymentFormValues) => {
    if (!user?.id || !debt) return
    setServerError('')

    const payAmount = Math.min(values.amount, remaining)
    const newRemaining = Math.max(remaining - payAmount, 0)

    createPayment.mutate(
      {
        user_id: user.id,
        debt_id: debt.id,
        amount: payAmount,
        date: values.date,
        note: values.note || null,
      },
      {
        onSuccess: () => {
          if (newRemaining === 0) {
            updateDebt.mutate({
              id: debt.id,
              payload: {
                remaining_balance: 0,
                is_paid_off: true,
                paid_off_at: new Date().toISOString(),
              },
            })
          } else {
            updateDebt.mutate({
              id: debt.id,
              payload: { remaining_balance: newRemaining },
            })
          }
          onOpenChange(false)
          reset()
        },
        onError: (err) => setServerError(err.message),
      },
    )
  }

  const isLoading = createPayment.isPending || updateDebt.isPending

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v) }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-h2">Bayar Cicilan</DialogTitle>
        </DialogHeader>
        {debt && (
          <div className="bg-[var(--c-surface)] rounded-[var(--radius-md)] p-3 space-y-1">
            <p className="text-xs font-medium text-[var(--c-text)]">{debt.name}</p>
            <div className="flex justify-between text-[10px] text-[var(--c-text-muted)]">
              <span>Sisa saldo</span>
              <span className="tabular-nums font-medium text-[var(--c-text)]">{formatRupiah(remaining)}</span>
            </div>
            <div className="flex justify-between text-[10px] text-[var(--c-text-muted)]">
              <span>Cicilan/bulan</span>
              <span className="tabular-nums">{formatRupiah(Number(debt.monthly_payment))}</span>
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverError && (
            <div className="text-xs text-[var(--c-accent-2)] bg-red-500/10 p-2 rounded-[var(--radius-sm)]">
              {serverError}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--c-text)]">Jumlah Bayar (Rp) *</label>
            <Input
              type="number"
              placeholder={String(debt ? debt.monthly_payment : '')}
              {...register('amount')}
            />
          </div>

          {watchedAmount > 0 && (
            <div className="bg-[var(--c-surface)] rounded-[var(--radius-md)] p-3 text-center space-y-1">
              <p className="text-[10px] text-[var(--c-text-muted)]">Sisa setelah bayar</p>
              <p className={cn(
                'text-lg font-bold tabular-nums',
                willBePaidOff ? 'text-emerald-500' : 'text-[var(--c-text)]',
              )}>
                {willBePaidOff ? 'LUNAS!' : formatRupiah(afterPayment)}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--c-text)]">Tanggal</label>
              <Input type="date" {...register('date')} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--c-text)]">Catatan</label>
              <Input placeholder="Opsional" {...register('note')} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => { reset(); onOpenChange(false) }}>
              Batal
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? 'Menyimpan...' : 'Bayar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/* eslint-enable react-hooks/incompatible-library */
