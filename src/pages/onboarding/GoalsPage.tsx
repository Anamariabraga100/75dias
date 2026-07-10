import { useNavigate } from 'react-router-dom'
import { OnboardingLayout, PageTitle } from '../../components/layout/OnboardingLayout'
import { Button } from '../../components/ui/Button'
import { MultiSelectCard } from '../../components/ui/SelectionCard'
import { OnboardingProgress } from '../../components/ui/OnboardingProgress'
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
      <OnboardingProgress current={2} total={8} label="Montando seu perfil" />
      <PageTitle
        className="mb-4"
        title="O que você quer melhorar?"
        subtitle="Pode escolher mais de uma — vamos focar no que importa pra você."
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
