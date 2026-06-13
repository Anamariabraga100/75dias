import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { useAppStore } from '../../store/useAppStore'
import { PRICING } from '../../lib/pricing'

export function OfferPage() {
  const navigate = useNavigate()
  const { setUsePromoOffer, setSelectedPlan } = useAppStore()
  const [seconds, setSeconds] = useState(29 * 60 + 53)

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`

  const goToPayment = () => {
    setSelectedPlan('quarterly')
    setUsePromoOffer(true)
    navigate('/onboarding/pagamento')
  }

  return (
    <div className="min-h-dvh bg-black flex flex-col">
      <div className="max-w-md mx-auto w-full flex flex-col min-h-dvh px-5">
        <header className="pt-4">
          <button
            onClick={() => navigate('/onboarding/planos')}
            className="text-neutral-500"
          >
            <X size={24} />
          </button>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="relative mb-6">
            <div className="bg-accent-yellow rounded-3xl px-8 py-6 rotate-[-3deg]">
              <span className="text-6xl font-black text-black">52</span>
              <span className="text-2xl font-bold text-black">% Off</span>
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-4">Oferta de lançamento</h1>

          <p className="text-neutral-300 mb-1">
            Trimestral por apenas{' '}
            <strong className="text-white text-xl">{PRICING.promoQuarterly.displayPerMonth}</strong>{' '}
            <span className="line-through text-neutral-500">{PRICING.monthly.display}</span>
            <span className="text-neutral-500"> / mês</span>
          </p>
          <p className="text-neutral-500 text-sm mb-8 max-w-xs">
            Acesso completo por 3 meses com {PRICING.promoQuarterly.discountPercent}% de desconto
          </p>

          <p className="text-neutral-500 text-sm mb-2">Oferta por tempo limitado</p>
          <div className="bg-surface rounded-xl px-6 py-3 mb-8">
            <span className="text-2xl font-mono font-bold tracking-widest">{timeStr}</span>
          </div>
        </div>

        <div className="pb-8">
          <Button
            className="!bg-accent-yellow !text-black hover:!bg-yellow-400"
            onClick={goToPayment}
          >
            Continuar — ECONOMIZE {PRICING.promoQuarterly.discountPercent}%
          </Button>
          <p className="text-neutral-500 text-xs text-center mt-3">
            Apenas {PRICING.promoQuarterly.displayTotal}/trimestre · Pix e cartão
          </p>
        </div>
      </div>
    </div>
  )
}
