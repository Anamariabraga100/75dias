import { useNavigate } from 'react-router-dom'
import { OnboardingLayout, PageTitle } from '../../components/layout/OnboardingLayout'
import { Button } from '../../components/ui/Button'
import { InputField } from '../../components/ui/InputField'
import { useAppStore } from '../../store/useAppStore'

export function NamePage() {
  const navigate = useNavigate()
  const { name, setName } = useAppStore()

  return (
    <OnboardingLayout
      footer={
        <Button
          disabled={name.trim().length < 2}
          onClick={() => navigate('/onboarding/objetivos')}
        >
          Continuar
        </Button>
      }
    >
      <PageTitle
        title="Como você gosta de ser chamado?"
        subtitle="Usamos esse nome no seu perfil e nas mensagens do app — do seu jeito."
      />
      <div className="mt-auto mb-4">
        <InputField
          value={name}
          onChange={setName}
          placeholder="Ex.: Lu, Ana, João…"
        />
      </div>
    </OnboardingLayout>
  )
}
