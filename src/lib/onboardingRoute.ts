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
  paid: boolean,
  pixViewed = false
): '/app' | '/onboarding/planos' | '/onboarding/nome' {
  if (onboardingComplete && (paid || pixViewed)) return '/app'
  if (onboardingComplete) return '/onboarding/planos'
  return '/onboarding/nome'
}

/** Rotas de login/cadastro — usuário autenticado é redirecionado ao app. */
export function shouldRedirectAuthenticatedFrom(pathname: string): boolean {
  if (pathname.startsWith('/admin')) return false
  if (pathname === '/auth/callback') return false
  return pathname === '/' || pathname.startsWith('/auth/email')
}
