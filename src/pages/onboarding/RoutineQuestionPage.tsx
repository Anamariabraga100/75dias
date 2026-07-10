import { useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { OnboardingLayout, PageTitle } from '../../components/layout/OnboardingLayout'
import { SelectionCard } from '../../components/ui/SelectionCard'
import {
  QUIZ_STEP_ORDER,
  ROUTINE_STEPS,
  useAppStore,
  type RoutineAnswers,
  type RoutineStepId,
} from '../../store/useAppStore'

const ADVANCE_MS = 0

function StepProgress({ current }: { current: RoutineStepId }) {
  const idx = QUIZ_STEP_ORDER.indexOf(current)
  const funnelStep = 2 + idx + 1
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
          Montando seu perfil · {funnelStep}/8
        </p>
      </div>
      <div className="flex items-center gap-1 mb-2">
        {QUIZ_STEP_ORDER.map((step, i) => (
          <div
            key={step}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= idx ? 'bg-accent-blue' : 'bg-neutral-800'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

export function RoutineQuestionPage() {
  const { step } = useParams<{ step: string }>()
  const navigate = useNavigate()
  const { routineAnswers, setRoutineAnswer, computeScores } = useAppStore()
  const advancing = useRef(false)

  const stepNum = step as RoutineStepId
  const config = ROUTINE_STEPS[stepNum]

  useEffect(() => {
    advancing.current = false
  }, [step])

  if (!config) return null

  const question = config.questions[0]

  const handleSelect = (value: RoutineAnswers[typeof question.key]) => {
    if (advancing.current) return
    advancing.current = true
    setRoutineAnswer(question.key, value)

    if (question.key === 'studySituation' && value === 'none') {
      setRoutineAnswer('studyFrequency', 'none')
    }

    const goNext = () => {
      if (stepNum === '6') computeScores()
      navigate(config.next)
    }

    if (ADVANCE_MS > 0) {
      setTimeout(goNext, ADVANCE_MS)
    } else {
      goNext()
    }
  }

  return (
    <OnboardingLayout showLogo={false}>
      <StepProgress current={stepNum} />
      <PageTitle title={config.title} subtitle={config.subtitle} className="mb-4" />

      <div className="space-y-2.5 flex-1">
        {question.options.map((opt) => (
          <SelectionCard
            key={opt.value}
            emoji={opt.emoji}
            label={opt.label}
            selected={routineAnswers[question.key] === opt.value}
            onClick={() =>
              handleSelect(opt.value as RoutineAnswers[typeof question.key])
            }
          />
        ))}
      </div>
    </OnboardingLayout>
  )
}
