import { useEffect, useState } from 'react'
import { ArrowLeft, CreditCard, Lock, QrCode, ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { InputField } from '../../components/ui/InputField'
import { PasswordField } from '../../components/ui/PasswordField'
import { MoneyBackGuarantee } from '../../components/ui/MoneyBackGuarantee'
import { useAppStore } from '../../store/useAppStore'
import { getCheckoutPrice } from '../../lib/pricing'
import {
  applySessionToStore,
  EmailConfirmationRequiredError,
  EmailLinkedToGoogleError,
  establishAuthSession,
  formatAuthError,
  isValidEmail,
  restoreAuthSession,
  signInWithEmail,
  signUpWithEmail,
} from '../../lib/auth'
import { startStripeCheckout } from '../../lib/stripeCheckout'
import { flushProfileSync } from '../../lib/userSync'
import { supabase } from '../../lib/supabase'

type AuthMode = 'signup' | 'login'

export function PaymentPage() {
  const navigate = useNavigate()
  const { selectedPlan, usePromoOffer, email: storedEmail } = useAppStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [authReady, setAuthReady] = useState<boolean | null>(null)
  const [authMode, setAuthMode] = useState<AuthMode>('signup')
  const [email, setEmail] = useState(storedEmail || '')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const price = getCheckoutPrice(selectedPlan, usePromoOffer)
  const isSignup = authMode === 'signup'
  const canSubmitAuth =
    isValidEmail(email) &&
    password.length >= 6 &&
    (!isSignup || password === confirmPassword)

  useEffect(() => {
    void flushProfileSync()
  }, [selectedPlan, usePromoOffer])

  useEffect(() => {
    if (!supabase) {
      setAuthReady(false)
      return
    }

    let active = true

    const syncAuth = async () => {
      const session = await restoreAuthSession()
      if (!active) return
      setAuthReady(Boolean(session))
    }

    void syncAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return
      if (session) {
        applySessionToStore(session)
        setAuthReady(true)
      }
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const goToCheckout = async () => {
    const url = await startStripeCheckout(selectedPlan, usePromoOffer)
    window.location.href = url
  }

  const handlePay = async () => {
    setLoading(true)
    setError(null)
    try {
      await goToCheckout()
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Erro ao iniciar pagamento'
      if (message === 'Faça login para continuar') {
        setAuthReady(false)
      }
      setError(message)
      setLoading(false)
    }
  }

  const handleAuthAndPay = async () => {
    if (!canSubmitAuth) return

    setLoading(true)
    setError(null)

    try {
      const session = isSignup
        ? await signUpWithEmail(email, password)
        : await signInWithEmail(email, password)

      if (!session) {
        throw new EmailConfirmationRequiredError()
      }

      await establishAuthSession(session)
      setAuthReady(true)
      await goToCheckout()
    } catch (e) {
      if (e instanceof EmailLinkedToGoogleError) {
        setError(e.message)
      } else if (e instanceof EmailConfirmationRequiredError) {
        setError(e.message)
      } else {
        const message = e instanceof Error ? e.message : 'Erro ao autenticar.'
        setError(formatAuthError(message))
      }
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

        <div className="flex-1 min-h-0 overflow-y-auto">
          {authReady === false && (
            <div className="bg-surface rounded-2xl p-4 mb-3 space-y-3 animate-fade-in">
              <div>
                <p className="font-semibold text-sm">
                  {isSignup ? 'Crie sua conta para pagar' : 'Entre na sua conta'}
                </p>
                <p className="text-neutral-500 text-xs mt-1">
                  Sua conta é criada agora e você vai direto para o pagamento seguro.
                </p>
              </div>

              <InputField
                value={email}
                onChange={setEmail}
                placeholder="seu@email.com"
                type="email"
              />
              <PasswordField
                label={isSignup ? 'Crie uma senha' : 'Sua senha'}
                value={password}
                onChange={setPassword}
                placeholder="Mínimo 6 caracteres"
                autoComplete={isSignup ? 'new-password' : 'current-password'}
              />
              {isSignup && (
                <PasswordField
                  label="Repita a senha"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  placeholder="Digite de novo"
                  autoComplete="new-password"
                />
              )}

              <button
                type="button"
                onClick={() => {
                  setAuthMode(isSignup ? 'login' : 'signup')
                  setError(null)
                  setPassword('')
                  setConfirmPassword('')
                }}
                className="text-neutral-400 text-xs underline"
              >
                {isSignup ? 'Já tenho conta — entrar' : 'Criar conta nova'}
              </button>
            </div>
          )}

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
          {authReady === false ? (
            <Button
              onClick={() => void handleAuthAndPay()}
              disabled={loading || !canSubmitAuth}
              className="py-3.5 text-sm"
            >
              {loading
                ? 'Redirecionando...'
                : isSignup
                  ? 'Criar conta e pagar'
                  : 'Entrar e pagar'}
            </Button>
          ) : (
            <Button
              onClick={() => void handlePay()}
              disabled={loading || authReady === null}
              className="py-3.5 text-sm"
            >
              {authReady === null ? 'Verificando conta...' : loading ? 'Redirecionando...' : 'Pagar agora'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
