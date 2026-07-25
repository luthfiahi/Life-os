/**
 * Zustand auth store — single source of truth for auth state.
 * Manages user session, login, logout, and OAuth flows.
 */
import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { User, Session } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  initialized: boolean
  error: string | null

  initialize: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signInWithOAuth: (provider: 'google' | 'github') => Promise<void>
  signOut: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  loading: true,
  initialized: false,
  error: null,

  initialize: async () => {
    if (get().initialized) return

    try {
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()
      set({
        session,
        user: session?.user ?? null,
        loading: false,
        initialized: true,
      })

      // Listen for auth state changes (session refresh, sign-out, etc.)
      supabase.auth.onAuthStateChange((_event, session) => {
        set({
          session,
          user: session?.user ?? null,
          loading: false,
          initialized: true,
        })
      })
    } catch {
      set({ loading: false, initialized: true, error: 'Gagal menginisialisasi autentikasi' })
    }
  },

  signInWithEmail: async (email: string, password: string) => {
    set({ loading: true, error: null })
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        // Map Supabase error messages to Indonesian
        let message = error.message
        if (message.includes('Invalid login')) {
          message = 'Email atau kata sandi salah'
        } else if (message.includes('Too many')) {
          message = 'Terlalu banyak percobaan. Coba lagi dalam beberapa menit.'
        }
        set({ error: message, loading: false })
        throw new Error(message)
      }
      set({ loading: false })
    } catch (err) {
      set({ loading: false })
      throw err
    }
  },

  signInWithOAuth: async (provider: 'google' | 'github') => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  },

  signOut: async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    set({ user: null, session: null, error: null })
  },

  clearError: () => set({ error: null }),
}))
