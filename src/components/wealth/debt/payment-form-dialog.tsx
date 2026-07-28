'use client'

/* eslint-disable react-hooks/incompatible-library */

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreditCard, AlertCircle, CheckCircle2, CalendarDays, StickyNote, Hash } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
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

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<PaymentFormValues>({
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

  /* - Shared Styles - */
  const inputBase = cn(
    'flex w-full rounded-xl border border-[var(--c-border)] bg-white px-4 text-sm shadow-sm',
    'transition-all duration-200 dark:bg-[#2e333b]',
    'placeholder:text-[var(--c-text-muted)]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500',
  )
  const inputError = 'border-red-500 focus-visible:ring-red-500/30 focus-visible:border-red-500'
  const inputStyle = { color: 'var(--c-text)' }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v) }}>
      <DialogContent className="flex flex-col gap-0 overflow-hidden p-0 sm:max-w-[480px] max-h-[97dvh] sm:max-h-[92vh]">

        {/* === HEADER === */}
        <div className="flex-shrink-0 px-6 pt-6 pb-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg transition-all duration-300 flex-shrink-0">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-xl font-bold tracking-tight">Bayar Cicilan</DialogTitle>
              <DialogDescription className="text-sm mt-0.5">Catat pembayaran cicilan kamu.</DialogDescription>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">

          {/* === SCROLLABLE CONTENT === */}
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 pb-6 space-y-6">

            {serverError && (
              <div className="flex items-start gap-2.5 rounded-xl border border-[var(--c-accent-2)] bg-[var(--c-accent-2)]/10 p-3.5 text-sm text-[var(--c-accent-2)]">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                {serverError}
              </div>
            )}

            {/* - Debt Info Card - */}
            {debt && (
              <div className="rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-[var(--c-text)]">{debt.name}</p>
                  <span className={cn(
                    'text-[10px] font-bold px-2.5 py-0.5 rounded-full',
                    debt.is_paid_off
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
                  )}>
                    {debt.is_paid_off ? 'LUNAS' : 'AKTIF'}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-[var(--c-text-muted)]">
                    <span>Progres</span>
                    <span className="font-semibold text-[var(--c-text)]">{progress.toFixed(0)}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-[var(--c-border)]/30 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-500"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-white/50 dark:bg-white/5 p-3">
                    <p className="text-[11px] font-semibold text-[var(--c-text-muted)] mb-0.5">Sisa saldo</p>
                    <p className="text-sm font-bold text-[var(--c-text)] tabular-nums">{formatRupiah(remaining)}</p>
                  </div>
                  <div className="rounded-xl bg-white/50 dark:bg-white/5 p-3">
                    <p className="text-[11px] font-semibold text-[var(--c-text-muted)] mb-0.5">Cicilan/bulan</p>
                    <p className="text-sm font-bold text-[var(--c-text)] tabular-nums">{formatRupiah(Number(debt.monthly_payment))}</p>
                  </div>
                </div>
              </div>
            )}

            {/* - Jumlah Bayar (prominent) - */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-[var(--c-text-muted)] uppercase tracking-wider">
                <Hash className="h-3.5 w-3.5" />
                Jumlah Bayar
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-[var(--c-text-muted)] select-none pointer-events-none">Rp</span>
                <input
                  type="number"
                  placeholder={String(debt ? debt.monthly_payment : '')}
                  className={cn(
                    'h-14 pl-12 pr-4 text-2xl font-bold tabular-nums',
                    inputBase,
                    errors.amount && inputError,
                  )}
                  style={inputStyle}
                  {...register('amount')}
                />
              </div>
              <p className="text-xs text-[var(--c-text-muted)] pl-1">Masukkan nominal yang ingin dibayar.</p>
              {errors.amount && (
                <p className="flex items-center gap-1 text-xs text-red-500 pl-1" role="alert">
                  <AlertCircle className="h-3 w-3 flex-shrink-0" />
                  {errors.amount.message}
                </p>
              )}
            </div>

            {/* - Payment Preview - */}
            {watchedAmount > 0 && (
              <div className={cn(
                'rounded-2xl p-5 text-center space-y-2 border transition-all',
                willBePaidOff
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-[var(--c-surface)] border-[var(--c-border)]',
              )}>
                {willBePaidOff ? (
                  <>
                    <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
                    <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">LUNAS!</p>
                    <p className="text-xs text-[var(--c-text-muted)]">Utang akan ditandai lunas setelah pembayaran ini.</p>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-[var(--c-text-muted)]">Sisa setelah bayar</p>
                    <p className="text-2xl font-bold text-[var(--c-text)] tabular-nums">{formatRupiah(afterPayment)}</p>
                    <p className="text-[11px] text-[var(--c-text-muted)]">
                      {progress.toFixed(0)}% → {Math.min(progress + (watchedAmount / Number(debt?.total_amount || 1)) * 100, 100).toFixed(0)}% progres
                    </p>
                  </>
                )}
              </div>
            )}

            {/* - Tanggal + Catatan - */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-[var(--c-text)]">
                  <CalendarDays className="h-4 w-4 text-[var(--c-text-muted)]" />
                  Tanggal
                </label>
                <input
                  type="date"
                  className={cn('h-12', inputBase)}
                  style={inputStyle}
                  {...register('date')}
                />
                <p className="text-xs text-[var(--c-text-muted)] pl-1">Tanggal pembayaran.</p>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-[var(--c-text)]">
                  <StickyNote className="h-4 w-4 text-[var(--c-text-muted)]" />
                  Catatan <span className="text-xs font-normal text-[var(--c-text-muted)]">(opsional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Opsional"
                  className={cn('h-12', inputBase)}
                  style={inputStyle}
                  {...register('note')}
                />
                <p className="text-xs text-[var(--c-text-muted)] pl-1">Info tambahan.</p>
              </div>
            </div>

          </div>

          {/* === FIXED FOOTER === */}
          <div className="flex-shrink-0 border-t border-[var(--c-border)] px-6 py-4">
            <div className="flex items-center gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => { reset(); onOpenChange(false) }}
                className="rounded-xl h-11 px-5"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="rounded-xl h-11 px-6 shadow-lg shadow-emerald-500/20"
              >
                {isLoading ? 'Menyimpan...' : 'Bayar Cicilan'}
              </Button>
            </div>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  )
}

/* eslint-enable react-hooks/incompatible-library */
