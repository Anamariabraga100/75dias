import { useNavigate } from 'react-router-dom'
import { OnboardingLayout } from '../../components/layout/OnboardingLayout'
import { Button } from '../../components/ui/Button'

const BENEFITS = [
  {
    emoji: '🧱',
    title: 'Construa disciplina com ações diárias simples',
    desc: 'Sem overplanning, sem overwhelm — só foco',
  },
  {
    emoji: '🔄',
    title: 'Mantenha consistência com desafios e streaks',
    desc: 'Veja progresso. Sinta momentum.',
  },
  {
    emoji: '🚫',
    title: 'Saia das distrações e gratificação instantânea',
    desc: 'Detox de dopamina, sem deletar o celular',
  },
  {
    emoji: '💪',
    title: 'Reconstrua rotinas após lesão ou burnout',
    desc: 'Retome o controle no seu ritmo',
  },
  {
    emoji: '🧰',
    title: 'Simplifique seus hábitos. Uma ferramenta, zero caos.',
    desc: 'Sem cadernos. Sem apps espalhados. Só Reset90',
  },
]

export function BenefitsPage() {
  const navigate = useNavigate()

  return (
    <OnboardingLayout
      footer={<Button onClick={() => navigate('/onboarding/apresentacao')}>Continuar</Button>}
    >
      <h1 className="text-2xl font-bold mb-6 leading-tight">
        Veja como o Reset90 vai te ajudar
      </h1>

      <div className="space-y-5 flex-1">
        {BENEFITS.map((b) => (
          <div key={b.title} className="flex gap-4">
            <span className="text-2xl shrink-0 mt-0.5">{b.emoji}</span>
            <div>
              <p className="font-semibold text-white text-sm leading-snug">{b.title}</p>
              <p className="text-neutral-500 text-sm mt-0.5">{b.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </OnboardingLayout>
  )
}
