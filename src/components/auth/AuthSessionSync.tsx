import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { navigateAfterAuth, restoreAuthSession, applySessionToStore } from '../../lib/auth'
import { shouldRedirectAuthenticatedFrom } from '../../lib/onboardingRoute'
import { hydrateFromCloud } from '../../lib/userSync'
import { waitForStoreHydration } from '../../lib/storeHydration'
import { requestPersistentStorage, warmAuthStorage } from '../../lib/authStorage'
import { AUTH_STORAGE_KEY, supabase } from '../../lib/supabase'
import { useAppStore } from '../../store/useAppStore'

interface AuthSessionSyncProps {
  children: ReactNode
}

/** Restaura sessão persistida, renova token e mantém usuário logado. */
export function AuthSessionSync({ children }: AuthSessionSyncProps) {
  const navigate = useNavigate()
  const [ready, setReady] = useState(!supabase)

  useEffect(() => {
    if (!supabase) return

    let active = true
    let bootstrapped = false

    const bootstrap = async () => {
      await requestPersistentStorage()
      await warmAuthStorage([AUTH_STORAGE_KEY])
      await waitForStoreHydration()
      await restoreAuthSession()
      if (!active) return
      bootstrapped = true
      setReady(true)
    }

    void bootstrap()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!active) return

      if (event === 'INITIAL_SESSION') {
        if (session) applySessionToStore(session)
        return
      }

      if (session) {
        applySessionToStore(session)
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          await hydrateFromCloud()
        }

        if (event === 'SIGNED_IN' && shouldRedirectAuthenticatedFrom(window.location.pathname)) {
          await navigateAfterAuth(navigate)
        }
        return
      }

      if (event === 'SIGNED_OUT') {
        if (!bootstrapped || !supabase) return
        // Offline / rede instável não deve deslogar o usuário do PWA
        if (!navigator.onLine) return
        const { data } = await supabase.auth.getSession()
        if (!active || data.session) return
        useAppStore.getState().reset()
      }
    })

    const refreshOnFocus = () => {
      if (document.visibilityState !== 'visible') return
      void restoreAuthSession()
    }

    document.addEventListener('visibilitychange', refreshOnFocus)
    window.addEventListener('focus', refreshOnFocus)
    window.addEventListener('online', refreshOnFocus)

    return () => {
      active = false
      subscription.unsubscribe()
      document.removeEventListener('visibilitychange', refreshOnFocus)
      window.removeEventListener('focus', refreshOnFocus)
      window.removeEventListener('online', refreshOnFocus)
    }
  }, [navigate])

  if (!ready) {
    return <div className="min-h-dvh bg-black" aria-busy="true" aria-label="Carregando sessão" />
  }

  return <>{children}</>
}
