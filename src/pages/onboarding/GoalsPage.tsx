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
      showLogo={false}
      footer={
        <Button
          disabled={goals.length === 0}
          onClick={() => navigate('/onboarding/quiz/1')}
        >
          Continuar
        </Button>
      }
    >
      <PageTitle
        title="O que você quer melhorar?"
        subtitle="Pode escolher mais de uma área"
      />
      <div className="space-y-2.5">
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
