/**
 * Life OS — Sprint 2 Mock Data
 * Provides realistic mock data for all dashboard widgets.
 * Will be replaced with real Supabase queries in future sprints.
 */

// ─── Life Score ─────────────────────────────────────────────
export interface LifeScoreData {
  overall: number
  categories: {
    name: string
    score: number
    icon: string
    color: string
    trend: 'up' | 'down' | 'stable'
  }[]
}

export const mockLifeScore: LifeScoreData = {
  overall: 72,
  categories: [
    { name: 'Keuangan', score: 78, icon: 'Wallet', color: 'text-emerald-500', trend: 'up' },
    { name: 'Misi', score: 65, icon: 'Target', color: 'text-blue-500', trend: 'up' },
    { name: 'Kesehatan', score: 70, icon: 'Heart', color: 'text-rose-500', trend: 'stable' },
    { name: 'Disiplin', score: 82, icon: 'Dumbbell', color: 'text-orange-500', trend: 'up' },
    { name: 'Refleksi', score: 55, icon: 'BookOpen', color: 'text-amber-500', trend: 'down' },
    { name: 'Belajar', score: 68, icon: 'Brain', color: 'text-pink-500', trend: 'stable' },
  ],
}

// ─── Today's Focus ──────────────────────────────────────────
export interface FocusItem {
  id: string
  title: string
  category: string
  categoryColor: string
  priority: 'high' | 'medium' | 'low'
  done: boolean
  time?: string
}

export const mockFocusItems: FocusItem[] = [
  {
    id: '1',
    title: 'Review budget bulanan Juli',
    category: 'Wealth',
    categoryColor: 'bg-emerald-500/10 text-emerald-600',
    priority: 'high',
    done: false,
    time: '09:00',
  },
  {
    id: '2',
    title: 'Olahraga pagi — 30 menit cardio',
    category: 'Disiplin',
    categoryColor: 'bg-orange-500/10 text-orange-600',
    priority: 'high',
    done: true,
    time: '06:30',
  },
  {
    id: '3',
    title: 'Baca 20 halaman Atomic Habits',
    category: 'Brain',
    categoryColor: 'bg-pink-500/10 text-pink-600',
    priority: 'medium',
    done: false,
    time: '20:00',
  },
  {
    id: '4',
    title: 'Tulis jurnal refleksi mingguan',
    category: 'Reflection',
    categoryColor: 'bg-amber-500/10 text-amber-600',
    priority: 'medium',
    done: false,
  },
  {
    id: '5',
    title: 'Update progress Q3 OKR',
    category: 'Mission',
    categoryColor: 'bg-blue-500/10 text-blue-600',
    priority: 'low',
    done: false,
  },
]

// ─── Quick Actions ──────────────────────────────────────────
export interface QuickAction {
  id: string
  label: string
  icon: string
  color: string
  bgColor: string
  href: string
}

export const mockQuickActions: QuickAction[] = [
  { id: 'qa1', label: 'Tambah Transaksi', icon: 'PlusCircle', color: 'text-emerald-500', bgColor: 'bg-emerald-500/10', href: '/wealth' },
  { id: 'qa2', label: 'Log Habit', icon: 'CheckCircle2', color: 'text-orange-500', bgColor: 'bg-orange-500/10', href: '/discipline' },
  { id: 'qa3', label: 'Catatan Baru', icon: 'FileText', color: 'text-pink-500', bgColor: 'bg-pink-500/10', href: '/brain' },
  { id: 'qa4', label: 'Buat Target', icon: 'Crosshair', color: 'text-blue-500', bgColor: 'bg-blue-500/10', href: '/mission' },
  { id: 'qa5', label: 'Jurnal Hari Ini', icon: 'PenLine', color: 'text-amber-500', bgColor: 'bg-amber-500/10', href: '/reflection' },
  { id: 'qa6', label: 'Chat AI Coach', icon: 'MessageCircle', color: 'text-cyan-500', bgColor: 'bg-cyan-500/10', href: '/coach' },
]

// ─── Snapshot Cards ─────────────────────────────────────────
export interface SnapshotCard {
  id: string
  title: string
  module: string
  href: string
  icon: string
  color: string
  bgColor: string
  metrics: {
    label: string
    value: string
    change?: string
    changeType?: 'positive' | 'negative' | 'neutral'
  }[]
}

