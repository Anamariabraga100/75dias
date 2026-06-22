/** URL pública do app — produção usa VITE_APP_URL; local usa origin atual. */
export function getAppOrigin(): string {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname
    if (host === 'localhost' || host === '127.0.0.1') {
      return window.location.origin
    }
  }

  const envUrl = import.meta.env.VITE_APP_URL as string | undefined
  if (envUrl?.trim()) {
    return envUrl.trim().replace(/\/$/, '')
  }

  if (typeof window !== 'undefined') {
    return window.location.origin
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

  if (typeof window !== 'undefined') {
    const host = window.location.hostname
    if (host === 'localhost' || host === '127.0.0.1') return false
  }

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
