import { useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { useAppStore } from '../../store/useAppStore'
import { PRICING } from '../../lib/pricing'

const PAYWALL_HERO =
  'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=900&h=1200&fit=crop&q=85'

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

        <div className="flex-1 relative mx-5 mt-2 mb-4 min-h-[280px] rounded-3xl overflow-hidden">
          <img
            src={PAYWALL_HERO}
            alt="Treino intenso — disciplina e transformação"
            className="absolute inset-0 w-full h-full object-cover object-[center_20%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <p className="text-white font-bold text-lg leading-snug mb-1">
              90 dias para reconstruir sua disciplina
            </p>
            <p className="text-white/70 text-sm">
              Junte-se a milhares de brasileiros no Reset90
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
              <p className="text-sm text-neutral-400 mb-1">{PRICING.monthly.label}</p>
              <p className="font-bold text-lg">{PRICING.monthly.display}</p>
              <p className="text-xs text-neutral-500">{PRICING.monthly.period}</p>
            </button>

            <button
              onClick={() => setSelectedPlan('quarterly')}
              className={`rounded-2xl p-4 text-left border-2 transition-all relative ${
                selectedPlan === 'quarterly'
                  ? 'border-accent-yellow bg-surface'
                  : 'border-neutral-800 bg-surface'
              }`}
            >
              <span className="absolute -top-2.5 right-3 bg-accent-yellow text-black text-xs font-bold px-2 py-0.5 rounded-full">
                -{PRICING.quarterly.discountPercent}%
              </span>
              <p className="text-sm text-neutral-400 mb-1">{PRICING.quarterly.label}</p>
              <p className="font-bold text-lg">{PRICING.quarterly.displayPerMonth}</p>
              <p className="text-xs text-neutral-500">{PRICING.quarterly.period}</p>
            </button>
          </div>

          <Button onClick={goToPayment}>Continuar</Button>

          <p className="text-neutral-500 text-xs text-center mt-3">
            {selectedPlan === 'quarterly'
              ? PRICING.quarterly.footer
              : PRICING.monthly.footer}
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
