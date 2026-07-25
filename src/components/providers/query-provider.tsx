  /** 
   * Life OS — TanStack Query Provider
   *
   * Wraps the app with QueryClientProvider.
   * Uses a single QueryClient instance (not re-created per render).
   */

'use client'

import { useState } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { createQueryClient } from '@/lib/queries/query-client'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // useState ensures the QueryClient is created once per client-side mount
  // and never re-created on re-renders.
  const [queryClient] = useState(() => createQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
