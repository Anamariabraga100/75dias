import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Copy, CreditCard, QrCode, ShieldCheck } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { useAppStore } from '../../store/useAppStore'
import { getCheckoutPrice } from '../../lib/pricing'

type PaymentMethod = 'pix' | 'card'

export function PaymentPage() {
  const navigate = useNavigate()
  const { selectedPlan, usePromoOffer, setPaymentComplete } = useAppStore()
  const [method, setMethod] = useState<PaymentMethod>('pix')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const price = getCheckoutPrice(selectedPlan, usePromoOffer)
  const pixCode = '00020126580014BR.GOV.BCB.PIX0136123e4567-e12b-12d1-a456-426655440000'

  const handlePay = () => {
    setLoading(true)
    setTimeout(() => {
      setPaymentComplete()
      navigate('/onboarding/pagamento/sucesso')
    }, 1800)
  }

  const copyPix = () => {
    navigator.clipboard.writeText(pixCode).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-dvh bg-black flex flex-col">
      <div className="max-w-md mx-auto w-full flex flex-col min-h-dvh px-5">
        <header className="flex items-center gap-3 pt-4 pb-2">
          <button onClick={() => navigate(-1)} className="text-neutral-400">
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-lg font-bold">Finalizar pagamento</h1>
        </header>

        <div className="bg-surface rounded-2xl p-4 mb-6 mt-2">
          <p className="text-neutral-400 text-sm mb-1">{price.label}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold">{price.total}</span>
            <span className="text-neutral-500 text-sm">{price.period}</span>
          </div>
          {usePromoOffer && price.discount && (
            <span className="inline-block mt-2 bg-accent-yellow/20 text-accent-yellow text-xs font-bold px-2 py-0.5 rounded-full">
              {price.discount}% OFF aplicado
            </span>
          )}
        </div>

        <p className="text-neutral-400 text-sm mb-3">Forma de pagamento</p>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => setMethod('pix')}
            className={`flex items-center justify-center gap-2 rounded-2xl py-3.5 border-2 transition-all ${
              method === 'pix'
                ? 'border-accent-green bg-accent-green/10 text-white'
                : 'border-neutral-800 bg-surface text-neutral-400'
            }`}
          >
            <QrCode size={18} />
            <span className="font-semibold text-sm">Pix</span>
          </button>
          <button
            onClick={() => setMethod('card')}
            className={`flex items-center justify-center gap-2 rounded-2xl py-3.5 border-2 transition-all ${
              method === 'card'
                ? 'border-accent-blue bg-accent-blue/10 text-white'
                : 'border-neutral-800 bg-surface text-neutral-400'
            }`}
          >
            <CreditCard size={18} />
            <span className="font-semibold text-sm">Cartão</span>
          </button>
        </div>

        <div className="flex-1">
          {method === 'pix' ? (
            <div className="animate-fade-in">
              <div className="bg-white rounded-2xl p-6 flex items-center justify-center mb-4">
                <div className="w-44 h-44 bg-neutral-100 rounded-xl flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-3 border-2 border-neutral-300 rounded-lg" />
                  <div className="grid grid-cols-5 gap-1 p-4">
                    {Array.from({ length: 25 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 ${i % 3 === 0 ? 'bg-black' : 'bg-neutral-300'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-neutral-400 text-sm text-center mb-4">
                Escaneie o QR Code ou copie o código Pix
              </p>
              <button
                onClick={copyPix}
                className="w-full bg-surface rounded-xl p-3 flex items-center gap-3 text-left"
              >
                <code className="flex-1 text-xs text-neutral-400 truncate">{pixCode}</code>
                <span className="text-accent-green text-xs font-medium shrink-0">
                  {copied ? 'Copiado!' : <Copy size={16} />}
                </span>
              </button>
            </div>
          ) : (
            <div className="space-y-3 animate-fade-in">
              <input
                placeholder="Número do cartão"
                className="w-full bg-surface rounded-xl px-4 py-3.5 text-white placeholder:text-neutral-600 outline-none focus:ring-2 focus:ring-accent-blue/50"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  placeholder="MM/AA"
                  className="w-full bg-surface rounded-xl px-4 py-3.5 text-white placeholder:text-neutral-600 outline-none focus:ring-2 focus:ring-accent-blue/50"
                />
                <input
                  placeholder="CVV"
                  className="w-full bg-surface rounded-xl px-4 py-3.5 text-white placeholder:text-neutral-600 outline-none focus:ring-2 focus:ring-accent-blue/50"
                />
              </div>
              <input
                placeholder="Nome no cartão"
                className="w-full bg-surface rounded-xl px-4 py-3.5 text-white placeholder:text-neutral-600 outline-none focus:ring-2 focus:ring-accent-blue/50"
              />
            </div>
          )}
        </div>

        <div className="pb-8 pt-4">
          <div className="flex items-center justify-center gap-2 text-neutral-500 text-xs mb-4">
            <ShieldCheck size={14} />
            Pagamento seguro · Simulação front-end
          </div>
          <Button onClick={handlePay} disabled={loading}>
            {loading ? 'Processando...' : `Pagar ${price.total}`}
          </Button>
        </div>
      </div>
    </div>
  )
}
