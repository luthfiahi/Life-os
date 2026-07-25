'use client'

import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  Wallet,
  Target,
  Calendar,
  Dumbbell,
  BookOpen,
  Brain,
  Bot,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

/**
 * Life OS Sidebar Navigation
 * Based on Life OS Documentation v1.2, Chapter 4 (Responsive Rules)
 * 
 * Desktop (>= 1024px): Permanent sidebar on the left
 * Tablet (768-1023px): Collapsible sidebar or bottom nav
 * Mobile (<= 767px): Bottom navigation bar
 * 
 * Navigation Items (9 modules):
 * 1. Command Center (Dashboard)
 * 2. Wealth
 * 3. Mission
 * 4. Schedule
 * 5. Discipline
 * 6. Reflection
 * 7. Brain
 * 8. Coach
 * 9. Insights
 */

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  description: string
}

const navItems: NavItem[] = [
  {
    label: 'Command Center',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Dashboard utama dan ringkasan hidup',
  },
  {
    label: 'Wealth',
    href: '/wealth',
    icon: Wallet,
    description: 'Keuangan, akun, transaksi, budget',
  },
  {
    label: 'Mission',
    href: '/mission',
    icon: Target,
    description: 'Tujuan, milestone, project',
  },
  {
    label: 'Schedule',
    href: '/schedule',
    icon: Calendar,
    description: 'Kalender, planner, time blocking',
  },
  {
    label: 'Discipline',
    href: '/discipline',
    icon: Dumbbell,
    description: 'Habit tracker, routine, streak',
  },
  {
    label: 'Reflection',
    href: '/reflection',
    icon: BookOpen,
    description: 'Jurnal, mood, review',
  },
  {
    label: 'Brain',
    href: '/brain',
    icon: Brain,
    description: 'Catatan, bookmark, ide',
  },
  {
    label: 'Coach',
    href: '/coach',
    icon: Bot,
    description: 'AI coaching dan rekomendasi',
  },
  {
    label: 'Insights',
    href: '/insights',
    icon: BarChart3,
    description: 'Analitik dan statistik hidup',
  },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const { user, signOut, loading: authLoading } = useAuth()

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-[var(--z-sidebar)] border-r border-[var(--c-border)] bg-[var(--c-surface)] transition-all duration-200',
          collapsed ? 'w-16' : 'w-60'
        )}
        role="navigation"
        aria-label="Navigasi utama"
      >
        {/* Logo Area */}
        <div className="flex items-center gap-3 px-4 h-14 border-b border-[var(--c-border)]">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--c-accent)]">
            <span className="text-sm font-bold text-white font-[family-name:var(--font-playfair)]">
              LO
            </span>
          </div>
          {!collapsed && (
            <div className="animate-fade-in overflow-hidden">
              <h1 className="text-sm font-bold text-[var(--c-text)] whitespace-nowrap">
                Life OS
              </h1>
              <p className="text-[10px] text-[var(--c-text-muted)] whitespace-nowrap">
                Personal Operating System
              </p>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-2 px-2">
          <ul className="space-y-0.5" role="list">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium transition-colors duration-150',
                      active
                        ? 'bg-[var(--c-accent)]/10 text-[var(--c-accent)]'
                        : 'text-[var(--c-text-muted)] hover:bg-[var(--c-card)] hover:text-[var(--c-text)]',
                      collapsed && 'justify-center px-2'
                    )}
                    title={collapsed ? item.label : undefined}
                    aria-current={active ? 'page' : undefined}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {!collapsed && (
                      <span className="animate-fade-in truncate">{item.label}</span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* User Section */}
        <div className="border-t border-[var(--c-border)] p-2">
          {!collapsed ? (
            <div className="flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--c-accent)]/10 text-[var(--c-accent)] text-xs font-semibold">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0 animate-fade-in">
                <p className="text-xs font-medium text-[var(--c-text)] truncate">
                  {user?.user_metadata?.full_name || 'Pengguna'}
                </p>
                <p className="text-[10px] text-[var(--c-text-muted)] truncate">
                  {user?.email || ''}
                </p>
              </div>
              <button
                onClick={signOut}
                disabled={authLoading}
                className="shrink-0 rounded-[var(--radius-sm)] p-1 text-[var(--c-text-muted)] hover:text-[var(--c-accent-2)] hover:bg-[var(--c-accent-2)]/10 transition-colors"
                aria-label="Keluar"
                title="Keluar"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={signOut}
              disabled={authLoading}
              className="flex w-full items-center justify-center rounded-[var(--radius-md)] px-2 py-2 text-[var(--c-text-muted)] hover:text-[var(--c-accent-2)] hover:bg-[var(--c-accent-2)]/10 transition-colors"
              aria-label="Keluar"
              title="Keluar"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Collapse Toggle */}
        <div className="border-t border-[var(--c-border)] p-2">
          <button
            onClick={onToggle}
            className="flex w-full items-center justify-center rounded-[var(--radius-md)] p-2 text-[var(--c-text-muted)] hover:bg-[var(--c-card)] hover:text-[var(--c-text)] transition-colors"
            aria-label={collapsed ? 'Perluas sidebar' : 'Perkecil sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-[var(--z-sidebar)] border-t border-[var(--c-border)] bg-[var(--c-surface)] lg:hidden"
        role="navigation"
        aria-label="Navigasi mobile"
      >
        <div className="flex items-center justify-around px-1 py-1">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-0.5 rounded-[var(--radius-md)] px-2 py-1.5 text-[10px] font-medium transition-colors',
                  active
                    ? 'text-[var(--c-accent)]'
                    : 'text-[var(--c-text-muted)]'
                )}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className="h-4 w-4" />
                <span className="truncate max-w-[56px]">{item.label}</span>
              </Link>
            )
          })}
          {/* More menu button for remaining items */}
          <Link
            href="/dashboard"
            className="flex flex-col items-center gap-0.5 rounded-[var(--radius-md)] px-2 py-1.5 text-[10px] font-medium text-[var(--c-text-muted)]"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="5" r="1" />
              <circle cx="12" cy="12" r="1" />
              <circle cx="12" cy="19" r="1" />
            </svg>
            <span>Lainnya</span>
          </Link>
        </div>
      </nav>
    </>
  )
}