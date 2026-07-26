'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useNetWorth } from '@/lib/queries/analytics-queries'
import { formatRupiah } from '@/lib/services/wealth.service'
import { Skeleton } from '@/components/ui/skeleton'
import { Landmark, Banknote, Smartphone, TrendingUp } from 'lucide-react'
import type { AccountType } from '@/lib/types/wealth'

const TYPE_ICONS: Record<AccountType, typeof Landmark> = {
  bank: Landmark,
  cash: Banknote,
  ewallet: Smartphone,
  investment: TrendingUp,
}

const TYPE_COLORS: Record<AccountType, string> = {
  bank: 'text-blue-500',
  cash: 'text-emerald-500',
  ewallet: 'text-violet-500',
  investment: 'text-amber-500',
}

export function NetWorthCard() {
  const { data, isLoading } = useNetWorth()

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-h3 text-[var(--c-text)]">Net Worth</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[120px] w-full rounded-[var(--radius-md)]" />
        ) : !data || data.totalAssets === 0 ? (
          <div className="flex items-center justify-center h-[120px] text-sm text-[var(--c-text-muted)]">
            Belum ada aset
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--c-text)]">
                {formatRupiah(data.netWorth)}
              </p>
              <p className="text-[10px] text-[var(--c-text-muted)] mt-0.5">Total Kekayaan</p>
            </div>
            {data.byAccountType.length > 0 && (
              <div className="flex justify-center gap-4">
                {data.byAccountType.map((item) => {
                  const Icon = TYPE_ICONS[item.type]
                  return (
                    <div key={item.type} className="text-center">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--c-surface)] mx-auto">
                        <Icon className={`h-4 w-4 ${TYPE_COLORS[item.type]}`} />
                      </div>
                      <p className="text-xs font-medium text-[var(--c-text)] mt-1 tabular-nums">
                        {formatRupiah(item.balance)}
                      </p>
                      <p className="text-[10px] text-[var(--c-text-muted)]">{item.label}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}