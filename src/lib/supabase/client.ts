import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Singleton pattern - create client once
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    // Return null during build time to prevent errors
    return null as any
  }

  // Return existing client if already created
  if (supabaseClient) {
    return supabaseClient
  }

  // Create and cache the client
  supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey)
  return supabaseClient
}
