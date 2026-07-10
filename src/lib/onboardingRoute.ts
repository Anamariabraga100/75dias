/** Rotas do funil após o onboarding (pagamento). */
export const ONBOARDING_PAYMENT_PATHS = [
  '/onboarding/planos',
  '/onboarding/pagamento',
  '/onboarding/pagamento/sucesso',
  '/onboarding/oferta',
] as const

export function isOnboardingPaymentPath(pathname: string): boolean {
  return ONBOARDING_PAYMENT_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  )
}

export function getPostAuthPath(
  onboardingComplete: boolean,
  paid: boolean
): '/app' | '/onboarding/planos' | '/onboarding/nome' {
  if (onboardingComplete && paid) return '/app'
  if (onboardingComplete) return '/onboarding/planos'
  return '/onboarding/nome'
}

export function isSafeInternalPath(path: string): boolean {
  return path.startsWith('/') && !path.startsWith('//') && !path.includes('://')
}

/** Rotas de login/cadastro — usuário autenticado é redirecionado ao app. */
export function shouldRedirectAuthenticatedFrom(pathname: string): boolean {
  if (pathname.startsWith('/admin')) return false
  if (pathname === '/auth/callback') return false
  if (pathname.startsWith('/auth/email')) return false
  return pathname === '/'
}
