import { useNavigate } from 'react-router-dom'
import { OnboardingLayout, PageTitle } from '../../components/layout/OnboardingLayout'
import { SelectionCard } from '../../components/ui/SelectionCard'
import { useAppStore, type Gender } from '../../store/useAppStore'

const OPTIONS: { id: Gender; label: string }[] = [
  { id: 'male', label: 'Masculino' },
  { id: 'female', label: 'Feminino' },
  { id: 'other', label: 'Outro' },
  { id: 'prefer_not', label: 'Prefiro não informar' },
]

export function GenderPage() {
  const navigate = useNavigate()
  const { gender, setGender } = useAppStore()

  const select = (g: Gender) => {
    setGender(g)
    setTimeout(() => navigate('/onboarding/objetivos'), 200)
  }

  return (
    <OnboardingLayout>
      <PageTitle
        title="Qual é o seu gênero?"
        subtitle="Isso nos ajuda a personalizar sua jornada (opcional — LGPD)"
      />
      <div className="space-y-3">
        {OPTIONS.map((opt) => (
          <SelectionCard
            key={opt.id}
            label={opt.label}
            selected={gender === opt.id}
            onClick={() => select(opt.id)}
            showRadio={false}
          />
        ))}
      </div>
    </OnboardingLayout>
  )
}
