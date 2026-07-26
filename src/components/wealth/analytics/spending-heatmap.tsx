'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSpendingHeatmap } from '@/lib/queries/analytics-queries'
import { Skeleton } from '@/components/ui/skeleton'
import { formatRupiah } from '@/lib/services/wealth.service'

const DAY_LABELS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

export function SpendingHeatmap({ year, month }: { year: number; month: number }) {
  const { data, isLoading } = useSpendingHeatmap(year, month)
  const [tooltipDay, setTooltipDay] = useState<string | null>(null)

  const { grid, maxAmount } = useMemo(() => {
    if (!data || data.length === 0) return { grid: [] as (typeof data)[0][][], maxAmount: 1 }

    const maxAmt = Math.max(...data.map((c) => c.amount), 1)
    const maxWeek = Math.max(...data.map((c) => c.week))

    const g: (typeof data)[0][][] = Array.from({ length: 7 }, () => [])
    for (const cell of data) {
      g[cell.dayOfWeek].push(cell)
    }
    const maxLen = maxWeek
    for (const row of g) {
      while (row.length < maxLen) {
        row.push({ date: '', dayOfWeek: 0, week: row.length, amount: 0 })
      }
    }

    return { grid: g, maxAmount: maxAmt }
  }, [data])

  const getHeatColor = (amount: number) => {
    if (amount === 0) return 'var(--c-surface)'
    const ratio = amount / maxAmount
    if (ratio < 0.25) return 'rgba(77, 180, 224, 0.2)'
    if (ratio < 0.5) return 'rgba(77, 180, 224, 0.4)'
    if (ratio < 0.75) return 'rgba(77, 180, 224, 0.6)'
    return 'var(--c-accent)'
  }

  const tooltipCell = tooltipDay ? data?.find((c) => c.date === tooltipDay) : null

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-h3 text-[var(--c-text)]">Spending Heatmap</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[180px] w-full rounded-[var(--radius-md)]" />
        ) : !data || data.length === 0 ? (
          <div className="flex items-center justify-center h-[180px] text-sm text-[var(--c-text-muted)]">
            Belum ada data pengeluaran
          </div>
        ) : (
          <div className="relative overflow-x-auto">
            {/* Week number labels */}
            <div className="flex gap-1 mb-1 pl-8">
              {grid[0]?.map((_, i) => (
                <div key={i} className="w-8 text-center text-[10px] text-[var(--c-text-muted)]">
                  W{i + 1}
                </div>
              ))}
            </div>
            {/* Grid rows: Mon-Sun */}
            <div className="flex flex-col gap-1">
              {DAY_LABELS.map((label, rowIdx) => (
                <div key={label} className="flex items-center gap-1">
                  <span className="w-6 text-right text-[10px] text-[var(--c-text-muted)]">{label}</span>
                  <div className="flex gap-1">
                    {grid[rowIdx]?.map((cell, colIdx) => {
                      const day = cell.date ? new Date(cell.date).getDate() : null
                      return (
                        <div
                          key={colIdx}
                          className="h-7 w-8 rounded-[var(--radius-sm)] flex items-center justify-center text-[10px] cursor-default transition-transform hover:scale-110 relative"
                          style={{ backgroundColor: getHeatColor(cell.amount) }}
                          onMouseEnter={() => cell.date && setTooltipDay(cell.date)}
                          onMouseLeave={() => setTooltipDay(null)}
                        >
                          {day ? (
                            <span className={cell.amount > 0 ? 'text-[var(--c-text)]' : 'text-[var(--c-text-muted)]'}>
                              {day}
                            </span>
                          ) : null}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Tooltip */}
            {tooltipCell && tooltipCell.amount > 0 && (
              <div className="absolute top-0 right-0 text-xs bg-[var(--c-header)] text-white px-2 py-1 rounded-[var(--radius-sm)] pointer-events-none">
                {tooltipCell.date} — {formatRupiah(tooltipCell.amount)}
              </div>
            )}

            {/* Legend */}
            <div className="flex items-center justify-end gap-1.5 mt-2">
              <span className="text-[10px] text-[var(--c-text-muted)]">Sedikit</span>
              {[0.2, 0.4, 0.6, 1].map((opacity, i) => (
                <div
                  key={i}
                  className="h-3 w-3 rounded-[var(--radius-sm)]"
                  style={{
                    backgroundColor: opacity === 1
                      ? 'var(--c-accent)'
                      : `rgba(77, 180, 224, ${opacity})`,
                  }}
                />
              ))}
              <span className="text-[10px] text-[var(--c-text-muted)]">Banyak</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}