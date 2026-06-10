import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { OnboardingLayout } from '../../components/layout/OnboardingLayout'
import { ProgressRing, LoadingStep } from '../../components/ui/ProgressRing'
import { useAppStore } from '../../store/useAppStore'

const STEPS = [
  'Analisando suas respostas',
  'Definindo metas de disciplina',
  'Criando hábitos diários',
  'Montando sistema de accountability',
]

const TESTIMONIALS = [
  {
    user: 'Mariana ✨',
    stars: 5,
    text: 'Mudou minha vida. Finalmente tenho uma rotina de verdade, não uma inventada. Me incentivou a ser mais consistente nos treinos e na leitura.',
  },
  {
    user: 'Pedro 💪',
    stars: 5,
    text: 'Completei os 75 dias hard! Algumas rotinas ficaram permanentes. App incrível para quem precisa de estrutura.',
  },
]

export function CreatingPage() {
  const navigate = useNavigate()
  const computeScores = useAppStore((s) => s.computeScores)
  const [percent, setPercent] = useState(0)
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    computeScores()
  }, [computeScores])

  useEffect(() => {
    const interval = setInterval(() => {
      setPercent((p) => {
        if (p >= 100) {
          clearInterval(interval)
          setTimeout(() => navigate('/onboarding/dia/1'), 600)
          return 100
        }
        return p + 2
      })
    }, 80)
    return () => clearInterval(interval)
  }, [navigate])

  useEffect(() => {
    setActiveStep(Math.min(Math.floor(percent / 25), STEPS.length - 1))
  }, [percent])

  return (
    <OnboardingLayout showLogo>
      <div className="flex flex-col items-center flex-1">
        <ProgressRing percent={percent} />
        <h2 className="text-xl font-bold mt-6 mb-4">Criando seu plano</h2>

        <div className="w-full mb-8">
          {STEPS.map((step, i) => (
            <LoadingStep
              key={step}
              label={step}
              status={i < activeStep ? 'done' : i === activeStep ? 'loading' : 'pending'}
            />
          ))}
        </div>

        <div className="mt-auto w-full">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.user}
                className="bg-surface rounded-2xl p-4 min-w-[260px] shrink-0"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-sm">
                    {t.user[0]}
                  </div>
                  <span className="font-medium text-sm">{t.user}</span>
                  <span className="text-yellow-400 text-xs ml-auto">
                    {'★'.repeat(t.stars)}
                  </span>
                </div>
                <p className="text-neutral-400 text-xs leading-relaxed line-clamp-3">
                  {t.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </OnboardingLayout>
  )
}
