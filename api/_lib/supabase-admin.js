const { createClient } = require('@supabase/supabase-js')
const { requireEnv } = require('./env')

let adminClient = null

function getSupabaseAdmin() {
  if (!adminClient) {
    adminClient = createClient(
      requireEnv('SUPABASE_URL'),
      requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
      { auth: { persistSession: false, autoRefreshToken: false } }
    )
  }
  return adminClient
}

module.exports = { getSupabaseAdmin }
