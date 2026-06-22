import { useEffect } from 'react'
import { applySessionToStore, getCurrentSession } from '../../lib/auth'
import { syncProfileToCloud } from '../../lib/userSync'
import { supabase } from '../../lib/supabase'
import { useAppStore } from '../../store/useAppStore'

/** Mantém nome, e-mail e foto do Google sincronizados com a sessão Supabase. */
export function AuthSessionSync() {
  useEffect(() => {
    if (!supabase) return

    getCurrentSession().then((session) => {
      if (session) {
        applySessionToStore(session)
        void syncProfileToCloud()
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        applySessionToStore(session)
        void syncProfileToCloud()
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
