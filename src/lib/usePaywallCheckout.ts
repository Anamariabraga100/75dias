import { useState } from 'react'
import type { PlanType } from '../store/useAppStore'
import { useAppStore } from '../store/useAppStore'
import {
  EmailConfirmationRequiredError,
  EmailLinkedToGoogleError,
  establishAuthSession,
  formatAuthError,
  isValidEmail,
  restoreAuthSession,
  signInWithEmail,
  signUpWithEmail,
} from './auth'
import { startStripeCheckout } from './stripeCheckout'

type AuthMode = 'signup' | 'login'

export function usePaywallCheckout(usePromoOffer: boolean) {
  const selectedPlan = useAppStore((s) => s.selectedPlan)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [needsAuth, setNeedsAuth] = useState(false)
  const [authMode, setAuthMode] = useState<AuthMode>('signup')
  const [email, setEmail] = useState(useAppStore.getState().email || '')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const isSignup = authMode === 'signup'
  const canSubmitAuth =
    isValidEmail(email) &&
    password.length >= 6 &&
    (!isSignup || password === confirmPassword)

  const redirectToCheckout = async (plan: PlanType, promo: boolean) => {
    const url = await startStripeCheckout(plan, promo)
    window.location.href = url
  }

  const startCheckout = async () => {
    setLoading(true)
    setError(null)
    try {
      await restoreAuthSession()
      await redirectToCheckout(selectedPlan, usePromoOffer)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Erro ao iniciar pagamento'
      if (message === 'Faça login para continuar') {
        setNeedsAuth(true)
      } else {
        setError(message)
      }
      setLoading(false)
    }
  }

  const authAndCheckout = async () => {
    if (!canSubmitAuth) return
    setLoading(true)
    setError(null)
    try {
      const session = isSignup
        ? await signUpWithEmail(email, password)
        : await signInWithEmail(email, password)
      if (!session) throw new EmailConfirmationRequiredError()
      await establishAuthSession(session)
      setNeedsAuth(false)
      await redirectToCheckout(selectedPlan, usePromoOffer)
    } catch (e) {
      if (e instanceof EmailLinkedToGoogleError || e instanceof EmailConfirmationRequiredError) {
        setError(e.message)
      } else {
        setError(e instanceof Error ? formatAuthError(e.message) : 'Erro ao autenticar.')
      }
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    needsAuth,
    authMode,
    setAuthMode,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    isSignup,
    canSubmitAuth,
    startCheckout,
    authAndCheckout,
    setError,
  }
}
