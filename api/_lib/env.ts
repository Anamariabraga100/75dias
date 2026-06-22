export function getAppUrl(): string {
  const url = process.env.APP_URL || process.env.VITE_APP_URL || ''
  return url.replace(/\/$/, '')
}

export function getGoogleRedirectUri(): string {
  return `${getAppUrl()}/api/auth/callback/google`
}

export function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing env: ${name}`)
  return value
}

export function encodeOAuthState(data: Record<string, string>): string {
  return Buffer.from(JSON.stringify(data)).toString('base64url')
}

export function decodeOAuthState(raw: string | undefined): Record<string, string> {
  if (!raw) return {}
  try {
    return JSON.parse(Buffer.from(raw, 'base64url').toString('utf8')) as Record<string, string>
  } catch {
    return {}
  }
}
