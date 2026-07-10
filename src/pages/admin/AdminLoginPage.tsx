import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Logo } from '../../components/ui/Logo'
import { Button } from '../../components/ui/Button'
import { PasswordField } from '../../components/ui/PasswordField'
import {
  activateAdminSession,
  isAdminAccessConfigured,
  verifyAdminPassword,
} from '../../lib/adminSession'

export function AdminLoginPage() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const configured = isAdminAccessConfigured()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!configured) {
      setError('Defina VITE_ADMIN_EMAIL e VITE_ADMIN_PASSWORD no .env ou na Vercel.')
      return
    }

    if (!verifyAdminPassword(password)) {
      setError('Senha incorreta.')
      return
    }

    try {
      setLoading(true)
      activateAdminSession()
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
      <p className="text-neutral-500 text-sm mt-4 mb-8">Área administrativa</p>

      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-4">
        {error && <p className="text-red-400 text-xs text-center">{error}</p>}

        <PasswordField
          label="Senha"
          value={password}
          onChange={setPassword}
          placeholder="Digite sua senha"
          autoComplete="current-password"
        />

        <Button type="submit" disabled={loading || !configured || password.length < 1}>
          {loading ? 'Entrando…' : 'Entrar no painel'}
        </Button>
      </form>

      {!configured && (
        <p className="text-amber-500/90 text-xs text-center max-w-xs mt-4">
          Adicione VITE_ADMIN_EMAIL e VITE_ADMIN_PASSWORD no .env e reinicie o servidor.
        </p>
      )}

      <a href="/" className="text-neutral-600 text-xs mt-8 hover:text-neutral-400">
        ← Voltar ao app
      </a>
    </div>
  )
}
