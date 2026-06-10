import { useNavigate } from 'react-router-dom'
import { Check, Sparkles } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { useAppStore } from '../../store/useAppStore'

export function PaymentSuccessPage() {
  const navigate = useNavigate()
  const { name, selectedPlan, usePromoOffer } = useAppStore()
  const displayName = name || 'você'

  const planLabel =
    usePromoOffer || selectedPlan === 'yearly' ? 'Plano Anual' : 'Plano Mensal'

  return (
    <div className="min-h-dvh bg-black flex flex-col">
      <div className="max-w-md mx-auto w-full flex flex-col min-h-dvh px-5">
        <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-in">
          <div className="relative mb-8">
            <div className="w-24 h-24 rounded-full bg-accent-green/20 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-accent-green flex items-center justify-center">
                <Check size={32} className="text-black" strokeWidth={3} />
              </div>
            </div>
            <Sparkles
              size={20}
              className="absolute -top-1 -right-1 text-accent-yellow animate-pulse"
            />
          </div>

          <h1 className="text-3xl font-bold mb-2">Pagamento confirmado!</h1>
          <p className="text-neutral-400 mb-6 max-w-xs">
            {displayName.charAt(0).toUpperCase() + displayName.slice(1)}, seu {planLabel}{' '}
            está ativo. Agora é hora de escolher seu desafio.
          </p>

          <div className="w-full bg-surface rounded-2xl p-5 text-left mb-6">
            <p className="text-neutral-500 text-xs uppercase tracking-wide mb-3">
              O que você desbloqueou
            </p>
            <ul className="space-y-2.5 text-sm text-neutral-300">
              <li className="flex items-center gap-2">
                <span className="text-accent-green">✓</span> Todos os desafios (Hard, Medium, Soft)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-accent-green">✓</span> Acompanhamento diário de hábitos
              </li>
              <li className="flex items-center gap-2">
                <span className="text-accent-green">✓</span> Radar de progresso personalizado
              </li>
              <li className="flex items-center gap-2">
                <span className="text-accent-green">✓</span> Comunidade e accountability
              </li>
            </ul>
          </div>
        </div>

        <div className="pb-8">
          <Button onClick={() => navigate('/onboarding/desafio')}>
            Escolher meu desafio
          </Button>
        </div>
      </div>
    </div>
  )
}
