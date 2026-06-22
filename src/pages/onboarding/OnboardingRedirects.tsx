import { Navigate, useParams } from 'react-router-dom'

/** Rotas antigas do funil longo → funil comercial enxuto */
export function LegacyRotinaRedirect() {
  const { step } = useParams<{ step: string }>()
  if (step === '1' || step === '2' || step === '3' || step === '4' || step === '5' || step === '6') {
    return <Navigate to={`/onboarding/quiz/${step}`} replace />
  }
  return <Navigate to="/onboarding/resultado" replace />
}
