import { useAppStore } from '../store/useAppStore'
import { ensureAuthSession } from './auth'
import { supabase } from './supabase'
import type { SubscriptionStatus } from './subscription'
import { parseSubscriptionStatus } from './subscription'
import type { PlanType } from '../store/useAppStore'

type SubscriptionStatusPayload = {
  selectedPlan: PlanType
  usePromoOffer: boolean
  subscriptionStatus: string
  paymentComplete: boolean
  periodEnd: string | null
  cancelAtPeriodEnd: boolean
}

function applySubscriptionPayload(payload: SubscriptionStatusPayload) {
  useAppStore.setState({
    selectedPlan: payload.selectedPlan,
    usePromoOffer: payload.usePromoOffer,
    subscriptionStatus: parseSubscriptionStatus(payload.subscriptionStatus),
    paymentComplete: payload.paymentComplete,
    subscriptionPeriodEnd: payload.periodEnd,
    subscriptionCancelAtPeriodEnd: payload.cancelAtPeriodEnd,
  })
}

export async function refreshSubscriptionStatus(): Promise<void> {
  if (!supabase) return

  try {
    const session = await ensureAuthSession()
    const res = await fetch('/api/stripe/subscription-status', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    })

    if (!res.ok) return

    const payload = (await res.json()) as SubscriptionStatusPayload
    applySubscriptionPayload(payload)
  } catch {
    // silencioso — perfil usa dados locais/cache
  }
}

export async function openBillingPortal(): Promise<void> {
  if (!supabase) throw new Error('Supabase não configurado')

  const session = await ensureAuthSession()
  const res = await fetch('/api/stripe/billing-portal', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  })

  const payload = (await res.json().catch(() => ({}))) as { url?: string; error?: string }
  if (!res.ok) {
    throw new Error(payload.error || 'Não foi possível abrir o portal de assinatura')
  }
  if (!payload.url) throw new Error('URL do portal inválida')

  window.location.href = payload.url
}

export function getSubscriptionStateFromStore() {
  const state = useAppStore.getState()
  return {
    selectedPlan: state.selectedPlan,
    usePromoOffer: state.usePromoOffer,
    subscriptionStatus: state.subscriptionStatus as SubscriptionStatus | null,
    paymentComplete: state.paymentComplete,
    periodEnd: state.subscriptionPeriodEnd,
    cancelAtPeriodEnd: state.subscriptionCancelAtPeriodEnd,
  }
}
