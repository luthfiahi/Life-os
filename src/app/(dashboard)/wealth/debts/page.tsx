'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, ChevronLeft, Landmark, CreditCard, CalendarClock, CircleDollarSign } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { DebtCard, DebtFormDialog, PaymentFormDialog, PaymentHistory } from '@/components/wealth/debt'
import { EmptyState } from '@/components/wealth/empty-state'
import { ConfirmDeleteDialog } from '@/components/wealth/confirm-delete-dialog'
import { useDebts, useDebtSnapshot, useDeleteDebt, useUpdateDebt } from '@/lib/queries/debt-queries'
import { formatRupiah } from '@/lib/services/wealth.service'
import type { DebtRow } from '@/lib/types/wealth'

export default function DebtsPage() {
  const { data: snapshot, isLoading: snapLoading } = useDebtSnapshot()
  const { data: debts, isLoading: debtsLoading } = useDebts()
  const deleteDebt = useDeleteDebt()
  const updateDebt = useUpdateDebt()

  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<DebtRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<DebtRow | null>(null)
  const [paymentTarget, setPaymentTarget] = useState<DebtRow | null>(null)
  const [selectedDebtForHistory, setSelectedDebtForHistory] = useState<string | null>(null)

  const activeDebts = debts?.filter((d) => !d.is_paid_off) ?? []
  const paidOffDebts = debts?.filter((d) => d.is_paid_off) ?? []
  const hasDebts = (debts?.length ?? 0) > 0

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/wealth" className="text-[var(--c-text-muted)] hover:text-[var(--c-text)] transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Landmark className="h-5 w-5 text-[var(--c-accent-2)]" />
              <h1 className="text-h1 text-[var(--c-text)]">Utang</h1>
            </div>
            <p className="text-sm text-[var(--c-text-muted)] mt-1">
              Kelola utang dan cicilan kamu.
            </p>
          </div>
        </div>
        <Button variant="primary" size="default" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          Tambah
        </Button>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3">
            {snapLoading ? (
              <Skeleton className="h-14 w-full rounded-[var(--radius-sm)]" />
            ) : (
              <>
                <div className="flex items-center gap-1.5 mb-1">
                  <CreditCard className="h-3.5 w-3.5 text-[var(--c-accent-2)]" />
                  <span className="text-[10px] text-[var(--c-text-muted)] uppercase tracking-wider">Total Utang</span>
                </div>
                <p className="text-lg font-bold text-[var(--c-accent-2)] tabular-nums">
                  {formatRupiah(snapshot?.totalDebt ?? 0)}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            {snapLoading ? (
              <Skeleton className="h-14 w-full rounded-[var(--radius-sm)]" />
            ) : (
              <>
                <div className="flex items-center gap-1.5 mb-1">
                  <CircleDollarSign className="h-3.5 w-3.5 text-amber-500" />
                  <span className="text-[10px] text-[var(--c-text-muted)] uppercase tracking-wider">Cicilan/bln</span>
                </div>
                <p className="text-lg font-bold text-[var(--c-text)] tabular-nums">
                  {formatRupiah(snapshot?.monthlyPayment ?? 0)}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            {snapLoading ? (
              <Skeleton className="h-14 w-full rounded-[var(--radius-sm)]" />
            ) : (
              <>
                <div className="flex items-center gap-1.5 mb-1">
                  <CalendarClock className="h-3.5 w-3.5 text-[var(--c-accent)]" />
                  <span className="text-[10px] text-[var(--c-text-muted)] uppercase tracking-wider">Sisa Waktu</span>
                </div>
                <p className="text-lg font-bold text-[var(--c-text)] tabular-nums">
                  {snapshot?.remainingMonths ?? 0} <span className="text-xs font-normal text-[var(--c-text-muted)]">bulan</span>
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            {snapLoading ? (
              <Skeleton className="h-14 w-full rounded-[var(--radius-sm)]" />
            ) : (
              <>
                <div className="flex items-center gap-1.5 mb-1">
                  <Landmark className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-[10px] text-[var(--c-text-muted)] uppercase tracking-wider">Terbayar</span>
                </div>
                <p className="text-lg font-bold text-[var(--c-text)] tabular-nums">
                  {snapshot?.paidOffPercentage ?? 0}%
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Debt List */}
      {!debtsLoading && !hasDebts ? (
        <EmptyState
          icon={Landmark}
          title="Belum ada utang"
          description="Tambahkan utang untuk mulai melacak cicilan dan progress pelunasan."
          actionLabel="Tambah Utang"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <>
          {/* Active Debts */}
          {activeDebts.length > 0 && (
            <div>
              <h2 className="text-h3 text-[var(--c-text)] mb-3">Aktif ({activeDebts.length})</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {activeDebts.map((debt) => (
                  <DebtCard
                    key={debt.id}
                    debt={debt}
                    onEdit={(d) => setEditTarget(d)}
                    onDelete={(d) => setDeleteTarget(d)}
                    onMarkPaid={(d) => {
                      updateDebt.mutate({
                        id: d.id,
                        payload: { is_paid_off: true, paid_off_at: new Date().toISOString(), remaining_balance: 0 },
                      })
                    }}
                    onRecordPayment={(d) => setPaymentTarget(d)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Paid Off */}
          {paidOffDebts.length > 0 && (
            <div>
              <h2 className="text-h3 text-[var(--c-text-muted)] mb-3">Lunas ({paidOffDebts.length})</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {paidOffDebts.map((debt) => (
                  <DebtCard
                    key={debt.id}
                    debt={debt}
                    onEdit={(d) => setEditTarget(d)}
                    onDelete={(d) => setDeleteTarget(d)}
                    onMarkPaid={() => {}}
                    onRecordPayment={() => {}}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Payment History (expandable) */}
      {selectedDebtForHistory && (
        <div className="mt-2">
          <button
            onClick={() => setSelectedDebtForHistory(null)}
            className="text-xs text-[var(--c-accent)] hover:underline mb-2"
          >
            Tutup riwayat
          </button>
          <PaymentHistory debtId={selectedDebtForHistory} />
        </div>
      )}

      {/* Form Dialog */}
      <DebtFormDialog
        open={showForm || !!editTarget}
        onOpenChange={(v) => { setShowForm(false); setEditTarget(null) }}
        editDebt={editTarget}
      />

      {/* Payment Dialog */}
      <PaymentFormDialog
        open={!!paymentTarget}
        onOpenChange={(v) => {
          setPaymentTarget(null)
          if (!v && paymentTarget) setSelectedDebtForHistory(paymentTarget.id)
        }}
        debt={paymentTarget}
      />

      {/* Delete Confirmation */}
      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteDebt.mutate(deleteTarget.id, {
              onSuccess: () => setDeleteTarget(null),
            })
          }
        }}
        isLoading={deleteDebt.isPending}
        title="Hapus Utang"
        description="Utang dan seluruh riwayat pembayarannya akan dihapus permanen."
      />
    </div>
  )
}
