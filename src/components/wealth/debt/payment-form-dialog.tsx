'use client'

/* eslint-disable react-hooks/incompatible-library */

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreditCard, AlertCircle, CheckCircle2, CalendarDays, FileText } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
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
  const progress = debt ? Math.max(0, (1 - remaining / Number(debt.total_amount)) * 100) : 0

  const onSubmit = (values: PaymentFormValues) => {
    if (!user?.id) {
      alert('Kamu belum login atau sesi sudah habis. Silakan login ulang.')
      return
    }
    if (!debt) return
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
              payload: { remaining_balance: 0, is_paid_off: true, paid_off_at: new Date().toISOString() },
            })
          } else {
            updateDebt.mutate({ id: debt.id, payload: { remaining_balance: newRemaining } })
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
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-sm">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle>Bayar Cicilan</DialogTitle>
              <DialogDescription>
                Catat pembayaran cicilan kamu.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {debt && (
          <div className="rounded-xl border border-[var(--c-border)]/50 bg-[var(--c-surface)]/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[var(--c-text)]">{debt.name}</p>
              <span className={cn(
                'text-[10px] font-bold px-2 py-0.5 rounded-full',
                debt.is_paid_off
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
              )}>
                {debt.is_paid_off ? 'LUNAS' : 'AKTIF'}
              </span>
            </div>
            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-[var(--c-text-muted)]">
                <span>Progres</span>
                <span className="font-semibold text-[var(--c-text)]">{progress.toFixed(0)}%</span>
              </div>
              <div className="h-2 rounded-full bg-[var(--c-border)]/30 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-500"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-white/60 dark:bg-white/5 p-2.5">
                <p className="text-[10px] text-[var(--c-text-muted)]">Sisa saldo</p>
                <p className="text-sm font-bold text-[var(--c-text)] tabular-nums">{formatRupiah(remaining)}</p>
              </div>
              <div className="rounded-lg bg-white/60 dark:bg-white/5 p-2.5">
                <p className="text-[10px] text-[var(--c-text-muted)]">Cicilan/bulan</p>
                <p className="text-sm font-bold text-[var(--c-text)] tabular-nums">{formatRupiah(Number(debt.monthly_payment))}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverError && (
            <div className="flex items-start gap-2.5 rounded-xl border border-[var(--c-accent-2)]/20 bg-[var(--c-accent-2)]/5 p-3.5 text-sm text-[var(--c-accent-2)]">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              {serverError}
            </div>
          )}

          {/* Amount input - prominent */}
          <div className="rounded-xl border border-[var(--c-border)]/50 bg-[var(--c-surface)]/50 p-4">
            <label className="block text-xs font-semibold text-[var(--c-text-muted)] uppercase tracking-wider mb-2">Jumlah Bayar</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--c-text-muted)]">Rp</span>
              <input
                type="number"
                placeholder={String(debt ? debt.monthly_payment : '')}
                className="flex h-12 w-full rounded-xl border border-[var(--c-border)]/50 bg-white pl-8 pr-3 text-xl font-bold shadow-sm transition-all dark:bg-[#2e333b] placeholder:text-[var(--c-text-muted)]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500"
                {...register('amount')}
              />
            </div>
          </div>

          {watchedAmount > 0 && (
            <div className={cn(
              'rounded-xl p-4 text-center space-y-1 border transition-all',
              willBePaidOff
                ? 'bg-emerald-500/5 border-emerald-500/20'
                : 'bg-[var(--c-surface)]/50 border-[var(--c-border)]/50'
            )}>
              {willBePaidOff ? (
                <>
                  <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-1" />
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">LUNAS!</p>
                  <p className="text-xs text-[var(--c-text-muted)]">Utang akan ditandai lunas</p>
                </>
              ) : (
                <>
                  <p className="text-xs text-[var(--c-text-muted)]">Sisa setelah bayar</p>
                  <p className="text-lg font-bold text-[var(--c-text)] tabular-nums">{formatRupiah(afterPayment)}</p>
                </>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />
                <label className="text-sm font-medium text-[var(--c-text)]">Tanggal</label>
              </div>
              <Input type="date" {...register('date')} />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />
                <label className="text-sm font-medium text-[var(--c-text)]">Catatan</label>
              </div>
              <Input placeholder="Opsional" {...register('note')} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => { reset(); onOpenChange(false) }}>
              Batal
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading} className="shadow-sm shadow-emerald-500/20">
              {isLoading ? 'Menyimpan...' : 'Bayar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/* eslint-enable react-hooks/incompatible-library */
