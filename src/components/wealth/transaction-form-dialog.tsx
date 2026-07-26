'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'
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
import { useAccounts, useCategories, useCreateCategory } from '@/lib/queries/wealth-queries'
import { useCreateTransaction, useUpdateTransaction } from '@/lib/queries/wealth-queries'
import { formatRupiah } from '@/lib/services/wealth.service'
import type { TransactionRow, TransactionType, CategoryType } from '@/lib/types/wealth'

const txSchema = z.object({
  type: z.enum(['income', 'expense'] as const),
  account_id: z.string().min(1, 'Pilih akun'),
  category_id: z.string().min(1, 'Pilih kategori'),
  amount: z.coerce.number().min(1, 'Jumlah harus lebih dari 0'),
  description: z.string().min(1, 'Deskripsi wajib diisi'),
  date: z.string().min(1, 'Tanggal wajib diisi'),
  note: z.string().optional(),
})

type TxFormValues = z.infer<typeof txSchema>

interface TransactionFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction?: TransactionRow | null
  defaultType?: TransactionType
}

/* eslint-disable react-hooks/incompatible-library */
export function TransactionFormDialog({ open, onOpenChange, transaction, defaultType }: TransactionFormDialogProps) {
  const { user } = useAuth()
  const createTx = useCreateTransaction()
  const updateTx = useUpdateTransaction()
  const { data: accounts } = useAccounts({ active: true })
  const txType = transaction?.type ?? defaultType ?? 'expense'
  const { data: categories } = useCategories(txType as CategoryType)
  const createCategory = useCreateCategory()

  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const isEditing = !!transaction

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TxFormValues>({
    resolver: zodResolver(txSchema),
    defaultValues: {
      type: defaultType ?? 'expense',
      account_id: '',
      category_id: '',
      amount: 0,
      description: '',
      date: new Date().toISOString().split('T')[0],
      note: '',
    },
  })

  const selectedType = watch('type')
  const selectedAccountId = watch('account_id')

  // Re-fetch categories when type changes
  useEffect(() => {
    if (open) {
      if (transaction) {
        reset({
          type: transaction.type,
          account_id: transaction.account_id,
          category_id: transaction.category_id ?? '',
          amount: Number(transaction.amount),
          description: transaction.description,
          date: transaction.date,
          note: transaction.note ?? '',
        })
      } else {
        reset({
          type: defaultType ?? 'expense',
          account_id: '',
          category_id: '',
          amount: 0,
          description: '',
          date: new Date().toISOString().split('T')[0],
          note: '',
        })
      }
      setShowNewCategory(false)
      setNewCategoryName('')
    }
  }, [open, transaction, defaultType, reset])

  const isSubmitting = createTx.isPending || updateTx.isPending

  async function handleAddCategory() {
    if (!user?.id || !newCategoryName.trim()) return
    try {
      const newCat = await createCategory.mutateAsync({
        user_id: user.id,
        name: newCategoryName.trim(),
        type: selectedType as CategoryType,
      })
      setValue('category_id', newCat.id)
      setNewCategoryName('')
      setShowNewCategory(false)
    } catch {
      // Error handled by mutation
    }
  }

  async function onSubmit(values: TxFormValues) {
    if (!user?.id) return
    try {
      if (isEditing && transaction) {
        await updateTx.mutateAsync({
          id: transaction.id,
          payload: values,
        })
      } else {
        await createTx.mutateAsync({
          user_id: user.id,
          ...values,
        })
      }
      onOpenChange(false)
    } catch {
      // Error handled by mutation
    }
  }

  const selectedAccount = accounts?.find((a) => a.id === selectedAccountId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Transaksi' : 'Tambah Transaksi Baru'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Ubah detail transaksi kamu.' : 'Catat pemasukan atau pengeluaran baru.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Type Toggle */}
          <div className="flex gap-2">
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-semibold rounded-[var(--radius-md)] border transition-colors ${selectedType === 'expense' ? 'bg-[var(--c-accent-2)]/10 border-[var(--c-accent-2)] text-[var(--c-accent-2)]' : 'bg-transparent border-[var(--c-border)] text-[var(--c-text-muted)] hover:bg-[var(--c-surface)]'}`}
              onClick={() => { setValue('type', 'expense'); setValue('category_id', '') }}
            >
              Pengeluaran
            </button>
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-semibold rounded-[var(--radius-md)] border transition-colors ${selectedType === 'income' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' : 'bg-transparent border-[var(--c-border)] text-[var(--c-text-muted)] hover:bg-[var(--c-surface)]'}`}
              onClick={() => { setValue('type', 'income'); setValue('category_id', '') }}
            >
              Pemasukan
            </button>
          </div>

          {/* Amount - prominent */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[var(--c-text)]">Jumlah</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--c-text-muted)]">Rp</span>
              <input
                type="number"
                placeholder="0"
                className={cn(
                  'flex h-11 w-full rounded-[var(--radius-md)] border bg-transparent pl-8 pr-3 text-base font-semibold shadow-sm transition-colors',
                  'placeholder:text-[var(--c-text-muted)]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--c-accent)]/30 focus-visible:border-[var(--c-accent)]',
                  errors.amount ? 'border-[var(--c-accent-2)]' : 'border-[var(--c-border)]'
                )}
                {...register('amount')}
              />
            </div>
            {selectedAccount && (
              <p className="text-xs text-[var(--c-text-muted)]">
                Saldo: {formatRupiah(Number(selectedAccount.balance))}
              </p>
            )}
            {errors.amount && <p className="text-xs text-[var(--c-accent-2)]">{errors.amount.message}</p>}
          </div>

          {/* Account */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[var(--c-text)]">Akun</label>
            <Select value={selectedAccountId} onValueChange={(v) => setValue('account_id', v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih akun" />
              </SelectTrigger>
              <SelectContent>
                {accounts?.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.account_id && <p className="text-xs text-[var(--c-accent-2)]">{errors.account_id.message}</p>}
          </div>

          {/* Category + Quick Add */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-[var(--c-text)]">Kategori</label>
              <button
                type="button"
                onClick={() => setShowNewCategory(!showNewCategory)}
                className="inline-flex items-center gap-1 text-xs text-[var(--c-accent)] hover:underline"
              >
                <Plus className="h-3 w-3" /> Kategori Baru
              </button>
            </div>
            {showNewCategory ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nama kategori"
                  className="flex h-9 flex-1 rounded-[var(--radius-md)] border border-[var(--c-border)] bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--c-accent)]/30 focus-visible:border-[var(--c-accent)]"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCategory())}
                  autoFocus
                />
                <Button type="button" size="sm" variant="primary" onClick={handleAddCategory} loading={createCategory.isPending}>
                  Simpan
                </Button>
                <button type="button" onClick={() => setShowNewCategory(false)} className="h-9 w-9 flex items-center justify-center rounded-[var(--radius-sm)] hover:bg-[var(--c-surface)]">
                  <X className="h-4 w-4 text-[var(--c-text-muted)]" />
                </button>
              </div>
            ) : (
              <>
                <Select value={watch('category_id')} onValueChange={(v) => setValue('category_id', v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category_id && <p className="text-xs text-[var(--c-accent-2)]">{errors.category_id.message}</p>}
              </>
            )}
          </div>

          <Input
            label="Deskripsi"
            placeholder="Contoh: Makan siang kantor"
            error={errors.description?.message}
            {...register('description')}
          />

          <Input
            label="Tanggal"
            type="date"
            error={errors.date?.message}
            {...register('date')}
          />

          <Input
            label="Catatan (opsional)"
            placeholder="Tambahkan catatan..."
            {...register('note')}
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {isEditing ? 'Simpan Perubahan' : 'Tambah Transaksi'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
/* eslint-enable react-hooks/incompatible-library */