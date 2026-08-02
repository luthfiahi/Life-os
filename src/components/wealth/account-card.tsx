'use client'

import { Landmark, Banknote, Smartphone, TrendingUp, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { formatRupiah } from '@/lib/services/wealth.service'
import type { AccountRow, AccountType } from '@/lib/types/wealth'
import { cn } from '@/lib/utils'

const accountTypeConfig: Record<AccountType, { icon: typeof Landmark; label: string; gradient: string; iconBg: string; accent: string }> = {
  bank: { icon: Landmark, label: 'Bank', gradient: 'from-blue-500/10 to-blue-600/5', iconBg: 'bg-blue-500', accent: 'text-blue-500' },
  cash: { icon: Banknote, label: 'Tunai', gradient: 'from-emerald-500/10 to-emerald-600/5', iconBg: 'bg-emerald-500', accent: 'text-emerald-500' },
  ewallet: { icon: Smartphone, label: 'E-Wallet', gradient: 'from-violet-500/10 to-violet-600/5', iconBg: 'bg-violet-500', accent: 'text-violet-500' },
  investment: { icon: TrendingUp, label: 'Investasi', gradient: 'from-amber-500/10 to-amber-600/5', iconBg: 'bg-amber-500', accent: 'text-amber-500' },
}

interface AccountCardProps {
  account: AccountRow
  onEdit?: (account: AccountRow) => void
  onDelete?: (id: string) => void
}

export function AccountCard({ account, onEdit, onDelete }: AccountCardProps) {
  const config = accountTypeConfig[account.type]
  const TypeIcon = config.icon
  const gradientStrip = account.type === 'bank' ? 'from-blue-500 to-blue-400' : account.type === 'cash' ? 'from-emerald-500 to-emerald-400' : account.type === 'ewallet' ? 'from-violet-500 to-violet-400' : 'from-amber-500 to-amber-400'

  return (
    <div className={cn(
      'group relative overflow-hidden rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] transition-all duration-200 hover:shadow-md hover:border-[var(--c-accent)]/20',
    )}>
      {/* Gradient accent strip */}
      <div className={cn('absolute top-0 left-0 right-0 h-1 bg-gradient-to-r opacity-80', gradientStrip)} />

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-sm', config.iconBg)}>
              <TypeIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-[var(--c-text)] truncate">{account.name}</h3>
                <span className={cn('h-2 w-2 shrink-0 rounded-full', account.is_active ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]' : 'bg-[var(--c-text-muted)]')} />
              </div>
              <span className={cn('text-[11px] font-medium', config.accent)}>{config.label}</span>
            </div>
          </div>

          {(onEdit || onDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-[var(--c-surface)] transition-colors opacity-0 group-hover:opacity-100">
                  <MoreVertical className="h-4 w-4 text-[var(--c-text-muted)]" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(account)}>
                    <Pencil className="h-4 w-4 mr-2" /> Edit
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onDelete(account.id)} variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" /> Hapus
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="mt-4 pl-14">
          <p className={cn('text-xl font-bold tabular-nums tracking-tight', account.balance >= 0 ? 'text-[var(--c-text)]' : 'text-[var(--c-accent-2)]')}>
            {formatRupiah(Number(account.balance))}
          </p>
          <p className="text-[11px] text-[var(--c-text-muted)] mt-0.5">Saldo saat ini</p>
        </div>
      </div>
    </div>
  )
}
