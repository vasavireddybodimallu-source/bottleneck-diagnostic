import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY — check your .env file.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Ensures the visitor has a Supabase session before any read/write.
 * Uses anonymous auth so every row can be scoped to auth.uid() and RLS
 * can prove one user cannot see another user's rows — no signup UI needed.
 */
export async function ensureUser() {
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.user) return session.user

  const { data, error } = await supabase.auth.signInAnonymously()
  if (error) throw error
  return data.user
}
