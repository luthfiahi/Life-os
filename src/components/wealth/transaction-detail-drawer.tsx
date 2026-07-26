'use client'

import { X, ArrowUpRight, ArrowDownRight, Wallet, Tag, Calendar, FileText, Repeat } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { formatRupiah } from '@/lib/services/wealth.service'
import { cn } from '@/lib/utils'
import type { TransactionRow, AccountRow, CategoryRow } from '@/lib/types/wealth'

interface TransactionDetailDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction: TransactionRow | null
  account?: AccountRow
  category?: CategoryRow
  onEdit?: (tx: TransactionRow) => void
  onDelete?: (id: string) => void
}

export function TransactionDetailDrawer({
  open,
  onOpenChange,
  transaction,
  account,
  category,
  onEdit,
  onDelete,
}: TransactionDetailDrawerProps) {
  if (!transaction) return null

  const isExpense = transaction.type === 'expense'
  const isTransfer = transaction.type === 'transfer'

  function formatDate(dateStr: string): string {
    try {
      const d = new Date(dateStr + 'T00:00:00')
      const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
      return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
    } catch {
      return dateStr
    }
  }

  function formatType(type: string): string {
    switch (type) {
      case 'income': return 'Pemasukan'
      case 'expense': return 'Pengeluaran'
      case 'transfer': return 'Transfer'
      default: return type
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md bg-[var(--c-surface)] border-[var(--c-border)] p-0">
        {/* Header with amount */}
        <div className="p-5 pb-4">
          <div className="flex items-center justify-between mb-6">
            <SheetTitle className="text-sm font-semibold text-[var(--c-text)]">
              Detail Transaksi
            </SheetTitle>
          </div>

          {/* Amount display */}
          <div className="flex items-center gap-3 mb-4">
            <div className={cn(
              'flex h-12 w-12 items-center justify-center rounded-xl shrink-0',
              isTransfer ? 'bg-[var(--c-accent)]/10' :
              isExpense ? 'bg-[var(--c-accent-2)]/10' : 'bg-emerald-500/10'
            )}>
              {isTransfer ? (
                <Repeat className="h-5 w-5 text-[var(--c-accent)]" />
              ) : isExpense ? (
                <ArrowDownRight className="h-5 w-5 text-[var(--c-accent-2)]" />
              ) : (
                <ArrowUpRight className="h-5 w-5 text-emerald-500" />
              )}
            </div>
            <div>
              <p className={cn(
                'text-2xl font-bold tabular-nums',
                isTransfer ? 'text-[var(--c-accent)]' :
                isExpense ? 'text-[var(--c-accent-2)]' : 'text-emerald-500'
              )}>
                {isExpense ? '-' : isTransfer ? '' : '+'}{formatRupiah(Number(transaction.amount))}
              </p>
              <Badge variant="outline" className="mt-1 text-[10px]">
                {formatType(transaction.type)}
              </Badge>
            </div>
          </div>

          {/* Description */}
          <p className="text-base font-medium text-[var(--c-text)]">
            {transaction.description || 'Tanpa deskripsi'}
          </p>
        </div>

        <Separator className="bg-[var(--c-border)]" />

        {/* Details */}
        <div className="p-5 space-y-4">
          {/* Category */}
          {category && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[var(--c-text-muted)]">
                <Tag className="h-4 w-4" />
                <span className="text-sm">Kategori</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-sm font-medium text-[var(--c-text)]">{category.name}</span>
              </div>
            </div>
          )}

          {/* Account */}
          {account && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[var(--c-text-muted)]">
                <Wallet className="h-4 w-4" />
                <span className="text-sm">Akun</span>
              </div>
              <span className="text-sm font-medium text-[var(--c-text)]">{account.name}</span>
            </div>
          )}

          {/* Date */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[var(--c-text-muted)]">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">Tanggal</span>
            </div>
            <span className="text-sm font-medium text-[var(--c-text)]">{formatDate(transaction.date)}</span>
          </div>

          {/* Note */}
          {transaction.note && (
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2 text-[var(--c-text-muted)]">
                <FileText className="h-4 w-4 shrink-0 mt-0.5" />
                <span className="text-sm">Catatan</span>
              </div>
              <span className="text-sm text-[var(--c-text)] text-right">{transaction.note}</span>
            </div>
          )}
        </div>

        <Separator className="bg-[var(--c-border)]" />

        {/* Actions */}
        {(onEdit || onDelete) && (
          <div className="p-5 flex gap-2">
            {onEdit && (
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  onOpenChange(false)
                  onEdit(transaction)
                }}
              >
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => {
                  onOpenChange(false)
                  onDelete(transaction.id)
                }}
              >
                Hapus
              </Button>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
