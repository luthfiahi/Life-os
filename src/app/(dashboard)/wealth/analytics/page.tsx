'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  CashFlowChart,
  MonthlyTrend,
  ExpenseByCategory,
  BudgetAnalytics,
  SpendingHeatmap,
  NetWorthCard,
  SavingsRateCard,
  FinancialInsights,
} from '@/components/wealth/analytics'
import { MONTH_NAMES } from '@/lib/services/analytics.service'

export default function AnalyticsPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)

  const navigateMonth = (delta: number) => {
    let m = month + delta
    let y = year
    if (m > 12) { m = 1; y++ }
    if (m < 1) { m = 12; y-- }
    setMonth(m)
    setYear(y)
  }

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
              <BarChart3 className="h-5 w-5 text-[var(--c-accent)]" />
              <h1 className="text-h1 text-[var(--c-text)]">Analytics</h1>
            </div>
            <p className="text-sm text-[var(--c-text-muted)] mt-1">
              Ubah data keuangan menjadi informasi yang actionable.
            </p>
          </div>
        </div>
      </div>

      {/* Month Navigator */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateMonth(-1)}
          className="text-[var(--c-text-muted)] hover:text-[var(--c-text)]"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-h2 text-[var(--c-text)] tabular-nums">
          {MONTH_NAMES[month - 1]} {year}
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateMonth(1)}
          className="text-[var(--c-text-muted)] hover:text-[var(--c-text)]"
          disabled={year === now.getFullYear() && month === now.getMonth() + 1}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Row 1: Net Worth + Savings Rate (side by side) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <NetWorthCard />
        <SavingsRateCard year={year} month={month} />
      </div>

      {/* Row 2: Cash Flow Chart (full width) */}
      <CashFlowChart />

      {/* Row 3: Monthly Trend (full width) */}
      <MonthlyTrend />

      {/* Row 4: Expense by Category + Budget Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ExpenseByCategory year={year} month={month} />
        <BudgetAnalytics year={year} month={month} />
      </div>

      {/* Row 5: Spending Heatmap (full width) */}
      <SpendingHeatmap year={year} month={month} />

      {/* Row 6: Financial Insights (full width) */}
      <FinancialInsights />
    </div>
  )
}
