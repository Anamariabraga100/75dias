import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Logo } from '../components/ui/Logo'
import { applySessionToStore, getCurrentSession } from '../lib/auth'
import { syncProfileToCloud } from '../lib/userSync'
import { supabase } from '../lib/supabase'
import { useAppStore } from '../store/useAppStore'

async function restoreSessionFromHash(): Promise<boolean> {
  if (!supabase || !window.location.hash.includes('access_token=')) return false

  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  const access_token = hash.get('access_token')
  const refresh_token = hash.get('refresh_token')
  if (!access_token || !refresh_token) return false

  const { error } = await supabase.auth.setSession({ access_token, refresh_token })
  if (error) return false

  const cleanUrl = `${window.location.pathname}${window.location.search}`
  window.history.replaceState(null, '', cleanUrl)
  return true
}

export function AuthCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!supabase) {
      setError('Supabase não configurado.')
      return
    }

    let cancelled = false

    const finish = async () => {
      await restoreSessionFromHash()

      const code = searchParams.get('code')
      if (code && supabase) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        if (exchangeError && !cancelled) {
          setError(exchangeError.message)
          return
        }
      }

      const session = await getCurrentSession()
      if (cancelled) return

      if (!session) {
        setError('Não foi possível concluir o login. Tente novamente.')
        return
      }

      applySessionToStore(session)
      void syncProfileToCloud()

      const next = searchParams.get('next')
      if (next && next.startsWith('/') && !next.startsWith('//')) {
        navigate(next, { replace: true })
        return
      }

      const returning = searchParams.get('returning') === '1'
      const { onboardingComplete } = useAppStore.getState()

      if (returning || onboardingComplete) {
        navigate('/app', { replace: true })
      } else {
        navigate('/onboarding/nome', { replace: true })
      }
    }

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        finish()
      }
    })

    finish()

    return () => {
      cancelled = true
      listener.subscription.unsubscribe()
    }
  }, [navigate, searchParams])

  return (
    <div className="min-h-dvh bg-black flex flex-col items-center justify-center px-6">
      <Logo size="lg" />
      {error ? (
        <>
          <p className="text-red-400 text-sm text-center mt-6 mb-4">{error}</p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-white underline text-sm"
          >
            Voltar para o início
          </button>
        </>
      ) : (
        <p className="text-neutral-400 text-sm mt-6">Entrando…</p>
      )}
    </div>
  )
}
