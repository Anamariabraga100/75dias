import { Navigate, Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { checkIsAdmin } from '../../lib/adminApi'
import { isLocalAdminSession } from '../../lib/adminDev'
import { supabase } from '../../lib/supabase'
import { Logo } from '../ui/Logo'

export function AdminGuard() {
  const [status, setStatus] = useState<'loading' | 'allowed' | 'denied' | 'login'>('loading')

  useEffect(() => {
    if (isLocalAdminSession()) {
      setStatus('allowed')
      return
    }

    if (!supabase) {
      setStatus('denied')
      return
    }

    let cancelled = false

    const verify = async () => {
      if (!supabase) return
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        if (!cancelled) setStatus('login')
        return
      }
      const isAdmin = await checkIsAdmin()
      if (!cancelled) setStatus(isAdmin ? 'allowed' : 'denied')
    }

    void verify()

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      void verify()
    })

    return () => {
      cancelled = true
      listener.subscription.unsubscribe()
    }
  }, [])

  if (status === 'loading') {
    return (
      <div className="min-h-dvh bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-neutral-500 text-sm">Verificando acesso…</p>
      </div>
    )
  }

  if (status === 'login') {
    return <Navigate to="/admin/login" replace />
  }

  if (status === 'denied') {
    return (
      <div className="min-h-dvh bg-[#0a0a0a] flex flex-col items-center justify-center px-6 text-center">
        <Logo size="lg" />
        <h1 className="text-xl font-bold mt-6 mb-2">Acesso restrito</h1>
        <p className="text-neutral-400 text-sm max-w-sm mb-6">
          Esta área é só para administradores.
        </p>
        <a href="/admin/login" className="text-accent-blue text-sm font-semibold hover:underline">
          Ir para login admin
        </a>
      </div>
    )
  }

  return <Outlet />
}
