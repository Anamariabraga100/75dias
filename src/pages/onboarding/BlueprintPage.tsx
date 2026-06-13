import { useNavigate } from 'react-router-dom'
import { OnboardingLayout, QuoteBox } from '../../components/layout/OnboardingLayout'
import { Button } from '../../components/ui/Button'
import { useAppStore } from '../../store/useAppStore'

export function BlueprintPage() {
  const navigate = useNavigate()
  const { profileInsights } = useAppStore()

  const text =
    profileInsights?.blueprintText ??
    'Com base na sua avaliação, montamos uma jornada personalizada de 90 dias.'

  return (
    <OnboardingLayout
      footer={<Button onClick={() => navigate('/onboarding/transformacao')}>Continuar</Button>}
    >
      <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-in">
        <div className="text-6xl mb-6">🗝️</div>
        <h1 className="text-3xl font-bold mb-6">Seu plano está pronto</h1>
        <QuoteBox>{text}</QuoteBox>

        {profileInsights?.strongAreas && profileInsights.strongAreas.length > 0 && (
          <p className="text-neutral-500 text-sm mt-4">
            Seus pontos fortes:{' '}
            <span className="text-neutral-300">{profileInsights.strongAreas.join(' e ')}</span>
          </p>
        )}
      </div>
    </OnboardingLayout>
  )
}
