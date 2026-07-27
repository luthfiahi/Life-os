'use client'

import { FileBarChart, ArrowLeft, Calendar, Download, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

/**
 * Wealth Reports — Placeholder
 * Will be built in a future sprint.
 */

const reportTemplates = [
  {
    title: 'Laporan Bulanan',
    description: 'Ringkasan pemasukan, pengeluaran, dan tabungan per bulan.',
    icon: Calendar,
    badge: 'Segera',
  },
  {
    title: 'Laporan Net Worth',
    description: 'Perubahan aset dan liabilitas dari waktu ke waktu.',
    icon: TrendingUp,
    badge: 'Segera',
  },
  {
    title: 'Laporan Budget',
    description: 'Analisis budget vs aktual untuk setiap kategori.',
    icon: FileBarChart,
    badge: 'Segera',
  },
]

export default function ReportsPage() {
  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div>
        <Link
          href="/wealth"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--c-text-muted)] hover:text-[var(--c-text)] transition-colors mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Kembali ke Wealth
        </Link>
        <h1 className="text-h1 text-[var(--c-text)]">Reports</h1>
        <p className="text-sm text-[var(--c-text-muted)] mt-1">
          Laporan keuangan yang bisa diunduh dan dianalisis.
        </p>
      </div>

      {/* Coming Soon Banner */}
      <Card className="p-5 bg-[var(--c-accent)]/10 border-[var(--c-accent)]/30">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--c-accent)]/10">
            <FileBarChart className="h-5 w-5 text-[var(--c-accent)]" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[var(--c-text)] mb-1">Reports Segera Hadir</h2>
            <p className="text-xs text-[var(--c-text-muted)] leading-relaxed">
              Modul laporan keuangan sedang dalam pengembangan. Kamu akan bisa mengunduh laporan bulanan,
              analisis net worth, dan perbandingan budget dalam format PDF.
            </p>
          </div>
        </div>
      </Card>

      {/* Report Templates */}
      <div className="space-y-3">
        {reportTemplates.map((report) => {
          const Icon = report.icon
          return (
            <Card key={report.title} className="group p-4 transition-all duration-200 hover:border-[var(--c-accent)]/30">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--c-surface)]">
                  <Icon className="h-5 w-5 text-[var(--c-text-muted)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-[var(--c-text)]">{report.title}</h3>
                    <Badge variant="outline" className="text-[10px]">{report.badge}</Badge>
                  </div>
                  <p className="text-xs text-[var(--c-text-muted)] mt-0.5">{report.description}</p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Suggestion */}
      <div className="text-center py-6">
        <p className="text-xs text-[var(--c-text-muted)]">
          Sementara itu, kunjungi{' '}
          <Link href="/wealth/analytics" className="text-[var(--c-accent)] hover:underline">
            Analytics
          </Link>
          {' '}untuk melihat chart dan insight keuangan.
        </p>
      </div>
    </div>
  )
}
