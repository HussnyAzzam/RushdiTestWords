import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

// Singleton — prevents multiple GoTrueClient instances on HMR reloads
const _global = typeof window !== 'undefined' ? window : globalThis
if (!_global.__supabaseInstance) {
  _global.__supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}

export const supabase = _global.__supabaseInstance
export default supabase