import { Navigate } from 'react-router-dom'
import { getPostAuthPath } from '../../lib/onboardingRoute'
import { useAppStore } from '../../store/useAppStore'

export function OnboardingIndexRedirect() {
  const onboardingComplete = useAppStore((s) => s.onboardingComplete)
  const paymentComplete = useAppStore((s) => s.paymentComplete)
  const pixViewed = useAppStore((s) => s.pixViewed)

  return <Navigate to={getPostAuthPath(onboardingComplete, paymentComplete, pixViewed)} replace />
}
