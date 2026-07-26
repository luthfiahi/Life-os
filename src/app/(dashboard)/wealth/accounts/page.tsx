'use client'

import { useState } from 'react'
import { Plus, Wallet, Landmark, Banknote, Smartphone, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AccountCard, AccountFormDialog, EmptyState, ConfirmDeleteDialog } from '@/components/wealth'
import { useAccounts, useDeleteAccount } from '@/lib/queries/wealth-queries'
import { formatRupiah } from '@/lib/services/wealth.service'
import type { AccountRow } from '@/lib/types/wealth'

export default function AccountsPage() {
  const { data: accounts, isLoading } = useAccounts()
  const deleteAccount = useDeleteAccount()

  const [formOpen, setFormOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<AccountRow | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function handleEdit(account: AccountRow) {
    setEditingAccount(account)
    setFormOpen(true)
  }

  function handleAdd() {
    setEditingAccount(null)
    setFormOpen(true)
  }

  function handleFormClose(open: boolean) {
    setFormOpen(open)
    if (!open) setEditingAccount(null)
  }

  async function handleDelete() {
    if (!deletingId) return
    try {
      await deleteAccount.mutateAsync(deletingId)
      setDeletingId(null)
    } catch {
      // handled by mutation
    }
  }

  // Summary
  const totalBalance = accounts?.reduce((sum, a) => sum + Number(a.balance), 0) ?? 0

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 text-[var(--c-text)]">Akun</h1>
          <p className="text-sm text-[var(--c-text-muted)] mt-1">
            Kelola akun keuangan kamu. Total saldo: <span className="font-semibold text-[var(--c-text)]">{formatRupiah(totalBalance)}</span>
          </p>
        </div>
        <Button variant="primary" onClick={handleAdd}>
          <Plus className="h-4 w-4" />
          Tambah Akun
        </Button>
      </div>

      {/* Account Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 rounded-[var(--radius-lg)] border border-[var(--c-border)] bg-[var(--c-surface)] animate-pulse" />
          ))}
        </div>
      ) : accounts && accounts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onEdit={handleEdit}
              onDelete={(id) => setDeletingId(id)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Wallet}
          title="Belum ada akun"
          description="Tambahkan akun keuangan pertamamu untuk mulai melacak saldo."
          action={{ label: 'Tambah Akun', onClick: handleAdd }}
        />
      )}

      {/* Form Dialog */}
      <AccountFormDialog
        open={formOpen}
        onOpenChange={handleFormClose}
        account={editingAccount}
      />

      {/* Delete Confirmation */}
      <ConfirmDeleteDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title="Hapus Akun?"
        description="Akun ini beserta semua transaksinya akan dihapus permanen. Tindakan ini tidak bisa dibatalkan."
        onConfirm={handleDelete}
        loading={deleteAccount.isPending}
      />
    </div>
  )
}