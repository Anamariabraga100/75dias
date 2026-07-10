function headerValue(value) {
  if (Array.isArray(value)) return value[0] ?? ''
  return value ?? ''
}

/** Prefer host da requisição (evita mismatch se APP_URL estiver desatualizado). */
function getAppUrl(req) {
  if (req?.headers) {
    const host = headerValue(req.headers['x-forwarded-host']) || headerValue(req.headers.host)
    const proto = headerValue(req.headers['x-forwarded-proto']) || 'https'
    if (host && !host.startsWith('localhost') && !host.startsWith('127.0.0.1')) {
      return `${proto}://${host.split(',')[0].trim()}`.replace(/\/$/, '')
    }
  }

  const url = process.env.APP_URL || process.env.VITE_APP_URL || ''
  return url.replace(/\/$/, '')
}

function getGoogleRedirectUri(req) {
  return `${getAppUrl(req)}/api/auth/callback/google`
}

function requireEnv(name, fallbackName) {
  const value = process.env[name] || (fallbackName ? process.env[fallbackName] : undefined)
  if (!value) {
    const hint = fallbackName ? ` (ou ${fallbackName})` : ''
    throw new Error(`Missing env: ${name}${hint}`)
  }
  return value
}

function getSupabaseUrl() {
  return requireEnv('SUPABASE_URL', 'VITE_SUPABASE_URL')
}

function getSupabaseAnonKey() {
  return requireEnv('SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY')
}

function encodeOAuthState(data) {
  return Buffer.from(JSON.stringify(data)).toString('base64url')
}

function decodeOAuthState(raw) {
  if (!raw) return {}
  try {
    return JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'))
  } catch {
    return {}
  }
}

module.exports = {
  getAppUrl,
  getGoogleRedirectUri,
  requireEnv,
  getSupabaseUrl,
  getSupabaseAnonKey,
  encodeOAuthState,
  decodeOAuthState,
}
