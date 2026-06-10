import { useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { useAppStore } from '../../store/useAppStore'

const PAYWALL_HERO =
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=1000&fit=crop'

export function PaywallPage() {
  const navigate = useNavigate()
  const { selectedPlan, setSelectedPlan, setUsePromoOffer } = useAppStore()

  const goToPayment = () => {
    setUsePromoOffer(false)
    navigate('/onboarding/pagamento')
  }

  return (
    <div className="min-h-dvh bg-black flex flex-col">
      <div className="max-w-md mx-auto w-full flex flex-col min-h-dvh">
        <header className="flex justify-between items-center pt-4 px-5 shrink-0 z-10">
          <button
            onClick={() => navigate('/onboarding/oferta')}
            className="text-neutral-500"
          >
            <X size={24} />
          </button>
        </header>

        <div className="flex gap-3 overflow-x-auto scrollbar-hide py-3 px-5 shrink-0">
          <div className="min-w-[220px] bg-gradient-to-br from-green-900/60 to-green-950/40 rounded-2xl p-4 shrink-0">
            <p className="font-bold text-sm mb-1">Fique conectado</p>
            <p className="text-neutral-400 text-xs">
              Convide amigos, acompanhe progresso e comemore vitórias juntos
            </p>
          </div>
          <div className="min-w-[220px] bg-gradient-to-br from-blue-900/60 to-blue-950/40 rounded-2xl p-4 shrink-0">
            <p className="font-bold text-sm mb-1">Crie seu desafio</p>
            <p className="text-neutral-400 text-xs">
              Acesse toda a biblioteca de desafios, a qualquer hora
            </p>
          </div>
        </div>

        <div className="flex-1 relative mx-5 my-2 min-h-[240px] rounded-3xl overflow-hidden">
          <img
            src={PAYWALL_HERO}
            alt="Pessoas treinando juntas"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/10" />
          <div className="absolute bottom-4 left-4 right-4">
            <p className="text-white/90 text-sm font-medium">
              Junte-se a milhares de brasileiros reconstruindo disciplina
            </p>
          </div>
        </div>

        <div className="px-5 pb-8 pt-2 shrink-0 bg-gradient-to-t from-black via-black to-transparent">
          <span className="inline-block bg-white/10 text-white text-xs font-medium px-3 py-1 rounded-full w-fit mb-3">
            Acesso completo
          </span>
          <h1 className="text-3xl font-bold mb-1">Escolha seu plano</h1>
          <p className="text-neutral-400 mb-6">Preço justo para o mercado brasileiro</p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => setSelectedPlan('monthly')}
              className={`rounded-2xl p-4 text-left border-2 transition-all ${
                selectedPlan === 'monthly'
                  ? 'border-white bg-surface'
                  : 'border-neutral-800 bg-surface'
              }`}
            >
              <p className="text-sm text-neutral-400 mb-1">Mensal</p>
              <p className="font-bold text-lg">R$ 24,90</p>
              <p className="text-xs text-neutral-500">/ mês</p>
            </button>

            <button
              onClick={() => setSelectedPlan('yearly')}
              className={`rounded-2xl p-4 text-left border-2 transition-all relative ${
                selectedPlan === 'yearly'
                  ? 'border-accent-yellow bg-surface'
                  : 'border-neutral-800 bg-surface'
              }`}
            >
              <span className="absolute -top-2.5 right-3 bg-accent-yellow text-black text-xs font-bold px-2 py-0.5 rounded-full">
                -60%
              </span>
              <p className="text-sm text-neutral-400 mb-1">Anual</p>
              <p className="font-bold text-lg">R$ 9,99</p>
              <p className="text-xs text-neutral-500">/ mês</p>
            </button>
          </div>

          <Button onClick={goToPayment}>Continuar</Button>

          <p className="text-neutral-500 text-xs text-center mt-3">
            {selectedPlan === 'yearly' ? 'R$ 119,90/ano' : 'Cobrança mensal recorrente'}
          </p>

          <div className="flex justify-center gap-4 mt-4 text-xs text-neutral-600">
            <button className="hover:text-neutral-400">Termos</button>
            <button className="hover:text-neutral-400">Restaurar</button>
            <button className="hover:text-neutral-400">Privacidade</button>
          </div>
        </div>
      </div>
    </div>
  )
}
