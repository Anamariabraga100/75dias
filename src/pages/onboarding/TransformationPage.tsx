import { useNavigate } from 'react-router-dom'
import { OnboardingLayout } from '../../components/layout/OnboardingLayout'
import { Button } from '../../components/ui/Button'

const BEFORE = [
  'Sem rotina de autocuidado',
  'Procrastinação constante',
  'Preocupação com tudo',
  'Fadiga crônica e sensação de overwhelm',
]

const AFTER = [
  'Programa personalizado de crescimento',
  'Sem culpa por desperdiçar tempo e potencial',
  'Ganhando autoconfiança',
  'Mente calma e focada',
]

export function TransformationPage() {
  const navigate = useNavigate()

  return (
    <OnboardingLayout
      footer={<Button onClick={() => navigate('/onboarding/contrato')}>Continuar</Button>}
    >
      <h1 className="text-2xl font-bold mb-8 gradient-text leading-tight">
        Veja a transformação com 75 Dias
      </h1>

      <div className="relative flex-1">
        <div className="bg-surface rounded-2xl p-5 w-[85%] mb-4">
          <p className="font-bold mb-3">Antes</p>
          <ul className="space-y-2">
            {BEFORE.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-neutral-400">
                <span className="text-red-500 shrink-0">✕</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-surface rounded-2xl p-5 w-[85%] ml-auto border border-white/10 relative z-10 -mt-2">
          <p className="font-bold mb-3">Depois</p>
          <ul className="space-y-2">
            {AFTER.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-neutral-300">
                <span className="text-green-500 shrink-0">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl opacity-30 pointer-events-none">
          ↻
        </div>
      </div>
    </OnboardingLayout>
  )
}
