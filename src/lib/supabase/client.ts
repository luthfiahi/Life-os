import { createBrowserClient } from '@supabase/ssr'

/**
 * Creates a Supabase browser client.
 * Returns null if env vars are missing or invalid (dev sandbox mode).
 */
export function createClient() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return null
    }
    return createBrowserClient(supabaseUrl, supabaseKey)
  } catch {
    // @supabase/ssr may throw if env vars are invalid during SSR/prerender
    return null
  }
}
