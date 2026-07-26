'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { MoreHorizontal, Trash2 } from 'lucide-react'
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { useDebtPayments, useDeleteDebtPayment } from '@/lib/queries/debt-queries'
import { formatRupiah } from '@/lib/services/wealth.service'
import { ConfirmDeleteDialog } from '@/components/wealth/confirm-delete-dialog'
import type { DebtPaymentRow } from '@/lib/types/wealth'

interface PaymentHistoryProps {
  debtId: string
}

export function PaymentHistory({ debtId }: PaymentHistoryProps) {
  const { data: payments, isLoading } = useDebtPayments(debtId)
  const deletePayment = useDeleteDebtPayment()
  const [deleteTarget, setDeleteTarget] = useState<DebtPaymentRow | null>(null)

  const totalPaid = payments?.reduce((s, p) => s + Number(p.amount), 0) ?? 0

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-h3 text-[var(--c-text)]">Riwayat Pembayaran</CardTitle>
            <span className="text-xs font-medium text-[var(--c-text)] tabular-nums">
              Total: {formatRupiah(totalPaid)}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-[var(--radius-sm)]" />
              ))}
            </div>
          ) : !payments || payments.length === 0 ? (
            <p className="text-xs text-[var(--c-text-muted)] text-center py-4">
              Belum ada pembayaran
            </p>
          ) : (
            <div className="space-y-1 max-h-[300px] overflow-y-auto">
              {payments.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between py-2 border-b border-[var(--c-border)] last:border-0 group"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-[var(--c-text)] tabular-nums">
                      {formatRupiah(Number(p.amount))}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-[var(--c-text-muted)]">
                      <span>{p.date}</span>
                      {p.note && <span>- {p.note}</span>}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 rounded-[var(--radius-sm)] hover:bg-[var(--c-surface)] opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => setDeleteTarget(p)}
                        className="text-[var(--c-accent-2)]"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deletePayment.mutate(deleteTarget.id, {
              onSuccess: () => setDeleteTarget(null),
            })
          }
        }}
        isLoading={deletePayment.isPending}
        title="Hapus Pembayaran"
        description="Pembayaran ini akan dihapus permanen."
      />
    </>
  )
}
