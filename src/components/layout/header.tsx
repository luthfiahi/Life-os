'use client'

import { useAuth } from '@/hooks/use-auth'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Sun, Moon, LogOut, Menu, Search, Bell } from 'lucide-react'

/**
 * Life OS Header Component
 * Based on Life OS Documentation v1.2, Chapter 4
 * 
 * Fixed header with:
 * - Page title / breadcrumb
 * - Search
 * - Notifications
 * - Theme toggle
 * - User menu / logout
 */

interface HeaderProps {
  onMenuToggle?: () => void
  title?: string
}

export function Header({ onMenuToggle, title }: HeaderProps) {
  const { user, signOut, loading: authLoading } = useAuth()
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <header
      className="sticky top-0 z-[var(--z-header)] flex h-14 items-center gap-4 border-b border-[var(--c-border)] bg-[var(--c-surface)] px-4 lg:px-6"
      role="banner"
    >
      {/* Mobile Menu Toggle */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden rounded-[var(--radius-sm)] p-1.5 text-[var(--c-text-muted)] hover:text-[var(--c-text)] hover:bg-[var(--c-card)] transition-colors"
        aria-label="Toggle menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Page Title */}
      <div className="flex-1 min-w-0">
        {title && (
          <h1 className="text-base font-semibold text-[var(--c-text)] truncate">
            {title}
          </h1>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Search (placeholder) */}
        <Button
          variant="ghost"
          size="icon"
          className="text-[var(--c-text-muted)] hover:text-[var(--c-text)]"
          aria-label="Cari"
        >
          <Search className="h-4 w-4" />
        </Button>

        {/* Notifications (placeholder) */}
        <Button
          variant="ghost"
          size="icon"
          className="text-[var(--c-text-muted)] hover:text-[var(--c-text)]"
          aria-label="Notifikasi"
        >
          <Bell className="h-4 w-4" />
        </Button>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="text-[var(--c-text-muted)] hover:text-[var(--c-text)]"
          aria-label={theme === 'dark' ? 'Mode terang' : 'Mode gelap'}
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>

        {/* User Avatar (mobile) */}
        <div className="lg:hidden flex items-center">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--c-accent)]/10 text-[var(--c-accent)] text-xs font-semibold">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
        </div>
      </div>
    </header>
  )
}