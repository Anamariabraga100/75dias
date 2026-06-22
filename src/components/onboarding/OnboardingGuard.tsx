import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { isOnboardingPaymentPath } from '../../lib/onboardingRoute'
import { useAppStore } from '../../store/useAppStore'

/** Onboarding uma vez; quem não pagou volta direto aos planos. */
export function OnboardingGuard() {
  const location = useLocation()
  const onboardingComplete = useAppStore((s) => s.onboardingComplete)
  const paymentComplete = useAppStore((s) => s.paymentComplete)

  if (onboardingComplete && paymentComplete) {
    const onPaymentFlow =
      location.pathname === '/onboarding/pagamento/sucesso' ||
      location.pathname === '/onboarding/pagamento'
    if (onPaymentFlow) return <Outlet />
    return <Navigate to="/app" replace />
  }

  if (onboardingComplete && !paymentComplete && !isOnboardingPaymentPath(location.pathname)) {
    return <Navigate to="/onboarding/planos" replace />
  }

  return <Outlet />
}
