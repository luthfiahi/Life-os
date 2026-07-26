'use client'

import { ArrowUpRight, ArrowDownRight, MoreVertical, Pencil, Trash2, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatRupiah } from '@/lib/services/wealth.service'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import type { TransactionRow, AccountRow, CategoryRow } from '@/lib/types/wealth'

interface TransactionItemProps {
  transaction: TransactionRow
  account?: AccountRow
  category?: CategoryRow
  onEdit?: (tx: TransactionRow) => void
  onDelete?: (id: string) => void
}

export function TransactionItem({ transaction, account, category, onEdit, onDelete }: TransactionItemProps) {
  const isExpense = transaction.type === 'expense'
  const dateStr = formatDate(transaction.date)

  return (
    <div className="group flex items-center gap-3 rounded-[var(--radius-md)] p-3 transition-colors hover:bg-[var(--c-surface)]">
      {/* Icon */}
      <div className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
        isExpense ? 'bg-[var(--c-accent-2)]/10' : 'bg-emerald-500/10'
      )}>
        {isExpense ? (
          <ArrowDownRight className="h-4 w-4 text-[var(--c-accent-2)]" />
        ) : (
          <ArrowUpRight className="h-4 w-4 text-emerald-500" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--c-text)] truncate">
          {transaction.description || 'Tanpa deskripsi'}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {category && (
            <span className="text-[10px] font-medium text-[var(--c-text-muted)]">
              {category.name}
            </span>
          )}
          {account && (
            <span className="text-[10px] text-[var(--c-text-muted)] flex items-center gap-0.5">
              <Wallet className="h-2.5 w-2.5" />
              {account.name}
            </span>
          )}
          <span className="text-[10px] text-[var(--c-text-muted)]">{dateStr}</span>
        </div>
      </div>

      {/* Amount + Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <span className={cn(
          'text-sm font-semibold tabular-nums',
          isExpense ? 'text-[var(--c-accent-2)]' : 'text-emerald-500'
        )}>
          {isExpense ? '-' : '+'}{formatRupiah(Number(transaction.amount))}
        </span>

        {(onEdit || onDelete) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-7 w-7 flex items-center justify-center rounded-[var(--radius-sm)] hover:bg-[var(--c-surface)] transition-colors opacity-0 group-hover:opacity-100">
                <MoreVertical className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(transaction)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
              )}
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onDelete(transaction.id)} variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Hapus
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  )
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T00:00:00')
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    return `${d.getDate()} ${months[d.getMonth()]}`
  } catch {
    return dateStr
  }
}
