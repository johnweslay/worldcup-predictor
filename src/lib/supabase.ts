import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co'
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder'
const supabaseSR   = process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'placeholder'

// Client-side (respects RLS)
export const supabase = createClient(supabaseUrl, supabaseAnon)

// Server-side only — bypasses RLS for admin operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseSR, {
  auth: { autoRefreshToken: false, persistSession: false },
})
