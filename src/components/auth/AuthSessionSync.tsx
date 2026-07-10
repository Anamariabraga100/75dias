import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { navigateAfterAuth, restoreAuthSession, applySessionToStore } from '../../lib/auth'
import { shouldRedirectAuthenticatedFrom } from '../../lib/onboardingRoute'
import { hydrateFromCloud, scheduleProfileSync } from '../../lib/userSync'
import { waitForStoreHydration } from '../../lib/storeHydration'
import { supabase } from '../../lib/supabase'
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

    const bootstrap = async () => {
      await waitForStoreHydration()
      const session = await restoreAuthSession()
      if (!active) return

      if (session) {
        scheduleProfileSync()
      }

      if (active) setReady(true)
    }

    void bootstrap()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!active) return

      if (session) {
        applySessionToStore(session)
        await hydrateFromCloud()
        scheduleProfileSync()

        if (event === 'SIGNED_IN' && shouldRedirectAuthenticatedFrom(window.location.pathname)) {
          await navigateAfterAuth(navigate)
        }
        return
      }

      if (event === 'SIGNED_OUT') {
        useAppStore.getState().reset()
      }
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [navigate])

  if (!ready) {
    return <div className="min-h-dvh bg-black" aria-busy="true" aria-label="Carregando sessão" />
  }

  return <>{children}</>
}
