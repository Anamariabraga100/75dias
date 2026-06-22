import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const AUTH_STORAGE_KEY = 'reset90-auth'

export const supabase: SupabaseClient | null =
  url && anonKey
    ? createClient(url, anonKey, {
        auth: {
          flowType: 'pkce',
          detectSessionInUrl: true,
          persistSession: true,
          autoRefreshToken: true,
          storage: localStorage,
          storageKey: AUTH_STORAGE_KEY,
        },
      })
    : null

export function isSupabaseConfigured(): boolean {
  return supabase !== null
}
