'use client'

/* eslint-disable react-hooks/incompatible-library */

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Landmark, Calculator, CalendarDays, FileText, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
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

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v) }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-sm">
              <Landmark className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle>{isEditing ? 'Edit Utang' : 'Tambah Utang'}</DialogTitle>
              <DialogDescription>
                {isEditing ? 'Ubah detail pinjaman kamu.' : 'Catat pinjaman dan lacak pembayarannya.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverError && (
            <div className="flex items-start gap-2.5 rounded-xl border border-[var(--c-accent-2)] bg-[var(--c-accent-2)]/10 p-3.5 text-sm text-[var(--c-accent-2)]">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              {serverError}
            </div>
          )}

          <Input
            label="Nama Utang"
            placeholder="KPR Rumah, Pinjaman Motor..."
            error={undefined}
            {...register('name')}
          />

          <Input
            label="Kreditur"
            placeholder="Bank ABC, teman..."
            {...register('creditor')}
          />

          {/* Loan amount - prominent */}
          <div className="rounded-xl border border-[var(--c-border)] bg-[var(--c-surface)] p-4">
            <label className="block text-xs font-semibold text-[var(--c-text-muted)] uppercase tracking-wider mb-2">Jumlah Pinjaman</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--c-text-muted)]">Rp</span>
              <input
                type="number"
                placeholder="0"
                className="flex h-12 w-full rounded-xl border border-[var(--c-border)] bg-white text-[var(--c-text)] pl-8 pr-3 text-xl font-bold shadow-sm transition-all dark:bg-[#2e333b] placeholder:text-[var(--c-text-muted)]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--c-accent)]/30 focus-visible:border-[var(--c-accent)]"
                {...register('total_amount')}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Calculator className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />
                <label className="text-sm font-medium text-[var(--c-text)]">Bunga (%/tahun)</label>
              </div>
              <Input type="number" step="0.01" placeholder="0" {...register('interest_rate')} />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />
                <label className="text-sm font-medium text-[var(--c-text)]">Tenor (bulan)</label>
              </div>
              <Input type="number" placeholder="12" {...register('tenure_months')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Sisa Saldo (Rp)" type="number" placeholder="= jumlah pinjaman" {...register('remaining_balance')} />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[var(--c-text)]">Tgl Jatuh Tempo</label>
              <Input type="number" min={1} max={28} placeholder="1-28" {...register('due_day')} />
            </div>
          </div>

          <Input label="Tanggal Mulai" type="date" {...register('start_date')} />

          {/* Estimation preview */}
          {totalAmount > 0 && tenureMonths > 0 && (
            <div className="rounded-xl bg-orange-500/10 border border-orange-500/20 p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                <Calculator className="h-3.5 w-3.5" />
                Estimasi Cicilan
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <p className="text-[10px] text-[var(--c-text-muted)]">Cicilan/bulan</p>
                  <p className="text-base font-bold text-[var(--c-text)] tabular-nums">
                    Rp {Math.round(estimatedMonthly).toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-[var(--c-text-muted)]">Total bayar</p>
                  <p className="text-base font-bold text-[var(--c-text)] tabular-nums">
                    Rp {Math.round(totalPayment).toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-[var(--c-text-muted)]">Total bunga</p>
                  <p className="text-base font-bold text-[var(--c-accent-2)] tabular-nums">
                    Rp {Math.round(totalInterest).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />
            <Input label="Catatan" placeholder="Opsional..." {...register('note')} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => { reset(); onOpenChange(false) }}>
              Batal
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading} className="shadow-sm shadow-orange-500/20">
              {isLoading ? 'Menyimpan...' : isEditing ? 'Simpan' : 'Tambah'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/* eslint-enable react-hooks/incompatible-library */
