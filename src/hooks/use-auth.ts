'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User, Session } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          setState((prev) => ({ ...prev, loading: false, error: error.message }))
          return
        }

        setState({
          user: session?.user ?? null,
          session: session ?? null,
          loading: false,
          error: null,
        })
      } catch (err) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : 'Gagal memuat sesi',
        }))
      }
    }

    getSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({
        user: session?.user ?? null,
        session: session ?? null,
        loading: false,
        error: null,
      })
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setState((prev) => ({ ...prev, loading: false, error: error.message }))
        return { data: null, error }
      }

      setState({
        user: data.user,
        session: data.session,
        loading: false,
        error: null,
      })

      router.push('/dashboard')
      return { data, error: null }
    },
    [supabase, router]
  )

  const signUpWithEmail = useCallback(
    async (email: string, password: string, fullName: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) {
        setState((prev) => ({ ...prev, loading: false, error: error.message }))
        return { data: null, error }
      }

      setState((prev) => ({ ...prev, loading: false }))
      return { data, error: null }
    },
    [supabase]
  )

  const signOut = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }))

    const { error } = await supabase.auth.signOut()

    if (error) {
      setState((prev) => ({ ...prev, loading: false, error: error.message }))
      return
    }

    setState({ user: null, session: null, loading: false, error: null })
    router.push('/login')
  }, [supabase, router])

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }))
  }, [])

  return {
    ...state,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    clearError,
  }
}