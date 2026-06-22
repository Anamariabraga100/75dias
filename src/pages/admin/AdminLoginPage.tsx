import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Logo } from '../../components/ui/Logo'
import { Button } from '../../components/ui/Button'
import { InputField } from '../../components/ui/InputField'
import {
  applySessionToStore,
  assertSupabaseReady,
  isValidEmail,
  signInWithEmail,
  signOut,
} from '../../lib/auth'
import { checkIsAdmin } from '../../lib/adminApi'
import {
  clearRememberedAdmin,
  getDefaultAdminEmail,
  getDefaultAdminPassword,
  matchesAdminCredentials,
  saveRememberedAdmin,
  shouldRememberByDefault,
} from '../../lib/adminCredentials'
import { isSupabaseConfigured } from '../../lib/supabase'
import { syncProfileToCloud } from '../../lib/userSync'

export function AdminLoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setEmail(getDefaultAdminEmail())
    setPassword(getDefaultAdminPassword())
    setRemember(shouldRememberByDefault())
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const normalizedEmail = email.trim()

    if (!isValidEmail(normalizedEmail)) {
      setError('Digite um e-mail válido.')
      return
    }
    if (password.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres.')
      return
    }
    if (!isSupabaseConfigured()) {
      setError('Supabase não configurado.')
      return
    }
    if (!matchesAdminCredentials(normalizedEmail, password)) {
      setError(
        'Credenciais diferentes das do .env / Vercel. Confira VITE_ADMIN_EMAIL e VITE_ADMIN_PASSWORD e reinicie o servidor.'
      )
      return
    }

    try {
      setLoading(true)
      assertSupabaseReady()

      const session = await signInWithEmail(normalizedEmail, password)
      applySessionToStore(session)
      await syncProfileToCloud()

      const isAdmin = await checkIsAdmin()
      if (!isAdmin) {
        await signOut()
        setError('Conta sem permissão de admin. Rode o SQL is_admin no Supabase.')
        return
      }

      if (remember) {
        saveRememberedAdmin({ email: normalizedEmail, password })
      } else {
        clearRememberedAdmin()
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
        Entre com e-mail e senha da conta administradora.
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-3">
        <InputField
          value={email}
          onChange={setEmail}
          placeholder="E-mail admin"
          type="email"
        />
        <InputField
          value={password}
          onChange={setPassword}
          placeholder="Senha"
          type="password"
        />

        <label className="flex items-center gap-2.5 cursor-pointer select-none py-1">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="w-4 h-4 rounded border-neutral-600 bg-neutral-900 accent-white"
          />
          <span className="text-sm text-neutral-400">Lembrar senha</span>
        </label>

        {error && <p className="text-red-400 text-xs text-center">{error}</p>}

        <Button type="submit" disabled={loading}>
          {loading ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>

      <a href="/" className="text-neutral-600 text-xs mt-8 hover:text-neutral-400">
        ← Voltar ao app
      </a>
    </div>
  )
}
