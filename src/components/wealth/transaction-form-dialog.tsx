'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, X, ArrowDownLeft, ArrowUpRight, TrendingDown, TrendingUp } from 'lucide-react'
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
    if (!user?.id) {
      alert('Kamu belum login atau sesi sudah habis. Silakan login ulang.')
      return
    }
    if (!newCategoryName.trim()) return
    try {
      const newCat = await createCategory.mutateAsync({
        user_id: user.id,
        name: newCategoryName.trim(),
        type: selectedType as CategoryType,
      })
      setValue('category_id', newCat.id)
      setNewCategoryName('')
      setShowNewCategory(false)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menambah kategori'
      alert(msg)
    }
  }

  async function onSubmit(values: TxFormValues) {
    if (!user?.id) {
      alert('Kamu belum login atau sesi sudah habis. Silakan login ulang.')
      return
    }
    try {
      if (isEditing && transaction) {
        await updateTx.mutateAsync({ id: transaction.id, payload: values })
      } else {
        await createTx.mutateAsync({ user_id: user.id, ...values })
      }
      onOpenChange(false)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan transaksi'
      alert(msg)
    }
  }

  const selectedAccount = accounts?.find((a) => a.id === selectedAccountId)
  const isExpense = selectedType === 'expense'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center shadow-sm ${isExpense ? 'bg-gradient-to-br from-rose-500 to-red-500' : 'bg-gradient-to-br from-emerald-500 to-green-500'}`}>
              {isExpense ? <TrendingDown className="h-5 w-5 text-white" /> : <TrendingUp className="h-5 w-5 text-white" />}
            </div>
            <div>
              <DialogTitle>{isEditing ? 'Edit Transaksi' : 'Tambah Transaksi'}</DialogTitle>
              <DialogDescription>
                {isEditing ? 'Ubah detail transaksi kamu.' : 'Catat pemasukan atau pengeluaran baru.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Type Toggle - Premium pill style */}
          <div className="p-1 rounded-xl bg-[var(--c-surface)] border border-[var(--c-border)]/40">
            <div className="relative grid grid-cols-2">
              <button
                type="button"
                className={`relative z-10 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${isExpense ? 'text-white' : 'text-[var(--c-text-muted)] hover:text-[var(--c-text)]'}`}
                onClick={() => { setValue('type', 'expense'); setValue('category_id', '') }}
              >
                <ArrowDownLeft className="h-4 w-4" />
                Pengeluaran
              </button>
              <button
                type="button"
                className={`relative z-10 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${!isExpense ? 'text-white' : 'text-[var(--c-text-muted)] hover:text-[var(--c-text)]'}`}
                onClick={() => { setValue('type', 'income'); setValue('category_id', '') }}
              >
                <ArrowUpRight className="h-4 w-4" />
                Pemasukan
              </button>
              <div
                className={cn(
                  'absolute top-0.5 bottom-0.5 rounded-lg transition-all duration-300 shadow-sm',
                  isExpense
                    ? 'left-0.5 w-[calc(50%-4px)] bg-gradient-to-r from-rose-500 to-red-500'
                    : 'left-[calc(50%+2px)] w-[calc(50%-4px)] bg-gradient-to-r from-emerald-500 to-green-500'
                )}
              />
            </div>
          </div>

          {/* Amount - prominent card */}
          <div className="rounded-xl border border-[var(--c-border)]/50 bg-[var(--c-surface)]/50 p-4">
            <label className="block text-xs font-semibold text-[var(--c-text-muted)] uppercase tracking-wider mb-2">Jumlah</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--c-text-muted)]">Rp</span>
              <input
                type="number"
                placeholder="0"
                className={cn(
                  'flex h-12 w-full rounded-xl border bg-white pl-8 pr-3 text-xl font-bold shadow-sm transition-all dark:bg-[#2e333b]',
                  'placeholder:text-[var(--c-text-muted)]/40',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--c-accent)]/30 focus-visible:border-[var(--c-accent)]',
                  errors.amount ? 'border-[var(--c-accent-2)]' : 'border-[var(--c-border)]/50'
                )}
                {...register('amount')}
              />
            </div>
            {selectedAccount && (
              <p className="mt-2 text-xs text-[var(--c-text-muted)] flex items-center gap-1">
                <span>Saldo saat ini:</span>
                <span className="font-semibold text-[var(--c-text)]">{formatRupiah(Number(selectedAccount.balance))}</span>
              </p>
            )}
            {errors.amount && <p className="mt-1 text-xs text-[var(--c-accent-2)]">{errors.amount.message}</p>}
          </div>

          {/* Account */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[var(--c-text)]">Akun</label>
            <Select value={selectedAccountId} onValueChange={(v) => setValue('account_id', v)}>
              <SelectTrigger className="w-full rounded-xl">
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
                className="inline-flex items-center gap-1 text-xs font-medium text-[var(--c-accent)] hover:underline"
              >
                <Plus className="h-3 w-3" /> Kategori Baru
              </button>
            </div>
            {showNewCategory ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nama kategori"
                  className="flex h-10 flex-1 rounded-xl border border-[var(--c-border)]/50 bg-white px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--c-accent)]/30 focus-visible:border-[var(--c-accent)] dark:bg-[#2e333b]"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCategory())}
                  autoFocus
                />
                <Button type="button" size="sm" variant="primary" onClick={handleAddCategory} loading={createCategory.isPending} className="rounded-xl">
                  Simpan
                </Button>
                <button type="button" onClick={() => setShowNewCategory(false)} className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-[var(--c-surface)] transition-colors">
                  <X className="h-4 w-4 text-[var(--c-text-muted)]" />
                </button>
              </div>
            ) : (
              <>
                <Select value={watch('category_id')} onValueChange={(v) => setValue('category_id', v)}>
                  <SelectTrigger className="w-full rounded-xl">
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
            <Button type="submit" loading={isSubmitting} className="shadow-sm shadow-[var(--c-accent)]/20">
              {isEditing ? 'Simpan Perubahan' : 'Tambah Transaksi'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
/* eslint-enable react-hooks/incompatible-library */