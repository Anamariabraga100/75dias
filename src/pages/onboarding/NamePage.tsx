import { useNavigate } from 'react-router-dom'
import { OnboardingLayout, PageTitle } from '../../components/layout/OnboardingLayout'
import { Button } from '../../components/ui/Button'
import { InputField } from '../../components/ui/InputField'
import { OnboardingProgress } from '../../components/ui/OnboardingProgress'
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
      <OnboardingProgress current={1} total={8} label="Montando seu perfil" />
      <PageTitle
        className="mb-4"
        title="Como você gosta de ser chamado?"
        subtitle="Usamos esse nome no app — do seu jeito, sem formalidade."
      />
      <p className="text-neutral-500 text-sm mb-4 leading-relaxed">
        Seu plano de 90 dias começa com quem você é hoje — e termina com quem você quer ser.
      </p>
      <InputField
        value={name}
        onChange={setName}
        placeholder="Ex.: Lu, Ana, João…"
      />
    </OnboardingLayout>
  )
}
