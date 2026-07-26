'use client'

import { useState } from 'react'
import { Plus, Target, MoreVertical, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BudgetCard, BudgetFormDialog, EmptyState, ConfirmDeleteDialog } from '@/components/wealth'
import { useBudgets, useBudgetUtilization, useDeleteBudget } from '@/lib/queries/wealth-queries'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { BudgetRow } from '@/lib/types/wealth'

export default function BudgetsPage() {
  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth() + 1)

  const { data: budgets, isLoading: budLoading } = useBudgets()
  const { data: utilization, isLoading: utilLoading } = useBudgetUtilization(viewYear, viewMonth)
  const deleteBudget = useDeleteBudget()

  const [formOpen, setFormOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<BudgetRow | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function handleEdit(budget: BudgetRow) {
    setEditingBudget(budget)
    setFormOpen(true)
  }

  function handleAdd() {
    setEditingBudget(null)
    setFormOpen(true)
  }

  function handleFormClose(open: boolean) {
    setFormOpen(open)
    if (!open) setEditingBudget(null)
  }

  async function handleDelete() {
    if (!deletingId) return
    try {
      await deleteBudget.mutateAsync(deletingId)
      setDeletingId(null)
    } catch {
      // handled by mutation
    }
  }

  function prevMonth() {
    if (viewMonth === 1) {
      setViewMonth(12)
      setViewYear(viewYear - 1)
    } else {
      setViewMonth(viewMonth - 1)
    }
  }

  function nextMonth() {
    if (viewMonth === 12) {
      setViewMonth(1)
      setViewYear(viewYear + 1)
    } else {
      setViewMonth(viewMonth + 1)
    }
  }

  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth() + 1
  const totalBudget = utilization?.reduce((s, b) => s + b.budget_amount, 0) ?? 0
  const totalSpent = utilization?.reduce((s, b) => s + b.spent, 0) ?? 0
  const avgPercentage = utilization && utilization.length > 0
    ? Math.round(utilization.reduce((s, b) => s + b.percentage, 0) / utilization.length)
    : 0

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 text-[var(--c-text)]">Budget</h1>
          <p className="text-sm text-[var(--c-text-muted)] mt-1">
            Pantau batas pengeluaran per kategori.
          </p>
        </div>
        <Button variant="primary" onClick={handleAdd}>
          <Plus className="h-4 w-4" />
          Tambah Budget
        </Button>
      </div>

      {/* Month Navigator */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="h-8 w-8 flex items-center justify-center rounded-[var(--radius-sm)] hover:bg-[var(--c-surface)] transition-colors">
          <ChevronLeft className="h-4 w-4 text-[var(--c-text)]" />
        </button>
        <div className="text-center">
          <p className="text-sm font-semibold text-[var(--c-text)]">{months[viewMonth - 1]} {viewYear}</p>
          {isCurrentMonth && (
            <p className="text-[10px] text-[var(--c-accent)]">Bulan ini</p>
          )}
        </div>
        <button onClick={nextMonth} className="h-8 w-8 flex items-center justify-center rounded-[var(--radius-sm)] hover:bg-[var(--c-surface)] transition-colors">
          <ChevronRight className="h-4 w-4 text-[var(--c-text)]" />
        </button>
      </div>

      {/* Summary */}
      {utilization && utilization.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-[var(--radius-lg)] border border-[var(--c-border)] bg-[var(--c-card)] p-3">
            <p className="text-xs text-[var(--c-text-muted)]">Total Budget</p>
            <p className="text-lg font-bold text-[var(--c-text)]">Rp {Math.round(totalBudget / 1000)}K</p>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-[var(--c-border)] bg-[var(--c-card)] p-3">
            <p className="text-xs text-[var(--c-text-muted)]">Total Terpakai</p>
            <p className="text-lg font-bold text-[var(--c-accent-2)]">Rp {Math.round(totalSpent / 1000)}K</p>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-[var(--c-border)] bg-[var(--c-card)] p-3">
            <p className="text-xs text-[var(--c-text-muted)]">Rata-rata Terpakai</p>
            <p className={cn(
              'text-lg font-bold',
              avgPercentage >= 85 ? 'text-[var(--c-accent-2)]' : avgPercentage >= 60 ? 'text-amber-500' : 'text-[var(--c-accent)]'
            )}>{avgPercentage}%</p>
          </div>
        </div>
      )}

      {/* Budget Cards */}
      {(utilLoading || budLoading) ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 rounded-[var(--radius-lg)] border border-[var(--c-border)] bg-[var(--c-surface)] animate-pulse" />
          ))}
        </div>
      ) : utilization && utilization.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {utilization.map((item) => (
            <BudgetCard key={item.category_id} item={item} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Target}
          title="Belum ada budget"
          description="Tetapkan batas pengeluaran untuk kategori agar keuangan lebih terkontrol."
          action={{ label: 'Tambah Budget', onClick: handleAdd }}
        />
      )}

      {/* All Budgets List (for edit/delete) */}
      {budgets && budgets.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-[var(--c-text)] mb-3">Semua Budget</h2>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {budgets.map((budget) => {
              const util = utilization?.find((u) => u.category_id === budget.category_id)
              return (
                <div key={budget.id} className="group flex items-center justify-between rounded-[var(--radius-md)] px-3 py-2 hover:bg-[var(--c-surface)] transition-colors">
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      'h-2 w-2 rounded-full',
                      budget.is_active ? 'bg-emerald-400' : 'bg-[var(--c-text-muted)]'
                    )} />
                    <div>
                      <p className="text-sm text-[var(--c-text)]">{util?.category_name ?? budget.category_id.slice(0, 8)}</p>
                      <p className="text-[10px] text-[var(--c-text-muted)]">
                        {budget.period === 'monthly' ? 'Bulanan' : 'Mingguan'}
                        {!budget.is_active && ' (nonaktif)'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[var(--c-text)] tabular-nums">
                      {util ? `${util.percentage}%` : '-'}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="h-7 w-7 flex items-center justify-center rounded-[var(--radius-sm)] hover:bg-[var(--c-surface)] opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(budget)}>
                          <Pencil className="h-4 w-4 mr-2" />Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setDeletingId(budget.id)} variant="destructive">
                          <Trash2 className="h-4 w-4 mr-2" />Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Form Dialog */}
      <BudgetFormDialog
        open={formOpen}
        onOpenChange={handleFormClose}
        budget={editingBudget}
      />

      {/* Delete Confirmation */}
      <ConfirmDeleteDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title="Hapus Budget?"
        description="Budget ini akan dihapus permanen. Transaksi terkait tidak akan terpengaruh."
        onConfirm={handleDelete}
        loading={deleteBudget.isPending}
      />
    </div>
  )
}