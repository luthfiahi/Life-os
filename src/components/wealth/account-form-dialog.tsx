'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Building2, Wallet, Smartphone, TrendingUp, Palette } from 'lucide-react'
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={"h-10 w-10 rounded-xl bg-gradient-to-br " + config.gradient + " flex items-center justify-center shadow-sm"}>
              <TypeIcon type={selectedType} className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle>{isEditing ? 'Edit Akun' : 'Tambah Akun Baru'}</DialogTitle>
              <DialogDescription>
                {isEditing ? 'Ubah detail akun keuangan kamu.' : 'Tambahkan akun baru untuk melacak saldo.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Account Type Selector - Visual Cards */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--c-text)]">Tipe Akun</label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(accountTypeConfig) as AccountType[]).map((type) => {
                const tc = accountTypeConfig[type]
                const isActive = selectedType === type
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setValue('type', type)}
                    className={"flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all duration-200 " + (isActive ? "border-[var(--c-accent)] bg-[var(--c-accent)]/5 shadow-sm" : "border-[var(--c-border)]/50 bg-[var(--c-surface)]/50 hover:border-[var(--c-border)]")}
                  >
                    <div className={"h-8 w-8 rounded-lg bg-gradient-to-br " + tc.gradient + " flex items-center justify-center transition-transform " + (isActive ? 'scale-110' : 'scale-100')}>
                      <TypeIcon type={type} />
                    </div>
                    <span className={"text-[10px] font-semibold " + (isActive ? 'text-[var(--c-accent)]' : 'text-[var(--c-text-muted)]')}>
                      {tc.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <Input
            label="Nama Akun"
            placeholder="Contoh: BCA, GoPay, Dompet"
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="Saldo Awal"
            type="number"
            placeholder="0"
            error={errors.balance?.message}
            {...register('balance')}
          />

          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Palette className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />
              <label className="block text-sm font-medium text-[var(--c-text)]">Warna (opsional)</label>
            </div>
            <div className="flex items-center gap-3">
              <Input
                placeholder="#10b981"
                className="flex-1"
                {...register('color')}
              />
              <div className="flex gap-1.5">
                {['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setValue('color', c)}
                    className={"h-7 w-7 rounded-full border-2 transition-all hover:scale-110 " + (watch('color') === c ? 'border-[var(--c-text)] scale-110' : 'border-transparent')}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" loading={isSubmitting} className="shadow-sm shadow-[var(--c-accent)]/20">
              {isEditing ? 'Simpan Perubahan' : 'Tambah Akun'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
/* eslint-enable react-hooks/incompatible-library */
