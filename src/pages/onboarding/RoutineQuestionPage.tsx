import { useNavigate, useParams } from 'react-router-dom'
import { OnboardingLayout, PageTitle } from '../../components/layout/OnboardingLayout'
import { Button } from '../../components/ui/Button'
import { SelectionCard } from '../../components/ui/SelectionCard'
import {
  ROUTINE_STEPS,
  useAppStore,
  type RoutineAnswers,
  type RoutineStepId,
} from '../../store/useAppStore'

const STEP_ORDER: RoutineStepId[] = ['1', '2', '3', '4']

function StepProgress({ current }: { current: RoutineStepId }) {
  const idx = STEP_ORDER.indexOf(current)
  return (
    <div className="flex items-center gap-2 mb-6">
      {STEP_ORDER.map((step, i) => (
        <div
          key={step}
          className={`h-1 flex-1 rounded-full transition-colors ${
            i <= idx ? 'bg-accent-blue' : 'bg-neutral-800'
          }`}
        />
      ))}
    </div>
  )
}

export function RoutineQuestionPage() {
  const { step } = useParams<{ step: string }>()
  const navigate = useNavigate()
  const { routineAnswers, setRoutineAnswer, computeScores } = useAppStore()

  const config = ROUTINE_STEPS[step as RoutineStepId]
  if (!config) return null

  const allAnswered = config.questions.every((q) => routineAnswers[q.key] !== null)
  const stepNum = step as RoutineStepId

  const handleContinue = () => {
    if (stepNum === '4') computeScores()
    navigate(config.next)
  }

  return (
    <OnboardingLayout
      footer={
        <Button disabled={!allAnswered} onClick={handleContinue}>
          {stepNum === '4' ? 'Analisar minha rotina' : 'Continuar'}
        </Button>
      }
    >
      <StepProgress current={stepNum} />
      <PageTitle title={config.title} subtitle={config.subtitle} />

      <div className="space-y-8">
        {config.questions.map((question) => (
          <div key={question.key}>
            <p className="text-neutral-300 font-medium mb-3 flex items-center gap-2">
              <span>{question.emoji}</span>
              {question.label}
            </p>
            <div className="space-y-3">
              {question.options.map((opt) => (
                <SelectionCard
                  key={opt.value}
                  emoji={opt.emoji}
                  label={opt.label}
                  selected={routineAnswers[question.key] === opt.value}
                  onClick={() =>
                    setRoutineAnswer(
                      question.key,
                      opt.value as RoutineAnswers[typeof question.key]
                    )
                  }
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </OnboardingLayout>
  )
}
