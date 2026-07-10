import { useEffect } from 'react'
import { flushProfileSync } from '../../lib/userSync'

/** Garante que progresso (XP, dias, hábitos) vá para a nuvem ao sair ou recarregar. */
export function ProfileSyncGuard() {
  useEffect(() => {
    const flush = () => {
      void flushProfileSync()
    }

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') flush()
    }

    window.addEventListener('pagehide', flush)
    window.addEventListener('beforeunload', flush)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      window.removeEventListener('pagehide', flush)
      window.removeEventListener('beforeunload', flush)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return null
}
