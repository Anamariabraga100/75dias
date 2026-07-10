import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { OnboardingLayout } from '../../components/layout/OnboardingLayout'
import { ProgressRing, LoadingStep } from '../../components/ui/ProgressRing'
import { useAppStore } from '../../store/useAppStore'

const STEPS = [
  'Analisando suas respostas',
  'Definindo metas de disciplina',
  'Criando hábitos diários',
  'Montando seu plano de 90 dias',
]

const TESTIMONIALS = [
  {
    user: 'Mariana',
    emoji: '🟢',
    stars: 5,
    text: 'Acabei de começar o Desafio Desafiante. No dia 3 já senti que a rotina está mais clara.',
  },
  {
    user: 'Pedro',
    emoji: '🔵',
    stars: 5,
    text: 'Entrei no Desafio Dominante ontem. O app deixa tudo bem direto — sem enrolação.',
  },
  {
    user: 'Lucas',
    emoji: '🔥',
    stars: 5,
    text: 'Comecei o Desafio Implacável hoje. Difícil, mas é exatamente o que eu precisava.',
  },
  {
    user: 'Ana',
    emoji: '🌱',
    stars: 5,
    text: 'Dia 1 no Desafio Dominante. Já marquei minhas missões e estou animada com os 90 dias.',
  },
]

const PROGRESS_TICK_MS = 85
const PROGRESS_STEP = 1

function TestimonialFeed() {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const rotate = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIndex((i) => (i + 1) % TESTIMONIALS.length)
        setVisible(true)
      }, 280)
    }, 3200)
    return () => clearInterval(rotate)
  }, [])

  const t = TESTIMONIALS[index]

  return (
    <div className="w-full mt-auto pt-6">
      <p className="text-neutral-500 text-xs text-center mb-3 uppercase tracking-wide">
        Quem está começando agora
      </p>

      <div
        className={`bg-surface rounded-2xl border border-neutral-800 p-4 transition-all duration-300 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-blue/30 to-purple-600/30 border border-neutral-700 flex items-center justify-center text-sm font-bold shrink-0">
            {t.user[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="font-semibold text-sm truncate">
                {t.user} {t.emoji}
              </p>
              <span className="text-yellow-400 text-xs shrink-0 tracking-tight">
                {'★'.repeat(t.stars)}
              </span>
            </div>
            <p className="text-neutral-400 text-sm leading-relaxed">"{t.text}"</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-1.5 mt-3">
        {TESTIMONIALS.map((_, i) => (
          <span
            key={i}
            className={`h-1 rounded-full transition-all duration-300 ${
              i === index ? 'w-4 bg-accent-blue' : 'w-1 bg-neutral-700'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

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
          setTimeout(() => navigate('/onboarding/contrato'), 800)
          return 100
        }
        return p + PROGRESS_STEP
      })
    }, PROGRESS_TICK_MS)
    return () => clearInterval(interval)
  }, [navigate])

  useEffect(() => {
    setActiveStep(Math.min(Math.floor(percent / 25), STEPS.length - 1))
  }, [percent])

  return (
    <OnboardingLayout showLogo>
      <div className="flex flex-col items-center flex-1 min-h-0">
        <ProgressRing percent={percent} />
        <h2 className="text-xl font-bold mt-6 mb-4">Montando seu plano</h2>

        <div className="w-full mb-4">
          {STEPS.map((step, i) => (
            <LoadingStep
              key={step}
              label={step}
              status={i < activeStep ? 'done' : i === activeStep ? 'loading' : 'pending'}
            />
          ))}
        </div>

        <TestimonialFeed />
      </div>
    </OnboardingLayout>
  )
}
