import { useNavigate } from 'react-router-dom'
import { OnboardingLayout, QuoteBox } from '../../components/layout/OnboardingLayout'
import { Button } from '../../components/ui/Button'
import { useAppStore } from '../../store/useAppStore'

function growthFactor(current: number, projected: number): string {
  const factor = projected / Math.max(current, 1)
  if (factor >= 3.5) return '4x'
  if (factor >= 2.5) return '3x'
  if (factor >= 1.8) return '2x'
  return 'grande'
}

export function ScorePage() {
  const navigate = useNavigate()
  const { disciplineScore, projectedScore, profileInsights } = useAppStore()
  const growth = growthFactor(disciplineScore, projectedScore)

  const quote =
    profileInsights?.personalizedQuote ??
    'Com um plano estruturado de 90 dias, dá para virar esse jogo.'

  return (
    <OnboardingLayout
      gradient="blue"
      footer={<Button onClick={() => navigate('/onboarding/criando')}>Continuar</Button>}
    >
      <p className="text-neutral-500 text-sm mb-2">Análise concluída</p>
      <h1 className="text-3xl font-bold mb-1">
        Sua nota de disciplina: {disciplineScore}%
      </h1>
      <p className="text-accent-blue font-semibold mb-4">
        {growth} de potencial de crescimento
      </p>

      {profileInsights?.scoreSummary && (
        <p className="text-neutral-400 text-sm mb-6 leading-relaxed">
          {profileInsights.scoreSummary}
        </p>
      )}

      {profileInsights?.priorityActions && profileInsights.priorityActions.length > 0 && (
        <div className="bg-surface rounded-2xl p-4 mb-6">
          <p className="text-neutral-500 text-xs uppercase tracking-wide mb-2">
            Prioridades no seu plano
          </p>
          <ul className="space-y-1.5">
            {profileInsights.priorityActions.map((action) => (
              <li key={action} className="text-sm text-neutral-300 flex gap-2">
                <span className="text-accent-blue shrink-0">→</span>
                {action}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-end justify-center gap-6 mb-8 h-64 relative">
        <div className="flex flex-col items-center">
          <div className="relative w-24 h-52 bg-surface rounded-2xl flex flex-col justify-end overflow-hidden">
            <div
              className="bg-neutral-600 rounded-b-2xl flex items-end justify-center pb-2"
              style={{ height: `${disciplineScore}%` }}
            >
              <span className="font-bold text-neutral-300">{disciplineScore}%</span>
            </div>
          </div>
          <p className="text-neutral-500 text-xs mt-2">Você agora</p>
        </div>

        <div
          className="absolute left-0 right-0 border-t border-dashed border-neutral-600 flex items-center"
          style={{ bottom: `${57}%` }}
        >
          <span className="text-neutral-500 text-xs bg-black px-1 -mt-3">
            57% Média geral
          </span>
        </div>

        <div className="flex flex-col items-center">
          <div className="relative w-24 h-52 rounded-2xl overflow-hidden bg-gradient-to-b from-accent-blue to-blue-800 flex flex-col">
            <p className="text-xs text-blue-200 text-center pt-2 font-medium">Disciplina</p>
            <div className="flex-1 flex items-center justify-center">
              <span className="font-bold text-2xl">{projectedScore}%</span>
            </div>
          </div>
          <p className="text-accent-blue text-xs mt-2 font-medium">Com Reset90</p>
        </div>
      </div>

      <QuoteBox>{quote}</QuoteBox>
    </OnboardingLayout>
  )
}
