'use client'

import { ArrowUpRight, ArrowDownRight, Wallet, Tag, Calendar, StickyNote, Repeat, Edit, Trash2 } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
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

  function formatTypeColor(type: string) {
    switch (type) {
      case 'income': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
      case 'expense': return 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
      case 'transfer': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
      default: return 'bg-[var(--c-surface)] text-[var(--c-text-muted)]'
    }
  }

  function DetailRow({ icon: Icon, label, children }: { icon: React.ElementType; label: string; children: React.ReactNode }) {
    return (
      <div className="flex items-center justify-between py-3">
        <div className="flex items-center gap-3 text-[var(--c-text-muted)]">
          <div className="h-8 w-8 rounded-lg bg-[var(--c-surface)] flex items-center justify-center">
            <Icon className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium">{label}</span>
        </div>
        <div className="text-sm font-semibold text-[var(--c-text)] text-right max-w-[60%] truncate">
          {children}
        </div>
      </div>
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md bg-[var(--c-surface)] border-[var(--c-border)] p-0">

        {/* ═══ HEADER ═══ */}
        <div className="px-6 pt-6 pb-5">
          <SheetTitle className="text-lg font-bold text-[var(--c-text)] tracking-tight mb-5">
            Detail Transaksi
          </SheetTitle>

          {/* Amount + Type Badge */}
          <div className="flex items-start justify-between">
            <div>
              <p className={cn(
                'text-3xl font-bold tabular-nums tracking-tight',
                isTransfer ? 'text-[var(--c-accent)]' :
                isExpense ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400',
              )}>
                {isExpense ? '-' : isTransfer ? '' : '+'}{formatRupiah(Number(transaction.amount))}
              </p>
              <div className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold mt-2',
                formatTypeColor(transaction.type),
              )}>
                {isTransfer ? <Repeat className="h-3 w-3" /> : isExpense ? <ArrowDownRight className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                {formatType(transaction.type)}
              </div>
            </div>
            <div className={cn(
              'flex h-12 w-12 items-center justify-center rounded-2xl shrink-0 shadow-sm',
              isTransfer ? 'bg-[var(--c-accent)]/10' :
              isExpense ? 'bg-rose-500/10' : 'bg-emerald-500/10',
            )}>
              {isTransfer ? (
                <Repeat className="h-6 w-6 text-[var(--c-accent)]" />
              ) : isExpense ? (
                <ArrowDownRight className="h-6 w-6 text-rose-500" />
              ) : (
                <ArrowUpRight className="h-6 w-6 text-emerald-500" />
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-base font-semibold text-[var(--c-text)] mt-4">
            {transaction.description || 'Tanpa deskripsi'}
          </p>
        </div>

        <Separator className="bg-[var(--c-border)]" />

        {/* ═══ DETAILS ═══ */}
        <div className="px-6 py-2">
          {category && (
            <DetailRow icon={Tag} label="Kategori">
              <span className="flex items-center gap-2 justify-end">
                {category.color && <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: category.color }} />}
                {category.name}
              </span>
            </DetailRow>
          )}

          {account && (
            <DetailRow icon={Wallet} label="Akun">
              {account.name}
            </DetailRow>
          )}

          <DetailRow icon={Calendar} label="Tanggal">
            {formatDate(transaction.date)}
          </DetailRow>

          {transaction.note && (
            <DetailRow icon={StickyNote} label="Catatan">
              {transaction.note}
            </DetailRow>
          )}
        </div>

        {/* ═══ ACTIONS ═══ */}
        {(onEdit || onDelete) && (
          <>
            <Separator className="bg-[var(--c-border)]" />
            <div className="px-6 py-5 flex gap-3">
              {onEdit && (
                <Button
                  variant="outline"
                  className="flex-1 h-11 rounded-xl"
                  onClick={() => {
                    onOpenChange(false)
                    onEdit(transaction)
                  }}
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="destructive"
                  className="flex-1 h-11 rounded-xl"
                  onClick={() => {
                    onOpenChange(false)
                    onDelete(transaction.id)
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  Hapus
                </Button>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