export const mockSnapshotCards: SnapshotCard[] = [
  {
    id: 'snap1',
    title: 'Keuangan',
    module: 'Wealth',
    href: '/wealth',
    icon: 'Wallet',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    metrics: [
      { label: 'Saldo Bulan Ini', value: 'Rp 12.4 Jt', change: '+8.2%', changeType: 'positive' },
      { label: 'Pengeluaran Hari Ini', value: 'Rp 185.000', change: '-12%', changeType: 'positive' },
      { label: 'Budget Terpakai', value: '67%', changeType: 'neutral' },
    ],
  },
  {
    id: 'snap2',
    title: 'Kesehatan',
    module: 'Health',
    href: '/discipline',
    icon: 'Heart',
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10',
    metrics: [
      { label: 'Kalori Hari Ini', value: '1,450 kcal', change: '+15%', changeType: 'positive' },
      { label: 'Langkah', value: '6,230', change: '-22%', changeType: 'negative' },
      { label: 'Tidur Semalam', value: '7.2 jam', changeType: 'neutral' },
    ],
  },
  {
    id: 'snap3',
    title: 'Target & Misi',
    module: 'Mission',
    href: '/mission',
    icon: 'Target',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    metrics: [
      { label: 'OKR Progress', value: '68%', change: '+5%', changeType: 'positive' },
      { label: 'Milestone Selesai', value: '3/7', changeType: 'neutral' },
      { label: 'Hari ke Deadline', value: '23 hari', changeType: 'neutral' },
    ],
  },
  {
    id: 'snap4',
    title: 'Habit & Rutinitas',
    module: 'Discipline',
    href: '/discipline',
    icon: 'Dumbbell',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    metrics: [
      { label: 'Streak Aktif', value: '14 hari', change: '+3', changeType: 'positive' },
      { label: 'Habit Selesai Hari Ini', value: '5/8', changeType: 'neutral' },
      { label: 'Completion Rate', value: '82%', change: '+7%', changeType: 'positive' },
    ],
  },
]

// ─── Recent Activity ────────────────────────────────────────
export interface ActivityItem {
  id: string
  action: string
  module: string
  moduleColor: string
  timestamp: string
  icon: string
}

export const mockRecentActivity: ActivityItem[] = [
  { id: 'act1', action: 'Menambahkan transaksi makan siang — Rp 45.000', module: 'Wealth', moduleColor: 'text-emerald-500', timestamp: '2 jam lalu', icon: 'Receipt' },
  { id: 'act2', action: 'Menyelesaikan habit: Olahraga pagi', module: 'Discipline', moduleColor: 'text-orange-500', timestamp: '4 jam lalu', icon: 'CheckCircle2' },
  { id: 'act3', action: 'Update milestone: "Launch MVP" → 80%', module: 'Mission', moduleColor: 'text-blue-500', timestamp: '5 jam lalu', icon: 'Target' },
  { id: 'act4', action: 'Menulis jurnal refleksi pagi', module: 'Reflection', moduleColor: 'text-amber-500', timestamp: '8 jam lalu', icon: 'PenLine' },
  { id: 'act5', action: 'Menambahkan catatan: "Ide fitur dashboard baru"', module: 'Brain', moduleColor: 'text-pink-500', timestamp: 'Kemarin', icon: 'FileText' },
  { id: 'act6', action: 'Budget review mingguan selesai', module: 'Wealth', moduleColor: 'text-emerald-500', timestamp: 'Kemarin', icon: 'PieChart' },
  { id: 'act7', action: 'Streak meditasi mencapai 14 hari!', module: 'Discipline', moduleColor: 'text-orange-500', timestamp: '2 hari lalu', icon: 'Flame' },
  { id: 'act8', action: 'Buat target baru: "Belajar TypeScript lanjutan"', module: 'Mission', moduleColor: 'text-blue-500', timestamp: '3 hari lalu', icon: 'PlusCircle' },
]

// ─── AI Coach Insight (Placeholder) ─────────────────────────
export interface AICoachInsight {
  id: string
  message: string
  type: 'insight' | 'suggestion' | 'motivation'
}

export const mockAICoachInsights: AICoachInsight[] = [
  {
    id: 'ai1',
    message: 'Pengeluaran makan di luar naik 15% minggu ini. Coba masak lebih sering untuk menghemat Rp 200-300rb/minggu.',
    type: 'insight',
  },
  {
    id: 'ai2',
    message: 'Streak olahraga kamu 14 hari — pertahankan! Hari ini belum tercatat, yuk jadwalkan sebelum jam 7 malam.',
    type: 'suggestion',
  },
  {
    id: 'ai3',
    message: '"Konsistensi kecil setiap hari lebih kuat dari usaha besar sesekali." Kamu sudah di jalur yang benar.',
    type: 'motivation',
  },
]
