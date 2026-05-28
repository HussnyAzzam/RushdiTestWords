import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

// Singleton — reuse across HMR reloads to prevent multiple GoTrueClient instances
let supabase

if (import.meta.hot) {
  // In dev: reuse existing instance stored in HMR data
  supabase = import.meta.hot.data.supabase
  if (!supabase) {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    import.meta.hot.data.supabase = supabase
  }
} else {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}

export { supabase }
export default supabase
