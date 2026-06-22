import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Logo } from '../../components/ui/Logo'
import { Button } from '../../components/ui/Button'
import {
  applySessionToStore,
  assertSupabaseReady,
  signInAsAdmin,
  signOut,
} from '../../lib/auth'
import { checkIsAdmin } from '../../lib/adminApi'
import { activateLocalAdminSession, isAdminAccessConfigured, isLocalAdminMode } from '../../lib/adminDev'
import { getAdminCredentials, getAdminEmailFromEnv } from '../../lib/adminCredentials'
import { isSupabaseConfigured } from '../../lib/supabase'
import { syncProfileToCloud } from '../../lib/userSync'

export function AdminLoginPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const adminEmail = getAdminEmailFromEnv()
  const configured = isAdminAccessConfigured()
  const localDev = isLocalAdminMode()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!configured) {
      setError(
        localDev
          ? 'Defina VITE_ADMIN_EMAIL no .env local.'
          : 'Defina VITE_ADMIN_EMAIL e VITE_ADMIN_PASSWORD na Vercel.'
      )
      return
    }

    try {
      setLoading(true)

      // Localhost: entra direto (sem senha / sem Supabase obrigatório)
      if (localDev) {
        activateLocalAdminSession()
        navigate('/admin/dashboard', { replace: true })
        return
      }

      if (!isSupabaseConfigured()) {
        setError('Supabase não configurado (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).')
        return
      }

      const { email, password } = getAdminCredentials()
      assertSupabaseReady()

      const session = await signInAsAdmin(email, password)
      applySessionToStore(session)
      await syncProfileToCloud()

      const isAdmin = await checkIsAdmin()
      if (!isAdmin) {
        await signOut()
        setError('Conta sem permissão admin. Rode 001_admin_schema.sql e 002_bootstrap_admin.sql.')
        return
      }

      navigate('/admin/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-[#0a0a0a] flex flex-col items-center justify-center px-6">
      <Logo size="lg" />
      <h1 className="text-xl font-bold mt-6 mb-1">Admin Reset90</h1>
      <p className="text-neutral-500 text-sm text-center max-w-sm mb-8">
        {localDev
          ? 'Modo local — clique para entrar (só VITE_ADMIN_EMAIL no .env).'
          : 'Produção — credenciais em VITE_ADMIN_EMAIL e VITE_ADMIN_PASSWORD na Vercel.'}
      </p>

      {configured && adminEmail && (
        <p className="text-neutral-400 text-sm mb-4">{adminEmail}</p>
      )}

      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-3">
        {error && <p className="text-red-400 text-xs text-center">{error}</p>}

        <Button type="submit" disabled={loading || !configured}>
          {loading ? 'Entrando…' : 'Entrar no painel'}
        </Button>
      </form>

      {!configured && (
        <p className="text-amber-500/90 text-xs text-center max-w-xs mt-4">
          {localDev
            ? 'Adicione VITE_ADMIN_EMAIL=admin@admin.com no .env e reinicie o npm run dev.'
            : 'Configure as variáveis na Vercel e faça redeploy.'}
        </p>
      )}

      <a href="/" className="text-neutral-600 text-xs mt-8 hover:text-neutral-400">
        ← Voltar ao app
      </a>
    </div>
  )
}
