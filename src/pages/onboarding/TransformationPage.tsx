import { useNavigate } from 'react-router-dom'
import { OnboardingLayout } from '../../components/layout/OnboardingLayout'
import { Button } from '../../components/ui/Button'
import { useAppStore } from '../../store/useAppStore'

const FALLBACK_BEFORE = [
  'Sem rotina de autocuidado',
  'Procrastinação constante',
  'Fadiga crônica e sensação de overwhelm',
]

const FALLBACK_AFTER = [
  'Programa personalizado de crescimento',
  'Ganhando autoconfiança',
  'Mente calma e focada',
]

export function TransformationPage() {
  const navigate = useNavigate()
  const { profileInsights } = useAppStore()

  const before = profileInsights?.beforeItems ?? FALLBACK_BEFORE
  const after = profileInsights?.afterItems ?? FALLBACK_AFTER

  return (
    <OnboardingLayout
      footer={<Button onClick={() => navigate('/onboarding/contrato')}>Continuar</Button>}
    >
      <h1 className="text-2xl font-bold mb-8 gradient-text leading-tight">
        Sua transformação com Reset90
      </h1>

      <div className="relative flex-1">
        <div className="bg-surface rounded-2xl p-5 w-[85%] mb-4">
          <p className="font-bold mb-3">Hoje — o que você nos contou</p>
          <ul className="space-y-2">
            {before.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-neutral-400">
                <span className="text-red-500 shrink-0">✕</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-surface rounded-2xl p-5 w-[85%] ml-auto border border-white/10 relative z-10 -mt-2">
          <p className="font-bold mb-3">Depois de 90 dias</p>
          <ul className="space-y-2">
            {after.map((item) => (
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
