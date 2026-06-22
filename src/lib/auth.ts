import type { Session } from '@supabase/supabase-js'
import type { NavigateFunction } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { getAuthCallbackUrl, getGoogleOAuthStartUrl, useCustomGoogleOAuth } from './appUrl'
import { getGoogleClientId, openGoogleSignInPopup } from './googleSignIn'
import { isSupabaseConfigured, supabase } from './supabase'

export class EmailLinkedToGoogleError extends Error {
  constructor() {
    super('Este e-mail já está cadastrado com Google. Use "Continuar com Google" para entrar.')
    this.name = 'EmailLinkedToGoogleError'
  }
}

export class EmailAlreadyExistsError extends Error {
  constructor() {
    super('Já existe uma conta com este e-mail. Use "Já tenho conta" para entrar.')
    this.name = 'EmailAlreadyExistsError'
  }
}

export class EmailConfirmationRequiredError extends Error {
  constructor() {
    super('Enviamos um link de confirmação para seu e-mail. Confirme antes de continuar.')
    this.name = 'EmailConfirmationRequiredError'
  }
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function isAlreadyRegisteredMessage(message: string) {
  return /already registered|already been registered|user already registered/i.test(message)
}

function isRateLimitMessage(message: string) {
  return /rate limit|too many requests|over_email_send_rate_limit|over_request_rate_limit/i.test(
    message
  )
}

export function formatAuthError(message: string): string {
  if (isRateLimitMessage(message)) {
    return 'Muitas tentativas em pouco tempo. Aguarde 1–2 minutos e tente de novo, ou use "Continuar com Google".'
  }
  if (/email not confirmed/i.test(message)) {
    return 'E-mail não confirmado. Confirme pelo link enviado ou desative "Confirm email" no Supabase.'
  }
  if (/invalid login credentials/i.test(message)) {
    return 'E-mail ou senha incorretos. Se você entrou com Google antes, use "Continuar com Google".'
  }
  if (/password should be at least/i.test(message)) {
    return 'A senha precisa ter pelo menos 6 caracteres.'
  }
  if (/signup is disabled/i.test(message)) {
    return 'Cadastro por e-mail está desativado no momento.'
  }
  return message
}

function assertClient() {
  if (!supabase) {
    throw new Error(
      'Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env'
    )
  }
  return supabase
}

export async function completeGoogleSignIn(idToken: string): Promise<Session> {
  const client = assertClient()
  const { data, error } = await client.auth.signInWithIdToken({
    provider: 'google',
    token: idToken,
  })

  if (error) throw new Error(formatAuthError(error.message))
  if (!data.session) throw new Error('Não foi possível iniciar a sessão.')

  return data.session
}

export async function signInWithGoogle(options?: {
  returning?: boolean
  next?: string
}): Promise<Session | void> {
  const clientId = getGoogleClientId()

  if (clientId) {
    const idToken = await openGoogleSignInPopup(clientId)
    return completeGoogleSignIn(idToken)
  }

  if (useCustomGoogleOAuth()) {
    window.location.assign(getGoogleOAuthStartUrl(options))
    return
  }

  const client = assertClient()

  const params: Record<string, string> = {}
  if (options?.returning) params.returning = '1'
  if (options?.next) params.next = options.next

  const redirectTo = getAuthCallbackUrl(Object.keys(params).length ? params : undefined)

  const { error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: { prompt: 'select_account' },
      scopes: 'email profile',
    },
  })

  if (error) throw error
}

export async function signUpWithEmail(email: string, password: string): Promise<Session | null> {
  const client = assertClient()
  const normalized = normalizeEmail(email)

  const { data, error } = await client.auth.signUp({
    email: normalized,
    password,
    options: {
      emailRedirectTo: getAuthCallbackUrl(),
    },
  })

  if (error) {
    if (isRateLimitMessage(error.message)) {
      throw new Error(formatAuthError(error.message))
    }

    if (isAlreadyRegisteredMessage(error.message)) {
      const { data: signInData, error: signInError } = await client.auth.signInWithPassword({
        email: normalized,
        password,
      })

      if (!signInError && signInData.session) {
        return signInData.session
      }

      if (signInError && isRateLimitMessage(signInError.message)) {
        throw new Error(formatAuthError(signInError.message))
      }

      throw new EmailLinkedToGoogleError()
    }

    throw new Error(formatAuthError(error.message))
  }

  if (data.session) return data.session

  if (data.user) {
    throw new EmailConfirmationRequiredError()
  }

  return null
}

export async function signInWithEmail(email: string, password: string): Promise<Session> {
  const client = assertClient()
  const normalized = normalizeEmail(email)

  const { data, error } = await client.auth.signInWithPassword({
    email: normalized,
    password,
  })

  if (error) {
    throw new Error(formatAuthError(error.message))
  }

  if (!data.session) {
    throw new Error('Não foi possível iniciar a sessão.')
  }

  return data.session
}

export function applySessionToStore(session: Session) {
  const meta = session.user.user_metadata as Record<string, string | undefined>
  const identityData = session.user.identities?.[0]?.identity_data as
    | Record<string, string | undefined>
    | undefined

  const displayName =
    meta.full_name ||
    meta.name ||
    session.user.email?.split('@')[0] ||
    ''

  const avatarUrl =
    meta.avatar_url ||
    meta.picture ||
    identityData?.avatar_url ||
    identityData?.picture ||
    null

  useAppStore.getState().setUserProfile({
    name: displayName || undefined,
    email: session.user.email ?? undefined,
    avatarUrl: avatarUrl || null,
  })
}

export async function signOut() {
  if (supabase) {
    await supabase.auth.signOut()
  }
  useAppStore.getState().clearUserProfile()
}

export function navigateAfterAuth(navigate: NavigateFunction, options?: { returning?: boolean }) {
  const { onboardingComplete } = useAppStore.getState()

  if (options?.returning || onboardingComplete) {
    navigate('/app', { replace: true })
  } else {
    navigate('/onboarding/nome', { replace: true })
  }
}

export async function getCurrentSession() {
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  return data.session
}

export function assertSupabaseReady() {
  if (!isSupabaseConfigured()) {
    throw new Error('Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY')
  }
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email))
}
