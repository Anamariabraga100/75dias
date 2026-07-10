import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { OnboardingLayout, PageTitle } from '../components/layout/OnboardingLayout'
import { Button } from '../components/ui/Button'
import { InputField } from '../components/ui/InputField'
import { PasswordChecklist, PasswordField } from '../components/ui/PasswordField'
import { GoogleSignInOverlay } from '../components/auth/GoogleSignInOverlay'
import {
  establishAuthSession,
  assertSupabaseReady,
  completeGoogleSignIn,
  EmailAlreadyExistsError,
  EmailConfirmationRequiredError,
  EmailLinkedToGoogleError,
  formatAuthError,
  isValidEmail,
  navigateAfterAuth,
  signInWithEmail,
  signInWithGoogle,
  signUpWithEmail,
} from '../lib/auth'
import { useGoogleClientId } from '../lib/googleSignIn'
import { isSupabaseConfigured } from '../lib/supabase'

type Step = 'email' | 'password'
type AuthMode = 'signup' | 'login'

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

export function EmailAuthPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const mode: AuthMode = searchParams.get('mode') === 'login' ? 'login' : 'signup'
  const nextPath = searchParams.get('next')
  const isSignup = mode === 'signup'

  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showGoogleHint, setShowGoogleHint] = useState(false)
  const { clientId: googleClientId, ready: googleReady } = useGoogleClientId()
  const useGisPopup = Boolean(googleClientId)

  useEffect(() => {
    setStep('email')
    setPassword('')
    setConfirmPassword('')
    setError(null)
    setShowGoogleHint(false)
  }, [mode])

  const handleBack = () => {
    if (step === 'password') {
      setStep('email')
      setPassword('')
      setConfirmPassword('')
      setError(null)
      setShowGoogleHint(false)
      return
    }
    navigate('/')
  }

  const handleEmailContinue = () => {
    setError(null)
    setShowGoogleHint(false)

    if (!isValidEmail(email)) {
      setError('Digite um e-mail válido.')
      return
    }

    setStep('password')
  }

  const handleSubmit = async () => {
    setError(null)
    setShowGoogleHint(false)

    if (password.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres.')
      return
    }

    if (isSignup && password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }

    if (!isSupabaseConfigured()) {
      setError('Login indisponível: variáveis do Supabase não encontradas.')
      return
    }

    try {
      setLoading(true)
      assertSupabaseReady()

      const session = isSignup
        ? await signUpWithEmail(email, password)
        : await signInWithEmail(email, password)

      if (session) {
        await establishAuthSession(session)
        await navigateAfterAuth(navigate, {
          returning: !isSignup,
          next: nextPath ?? undefined,
        })
        return
      }

      if (isSignup) {
        setError('Conta criada! Confirme o e-mail enviado para continuar.')
      }
    } catch (e) {
      if (e instanceof EmailLinkedToGoogleError) {
        setShowGoogleHint(true)
        setError(e.message)
      } else if (e instanceof EmailAlreadyExistsError) {
        setError(e.message)
      } else if (e instanceof EmailConfirmationRequiredError) {
        setError(e.message)
      } else {
        const message = e instanceof Error ? e.message : 'Erro ao autenticar.'
        setError(formatAuthError(message))
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleCredential = async (idToken: string) => {
    setError(null)
    if (!isSupabaseConfigured()) return
    try {
      setLoading(true)
      assertSupabaseReady()
      const session = await completeGoogleSignIn(idToken)
      await establishAuthSession(session)
      await navigateAfterAuth(navigate, { returning: !isSignup, next: nextPath ?? undefined })
    } catch (e) {
      setError(e instanceof Error ? formatAuthError(e.message) : 'Erro ao entrar com Google.')
      setLoading(false)
    }
  }

  const handleGoogleFromHint = async () => {
    setError(null)
    if (!isSupabaseConfigured()) return
    try {
      setLoading(true)
      assertSupabaseReady()
      const session = await signInWithGoogle({ returning: !isSignup })
      if (session) {
        await establishAuthSession(session)
        await navigateAfterAuth(navigate, { returning: !isSignup, next: nextPath ?? undefined })
      }
    } catch (e) {
      setError(e instanceof Error ? formatAuthError(e.message) : 'Erro ao abrir login Google.')
      setLoading(false)
    }
  }

  const canContinueEmail = isValidEmail(email)
  const canSubmitPassword =
    password.length >= 6 && (!isSignup || (confirmPassword.length >= 6 && password === confirmPassword))

  return (
    <OnboardingLayout
      onBack={handleBack}
      footer={
        step === 'email' ? (
          <Button disabled={!canContinueEmail || loading} onClick={handleEmailContinue}>
            Continuar
          </Button>
        ) : (
          <Button disabled={!canSubmitPassword || loading} onClick={handleSubmit}>
            {loading ? 'Aguarde…' : isSignup ? 'Criar conta' : 'Entrar'}
          </Button>
        )
      }
    >
      <PageTitle
        title={
          step === 'email'
            ? isSignup
              ? 'Qual seu e-mail?'
              : 'Entrar com e-mail'
            : isSignup
              ? 'Crie sua senha'
              : 'Sua senha'
        }
        subtitle={
          step === 'email'
            ? isSignup
              ? 'Vamos criar sua conta no Reset90'
              : 'Digite o e-mail da sua conta'
            : isSignup
              ? `Conta: ${email}`
              : email
        }
      />

      {error && (
        <div
          className={`rounded-2xl px-4 py-3 mb-4 text-sm ${
            showGoogleHint
              ? 'bg-amber-950/50 border border-amber-800/60 text-amber-200'
              : 'bg-red-950/50 border border-red-900/60 text-red-300'
          }`}
        >
          {error}
        </div>
      )}

      {showGoogleHint && (googleReady && useGisPopup ? (
          <GoogleSignInOverlay
            disabled={loading}
            onCredential={handleGoogleCredential}
            onError={(msg) => setError(formatAuthError(msg))}
            className="mb-4"
          >
            <button
              type="button"
              disabled={loading}
              className="landing-btn-google disabled:opacity-60 w-full"
            >
              <GoogleIcon />
              Continuar com Google
            </button>
          </GoogleSignInOverlay>
        ) : (
          <button
            type="button"
            onClick={handleGoogleFromHint}
            disabled={loading}
            className="landing-btn-google disabled:opacity-60 mb-4"
          >
            <GoogleIcon />
            Continuar com Google
          </button>
        )
      )}

      <div className="mt-auto mb-4 space-y-3">
        {step === 'email' ? (
          <InputField
            value={email}
            onChange={setEmail}
            placeholder="seu@email.com"
            type="email"
          />
        ) : (
          <div className="space-y-4">
            <PasswordField
              label={isSignup ? 'Escolha uma senha' : 'Sua senha'}
              value={password}
              onChange={setPassword}
              placeholder="Mínimo 6 caracteres"
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              hint={isSignup ? 'Use letras e números — fácil de lembrar, difícil de adivinhar.' : undefined}
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
            {isSignup ? (
              <PasswordChecklist
                password={password}
                confirmPassword={confirmPassword}
                showMatch
              />
            ) : (
              <p className="text-sm text-neutral-500 px-1">Mínimo 6 caracteres.</p>
            )}
          </div>
        )}
      </div>
    </OnboardingLayout>
  )
}
