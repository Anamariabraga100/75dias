export function isLocalDev(): boolean {
  if (typeof window === 'undefined') return false
  const host = window.location.hostname
  return host === 'localhost' || host === '127.0.0.1'
}

/** Origin do app — no browser usa o domínio atual (produção ou localhost). */
export function getAppOrigin(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin.replace(/\/$/, '')
  }

  const envUrl = import.meta.env.VITE_APP_URL as string | undefined
  if (envUrl?.trim()) {
    return envUrl.trim().replace(/\/$/, '')
  }
  return ''
}

export function getAuthCallbackUrl(params?: Record<string, string>): string {
  const origin = getAppOrigin()
  const search = params ? `?${new URLSearchParams(params).toString()}` : ''
  return `${origin}/auth/callback${search}`
}

export function useCustomGoogleOAuth(): boolean {
  if (import.meta.env.VITE_CUSTOM_GOOGLE_OAUTH !== 'true') return false
  if (isLocalDev()) return false
  return true
}

export function getGoogleOAuthStartUrl(options?: { returning?: boolean; next?: string }): string {
  const params = new URLSearchParams()
  if (options?.returning) params.set('returning', '1')
  if (options?.next) params.set('next', options.next)
  const qs = params.toString()
  const origin =
    getAppOrigin() || (typeof window !== 'undefined' ? window.location.origin : '')
  return `${origin}/api/auth/google${qs ? `?${qs}` : ''}`
}
