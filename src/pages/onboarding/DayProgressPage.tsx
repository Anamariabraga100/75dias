import { useNavigate, useParams } from 'react-router-dom'
import { OnboardingLayout, QuoteBox } from '../../components/layout/OnboardingLayout'
import { Button } from '../../components/ui/Button'
import { RadarChart } from '../../components/ui/RadarChart'
import { useAppStore, type RadarScores } from '../../store/useAppStore'

const DAY_CONFIG = {
  '1': {
    color: '#ef4444',
    gradient: 'red' as const,
    progress: 0,
    message: (weak: string[]) =>
      weak.length > 0
        ? `Dia 1: seu ponto fraco hoje é ${weak[0]}. Sem sistema, a maioria desiste antes do dia 7.`
        : 'Você começa forte mas perde o ritmo. Sem sistema. Só recomeços.',
    next: '/onboarding/dia/30',
  },
  '30': {
    color: '#a855f7',
    gradient: 'purple' as const,
    progress: 0.4,
    message: () => 'A maioria estagna aqui — mas com hábitos diários estruturados, você passa dessa barreira.',
    next: '/onboarding/dia/75',
  },
  '75': {
    color: '#22c55e',
    gradient: 'green' as const,
    progress: 1,
    message: () => 'Ótimo! Vamos consolidar a consistência e escalar seus resultados.',
    next: '/onboarding/plano',
  },
}

function interpolateScores(
  current: RadarScores,
  target: RadarScores,
  t: number
): number[] {
  const keys: (keyof RadarScores)[] = [
    'disciplina',
    'energia',
    'habitos',
    'consistencia',
    'saude',
    'foco',
  ]
  return keys.map((key) => Math.round(current[key] + (target[key] - current[key]) * t))
}

function average(values: number[]): number {
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length)
}

export function DayProgressPage() {
  const { day } = useParams<{ day: string }>()
  const navigate = useNavigate()
  const { radarScores, projectedScore, weakAreas } = useAppStore()
  const config = DAY_CONFIG[day as keyof typeof DAY_CONFIG]

  if (!config) return null

  const targetScores: RadarScores = {
    disciplina: projectedScore,
    energia: Math.min(95, radarScores.energia + 35),
    habitos: Math.min(95, radarScores.habitos + 40),
    consistencia: projectedScore,
    saude: Math.min(95, radarScores.saude + 30),
    foco: Math.min(95, radarScores.foco + 38),
  }

  const axisValues = interpolateScores(radarScores, targetScores, config.progress)
  const fillPercent = average(axisValues)

  return (
    <OnboardingLayout
      gradient={config.gradient}
      footer={<Button onClick={() => navigate(config.next)}>Continuar</Button>}
    >
      <h1 className="text-5xl font-bold text-center mb-2">Dia {day}</h1>

      <div className="flex-1 flex flex-col items-center justify-center">
        <RadarChart fillPercent={fillPercent} axisValues={axisValues} color={config.color} />
        <div className="w-full mt-4">
          <QuoteBox>{config.message(weakAreas)}</QuoteBox>
        </div>
      </div>
    </OnboardingLayout>
  )
}
