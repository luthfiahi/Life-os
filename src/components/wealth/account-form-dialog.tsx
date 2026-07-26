'use client'

import { useEffect, useState } from 'react'
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
    if (!user?.id) return
    try {
      if (isEditing && account) {
        await updateAccount.mutateAsync({
          id: account.id,
          payload: values,
        })
      } else {
        await createAccount.mutateAsync({
          user_id: user.id,
          ...values,
        })
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
          <DialogTitle>{isEditing ? 'Edit Akun' : 'Tambah Akun Baru'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Ubah detail akun keuangan kamu.' : 'Tambahkan akun keuangan baru untuk melacak saldo.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nama Akun"
            placeholder="Contoh: BCA, GoPay, Dompet"
            error={errors.name?.message}
            {...register('name')}
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[var(--c-text)]">Tipe Akun</label>
            <Select value={selectedType} onValueChange={(v) => setValue('type', v as AccountType)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank">Bank</SelectItem>
                <SelectItem value="cash">Tunai</SelectItem>
                <SelectItem value="ewallet">E-Wallet</SelectItem>
                <SelectItem value="investment">Investasi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Input
            label="Saldo Awal"
            type="number"
            placeholder="0"
            error={errors.balance?.message}
            {...register('balance')}
          />

          <Input
            label="Warna (opsional)"
            placeholder="Contoh: #10b981"
            {...register('color')}
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {isEditing ? 'Simpan Perubahan' : 'Tambah Akun'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
/* eslint-enable react-hooks/incompatible-library */
