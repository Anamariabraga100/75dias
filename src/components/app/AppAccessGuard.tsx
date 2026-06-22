import { Navigate, Outlet } from 'react-router-dom'
import { getPostAuthPath } from '../../lib/onboardingRoute'
import { useAppStore } from '../../store/useAppStore'

/** Bloqueia /app até onboarding e pagamento concluídos. */
export function AppAccessGuard() {
  const onboardingComplete = useAppStore((s) => s.onboardingComplete)
  const paymentComplete = useAppStore((s) => s.paymentComplete)
  const pixViewed = useAppStore((s) => s.pixViewed)

  const target = getPostAuthPath(onboardingComplete, paymentComplete, pixViewed)
  if (target !== '/app') {
    return <Navigate to={target} replace />
  }

  return <Outlet />
}
