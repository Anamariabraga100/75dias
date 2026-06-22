import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

function loadEnv() {
  const raw = readFileSync('.env', 'utf8')
  const env = {}
  for (const line of raw.split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i === -1) continue
    env[t.slice(0, i).trim()] = t.slice(i + 1).trim()
  }
  return env
}

const env = loadEnv()
const url = env.VITE_SUPABASE_URL
const key = env.VITE_SUPABASE_ANON_KEY
const email = env.VITE_ADMIN_EMAIL
const password = env.VITE_ADMIN_PASSWORD

console.log('URL:', url ? 'ok' : 'missing')
console.log('Anon key:', key ? 'ok' : 'missing')
console.log('Admin email:', email || 'missing')
console.log('Admin password length:', password?.length ?? 0)

if (!url || !key || !email || !password) {
  process.exit(1)
}

const supabase = createClient(url, key)
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
})

if (error) {
  console.log('Supabase login FAIL:', error.message)
  process.exit(1)
}

console.log('Supabase login OK, user:', data.user?.email)

const { data: profile, error: pErr } = await supabase
  .from('profiles')
  .select('is_admin, email')
  .eq('user_id', data.user.id)
  .maybeSingle()

if (pErr) {
  console.log('Profile check FAIL:', pErr.message)
  console.log('(Migration SQL rodou no Supabase?)')
} else if (!profile) {
  console.log('Profile: não existe ainda — faça login no admin uma vez ou insert manual')
} else {
  console.log('Profile is_admin:', profile.is_admin)
}
