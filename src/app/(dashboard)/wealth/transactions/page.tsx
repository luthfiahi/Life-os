'use client'

import { useState, useMemo } from 'react'
import { Plus, Receipt, ArrowDownRight, ArrowUpRight, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TransactionItem, TransactionFormDialog, EmptyState, ConfirmDeleteDialog } from '@/components/wealth'
import { useTransactions, useDeleteTransaction, useAccounts, useCategories } from '@/lib/queries/wealth-queries'
import { formatRupiah } from '@/lib/services/wealth.service'
import { cn } from '@/lib/utils'
import type { TransactionRow } from '@/lib/types/wealth'

export default function TransactionsPage() {
  const { data: transactions, isLoading } = useTransactions({ limit: 100 })
  const deleteTx = useDeleteTransaction()
  const { data: accounts } = useAccounts({ active: true })
  const { data: categories } = useCategories()

  const [formOpen, setFormOpen] = useState(false)
  const [editingTx, setEditingTx] = useState<TransactionRow | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<string>('all')
  const [filterAccount, setFilterAccount] = useState<string>('all')

  const accountsMap = useMemo(() => {
    const map = new Map<string, (typeof accounts extends (infer T)[] | undefined ? T : never)>()
    accounts?.forEach((a) => map.set(a.id, a))
    return map
  }, [accounts])

  const categoriesMap = useMemo(() => {
    const map = new Map<string, (typeof categories extends (infer T)[] | undefined ? T : never)>()
    categories?.forEach((c) => map.set(c.id, c))
    return map
  }, [categories])

  const filtered = useMemo(() => {
    if (!transactions) return []
    return transactions.filter((tx) => {
      if (filterType !== 'all' && tx.type !== filterType) return false
      if (filterAccount !== 'all' && tx.account_id !== filterAccount) return false
      return true
    })
  }, [transactions, filterType, filterAccount])

  // Summary
  const totalIncome = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const totalExpense = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)

  // Group by date
  const grouped = useMemo(() => {
    const groups: { date: string; items: TransactionRow[] }[] = []
    const dateMap = new Map<string, TransactionRow[]>()
    filtered.forEach((tx) => {
      const d = tx.date
      if (!dateMap.has(d)) dateMap.set(d, [])
      dateMap.get(d)!.push(tx)
    })
    dateMap.forEach((items, date) => groups.push({ date, items }))
    groups.sort((a, b) => b.date.localeCompare(a.date))
    return groups
  }, [filtered])

  function handleEdit(tx: TransactionRow) {
    setEditingTx(tx)
    setFormOpen(true)
  }

  function handleAdd() {
    setEditingTx(null)
    setFormOpen(true)
  }

  function handleFormClose(open: boolean) {
    setFormOpen(open)
    if (!open) setEditingTx(null)
  }

  async function handleDelete() {
    if (!deletingId) return
    try {
      await deleteTx.mutateAsync(deletingId)
      setDeletingId(null)
    } catch {
      // handled by mutation
    }
  }

  function formatGroupDate(dateStr: string): string {
    try {
      const d = new Date(dateStr + 'T00:00:00')
      const today = new Date()
      const yesterday = new Date()
      yesterday.setDate(today.getDate() - 1)
      const dStr = d.toISOString().split('T')[0]
      const todayStr = today.toISOString().split('T')[0]
      const yestStr = yesterday.toISOString().split('T')[0]
      const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
      if (dStr === todayStr) return 'Hari Ini'
      if (dStr === yestStr) return 'Kemarin'
      return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
    } catch {
      return dateStr
    }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 text-[var(--c-text)]">Transaksi</h1>
          <p className="text-sm text-[var(--c-text-muted)] mt-1">
            Riwayat pemasukan dan pengeluaran kamu.
          </p>
        </div>
        <Button variant="primary" onClick={handleAdd}>
          <Plus className="h-4 w-4" />
          Tambah
        </Button>
      </div>

      {/* Summary Bar */}
      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-1.5">
          <ArrowUpRight className="h-4 w-4 text-emerald-500" />
          <span className="text-[var(--c-text-muted)]">Masuk:</span>
          <span className="font-semibold text-emerald-500">{formatRupiah(totalIncome)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <ArrowDownRight className="h-4 w-4 text-[var(--c-accent-2)]" />
          <span className="text-[var(--c-text-muted)]">Keluar:</span>
          <span className="font-semibold text-[var(--c-accent-2)]">{formatRupiah(totalExpense)}</span>
        </div>
      </div>

      {/* Filters */}
      {(accounts && accounts.length > 1) && (
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-[var(--c-text-muted)]" />
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Tipe</SelectItem>
              <SelectItem value="income">Pemasukan</SelectItem>
              <SelectItem value="expense">Pengeluaran</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterAccount} onValueChange={setFilterAccount}>
            <SelectTrigger className="w-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Akun</SelectItem>
              {accounts.map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Transaction List */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 rounded-[var(--radius-md)] bg-[var(--c-surface)] animate-pulse" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-4 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
          {grouped.map((group) => (
            <div key={group.date}>
              <p className="text-xs font-semibold text-[var(--c-text-muted)] uppercase tracking-wider mb-2 px-1">
                {formatGroupDate(group.date)}
              </p>
              <div className="space-y-1">
                {group.items.map((tx) => (
                  <TransactionItem
                    key={tx.id}
                    transaction={tx}
                    account={accountsMap.get(tx.account_id)}
                    category={tx.category_id ? categoriesMap.get(tx.category_id) : undefined}
                    onEdit={handleEdit}
                    onDelete={(id) => setDeletingId(id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Receipt}
          title="Belum ada transaksi"
          description="Catat pemasukan atau pengeluaran pertamamu."
          action={{ label: 'Tambah Transaksi', onClick: handleAdd }}
        />
      )}

      {/* Form Dialog */}
      <TransactionFormDialog
        open={formOpen}
        onOpenChange={handleFormClose}
        transaction={editingTx}
      />

      {/* Delete Confirmation */}
      <ConfirmDeleteDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title="Hapus Transaksi?"
        description="Transaksi ini akan dihapus permanen dan tidak bisa dikembalikan."
        onConfirm={handleDelete}
        loading={deleteTx.isPending}
      />
    </div>
  )
}