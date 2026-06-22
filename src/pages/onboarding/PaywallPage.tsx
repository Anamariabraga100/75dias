import { useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { MoneyBackGuarantee } from '../../components/ui/MoneyBackGuarantee'
import { useAppStore } from '../../store/useAppStore'
import { PRICING } from '../../lib/pricing'

const PAYWALL_HERO = '/niveis/pagamento.jpg'

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
        <header className="flex justify-end items-center pt-4 px-5 shrink-0 z-10">
          <button
            type="button"
            onClick={() => navigate('/onboarding/oferta')}
            className="text-neutral-500 p-1"
            aria-label="Fechar"
          >
            <X size={24} />
          </button>
        </header>

        <div className="flex-1 relative mx-5 mt-2 mb-4 min-h-[280px] rounded-3xl overflow-hidden">
          <img
            src={PAYWALL_HERO}
            alt="Treino intenso — disciplina e transformação"
            className="absolute inset-0 w-full h-full object-cover object-[center_35%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <p className="text-white font-bold text-lg leading-snug mb-1">
              Seu Reset90 começa agora
            </p>
            <p className="text-white/70 text-sm">
              Plano personalizado · 90 dias de transformação
            </p>
          </div>
        </div>

        <div className="px-5 pb-8 pt-2 shrink-0 bg-gradient-to-t from-black via-black to-transparent">
          <span className="inline-block bg-white/10 text-white text-xs font-medium px-3 py-1 rounded-full w-fit mb-3">
            Acesso completo · 90 dias
          </span>
          <h1 className="text-3xl font-bold mb-1">Desbloqueie seu plano</h1>
          <p className="text-neutral-400 text-sm mb-5">Cancele quando quiser · acesso imediato</p>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <button
              type="button"
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
              type="button"
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

          <ul className="space-y-2 mb-5 text-sm text-neutral-300">
            <li className="flex items-center gap-2">
              <span className="text-accent-green">✓</span> Todos os níveis do desafio
            </li>
            <li className="flex items-center gap-2">
              <span className="text-accent-green">✓</span> Acompanhamento diário de hábitos
            </li>
            <li className="flex items-center gap-2">
              <span className="text-accent-green">✓</span> Radar de progresso personalizado
            </li>
          </ul>

          <MoneyBackGuarantee compact className="mb-5" />

          <Button onClick={goToPayment}>Continuar para pagamento</Button>

          <p className="text-neutral-500 text-xs text-center mt-3">
            {selectedPlan === 'quarterly'
              ? PRICING.quarterly.footer
              : PRICING.monthly.footer}
          </p>
        </div>
      </div>
    </div>
  )
}
