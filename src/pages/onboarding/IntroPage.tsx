import { useNavigate } from 'react-router-dom'
import { OnboardingLayout } from '../../components/layout/OnboardingLayout'
import { Button } from '../../components/ui/Button'

export function IntroPage() {
  const navigate = useNavigate()

  return (
    <OnboardingLayout
      footer={<Button onClick={() => navigate('/onboarding/nome')}>Continuar</Button>}
    >
      <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-in">
        <h1 className="text-4xl font-bold gradient-text mb-4 leading-tight">
          Vamos falar sobre você
        </h1>
        <p className="text-neutral-400 text-base leading-relaxed max-w-xs">
          Só algumas perguntas para criar algo que realmente funcione para você
        </p>
      </div>
    </OnboardingLayout>
  )
}
