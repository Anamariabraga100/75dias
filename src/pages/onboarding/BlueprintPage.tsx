import { useNavigate } from 'react-router-dom'
import { OnboardingLayout, QuoteBox } from '../../components/layout/OnboardingLayout'
import { Button } from '../../components/ui/Button'
import { useAppStore } from '../../store/useAppStore'

export function BlueprintPage() {
  const navigate = useNavigate()
  const { name, weakAreas, recommendedChallenge } = useAppStore()
  const displayName = name || 'você'
  const capitalized = displayName.charAt(0).toUpperCase() + displayName.slice(1)

  const challengeName =
    recommendedChallenge === 'hard'
      ? '75 Dias Hard'
      : recommendedChallenge === 'soft'
        ? '75 Dias Soft'
        : '75 Dias Medium'

  const weakText =
    weakAreas.length >= 2
      ? `${weakAreas[0]} e ${weakAreas[1]}`
      : weakAreas[0] ?? 'consistência'

  return (
    <OnboardingLayout
      footer={<Button onClick={() => navigate('/onboarding/transformacao')}>Continuar</Button>}
    >
      <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-in">
        <div className="text-6xl mb-6">🗝️</div>
        <h1 className="text-3xl font-bold mb-6">Seu plano está pronto</h1>
        <QuoteBox>
          {capitalized}, com base na sua rotina, montamos uma jornada de 75 dias focada em{' '}
          {weakText}. Recomendamos começar com o {challengeName} — no ritmo certo para você
          agora.
        </QuoteBox>
      </div>
    </OnboardingLayout>
  )
}
