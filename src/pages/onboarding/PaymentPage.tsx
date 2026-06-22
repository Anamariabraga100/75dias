import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Copy, CreditCard, Lock, QrCode } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { MoneyBackGuarantee } from '../../components/ui/MoneyBackGuarantee'
import { useAppStore } from '../../store/useAppStore'
import { getCheckoutPrice } from '../../lib/pricing'
import { recordPaymentToCloud } from '../../lib/userSync'

type PaymentMethod = 'pix' | 'card'

export function PaymentPage() {
  const navigate = useNavigate()
  const { selectedPlan, usePromoOffer } = useAppStore()
  const [method, setMethod] = useState<PaymentMethod>('pix')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const price = getCheckoutPrice(selectedPlan, usePromoOffer)
  const pixCode = '00020126580014BR.GOV.BCB.PIX0136123e4567-e12b-12d1-a456-426655440000'

  useEffect(() => {
    useAppStore.getState().markPixViewed()
  }, [])

  const handlePay = () => {
    setLoading(true)
    void recordPaymentToCloud(selectedPlan, method, usePromoOffer)
    setTimeout(() => {
      navigate('/onboarding/pagamento/sucesso')
      useAppStore.getState().grantInterimPaymentAccess()
    }, 1800)
  }

  const copyPix = () => {
    navigator.clipboard.writeText(pixCode).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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

        <div className="grid grid-cols-2 gap-2 shrink-0 mb-3">
          <button
            type="button"
            onClick={() => setMethod('pix')}
            className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 border transition-all ${
              method === 'pix'
                ? 'border-accent-green bg-accent-green/10 text-white'
                : 'border-neutral-800 bg-surface text-neutral-400'
            }`}
          >
            <QrCode size={16} />
            <span className="font-semibold text-xs">Pix</span>
          </button>
          <button
            type="button"
            onClick={() => setMethod('card')}
            className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 border transition-all ${
              method === 'card'
                ? 'border-accent-blue bg-accent-blue/10 text-white'
                : 'border-neutral-800 bg-surface text-neutral-400'
            }`}
          >
            <CreditCard size={16} />
            <span className="font-semibold text-xs">Cartão</span>
          </button>
        </div>

        <div className="flex-1 min-h-0 flex flex-col">
          {method === 'pix' ? (
            <div className="flex flex-col items-center animate-fade-in min-h-0">
              <div className="bg-white rounded-xl p-3 mb-2 shrink-0">
                <div className="w-[7.5rem] h-[7.5rem] bg-neutral-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-2 border border-neutral-300 rounded" />
                  <div className="grid grid-cols-5 gap-0.5 p-2">
                    {Array.from({ length: 25 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 ${i % 3 === 0 ? 'bg-black' : 'bg-neutral-300'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-neutral-400 text-xs text-center mb-2 shrink-0">
                Escaneie o QR Code ou copie o Pix abaixo
              </p>

              <button
                type="button"
                onClick={copyPix}
                className="w-full bg-surface rounded-xl px-3 py-2.5 flex items-center gap-2 text-left shrink-0 mb-2"
              >
                <code className="flex-1 text-[10px] text-neutral-400 truncate font-mono">
                  {pixCode}
                </code>
                <span className="text-accent-green text-[10px] font-semibold shrink-0 flex items-center gap-1">
                  {copied ? 'Copiado!' : (
                    <>
                      <Copy size={14} />
                      Copiar
                    </>
                  )}
                </span>
              </button>

              <MoneyBackGuarantee compact className="w-full shrink-0" />
            </div>
          ) : (
            <div className="space-y-2 animate-fade-in min-h-0 overflow-y-auto">
              <input
                placeholder="Número do cartão"
                className="w-full bg-surface rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-neutral-600 outline-none focus:ring-2 focus:ring-accent-blue/50"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  placeholder="MM/AA"
                  className="w-full bg-surface rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-neutral-600 outline-none focus:ring-2 focus:ring-accent-blue/50"
                />
                <input
                  placeholder="CVV"
                  className="w-full bg-surface rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-neutral-600 outline-none focus:ring-2 focus:ring-accent-blue/50"
                />
              </div>
              <input
                placeholder="Nome no cartão"
                className="w-full bg-surface rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-neutral-600 outline-none focus:ring-2 focus:ring-accent-blue/50"
              />
              <MoneyBackGuarantee compact className="w-full mt-1" />
            </div>
          )}
        </div>

        <div className="shrink-0 pt-3 space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-neutral-500 text-[10px]">
            <Lock size={12} />
            Pagamento seguro · criptografado
          </div>
          <Button onClick={handlePay} disabled={loading} className="py-3.5 text-sm">
            {loading ? 'Verificando...' : 'Já paguei'}
          </Button>
        </div>
      </div>
    </div>
  )
}
