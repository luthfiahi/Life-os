'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Building2, Wallet, Smartphone, TrendingUp, Palette, PenLine, Coins, AlertCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { useCreateAccount, useUpdateAccount } from '@/lib/queries/wealth-queries'
import type { AccountRow, AccountType } from '@/lib/types/wealth'

const accountSchema = z.object({
  name: z.string().min(1, 'Nama akun wajib diisi'),
  type: z.enum(['bank', 'cash', 'ewallet', 'investment'] as const),
  balance: z.coerce.number().min(0, 'Saldo tidak boleh negatif'),
  color: z.string().optional(),
})

type AccountFormValues = z.infer<typeof accountSchema>

interface AccountFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  account?: AccountRow | null
}

const accountTypeConfig: Record<AccountType, { label: string; gradient: string }> = {
  bank: { label: 'Bank', gradient: 'from-blue-500 to-blue-600' },
  cash: { label: 'Tunai', gradient: 'from-emerald-500 to-emerald-600' },
  ewallet: { label: 'E-Wallet', gradient: 'from-violet-500 to-violet-600' },
  investment: { label: 'Investasi', gradient: 'from-amber-500 to-amber-600' },
}

function TypeIcon({ type, className }: { type: AccountType; className?: string }) {
  const cls = className || 'h-4 w-4 text-white'
  switch (type) {
    case 'bank': return <Building2 className={cls} />
    case 'cash': return <Wallet className={cls} />
    case 'ewallet': return <Smartphone className={cls} />
    case 'investment': return <TrendingUp className={cls} />
  }
}

/* eslint-disable react-hooks/incompatible-library */
export function AccountFormDialog({ open, onOpenChange, account }: AccountFormDialogProps) {
  const { user } = useAuth()
  const createAccount = useCreateAccount()
  const updateAccount = useUpdateAccount()
  const isEditing = !!account

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: '',
      type: 'bank',
      balance: 0,
      color: '',
    },
  })

  useEffect(() => {
    if (account) {
      reset({
        name: account.name,
        type: account.type,
        balance: Number(account.balance),
        color: account.color ?? '',
      })
    } else {
      reset({ name: '', type: 'bank', balance: 0, color: '' })
    }
  }, [account, reset])

  const selectedType = watch('type')
  const watchedColor = watch('color')
  const isSubmitting = createAccount.isPending || updateAccount.isPending

  async function onSubmit(values: AccountFormValues) {
    if (!user?.id) {
      alert('Kamu belum login atau sesi sudah habis. Silakan login ulang.')
      return
    }
    try {
      if (isEditing && account) {
        await updateAccount.mutateAsync({ id: account.id, payload: values })
      } else {
        await createAccount.mutateAsync({ user_id: user.id, ...values })
      }
      onOpenChange(false)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan akun'
      alert(msg)
    }
  }

  const config = accountTypeConfig[selectedType]

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
      <DialogContent className="flex flex-col gap-0 overflow-hidden p-0 sm:max-w-[480px] max-h-[97dvh] sm:max-h-[92vh]">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">

          <div className="flex-shrink-0 px-6 pt-6 pb-4">
            <div className="flex items-center gap-4">
              <div className={cn(
                'h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 flex-shrink-0 bg-gradient-to-br',
                config.gradient,
              )}>
                <TypeIcon type={selectedType} className="h-6 w-6 text-white" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-xl font-bold tracking-tight">
                  {isEditing ? 'Edit Akun' : 'Tambah Akun Baru'}
                </DialogTitle>
                <DialogDescription className="text-sm mt-0.5">
                  {isEditing ? 'Ubah detail akun keuangan kamu.' : 'Tambahkan akun baru untuk melacak saldo.'}
                </DialogDescription>
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 pb-6 space-y-6">

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-[var(--c-text)]">
                <Wallet className="h-4 w-4 text-[var(--c-text-muted)]" />
                Tipe Akun
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(Object.keys(accountTypeConfig) as AccountType[]).map((type) => {
                  const tc = accountTypeConfig[type]
                  const isActive = selectedType === type
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setValue('type', type)}
                      className={cn(
                        'flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all duration-200',
                        isActive
                          ? 'border-[var(--c-accent)] bg-[var(--c-accent)]/10 shadow-sm'
                          : 'border-[var(--c-border)] bg-[var(--c-surface)] hover:border-[var(--c-text-muted)]',
                      )}
                    >
                      <div className={cn(
                        'h-8 w-8 rounded-lg bg-gradient-to-br flex items-center justify-center transition-transform',
                        tc.gradient,
                        isActive ? 'scale-110' : 'scale-100',
                      )}>
                        <TypeIcon type={type} />
                      </div>
                      <span className={cn(
                        'text-[10px] font-semibold',
                        isActive ? 'text-[var(--c-accent)]' : 'text-[var(--c-text-muted)]',
                      )}>
                        {tc.label}
                      </span>
                    </button>
                  )
                })}
              </div>
              <p className="text-xs text-[var(--c-text-muted)] pl-1">Pilih jenis akun keuangan.</p>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-[var(--c-text)]">
                <PenLine className="h-4 w-4 text-[var(--c-text-muted)]" />
                Nama Akun
              </label>
              <input
                type="text"
                placeholder="Contoh: BCA, GoPay, Dompet"
                className={cn('h-12', inputBase, errors.name && inputError)}
                style={inputStyle}
                {...register('name')}
              />
              <p className="text-xs text-[var(--c-text-muted)] pl-1">Nama yang mudah dikenali untuk akun ini.</p>
              {errors.name && (
                <p className="flex items-center gap-1 text-xs text-red-500 pl-1" role="alert">
                  <AlertCircle className="h-3 w-3 flex-shrink-0" />
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-[var(--c-text)]">
                <Coins className="h-4 w-4 text-[var(--c-text-muted)]" />
                Saldo Awal
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--c-text-muted)] select-none pointer-events-none">Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  className={cn(inputBase, 'h-12 !pl-10 pr-4 !text-lg font-bold tabular-nums', errors.balance && inputError)}
                  style={inputStyle}
                  {...register('balance')}
                />
              </div>
              <p className="text-xs text-[var(--c-text-muted)] pl-1">Saldo saat ini pada akun tersebut.</p>
              {errors.balance && (
                <p className="flex items-center gap-1 text-xs text-red-500 pl-1" role="alert">
                  <AlertCircle className="h-3 w-3 flex-shrink-0" />
                  {errors.balance.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-[var(--c-text)]">
                <Palette className="h-4 w-4 text-[var(--c-text-muted)]" />
                Warna <span className="text-xs font-normal text-[var(--c-text-muted)]">(opsional)</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="#10b981"
                  className={cn('h-12 flex-1', inputBase)}
                  style={inputStyle}
                  {...register('color')}
                />
                <div className="flex gap-1.5">
                  {['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setValue('color', c)}
                      className={cn(
                        'h-8 w-8 rounded-full border-2 transition-all hover:scale-110',
                        watchedColor === c ? 'border-[var(--c-text)] scale-110 ring-2 ring-[var(--c-text)]/20' : 'border-transparent',
                      )}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs text-[var(--c-text-muted)] pl-1">Pilih warna untuk membedakan akun.</p>
            </div>

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
                className="rounded-xl h-11 px-6 shadow-lg shadow-[var(--c-accent)]/20"
              >
                {isEditing ? 'Simpan Perubahan' : 'Tambah Akun'}
              </Button>
            </div>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  )
}
/* eslint-enable react-hooks/incompatible-library */