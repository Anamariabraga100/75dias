import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  navigateAfterAuth,
  applySessionToStore,
  getCurrentSession,
} from '../../lib/auth'
import { shouldRedirectAuthenticatedFrom } from '../../lib/onboardingRoute'
import { hydrateFromCloud } from '../../lib/userSync'
import { waitForStoreHydration } from '../../lib/storeHydration'
import { supabase } from '../../lib/supabase'

interface AuthSessionSyncProps {
  children: ReactNode
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return new Promise((resolve) => {
    const timer = window.setTimeout(() => resolve(null), ms)
    promise
      .then((value) => {
        window.clearTimeout(timer)
        resolve(value)
      })
      .catch(() => {
        window.clearTimeout(timer)
        resolve(null)
      })
  })
}

/** Restaura sessão persistida, renova token e mantém usuário logado. */
export function AuthSessionSync({ children }: AuthSessionSyncProps) {
  const navigate = useNavigate()
  const [ready, setReady] = useState(!supabase)

  useEffect(() => {
    if (!supabase) return

    let active = true

    const bootstrap = async () => {
      try {
        await withTimeout(
          (async () => {
            await waitForStoreHydration()
            const session = await getCurrentSession()
            if (session) {
              applySessionToStore(session)
              void hydrateFromCloud()
            }
          })(),
          2500
        )
      } finally {
        if (active) setReady(true)
      }
    }

    void bootstrap()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!active) return

      if (event === 'INITIAL_SESSION') {
        if (session) {
          applySessionToStore(session)
          void hydrateFromCloud()
        }
        return
      }

      if (session) {
        applySessionToStore(session)
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          void hydrateFromCloud()
        }

        if (event === 'SIGNED_IN' && shouldRedirectAuthenticatedFrom(window.location.pathname)) {
          await navigateAfterAuth(navigate)
        }
        return
      }

      // SIGNED_OUT: não zera o app automaticamente —
      // refresh falho / foco / PWA disparava logout falso.
      // Logout real só via signOut() explícito.
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
