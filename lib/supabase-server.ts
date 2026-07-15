import { createClient } from '@supabase/supabase-js'
import { requireEnv } from './env'

const supabaseUrl = requireEnv('SUPABASE_URL')
const supabaseServiceRoleKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY')

// Server-only client: uses the service role key, which bypasses Row Level
// Security by design (AD-4). Never import this file from a Client Component.
export const supabaseServer = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false },
})
