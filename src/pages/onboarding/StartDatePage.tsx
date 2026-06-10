import { useNavigate } from 'react-router-dom'
import { OnboardingLayout, PageTitle } from '../../components/layout/OnboardingLayout'
import { SelectionCard } from '../../components/ui/SelectionCard'
import { useAppStore, type StartDateOption } from '../../store/useAppStore'

const OPTIONS: { id: StartDateOption; label: string }[] = [
  { id: 'other', label: 'Outra data' },
  { id: 'already', label: 'Já comecei' },
  { id: 'tomorrow', label: 'Amanhã' },
  { id: 'today', label: 'Hoje' },
]

export function StartDatePage() {
  const navigate = useNavigate()
  const { startDate, setStartDate, completeOnboarding } = useAppStore()

  const select = (option: StartDateOption) => {
    setStartDate(option)
    completeOnboarding()
    setTimeout(() => navigate('/app'), 300)
  }

  return (
    <OnboardingLayout showLogo={false} gradient="blue">
      <PageTitle
        title="Quando quer começar?"
        subtitle="Escolha a data para iniciar seu desafio"
      />
      <div className="space-y-3">
        {OPTIONS.map((opt) => (
          <SelectionCard
            key={opt.id}
            label={opt.label}
            selected={startDate === opt.id}
            onClick={() => select(opt.id)}
          />
        ))}
      </div>
    </OnboardingLayout>
  )
}
