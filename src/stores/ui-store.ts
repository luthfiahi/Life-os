/**
 * Zustand UI store — manages sidebar state, active module, and mobile nav.
 */
import { create } from 'zustand'

export type ModuleKey =
  | 'dashboard'
  | 'wealth'
  | 'mission'
  | 'schedule'
  | 'discipline'
  | 'reflection'
  | 'brain'
  | 'coach'
  | 'insights'

export const MODULE_LABELS: Record<ModuleKey, string> = {
  dashboard: 'Dashboard',
  wealth: 'Wealth',
  mission: 'Mission',
  schedule: 'Schedule',
  discipline: 'Discipline',
  reflection: 'Reflection',
  brain: 'Brain',
  coach: 'Coach',
  insights: 'Insights',
}

interface UIState {
  sidebarCollapsed: boolean
  sidebarMobileOpen: boolean
  activeModule: ModuleKey

  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebarCollapsed: () => void
  setSidebarMobileOpen: (open: boolean) => void
  toggleSidebarMobile: () => void
  setActiveModule: (module: ModuleKey) => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  sidebarMobileOpen: false,
  activeModule: 'dashboard',

  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleSidebarCollapsed: () =>
    set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarMobileOpen: (open) => set({ sidebarMobileOpen: open }),
  toggleSidebarMobile: () =>
    set((s) => ({ sidebarMobileOpen: !s.sidebarMobileOpen })),
  setActiveModule: (module) =>
    set({ activeModule: module, sidebarMobileOpen: false }),
}))
