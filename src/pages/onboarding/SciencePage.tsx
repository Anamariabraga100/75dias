import { useNavigate } from 'react-router-dom'
import { OnboardingLayout, PageTitle } from '../../components/layout/OnboardingLayout'
import { Button } from '../../components/ui/Button'

const STUDIES = [
  {
    logo: '🏛️',
    logoLabel: 'Harvard',
    quote:
      'Hábitos se formam por ações repetidas em contextos estáveis, levando semanas a meses para se tornarem automáticos.',
    citation: 'Wood, W., & Rünger, D. (2016). Psychology of Habit. Annual Review of Psychology.',
  },
  {
    logo: '🎓',
    logoLabel: 'UCL',
    quote:
      '96 participantes realizaram um comportamento diário, e a automaticidade estabilizou em média em 66 dias, com variação de 18 a 254 dias.',
    citation:
      'Lally, P., et al. (2010). How are habits formed. European Journal of Social Psychology.',
  },
  {
    logo: '📘',
    logoLabel: 'Atomic Habits',
    quote:
      'Em média, leva mais de dois meses para um novo comportamento se tornar automático — 66 dias, para ser exato.',
    citation: 'Clear, J. (2018). Atomic Habits. Avery.',
  },
]

export function SciencePage() {
  const navigate = useNavigate()

  return (
    <OnboardingLayout
      footer={<Button onClick={() => navigate('/onboarding/resultado')}>Continuar</Button>}
    >
      <PageTitle title="Método baseado em ciência" />

      <div className="space-y-5 flex-1 overflow-y-auto scrollbar-hide">
        {STUDIES.map((s) => (
          <div key={s.logoLabel}>
            <div className="bg-surface rounded-2xl p-4 flex gap-4">
              <div className="w-14 h-14 bg-surface-light rounded-xl flex items-center justify-center text-2xl shrink-0">
                {s.logo}
              </div>
              <p className="text-neutral-300 text-sm leading-relaxed">{s.quote}</p>
            </div>
            <p className="text-neutral-600 text-xs mt-2 px-1 leading-relaxed">{s.citation}</p>
          </div>
        ))}
      </div>
    </OnboardingLayout>
  )
}
