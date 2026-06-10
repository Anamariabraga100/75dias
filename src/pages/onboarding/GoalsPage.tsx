import { useNavigate } from 'react-router-dom'
import { OnboardingLayout, PageTitle } from '../../components/layout/OnboardingLayout'
import { Button } from '../../components/ui/Button'
import { MultiSelectCard } from '../../components/ui/SelectionCard'
import { GOAL_OPTIONS, useAppStore } from '../../store/useAppStore'

export function GoalsPage() {
  const navigate = useNavigate()
  const { goals, toggleGoal } = useAppStore()

  return (
    <OnboardingLayout
      footer={
        <Button
          disabled={goals.length === 0}
          onClick={() => navigate('/onboarding/ciencia')}
        >
          Continuar
        </Button>
      }
    >
      <PageTitle
        title="No que podemos te ajudar?"
        subtitle="Selecione uma ou mais opções"
      />
      <div className="space-y-3">
        {GOAL_OPTIONS.map((g) => (
          <MultiSelectCard
            key={g.id}
            emoji={g.emoji}
            label={g.label}
            selected={goals.includes(g.id)}
            onClick={() => toggleGoal(g.id)}
          />
        ))}
      </div>
    </OnboardingLayout>
  )
}
