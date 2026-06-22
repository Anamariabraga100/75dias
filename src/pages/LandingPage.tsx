import { useState } from 'react'
import { Mail } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { GoogleSignInOverlay } from '../components/auth/GoogleSignInOverlay'
import { useAppStore } from '../store/useAppStore'
import {
  applySessionToStore,
  assertSupabaseReady,
  completeGoogleSignIn,
  formatAuthError,
  navigateAfterAuth,
  signInWithGoogle,
} from '../lib/auth'
import { useGoogleIdentitySignIn } from '../lib/googleSignIn'
import { isSupabaseConfigured } from '../lib/supabase'

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

export function LandingPage() {
  const navigate = useNavigate()
  const enterAsReturningUser = useAppStore((s) => s.enterAsReturningUser)
  const [loading, setLoading] = useState<'google' | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)
  const useGisPopup = useGoogleIdentitySignIn()

  const startEmailSignup = () => navigate('/auth/email')

  const finishGoogleSession = async (idToken: string) => {
    setAuthError(null)
    setLoading('google')
    try {
      assertSupabaseReady()
      const session = await completeGoogleSignIn(idToken)
      applySessionToStore(session)
      navigateAfterAuth(navigate)
    } catch (e) {
      setAuthError(e instanceof Error ? formatAuthError(e.message) : 'Erro ao entrar com Google.')
    } finally {
      setLoading(null)
    }
  }

  const handleGoogleLoginFallback = async () => {
    setAuthError(null)
    if (!isSupabaseConfigured()) {
      setAuthError('Login indisponível: variáveis do Supabase não encontradas.')
      return
    }
    try {
      setLoading('google')
      assertSupabaseReady()
      const session = await signInWithGoogle()
      if (session) {
        applySessionToStore(session)
        navigateAfterAuth(navigate)
      }
    } catch (e) {
      setAuthError(e instanceof Error ? formatAuthError(e.message) : 'Erro ao abrir login Google.')
      setLoading(null)
    }
  }

  const handleReturningUser = () => {
    setAuthError(null)
    if (!isSupabaseConfigured()) {
      enterAsReturningUser()
      navigate('/app')
      return
    }
    navigate('/auth/email?mode=login')
  }

  const googleButton = (
    <button
      type="button"
      onClick={useGisPopup ? undefined : handleGoogleLoginFallback}
      disabled={loading !== null}
      className="landing-btn-google disabled:opacity-60 w-full"
    >
      <GoogleIcon />
      {loading === 'google' ? 'Abrindo Google…' : 'Continuar com Google'}
    </button>
  )

  return (
    <div className="min-h-dvh bg-black">
      <div className="relative max-w-md mx-auto min-h-dvh overflow-hidden">
        <img
          src="/landing/hero.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-[center_42%]"
        />

        <div
          className="absolute inset-x-0 bottom-0 h-[55%] pointer-events-none"
          style={{
            background:
              'linear-gradient(to top, rgba(0,0,0,0.98) 0%, rgba(0,0,0,0.78) 38%, rgba(0,0,0,0.35) 68%, transparent 100%)',
          }}
        />

        <div className="relative z-10 flex flex-col min-h-dvh">
          <header className="text-center px-6 pt-[max(2rem,env(safe-area-inset-top))]">
            <h1 className="landing-hero-brand">RESET90</h1>
            <p className="landing-hero-slogan">Disciplina. Corpo. Mente.</p>
          </header>

          <div className="flex-1 min-h-[22vh]" aria-hidden />

          <div className="landing-hero-lower px-6 pb-[max(2.25rem,env(safe-area-inset-bottom))]">
            <h2 className="landing-hero-headline">90 dias. Reset total.</h2>
            <p className="landing-hero-body">
              Torne-se a pessoa que você sabe que pode ser.
            </p>

            {authError && (
              <p className="text-red-400 text-xs text-center mt-4 max-w-sm mx-auto">{authError}</p>
            )}

            <div className="mt-7 space-y-3 max-w-sm mx-auto w-full">
              {useGisPopup ? (
                <GoogleSignInOverlay
                  disabled={loading !== null}
                  onCredential={finishGoogleSession}
                  onError={(msg) => setAuthError(formatAuthError(msg))}
                  className="w-full"
                >
                  {googleButton}
                </GoogleSignInOverlay>
              ) : (
                googleButton
              )}

              <button
                type="button"
                onClick={startEmailSignup}
                disabled={loading !== null}
                className="landing-btn-email disabled:opacity-60"
              >
                <Mail size={20} strokeWidth={2} className="shrink-0" />
                Continuar com e-mail
              </button>
            </div>

            <button
              type="button"
              onClick={handleReturningUser}
              disabled={loading !== null}
              className="landing-btn-account disabled:opacity-60"
            >
              Já tenho conta
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
