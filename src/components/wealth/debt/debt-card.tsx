'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Pencil, Trash2, CheckCircle2, CircleDollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatRupiah } from '@/lib/services/wealth.service'
import type { DebtRow } from '@/lib/types/wealth'

interface DebtCardProps {
  debt: DebtRow
  onEdit: (debt: DebtRow) => void
  onDelete: (debt: DebtRow) => void
  onMarkPaid: (debt: DebtRow) => void
  onRecordPayment: (debt: DebtRow) => void
}

export function DebtCard({ debt, onEdit, onDelete, onMarkPaid, onRecordPayment }: DebtCardProps) {
  const [hovered, setHovered] = useState(false)
  const remaining = Number(debt.remaining_balance)
  const total = Number(debt.total_amount)
  const paidPct = total > 0 ? Math.min(Math.round(((total - remaining) / total) * 100), 100) : 0

  const progressColor = paidPct >= 80 ? 'bg-emerald-500' : paidPct >= 50 ? 'bg-[var(--c-accent)]' : 'bg-amber-500'

  return (
    <Card
      className={cn('group transition-all', debt.is_paid_off && 'opacity-60')}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className={cn(
                'text-sm font-semibold text-[var(--c-text)] truncate',
                debt.is_paid_off && 'line-through',
              )}>
                {debt.name}
              </h3>
              {debt.is_paid_off ? (
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] px-1.5 py-0">Lunas</Badge>
              ) : (
                <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] px-1.5 py-0">Aktif</Badge>
              )}
            </div>
            {debt.creditor && (
              <p className="text-[10px] text-[var(--c-text-muted)] mt-0.5">{debt.creditor}</p>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 rounded-[var(--radius-sm)] hover:bg-[var(--c-surface)] transition-colors opacity-0 group-hover:opacity-100">
                <MoreHorizontal className="h-4 w-4 text-[var(--c-text-muted)]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!debt.is_paid_off && (
                <DropdownMenuItem onClick={() => onRecordPayment(debt)}>
                  <CircleDollarSign className="h-4 w-4 mr-2" />
                  Bayar Cicilan
                </DropdownMenuItem>
              )}
              {!debt.is_paid_off && (
                <DropdownMenuItem onClick={() => onMarkPaid(debt)}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Tandai Lunas
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onEdit(debt)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(debt)} className="text-[var(--c-accent-2)]">
                <Trash2 className="h-4 w-4 mr-2" />
                Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Financial details */}
        <div className="mt-3 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-[var(--c-text-muted)]">Sisa</span>
            <span className="font-medium text-[var(--c-text)] tabular-nums">{formatRupiah(remaining)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[var(--c-text-muted)]">Cicilan/bulan</span>
            <span className="font-medium text-[var(--c-text)] tabular-nums">{formatRupiah(Number(debt.monthly_payment))}</span>
          </div>
          {!debt.is_paid_off && (
            <div className="flex justify-between text-[10px] text-[var(--c-text-muted)]">
              <span>Progress</span>
              <span className="tabular-nums">{paidPct}%</span>
            </div>
          )}
          {!debt.is_paid_off && (
            <div className="h-1.5 rounded-full bg-[var(--c-surface)] overflow-hidden">
              <div className={cn('h-full rounded-full transition-all', progressColor)} style={{ width: `${paidPct}%` }} />
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-[var(--c-border)]">
          <span className="text-[10px] text-[var(--c-text-muted)]">
            Bunga {(debt.interest_rate || 0)}% / {debt.tenure_months} bln
          </span>
          <span className="text-[10px] text-[var(--c-text-muted)]">
            Tgl {debt.due_day}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
