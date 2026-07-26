'use client'

import { Landmark, Banknote, Smartphone, TrendingUp, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { formatRupiah } from '@/lib/services/wealth.service'
import type { AccountRow, AccountType } from '@/lib/types/wealth'
import { cn } from '@/lib/utils'

const accountTypeConfig: Record<AccountType, { icon: typeof Landmark; label: string; className: string }> = {
  bank: { icon: Landmark, label: 'Bank', className: 'text-blue-500 bg-blue-500/10' },
  cash: { icon: Banknote, label: 'Tunai', className: 'text-emerald-500 bg-emerald-500/10' },
  ewallet: { icon: Smartphone, label: 'E-Wallet', className: 'text-violet-500 bg-violet-500/10' },
  investment: { icon: TrendingUp, label: 'Investasi', className: 'text-amber-500 bg-amber-500/10' },
}

interface AccountCardProps {
  account: AccountRow
  onEdit?: (account: AccountRow) => void
  onDelete?: (id: string) => void
}

export function AccountCard({ account, onEdit, onDelete }: AccountCardProps) {
  const config = accountTypeConfig[account.type]
  const TypeIcon = config.icon

  return (
    <Card className="group relative overflow-hidden transition-colors duration-200 hover:border-[var(--c-accent)]/30">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)]', config.className)}>
              <TypeIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-[var(--c-text)] truncate">{account.name}</h3>
                <span className={cn('h-2 w-2 shrink-0 rounded-full', account.is_active ? 'bg-emerald-400' : 'bg-[var(--c-text-muted)]')} />
              </div>
              <Badge className={cn('mt-1', config.className)}>{config.label}</Badge>
            </div>
          </div>

          {(onEdit || onDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-8 w-8 flex items-center justify-center rounded-[var(--radius-sm)] hover:bg-[var(--c-surface)] transition-colors opacity-0 group-hover:opacity-100">
                  <MoreVertical className="h-4 w-4 text-[var(--c-text-muted)]" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(account)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onDelete(account.id)} variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Hapus
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="mt-3">
          <p className={cn('text-xl font-bold', account.balance >= 0 ? 'text-[var(--c-text)]' : 'text-[var(--c-accent-2)]')}>
            {formatRupiah(Number(account.balance))}
          </p>
        </div>
      </div>
    </Card>
  )
}
