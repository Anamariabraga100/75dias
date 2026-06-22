import { useEffect } from 'react'
import { applySessionToStore, getCurrentSession } from '../../lib/auth'
import { hydrateFromCloud, scheduleProfileSync } from '../../lib/userSync'
import { supabase } from '../../lib/supabase'
import { useAppStore } from '../../store/useAppStore'

/** Mantém sessão Supabase e progresso sincronizado (cloud → local). */
export function AuthSessionSync() {
  useEffect(() => {
    if (!supabase) return

    const syncSession = async () => {
      const session = await getCurrentSession()
      if (session) {
        applySessionToStore(session)
        await hydrateFromCloud()
        scheduleProfileSync()
      }
    }

    void syncSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        applySessionToStore(session)
        await hydrateFromCloud()
        scheduleProfileSync()
        return
      }
      if (event === 'SIGNED_OUT') {
        useAppStore.getState().clearUserProfile()
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return null
}
