'use client'

import { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Plus, X, ArrowDownLeft, ArrowUpRight, TrendingDown, TrendingUp,
  Wallet, Tag, FileText, Calendar, StickyNote, Hash,
  Save, Send,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
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

const QUICK_AMOUNTS = [50000, 100000, 500000, 1000000]

function formatQuickAmount(n: number) {
  if (n >= 1000000) return `${n / 1000000}jt`
  if (n >= 1000) return `${n / 1000}rb`
  return String(n)
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
    register, handleSubmit, reset, setValue, watch, formState: { errors },
  } = useForm<TxFormValues>({
    resolver: zodResolver(txSchema),
    defaultValues: {
      type: defaultType ?? 'expense', account_id: '', category_id: '',
      amount: 0, description: '', date: new Date().toISOString().split('T')[0], note: '',
    },
  })

  const selectedType = watch('type')
  const selectedAccountId = watch('account_id')
  const selectedCategoryId = watch('category_id')
  const watchedAmount = watch('amount')
  const watchedDescription = watch('description')

  useEffect(() => {
    if (open) {
      if (transaction) {
        reset({
          type: transaction.type, account_id: transaction.account_id,
          category_id: transaction.category_id ?? '', amount: Number(transaction.amount),
          description: transaction.description, date: transaction.date, note: transaction.note ?? '',
        })
      } else {
        reset({
          type: defaultType ?? 'expense', account_id: '', category_id: '',
          amount: 0, description: '', date: new Date().toISOString().split('T')[0], note: '',
        })
      }
      setShowNewCategory(false)
      setNewCategoryName('')
    }
  }, [open, transaction, defaultType, reset])

  const isSubmitting = createTx.isPending || updateTx.isPending
  const isExpense = selectedType === 'expense'
  const selectedAccount = accounts?.find((a) => a.id === selectedAccountId)
  const selectedCategory = categories?.find((c) => c.id === selectedCategoryId)

  const remainingBalance = selectedAccount
    ? Number(selectedAccount.balance) - (isExpense ? (watchedAmount || 0) : 0) + (!isExpense ? (watchedAmount || 0) : 0)
    : null

  const handleQuickAmount = useCallback((amount: number) => {
    const current = watchedAmount || 0
    setValue('amount', current + amount, { shouldValidate: true })
  }, [watchedAmount, setValue])

  async function handleAddCategory() {
    if (!user?.id) { alert('Kamu belum login atau sesi sudah habis. Silakan login ulang.'); return }
    if (!newCategoryName.trim()) return
    try {
      const newCat = await createCategory.mutateAsync({
        user_id: user.id, name: newCategoryName.trim(), type: selectedType as CategoryType,
      })
      setValue('category_id', newCat.id)
      setNewCategoryName('')
      setShowNewCategory(false)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal menambah kategori')
    }
  }

  async function onSubmitForm(values: TxFormValues) {
    if (!user?.id) { alert('Kamu belum login atau sesi sudah habis. Silakan login ulang.'); return }
    try {
      if (isEditing && transaction) {
        await updateTx.mutateAsync({ id: transaction.id, payload: values })
      } else {
        await createTx.mutateAsync({ user_id: user.id, ...values })
      }
      onOpenChange(false)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal menyimpan transaksi')
    }
  }

  function handleSaveDraft() {
    if (!user?.id) { alert('Kamu belum login.'); return }
    const values = { type: selectedType, account_id: selectedAccountId, category_id: selectedCategoryId, amount: watchedAmount, description: watchedDescription, date: watch('date'), note: watch('note') }
    try {
      if (isEditing && transaction) {
        updateTx.mutateAsync({ id: transaction.id, payload: values as TxFormValues })
      } else {
        createTx.mutateAsync({ user_id: user.id, ...values } as { user_id: string } & TxFormValues)
      }
      onOpenChange(false)
    } catch { /* silent */ }
  }

  const previewData = (
    <div className="lg:w-[240px] lg:min-w-[240px] border-t lg:border-t-0 lg:border-l border-[var(--c-border)] bg-[var(--c-surface)] px-6 py-6">
      <div className="flex items-center gap-2 mb-5">
        <div className={cn('h-2 w-2 rounded-full', isExpense ? 'bg-rose-500' : 'bg-emerald-500')} />
        <h3 className="text-xs font-bold text-[var(--c-text-muted)] uppercase tracking-widest">Preview</h3>
      </div>
      <div className="space-y-4">
        <div>
          <p className="text-[11px] text-[var(--c-text-muted)] mb-1">Tipe</p>
          <div className={cn('inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold', isExpense ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400')}>
            {isExpense ? <ArrowDownLeft className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
            {isExpense ? 'Pengeluaran' : 'Pemasukan'}
          </div>
        </div>
        <div>
          <p className="text-[11px] text-[var(--c-text-muted)] mb-1">Jumlah</p>
          <p className={cn('text-lg font-bold tabular-nums', isExpense ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400')}>
            {watchedAmount ? formatRupiah(watchedAmount) : 'Rp 0'}
          </p>
        </div>
        <div className="h-px bg-[var(--c-border)]" />
        <div>
          <p className="text-[11px] text-[var(--c-text-muted)] mb-1">Akun</p>
          <p className="text-sm font-semibold text-[var(--c-text)]">{selectedAccount?.name ?? '—'}</p>
          {selectedAccount && <p className="text-[11px] text-[var(--c-text-muted)] mt-0.5">Saldo: {formatRupiah(Number(selectedAccount.balance))}</p>}
        </div>
        <div>
          <p className="text-[11px] text-[var(--c-text-muted)] mb-1">Kategori</p>
          <p className="text-sm font-semibold text-[var(--c-text)]">{selectedCategory?.name ?? '—'}</p>
        </div>
        <div>
          <p className="text-[11px] text-[var(--c-text-muted)] mb-1">Deskripsi</p>
          <p className="text-sm font-medium text-[var(--c-text)] line-clamp-2">{watchedDescription || '—'}</p>
        </div>
        <div className="h-px bg-[var(--c-border)]" />
        <div>
          <p className="text-[11px] text-[var(--c-text-muted)] mb-1">Sisa Saldo</p>
          <p className="text-base font-bold text-[var(--c-text)] tabular-nums">{remainingBalance !== null ? formatRupiah(remainingBalance) : '—'}</p>
          {selectedAccount && watchedAmount > 0 && (
            <p className={cn('text-[11px] font-semibold mt-1', remainingBalance !== null && remainingBalance < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-[var(--c-text-muted)]')}>
              {remainingBalance !== null && remainingBalance < 0 ? 'Saldo tidak cukup!' : isExpense ? '-' + formatRupiah(watchedAmount) + ' dari saldo' : '+' + formatRupiah(watchedAmount) + ' ke saldo'}
            </p>
          )}
        </div>
      </div>
    </div>
  )

  const footerButtons = (
    <div className="border-t border-[var(--c-border)] px-6 lg:px-8 py-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3 sm:justify-end">
      <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl h-11 px-5">
        Batal
      </Button>
      <Button type="button" variant="ghost" onClick={handleSaveDraft} disabled={isSubmitting} className="rounded-xl h-11 px-5 text-[var(--c-text-muted)]">
        <Save className="h-4 w-4" />
        Simpan Draft
      </Button>
      <Button type="submit" loading={isSubmitting} className="rounded-xl h-11 px-6 shadow-md shadow-[var(--c-accent)]/25">
        <Send className="h-4 w-4" />
        {isEditing ? 'Simpan Perubahan' : 'Simpan Transaksi'}
      </Button>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[700px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className={cn('h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300', isExpense ? 'bg-gradient-to-br from-rose-500 to-red-500' : 'bg-gradient-to-br from-emerald-500 to-green-500')}>
              {isExpense ? <TrendingDown className="h-6 w-6 text-white" /> : <TrendingUp className="h-6 w-6 text-white" />}
            </div>
            <div>
              <DialogTitle className="text-xl tracking-tight">{isEditing ? 'Edit Transaksi' : 'Tambah Transaksi'}</DialogTitle>
              <DialogDescription className="mt-0.5">{isEditing ? 'Ubah detail transaksi kamu.' : 'Catat pemasukan atau pengeluaran baru.'}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmitForm)}>
          <div className="flex flex-col lg:flex-row gap-0">
            {/* Main form area */}
            <div className="flex-1 space-y-6">
              {/* Type Toggle */}
              <div className="p-1 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)]">
                <div className="relative grid grid-cols-2">
                  <button type="button" className={cn('relative z-10 flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-xl transition-all duration-200', isExpense ? 'text-white' : 'text-[var(--c-text-muted)] hover:text-[var(--c-text)]')} onClick={() => { setValue('type', 'expense'); setValue('category_id', '') }} aria-pressed={isExpense}>
                    <ArrowDownLeft className="h-4 w-4" />
                    Pengeluaran
                  </button>
                  <button type="button" className={cn('relative z-10 flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-xl transition-all duration-200', !isExpense ? 'text-white' : 'text-[var(--c-text-muted)] hover:text-[var(--c-text)]')} onClick={() => { setValue('type', 'income'); setValue('category_id', '') }} aria-pressed={!isExpense}>
                    <ArrowUpRight className="h-4 w-4" />
                    Pemasukan
                  </button>
                  <div className={cn('absolute top-0.5 bottom-0.5 rounded-xl transition-all duration-300 shadow-sm', isExpense ? 'left-0.5 w-[calc(50%-4px)] bg-gradient-to-r from-rose-500 to-red-500' : 'left-[calc(50%+2px)] w-[calc(50%-4px)] bg-gradient-to-r from-emerald-500 to-green-500')} />
                </div>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-[var(--c-text-muted)] uppercase tracking-widest"><Hash className="h-3.5 w-3.5" />Jumlah</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-bold text-[var(--c-text-muted)]">Rp</span>
                  <input type="number" placeholder="0" className={cn('flex h-14 w-full rounded-xl border bg-white pl-10 pr-4 text-2xl font-bold shadow-sm transition-all dark:bg-[#2e333b]', 'placeholder:text-[var(--c-text-muted)]/30', 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--c-accent)]/30 focus-visible:border-[var(--c-accent)]', errors.amount ? 'border-[var(--c-accent-2)]' : 'border-[var(--c-border)]')} style={{ color: 'var(--c-text)' }} {...register('amount')} />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-medium text-[var(--c-text-muted)] mr-1">Cepat:</span>
                  {QUICK_AMOUNTS.map((amt) => (
                    <button key={amt} type="button" onClick={() => handleQuickAmount(amt)} className="inline-flex items-center rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--c-text)] transition-all duration-150 hover:border-[var(--c-accent)] hover:text-[var(--c-accent)] hover:bg-[var(--c-accent)]/5 active:scale-95">{formatQuickAmount(amt)}</button>
                  ))}
                </div>
                {errors.amount && <p className="text-xs text-[var(--c-accent-2)]" role="alert">{errors.amount.message}</p>}
              </div>

              {/* Account + Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-[var(--c-text)]"><Wallet className="h-4 w-4 text-[var(--c-text-muted)]" />Akun</label>
                  <Select value={selectedAccountId} onValueChange={(v) => setValue('account_id', v)}>
                    <SelectTrigger className="w-full rounded-xl h-11"><SelectValue placeholder="Pilih akun" /></SelectTrigger>
                    <SelectContent>{accounts?.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent>
                  </Select>
                  <p className="text-[11px] text-[var(--c-text-muted)]">Sumber atau tujuan dana</p>
                  {errors.account_id && <p className="text-xs text-[var(--c-accent-2)]" role="alert">{errors.account_id.message}</p>}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm font-semibold text-[var(--c-text)]"><Tag className="h-4 w-4 text-[var(--c-text-muted)]" />Kategori</label>
                    <button type="button" onClick={() => setShowNewCategory(!showNewCategory)} className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--c-accent)] hover:underline"><Plus className="h-3 w-3" />Baru</button>
                  </div>
                  {showNewCategory ? (
                    <div className="flex gap-2">
                      <input type="text" placeholder="Nama kategori" className="flex h-11 flex-1 rounded-xl border border-[var(--c-border)] bg-white px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--c-accent)]/30 focus-visible:border-[var(--c-accent)] dark:bg-[#2e333b]" style={{ color: 'var(--c-text)' }} value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCategory())} autoFocus />
                      <Button type="button" size="sm" variant="primary" onClick={handleAddCategory} loading={createCategory.isPending} className="rounded-xl">Simpan</Button>
                      <button type="button" onClick={() => setShowNewCategory(false)} className="h-11 w-11 flex items-center justify-center rounded-xl hover:bg-[var(--c-surface)] transition-colors"><X className="h-4 w-4 text-[var(--c-text-muted)]" /></button>
                    </div>
                  ) : (
                    <>
                      <Select value={selectedCategoryId} onValueChange={(v) => setValue('category_id', v)}>
                        <SelectTrigger className="w-full rounded-xl h-11"><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                        <SelectContent>{categories?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                      </Select>
                      <p className="text-[11px] text-[var(--c-text-muted)]">Kelompokkan transaksi</p>
                    </>
                  )}
                  {errors.category_id && <p className="text-xs text-[var(--c-accent-2)]" role="alert">{errors.category_id.message}</p>}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-[var(--c-text)]"><FileText className="h-4 w-4 text-[var(--c-text-muted)]" />Deskripsi</label>
                <input type="text" placeholder="Contoh: Makan siang kantor" className={cn('flex h-11 w-full rounded-xl border bg-white px-4 text-sm shadow-sm transition-all dark:bg-[#2e333b]', 'placeholder:text-[var(--c-text-muted)]', 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--c-accent)]/30 focus-visible:border-[var(--c-accent)]', errors.description ? 'border-[var(--c-accent-2)]' : 'border-[var(--c-border)]')} style={{ color: 'var(--c-text)' }} {...register('description')} />
                <p className="text-[11px] text-[var(--c-text-muted)]">Jelaskan transaksi ini</p>
                {errors.description && <p className="text-xs text-[var(--c-accent-2)]" role="alert">{errors.description.message}</p>}
              </div>

              {/* Date + Note */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-[var(--c-text)]"><Calendar className="h-4 w-4 text-[var(--c-text-muted)]" />Tanggal</label>
                  <input type="date" className={cn('flex h-11 w-full rounded-xl border bg-white px-4 text-sm shadow-sm transition-all dark:bg-[#2e333b]', 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--c-accent)]/30 focus-visible:border-[var(--c-accent)]', errors.date ? 'border-[var(--c-accent-2)]' : 'border-[var(--c-border)]')} style={{ color: 'var(--c-text)' }} {...register('date')} />
                  <p className="text-[11px] text-[var(--c-text-muted)]">Kapan transaksi terjadi</p>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-[var(--c-text)]"><StickyNote className="h-4 w-4 text-[var(--c-text-muted)]" />Catatan</label>
                  <input type="text" placeholder="Opsional..." className="flex h-11 w-full rounded-xl border border-[var(--c-border)] bg-white px-4 text-sm shadow-sm transition-all dark:bg-[#2e333b] placeholder:text-[var(--c-text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--c-accent)]/30 focus-visible:border-[var(--c-accent)]" style={{ color: 'var(--c-text)' }} {...register('note')} />
                  <p className="text-[11px] text-[var(--c-text-muted)]">Info tambahan (opsional)</p>
                </div>
              </div>
            </div>

            {/* Preview + Footer stacked on mobile, side on desktop */}
            <div className="lg:contents">
              {previewData}
              {footerButtons}
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
/* eslint-enable react-hooks/incompatible-library */
