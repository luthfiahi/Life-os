'use client'

import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Sidebar } from './sidebar'
import { Header } from './header'

/**
 * Life OS Application Shell
 * Main layout wrapper with sidebar + header + content area.
 * 
 * Based on Life OS Documentation v1.2:
 * - Desktop (>= 1024px): Fixed sidebar + header
 * - Tablet (768-1023px): Header + content
 * - Mobile (<= 767px): Header + content + bottom nav
 */

interface AppShellProps {
  children: React.ReactNode
  title?: string
}

export function AppShell({ children, title }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Handle sidebar toggle
  const handleSidebarToggle = () => {
    setSidebarCollapsed((prev) => !prev)
  }

  const handleMobileMenuToggle = useCallback(() => {
    setMobileMenuOpen((prev) => !prev)
  }, [])

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false)
  }, [])

  return (
    <div className="min-h-screen bg-[var(--c-bg)]">
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={handleSidebarToggle}
      />

      {/* Main Content Area */}
      <div
        className={cn(
          'flex flex-col min-h-screen transition-all duration-200',
          'lg:ml-60', // default sidebar width
          sidebarCollapsed && 'lg:ml-16', // collapsed sidebar width
          // Mobile: full width, padding bottom for bottom nav
          'pb-16 lg:pb-0'
        )}
      >
        <Header
          onMenuToggle={handleMobileMenuToggle}
          title={title}
        />

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6" role="main">
          {children}
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-[var(--z-overlay)] bg-black/50 lg:hidden animate-fade-in"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}
    </div>
  )
}