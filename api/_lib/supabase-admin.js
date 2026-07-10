const { createClient } = require('@supabase/supabase-js')
const { requireEnv, getSupabaseUrl } = require('./env')

let adminClient = null

function getSupabaseAdmin() {
  if (!adminClient) {
    adminClient = createClient(
      getSupabaseUrl(),
      requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
      { auth: { persistSession: false, autoRefreshToken: false } }
    )
  }
  return adminClient
}

module.exports = { getSupabaseAdmin }
