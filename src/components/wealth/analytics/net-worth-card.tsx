'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useNetWorth } from '@/lib/queries/analytics-queries'
import { formatRupiah } from '@/lib/services/wealth.service'
import { Skeleton } from '@/components/ui/skeleton'
import { Landmark, Banknote, Smartphone, TrendingUp, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
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
          <Skeleton className="h-[140px] w-full rounded-[var(--radius-md)]" />
        ) : !data || data.totalAssets === 0 ? (
          <div className="flex items-center justify-center h-[140px] text-sm text-[var(--c-text-muted)]">
            Belum ada aset
          </div>
        ) : (
          <div className="space-y-3">
            {/* Main net worth number */}
            <div className="text-center">
              <p className={cn(
                'text-2xl font-bold tabular-nums',
                data.netWorth < 0 ? 'text-[var(--c-accent-2)]' : 'text-[var(--c-text)]',
              )}>
                {formatRupiah(data.netWorth)}
              </p>
              <p className="text-[10px] text-[var(--c-text-muted)] mt-0.5">Kekayaan Bersih</p>
            </div>

            {/* Assets vs Liabilities */}
            <div className="grid grid-cols-2 gap-2 text-center">
              <div>
                <p className="text-[10px] text-[var(--c-text-muted)]">Aset</p>
                <p className="text-xs font-semibold text-emerald-600 tabular-nums">{formatRupiah(data.totalAssets)}</p>
              </div>
              <div>
                <p className="text-[10px] text-[var(--c-text-muted)]">Utang</p>
                <p className={cn(
                  'text-xs font-semibold tabular-nums',
                  data.totalLiabilities > 0 ? 'text-[var(--c-accent-2)]' : 'text-[var(--c-text-muted)]',
                )}>
                  {data.totalLiabilities > 0 ? formatRupiah(data.totalLiabilities) : 'Rp 0'}
                </p>
              </div>
            </div>

            {/* Account type breakdown */}
            {data.byAccountType.length > 0 && (
              <div className="flex justify-center gap-3">
                {data.byAccountType.map((item) => {
                  const Icon = TYPE_ICONS[item.type]
                  return (
                    <div key={item.type} className="text-center">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--c-surface)] mx-auto">
                        <Icon className={cn('h-3.5 w-3.5', TYPE_COLORS[item.type])} />
                      </div>
                      <p className="text-[10px] font-medium text-[var(--c-text)] mt-0.5 tabular-nums">
                        {formatRupiah(item.balance)}
                      </p>
                      <p className="text-[9px] text-[var(--c-text-muted)]">{item.label}</p>
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