import { useNavigate } from 'react-router-dom'
import { OnboardingLayout, QuoteBox } from '../../components/layout/OnboardingLayout'
import { Button } from '../../components/ui/Button'
import { useAppStore } from '../../store/useAppStore'

export function BlueprintPage() {
  const navigate = useNavigate()
  const { name } = useAppStore()
  const displayName = name || 'você'

  return (
    <OnboardingLayout
      footer={<Button onClick={() => navigate('/onboarding/transformacao')}>Continuar</Button>}
    >
      <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-in">
        <div className="text-6xl mb-6">🗝️</div>
        <h1 className="text-3xl font-bold mb-6">Seu plano está pronto</h1>
        <QuoteBox>
          {displayName.charAt(0).toUpperCase() + displayName.slice(1)}, com base na sua
          avaliação, montamos uma jornada personalizada de 75 dias que ataca exatamente as
          áreas onde você precisa de breakthrough.
        </QuoteBox>
      </div>
    </OnboardingLayout>
  )
}
