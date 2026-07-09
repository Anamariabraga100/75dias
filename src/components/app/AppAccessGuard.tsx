import { Navigate, Outlet } from 'react-router-dom'
import { hasActiveAccess } from '../../lib/subscription'
import { getPostAuthPath } from '../../lib/onboardingRoute'
import { useAppStore } from '../../store/useAppStore'

/** Bloqueia /app até onboarding e assinatura ativa. */
export function AppAccessGuard() {
  const onboardingComplete = useAppStore((s) => s.onboardingComplete)
  const paymentComplete = useAppStore((s) => s.paymentComplete)
  const subscriptionStatus = useAppStore((s) => s.subscriptionStatus)
  const pixViewed = useAppStore((s) => s.pixViewed)

  const paid = hasActiveAccess(subscriptionStatus, paymentComplete)
  const target = getPostAuthPath(onboardingComplete, paid, pixViewed)
  if (target !== '/app') {
    return <Navigate to={target} replace />
  }

  return <Outlet />
}
