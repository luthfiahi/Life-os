/**
 * Life OS — TanStack Query Client Configuration
 *
 * Central QueryClient instance shared across the app.
 * Configured with sensible defaults for the Life OS dashboard.
 *
 * Stale times are tuned for a personal dashboard:
 * - Snapshot data: 2 min (don't hammer Supabase on every tab switch)
 * - List data: 5 min
 * - Detail data: 10 min
 */

import { QueryClient } from '@tanstack/react-query'

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Don't refetch on window focus for a personal dashboard
        refetchOnWindowFocus: false,
        // Retry failed requests once (network hiccups)
        retry: 1,
        // Data is stale after 2 minutes
        staleTime: 2 * 60 * 1000,
        // Cache entries are garbage-collected after 10 minutes
        gcTime: 10 * 60 * 1000,
      },
      mutations: {
        // Don't retry mutations
        retry: false,
      },
    },
  })
}
