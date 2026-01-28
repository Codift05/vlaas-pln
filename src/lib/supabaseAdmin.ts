import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key'

if (!supabaseUrl || !supabaseServiceRoleKey) {
    if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL. Admin operations may fail.')
    }
}

// Create a Supabase client with the SERVICE ROLE key
// This client has admin privileges and bypasses RLS
export const supabaseAdmin = createClient(
    supabaseUrl,
    supabaseServiceRoleKey,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
)
