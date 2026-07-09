import type { PlanType } from '../store/useAppStore'
import { supabase } from './supabase'

export async function startStripeCheckout(
  selectedPlan: PlanType,
  usePromoOffer: boolean
): Promise<string> {
  if (!supabase) throw new Error('Supabase não configurado')

  const { data: sessionData } = await supabase.auth.getSession()
  const session = sessionData.session
  if (!session) throw new Error('Faça login para continuar')

  const res = await fetch('/api/stripe/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ selectedPlan, usePromoOffer }),
  })

  const payload = (await res.json().catch(() => ({}))) as { url?: string; error?: string }
  if (!res.ok) {
    throw new Error(payload.error || 'Não foi possível iniciar o pagamento')
  }
  if (!payload.url) throw new Error('URL de checkout inválida')

  return payload.url
}

export async function waitForActiveSubscription(
  hydrate: () => Promise<boolean>,
  maxAttempts = 15,
  intervalMs = 2000
): Promise<boolean> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const ready = await hydrate()
    if (ready) return true
    if (attempt < maxAttempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs))
    }
  }
  return false
}
