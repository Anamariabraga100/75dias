import { useNavigate } from 'react-router-dom'
import { OnboardingLayout, QuoteBox } from '../../components/layout/OnboardingLayout'
import { Button } from '../../components/ui/Button'
import { useAppStore } from '../../store/useAppStore'

export function ScorePage() {
  const navigate = useNavigate()
  const { disciplineScore } = useAppStore()
  const withApp = 92

  return (
    <OnboardingLayout
      gradient="blue"
      footer={<Button onClick={() => navigate('/onboarding/criando')}>Continuar</Button>}
    >
      <p className="text-neutral-500 text-sm mb-2">Análise concluída</p>
      <h1 className="text-3xl font-bold mb-1">
        Sua nota de disciplina: {disciplineScore}%
      </h1>
      <p className="text-accent-blue font-semibold mb-8">4x de potencial de crescimento</p>

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
              <span className="font-bold text-2xl">{withApp}%</span>
            </div>
          </div>
          <p className="text-accent-blue text-xs mt-2 font-medium">Com 75 Dias</p>
        </div>
      </div>

      <QuoteBox>
        Tudo bem. A maioria só percebe o quanto a rotina diária afeta energia, foco e bem-estar —
        quando já está esgotada.
      </QuoteBox>
    </OnboardingLayout>
  )
}
