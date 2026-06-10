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

function buildQuote(weakAreas: string[]): string {
  if (weakAreas.length === 0) {
    return 'Você já tem uma base sólida — o desafio é manter consistência por 75 dias seguidos.'
  }
  const areas = weakAreas.join(' e ')
  return `Identificamos que ${areas} são seus maiores pontos de melhoria agora. Com um plano estruturado de 75 dias, dá para virar esse jogo.`
}

export function ScorePage() {
  const navigate = useNavigate()
  const { disciplineScore, projectedScore, weakAreas } = useAppStore()
  const growth = growthFactor(disciplineScore, projectedScore)

  return (
    <OnboardingLayout
      gradient="blue"
      footer={<Button onClick={() => navigate('/onboarding/criando')}>Continuar</Button>}
    >
      <p className="text-neutral-500 text-sm mb-2">Análise concluída</p>
      <h1 className="text-3xl font-bold mb-1">
        Sua nota de disciplina: {disciplineScore}%
      </h1>
      <p className="text-accent-blue font-semibold mb-8">
        {growth} de potencial de crescimento
      </p>

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
          <p className="text-accent-blue text-xs mt-2 font-medium">Com 75 Dias</p>
        </div>
      </div>

      <QuoteBox>{buildQuote(weakAreas)}</QuoteBox>
    </OnboardingLayout>
  )
}
