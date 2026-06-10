import { useNavigate } from 'react-router-dom'
import { OnboardingLayout, PageTitle } from '../../components/layout/OnboardingLayout'
import { Button } from '../../components/ui/Button'

export function ReadyPage() {
  const navigate = useNavigate()

  return (
    <OnboardingLayout
      footer={<Button onClick={() => navigate('/onboarding/beneficios')}>Continuar</Button>}
    >
      <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-in">
        <div className="text-7xl mb-8">⚡</div>
        <PageTitle
          title="Pronto para retomar o controle?"
          className="text-center [&_h1]:text-2xl"
        />
      </div>
    </OnboardingLayout>
  )
}
