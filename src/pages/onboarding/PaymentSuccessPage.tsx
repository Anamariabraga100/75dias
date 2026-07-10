import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Check, Loader2, Sparkles } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { useAppStore } from '../../store/useAppStore'
import { getPlanDisplayLabel } from '../../lib/pricing'
import { verifyCheckoutSession, waitForActiveSubscription } from '../../lib/stripeCheckout'
import { confirmPaymentFromCloud } from '../../lib/userSync'

export function PaymentSuccessPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const { name, selectedPlan, usePromoOffer, setStartDate, completeOnboarding } =
    useAppStore()
  const displayName = name || 'você'
  const planLabel = getPlanDisplayLabel(selectedPlan, usePromoOffer)

  const [confirming, setConfirming] = useState(true)
  const [confirmed, setConfirmed] = useState(false)

  useEffect(() => {
    let active = true

    const confirm = async () => {
      if (sessionId) {
        await verifyCheckoutSession(sessionId)
      }

      const ready = await waitForActiveSubscription(confirmPaymentFromCloud, 12, 1500)
      if (!active) return
      setConfirmed(ready)
      setConfirming(false)
    }

    void confirm()
    return () => {
      active = false
    }
  }, [sessionId])

  const startNow = () => {
    setStartDate('today')
    completeOnboarding()
    navigate('/app')
  }

  const retryConfirm = async () => {
    setConfirming(true)
    if (sessionId) {
      await verifyCheckoutSession(sessionId)
    }
    const ready = await waitForActiveSubscription(confirmPaymentFromCloud, 8, 1500)
    setConfirmed(ready)
    setConfirming(false)
  }

  return (
    <div className="min-h-dvh bg-black flex flex-col">
      <div className="max-w-md mx-auto w-full flex flex-col min-h-dvh px-5">
        <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-in">
          <div className="relative mb-8">
            <div className="w-24 h-24 rounded-full bg-accent-green/20 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-accent-green flex items-center justify-center">
                {confirming ? (
                  <Loader2 size={32} className="text-black animate-spin" />
                ) : (
                  <Check size={32} className="text-black" strokeWidth={3} />
                )}
              </div>
            </div>
            {!confirming && confirmed && (
              <Sparkles
                size={20}
                className="absolute -top-1 -right-1 text-accent-yellow animate-pulse"
              />
            )}
          </div>

          {confirming ? (
            <>
              <h1 className="text-2xl font-bold mb-2">Confirmando pagamento...</h1>
              <p className="text-neutral-400 mb-6 max-w-xs text-sm">
                Aguarde enquanto validamos sua assinatura. Isso leva só alguns segundos.
              </p>
            </>
          ) : confirmed ? (
            <>
              <h1 className="text-3xl font-bold mb-2">Você está dentro!</h1>
              <p className="text-neutral-400 mb-6 max-w-xs">
                {displayName.charAt(0).toUpperCase() + displayName.slice(1)}, seu {planLabel}{' '}
                está ativo. Escolha seu nível e comece o dia 1 agora.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-2">Pagamento em processamento</h1>
              <p className="text-neutral-400 mb-6 max-w-xs text-sm">
                Se você já pagou, toque em verificar novamente. Se persistir, confira o webhook
                Stripe na Vercel (STRIPE_WEBHOOK_SECRET).
              </p>
            </>
          )}

          {confirmed && (
            <div className="w-full bg-surface rounded-2xl p-5 text-left mb-6">
              <p className="text-neutral-500 text-xs uppercase tracking-wide mb-3">
                O que você desbloqueou
              </p>
              <ul className="space-y-2.5 text-sm text-neutral-300">
                <li className="flex items-center gap-2">
                  <span className="text-accent-green">✓</span> Todos os níveis (Iniciante,
                  Intermediário, Implacável)
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
          )}
        </div>

        <div className="pb-8">
          {confirming ? (
            <Button disabled className="opacity-60">
              Aguarde...
            </Button>
          ) : confirmed ? (
            <Button onClick={startNow}>Começar agora</Button>
          ) : (
            <Button onClick={() => void retryConfirm()}>Verificar novamente</Button>
          )}
        </div>
      </div>
    </div>
  )
}
