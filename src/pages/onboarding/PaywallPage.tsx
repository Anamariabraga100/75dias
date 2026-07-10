import { useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { InputField } from '../../components/ui/InputField'
import { PasswordField } from '../../components/ui/PasswordField'
import { MoneyBackGuarantee } from '../../components/ui/MoneyBackGuarantee'
import { useAppStore } from '../../store/useAppStore'
import { PRICING } from '../../lib/pricing'
import { usePaywallCheckout } from '../../lib/usePaywallCheckout'
import { grantDevAccess, isDevBypassPayment } from '../../lib/devMode'

const PAYWALL_HERO = '/niveis/pagamento.jpg'

export function PaywallPage() {
  const navigate = useNavigate()
  const { selectedPlan, setSelectedPlan } = useAppStore()
  const checkout = usePaywallCheckout(false)

  const handlePay = () => {
    if (checkout.needsAuth) {
      void checkout.authAndCheckout()
      return
    }
    void checkout.startCheckout()
  }

  const handleDevSkip = () => {
    grantDevAccess()
    navigate('/app', { replace: true })
  }

  const devMode = isDevBypassPayment()

  return (
    <div className="h-dvh max-h-dvh bg-black overflow-hidden">
      <div className="max-w-md mx-auto w-full h-full flex flex-col pt-[max(0.5rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <header className="flex justify-end items-center px-5 shrink-0 py-1">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-neutral-500 p-1"
            aria-label="Fechar"
          >
            <X size={22} />
          </button>
        </header>

        <div
          className={`relative mx-5 rounded-2xl overflow-hidden shrink min-h-0 ${
            checkout.needsAuth
              ? 'h-[14vh] min-h-[6.5rem] max-h-[8.5rem]'
              : 'flex-1 min-h-[10rem] max-h-[34vh]'
          }`}
        >
          <img
            src={PAYWALL_HERO}
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-[center_35%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <p className="text-white font-bold text-base leading-snug">Seu Reset90 começa agora</p>
            <p className="text-white/70 text-xs mt-0.5">Plano personalizado · 90 dias de transformação</p>
          </div>
        </div>

        <div className="shrink-0 px-5 pt-4 space-y-3">
          {devMode && (
            <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2.5">
              <p className="text-amber-400 text-xs font-semibold mb-2">Modo dev — pagamento desligado</p>
              <button
                type="button"
                onClick={handleDevSkip}
                className="w-full py-2 rounded-lg text-sm font-bold text-amber-300 border border-amber-500/50 hover:bg-amber-500/15 transition-colors"
              >
                Entrar no app sem pagar
              </button>
            </div>
          )}

          <div>
            <span className="inline-block bg-white/10 text-white text-[10px] font-medium px-2.5 py-0.5 rounded-full mb-2">
              Acesso completo · 90 dias
            </span>
            <h1 className="text-2xl font-bold leading-tight">Desbloqueie seu plano</h1>
            <p className="text-neutral-400 text-xs mt-0.5">Cancele quando quiser · acesso imediato</p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setSelectedPlan('monthly')}
              className={`rounded-2xl p-3 text-left border-2 transition-all ${
                selectedPlan === 'monthly'
                  ? 'border-white bg-surface'
                  : 'border-neutral-800 bg-surface'
              }`}
            >
              <p className="text-xs text-neutral-400 mb-0.5">{PRICING.monthly.label}</p>
              <p className="font-bold text-base">{PRICING.monthly.display}</p>
              <p className="text-[11px] text-neutral-500">{PRICING.monthly.period}</p>
            </button>

            <button
              type="button"
              onClick={() => setSelectedPlan('quarterly')}
              className={`rounded-2xl p-3 text-left border-2 transition-all relative ${
                selectedPlan === 'quarterly'
                  ? 'border-accent-yellow bg-surface'
                  : 'border-neutral-800 bg-surface'
              }`}
            >
              <span className="absolute -top-2 right-2.5 bg-accent-yellow text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
                -{PRICING.quarterly.discountPercent}%
              </span>
              <p className="text-xs text-neutral-400 mb-0.5">{PRICING.quarterly.label}</p>
              <p className="font-bold text-base">{PRICING.quarterly.displayPerMonth}</p>
              <p className="text-[11px] text-neutral-500">{PRICING.quarterly.period}</p>
            </button>
          </div>

          {checkout.needsAuth ? (
            <div className="space-y-2">
              <InputField
                value={checkout.email}
                onChange={checkout.setEmail}
                placeholder="seu@email.com"
                type="email"
              />
              <PasswordField
                label={checkout.isSignup ? 'Senha' : 'Sua senha'}
                value={checkout.password}
                onChange={checkout.setPassword}
                placeholder="Mín. 6 caracteres"
                autoComplete={checkout.isSignup ? 'new-password' : 'current-password'}
              />
              {checkout.isSignup && (
                <PasswordField
                  label="Repita a senha"
                  value={checkout.confirmPassword}
                  onChange={checkout.setConfirmPassword}
                  placeholder="Digite de novo"
                  autoComplete="new-password"
                />
              )}
              <button
                type="button"
                onClick={() => {
                  checkout.setAuthMode(checkout.isSignup ? 'login' : 'signup')
                  checkout.setError(null)
                  checkout.setPassword('')
                  checkout.setConfirmPassword('')
                }}
                className="text-neutral-500 text-xs underline"
              >
                {checkout.isSignup ? 'Já tenho conta' : 'Criar conta'}
              </button>
            </div>
          ) : (
            <ul className="text-xs text-neutral-300 space-y-1">
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
          )}

          <MoneyBackGuarantee compact />

          {checkout.error && (
            <p className="text-red-400 text-xs text-center" role="alert">
              {checkout.error}
            </p>
          )}

          <Button
            onClick={handlePay}
            disabled={checkout.loading || (checkout.needsAuth && !checkout.canSubmitAuth)}
            className="py-3.5 text-sm w-full"
          >
            {checkout.loading
              ? 'Redirecionando...'
              : checkout.needsAuth
                ? checkout.isSignup
                  ? 'Criar conta e pagar'
                  : 'Entrar e pagar'
                : 'Continuar para pagamento'}
          </Button>

          <p className="text-neutral-500 text-[11px] text-center pb-0.5">
            {selectedPlan === 'quarterly' ? PRICING.quarterly.footer : PRICING.monthly.footer}
          </p>
        </div>
      </div>
    </div>
  )
}
