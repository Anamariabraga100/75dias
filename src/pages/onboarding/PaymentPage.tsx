import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CreditCard, Lock, QrCode, ShieldCheck } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { MoneyBackGuarantee } from '../../components/ui/MoneyBackGuarantee'
import { useAppStore } from '../../store/useAppStore'
import { getCheckoutPrice } from '../../lib/pricing'
import { startStripeCheckout } from '../../lib/stripeCheckout'
import { flushProfileSync } from '../../lib/userSync'

export function PaymentPage() {
  const navigate = useNavigate()
  const { selectedPlan, usePromoOffer } = useAppStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const price = getCheckoutPrice(selectedPlan, usePromoOffer)

  useEffect(() => {
    useAppStore.getState().markPixViewed()
    void flushProfileSync()
  }, [selectedPlan, usePromoOffer])

  const handlePay = async () => {
    setLoading(true)
    setError(null)
    try {
      const url = await startStripeCheckout(selectedPlan, usePromoOffer)
      window.location.href = url
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Erro ao iniciar pagamento'
      setError(message)
      setLoading(false)
    }
  }

  return (
    <div className="h-dvh max-h-dvh bg-black overflow-hidden">
      <div className="max-w-md mx-auto w-full h-full flex flex-col px-5 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <header className="flex items-center gap-2 shrink-0 mb-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-neutral-400 -ml-1 p-1"
            aria-label="Voltar"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold truncate">Pagamento</h1>
            <p className="text-neutral-500 text-xs truncate">{price.label}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-lg font-bold leading-none">{price.total}</p>
            <p className="text-neutral-500 text-[10px]">{price.period}</p>
          </div>
        </header>

        {usePromoOffer && price.discount && (
          <span className="inline-block self-start shrink-0 mb-2 bg-accent-yellow/20 text-accent-yellow text-[10px] font-bold px-2 py-0.5 rounded-full">
            {price.discount}% OFF aplicado
          </span>
        )}

        <div className="flex-1 min-h-0 flex flex-col justify-center">
          <div className="bg-surface rounded-2xl p-5 space-y-4 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent-green/15 flex items-center justify-center">
                <ShieldCheck size={20} className="text-accent-green" />
              </div>
              <div>
                <p className="font-semibold text-sm">Pagamento seguro via Stripe</p>
                <p className="text-neutral-500 text-xs">Cartão ou Pix · assinatura recorrente</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 rounded-xl border border-neutral-800 px-3 py-2.5">
                <CreditCard size={16} className="text-accent-blue shrink-0" />
                <span className="text-xs text-neutral-300">Cartão</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-neutral-800 px-3 py-2.5">
                <QrCode size={16} className="text-accent-green shrink-0" />
                <span className="text-xs text-neutral-300">Pix</span>
              </div>
            </div>

            <p className="text-neutral-400 text-xs leading-relaxed">
              Você será redirecionado para a página segura da Stripe para concluir o pagamento.
              {selectedPlan === 'quarterly'
                ? ' Cobrança a cada 3 meses. Cancele quando quiser.'
                : ' Cobrança mensal. Cancele quando quiser.'}
            </p>

            <MoneyBackGuarantee compact className="w-full" />
          </div>
        </div>

        <div className="shrink-0 pt-3 space-y-2">
          {error && (
            <p className="text-red-400 text-xs text-center" role="alert">
              {error}
            </p>
          )}
          <div className="flex items-center justify-center gap-1.5 text-neutral-500 text-[10px]">
            <Lock size={12} />
            Pagamento seguro · criptografado
          </div>
          <Button onClick={() => void handlePay()} disabled={loading} className="py-3.5 text-sm">
            {loading ? 'Redirecionando...' : 'Pagar agora'}
          </Button>
        </div>
      </div>
    </div>
  )
}
