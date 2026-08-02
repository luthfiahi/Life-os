'use client'

/* eslint-disable react-hooks/incompatible-library */

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Landmark, Calculator, CalendarDays, FileText, AlertCircle, PenLine, User, Coins, Calendar, Hash, StickyNote } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
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

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<DebtFormValues>({
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

  const estimatedMonthly = (() => {
    const P = totalAmount || 0
    const r = (interestRate || 0) / 100 / 12
    const n = tenureMonths || 1
    if (r === 0) return P / n
    return (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
  })()

  const totalPayment = estimatedMonthly * (tenureMonths || 1)
  const totalInterest = totalPayment - (totalAmount || 0)

  const onSubmit = (values: DebtFormValues) => {
    if (!user?.id) {
      alert('Kamu belum login atau sesi sudah habis. Silakan login ulang.')
      return
    }
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
          onSuccess: () => { onOpenChange(false); reset() },
          onError: (err) => setServerError(err.message),
        },
      )
    } else {
      createDebt.mutate(payload, {
        onSuccess: () => { onOpenChange(false); reset() },
        onError: (err) => setServerError(err.message),
      })
    }
  }

  const isLoading = createDebt.isPending || updateDebt.isPending

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
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v) }}>
      <DialogContent className="flex flex-col gap-0 overflow-hidden p-0 sm:max-w-[560px] max-h-[97dvh] sm:max-h-[92vh]">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">

          
          <div className="flex-shrink-0 px-6 pt-6 pb-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg transition-all duration-300 flex-shrink-0">
                <Landmark className="h-6 w-6 text-white" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-xl font-bold tracking-tight">
                  {isEditing ? 'Edit Utang' : 'Tambah Utang'}
                </DialogTitle>
                <DialogDescription className="text-sm mt-0.5">
                  {isEditing ? 'Ubah detail pinjaman kamu.' : 'Catat pinjaman dan lacak pembayarannya.'}
                </DialogDescription>
              </div>
            </div>
          </div>

          
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 pb-6 space-y-6">

            {serverError && (
              <div className="flex items-start gap-2.5 rounded-xl border border-[var(--c-accent-2)] bg-[var(--c-accent-2)]/10 p-3.5 text-sm text-[var(--c-accent-2)]">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                {serverError}
              </div>
            )}

            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-[var(--c-text)]">
                  <PenLine className="h-4 w-4 text-[var(--c-text-muted)]" />
                  Nama Utang
                </label>
                <input
                  type="text"
                  placeholder="KPR Rumah, Pinjaman..."
                  className={cn('h-12', inputBase, errors.name && inputError)}
                  style={inputStyle}
                  {...register('name')}
                />
                <p className="text-xs text-[var(--c-text-muted)] pl-1">Nama pinjaman yang mudah dikenali.</p>
                {errors.name && (
                  <p className="flex items-center gap-1 text-xs text-red-500 pl-1" role="alert">
                    <AlertCircle className="h-3 w-3 flex-shrink-0" />
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-[var(--c-text)]">
                  <User className="h-4 w-4 text-[var(--c-text-muted)]" />
                  Kreditur
                </label>
                <input
                  type="text"
                  placeholder="Bank ABC, teman..."
                  className={cn('h-12', inputBase)}
                  style={inputStyle}
                  {...register('creditor')}
                />
                <p className="text-xs text-[var(--c-text-muted)] pl-1">Pihak yang memberi pinjaman.</p>
              </div>
            </div>

            
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-[var(--c-text-muted)] uppercase tracking-wider">
                <Coins className="h-3.5 w-3.5" />
                Jumlah Pinjaman
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-[var(--c-text-muted)] select-none pointer-events-none">Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  className={cn(
                    inputBase,
                    'h-14 !pl-12 pr-4 !text-2xl font-bold tabular-nums',
                    errors.total_amount && inputError,
                  )}
                  style={inputStyle}
                  {...register('total_amount')}
                />
              </div>
              <p className="text-xs text-[var(--c-text-muted)] pl-1">Total jumlah yang dipinjam.</p>
              {errors.total_amount && (
                <p className="flex items-center gap-1 text-xs text-red-500 pl-1" role="alert">
                  <AlertCircle className="h-3 w-3 flex-shrink-0" />
                  {errors.total_amount.message}
                </p>
              )}
            </div>

            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-[var(--c-text)]">
                  <Calculator className="h-4 w-4 text-[var(--c-text-muted)]" />
                  Bunga (%/tahun)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0"
                  className={cn('h-12', inputBase)}
                  style={inputStyle}
                  {...register('interest_rate')}
                />
                <p className="text-xs text-[var(--c-text-muted)] pl-1">Tarif bunga per tahun.</p>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-[var(--c-text)]">
                  <CalendarDays className="h-4 w-4 text-[var(--c-text-muted)]" />
                  Tenor (bulan)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="12"
                  className={cn('h-12', inputBase, errors.tenure_months && inputError)}
                  style={inputStyle}
                  {...register('tenure_months')}
                />
                <p className="text-xs text-[var(--c-text-muted)] pl-1">Durasi cicilan.</p>
                {errors.tenure_months && (
                  <p className="flex items-center gap-1 text-xs text-red-500 pl-1" role="alert">
                    <AlertCircle className="h-3 w-3 flex-shrink-0" />
                    {errors.tenure_months.message}
                  </p>
                )}
              </div>
            </div>

            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-[var(--c-text)]">
                  <Hash className="h-4 w-4 text-[var(--c-text-muted)]" />
                  Sisa Saldo (Rp)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="= jumlah pinjaman"
                  className={cn('h-12', inputBase)}
                  style={inputStyle}
                  {...register('remaining_balance')}
                />
                <p className="text-xs text-[var(--c-text-muted)] pl-1">Kosongkan jika sama dengan pinjaman.</p>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-[var(--c-text)]">
                  <Calendar className="h-4 w-4 text-[var(--c-text-muted)]" />
                  Tgl Jatuh Tempo
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="1-28"
                  className={cn('h-12', inputBase)}
                  style={inputStyle}
                  {...register('due_day')}
                />
                <p className="text-xs text-[var(--c-text-muted)] pl-1">Tanggal bayar cicilan tiap bulan.</p>
              </div>
            </div>

            
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-[var(--c-text)]">
                <Calendar className="h-4 w-4 text-[var(--c-text-muted)]" />
                Tanggal Mulai
              </label>
              <input
                type="date"
                className={cn('h-12', inputBase)}
                style={inputStyle}
                {...register('start_date')}
              />
              <p className="text-xs text-[var(--c-text-muted)] pl-1">Tanggal pertama kali cicilan.</p>
            </div>

            
            {totalAmount > 0 && tenureMonths > 0 && (
              <div className="rounded-2xl bg-orange-500/10 border border-orange-500/20 p-5 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                  <Calculator className="h-3.5 w-3.5" />
                  Estimasi Cicilan
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-[11px] font-semibold text-[var(--c-text-muted)] mb-1">Cicilan/bulan</p>
                    <p className="text-lg font-bold text-[var(--c-text)] tabular-nums">
                      Rp {Math.round(estimatedMonthly).toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[11px] font-semibold text-[var(--c-text-muted)] mb-1">Total bayar</p>
                    <p className="text-lg font-bold text-[var(--c-text)] tabular-nums">
                      Rp {Math.round(totalPayment).toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[11px] font-semibold text-[var(--c-text-muted)] mb-1">Total bunga</p>
                    <p className="text-lg font-bold text-[var(--c-accent-2)] tabular-nums">
                      Rp {Math.round(totalInterest).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-[var(--c-text)]">
                <StickyNote className="h-4 w-4 text-[var(--c-text-muted)]" />
                Catatan <span className="text-xs font-normal text-[var(--c-text-muted)]">(opsional)</span>
              </label>
              <input
                type="text"
                placeholder="Opsional..."
                className={cn('h-12', inputBase)}
                style={inputStyle}
                {...register('note')}
              />
              <p className="text-xs text-[var(--c-text-muted)] pl-1">Info tambahan tentang pinjaman.</p>
            </div>

          </div>

          
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
                className="rounded-xl h-11 px-6 shadow-lg shadow-orange-500/20"
              >
                {isEditing ? 'Simpan Perubahan' : 'Tambah Utang'}
              </Button>
            </div>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  )
}

/* eslint-enable react-hooks/incompatible-library */
