import { Navigate } from 'react-router-dom'
import { getPostAuthPath } from '../../lib/onboardingRoute'
import { hasActiveAccess } from '../../lib/subscription'
import { useAppStore } from '../../store/useAppStore'

export function OnboardingIndexRedirect() {
  const onboardingComplete = useAppStore((s) => s.onboardingComplete)
  const paymentComplete = useAppStore((s) => s.paymentComplete)
  const subscriptionStatus = useAppStore((s) => s.subscriptionStatus)
  const paid = hasActiveAccess(subscriptionStatus, paymentComplete)

  return <Navigate to={getPostAuthPath(onboardingComplete, paid)} replace />
}
