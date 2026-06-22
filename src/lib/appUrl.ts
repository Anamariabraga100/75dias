/** URL pública do app — use na Vercel para OAuth voltar ao domínio certo (não localhost). */
export function getAppOrigin(): string {
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
  return import.meta.env.VITE_CUSTOM_GOOGLE_OAUTH === 'true'
}

export function getGoogleOAuthStartUrl(options?: { returning?: boolean; next?: string }): string {
  const params = new URLSearchParams()
  if (options?.returning) params.set('returning', '1')
  if (options?.next) params.set('next', options.next)
  const qs = params.toString()
  return `/api/auth/google${qs ? `?${qs}` : ''}`
}
