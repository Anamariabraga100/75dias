import type { Session } from '@supabase/supabase-js'
import type { NavigateFunction } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { getAuthCallbackUrl, getGoogleOAuthStartUrl, useCustomGoogleOAuth } from './appUrl'
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

function assertClient() {
  if (!supabase) {
    throw new Error(
      'Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env'
    )
  }
  return supabase
}

export async function signInWithGoogle(options?: { returning?: boolean; next?: string }) {
  if (useCustomGoogleOAuth()) {
    window.location.href = getGoogleOAuthStartUrl(options)
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
    if (isAlreadyRegisteredMessage(error.message)) {
      const { error: signInError } = await client.auth.signInWithPassword({
        email: normalized,
        password,
      })

      if (!signInError) {
        throw new EmailAlreadyExistsError()
      }

      throw new EmailLinkedToGoogleError()
    }
    throw error
  }

  if (data.session) return data.session

  const { data: signInData, error: signInError } = await client.auth.signInWithPassword({
    email: normalized,
    password,
  })

  if (!signInError && signInData.session) {
    return signInData.session
  }

  if (signInError && /email not confirmed/i.test(signInError.message)) {
    throw new Error(
      'Confirme o e-mail ou desative "Confirm email" no Supabase (Authentication → Email).'
    )
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
    if (/email not confirmed/i.test(error.message)) {
      throw new Error(
        'E-mail não confirmado. No Supabase: Authentication → Providers → Email → desative "Confirm email", ou confirme o e-mail.'
      )
    }
    if (/invalid login credentials/i.test(error.message)) {
      throw new Error(
        'E-mail ou senha incorretos. Se você entrou com Google antes, use "Continuar com Google".'
      )
    }
    throw error
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
