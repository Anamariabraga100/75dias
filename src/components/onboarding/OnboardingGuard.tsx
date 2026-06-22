import { Navigate, Outlet } from 'react-router-dom'
import { useAppStore } from '../../store/useAppStore'

/** Impede refazer onboarding depois de concluído (uma vez só). */
export function OnboardingGuard() {
  const onboardingComplete = useAppStore((s) => s.onboardingComplete)
  const paymentComplete = useAppStore((s) => s.paymentComplete)

  if (onboardingComplete && paymentComplete) {
    return <Navigate to="/app" replace />
  }

  return <Outlet />
}
