import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createClient } from '@supabase/supabase-js'

function loadEnv() {
  const raw = readFileSync(join(process.cwd(), '.env'), 'utf8')
  const env = {}
  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const i = trimmed.indexOf('=')
    if (i === -1) continue
    env[trimmed.slice(0, i).trim()] = trimmed.slice(i + 1).trim()
  }
  return env
}

const env = loadEnv()
const url = env.VITE_SUPABASE_URL
const anonKey = env.VITE_SUPABASE_ANON_KEY
const redirectTo = 'http://localhost:4444/auth/callback'

const checks = []

function ok(name, detail) {
  checks.push({ name, ok: true, detail })
  console.log(`OK  ${name}: ${detail}`)
}

function fail(name, detail) {
  checks.push({ name, ok: false, detail })
  console.error(`FAIL ${name}: ${detail}`)
}

if (!url || /SEU_PROJECT|seu_project/i.test(url)) {
  fail('env', 'VITE_SUPABASE_URL ausente ou placeholder')
} else {
  ok('env', 'VITE_SUPABASE_URL definida')
}

if (!anonKey || anonKey.includes('sua_anon')) {
  fail('env', 'VITE_SUPABASE_ANON_KEY ausente ou placeholder')
} else {
  ok('env', 'VITE_SUPABASE_ANON_KEY definida')
}

if (!url || !anonKey) {
  process.exit(1)
}

const supabase = createClient(url, anonKey)

try {
  const res = await fetch(`${url}/auth/v1/settings`, {
    headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
  })
  if (!res.ok) {
    fail('auth-settings', `HTTP ${res.status}`)
  } else {
    const settings = await res.json()
    const google = settings.external?.google
    if (google) {
      ok('auth-settings', 'Google provider habilitado no Supabase')
    } else {
      fail('auth-settings', 'Google provider não aparece habilitado')
    }
  }
} catch (e) {
  fail('auth-settings', e instanceof Error ? e.message : String(e))
}

const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: { redirectTo, skipBrowserRedirect: true },
})

if (error) {
  fail('oauth-url', error.message)
} else if (!data?.url) {
  fail('oauth-url', 'Resposta sem URL de redirect')
} else {
  const parsed = new URL(data.url)
  const host = parsed.hostname
  if (host.includes('accounts.google.com') || host.includes('supabase.co')) {
    ok('oauth-url', `URL gerada (${host})`)
  } else {
    fail('oauth-url', `Host inesperado: ${host}`)
  }
}

const failed = checks.filter((c) => !c.ok)
console.log('')
console.log(failed.length === 0 ? 'Todos os testes passaram.' : `${failed.length} teste(s) falharam.`)
process.exit(failed.length === 0 ? 0 : 1)
