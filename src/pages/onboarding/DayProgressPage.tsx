import { useNavigate, useParams } from 'react-router-dom'
import { OnboardingLayout, QuoteBox } from '../../components/layout/OnboardingLayout'
import { Button } from '../../components/ui/Button'
import { RadarChart } from '../../components/ui/RadarChart'

const DAY_CONFIG = {
  '1': {
    fill: 15,
    color: '#ef4444',
    gradient: 'red' as const,
    message: 'Você começa forte mas perde o ritmo. Sem sistema. Só recomeços.',
    next: '/onboarding/dia/30',
  },
  '30': {
    fill: 45,
    color: '#a855f7',
    gradient: 'purple' as const,
    message: 'A maioria estagna aqui — vamos te mostrar um caminho melhor.',
    next: '/onboarding/dia/75',
  },
  '75': {
    fill: 95,
    color: '#22c55e',
    gradient: 'green' as const,
    message: 'Ótimo! Vamos consolidar a consistência e escalar seus resultados.',
    next: '/onboarding/plano',
  },
}

export function DayProgressPage() {
  const { day } = useParams<{ day: string }>()
  const navigate = useNavigate()
  const config = DAY_CONFIG[day as keyof typeof DAY_CONFIG]

  if (!config) return null

  return (
    <OnboardingLayout
      gradient={config.gradient}
      footer={<Button onClick={() => navigate(config.next)}>Continuar</Button>}
    >
      <h1 className="text-5xl font-bold text-center mb-2">Dia {day}</h1>

      <div className="flex-1 flex flex-col items-center justify-center">
        <RadarChart fillPercent={config.fill} color={config.color} />
        <div className="w-full mt-4">
          <QuoteBox>{config.message}</QuoteBox>
        </div>
      </div>
    </OnboardingLayout>
  )
}
