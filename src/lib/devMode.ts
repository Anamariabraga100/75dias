import { useAppStore } from '../store/useAppStore'

/** Localhost (npm run dev): pula pagamento para testar o app. */
export function isDevBypassPayment(): boolean {
  return import.meta.env.DEV || import.meta.env.VITE_DEV_BYPASS_PAYMENT === 'true'
}

/** Libera assinatura no store local (não envia ao Stripe). */
export function grantDevAccess() {
  const state = useAppStore.getState()
  const periodEnd = new Date()
  periodEnd.setDate(periodEnd.getDate() + (state.selectedPlan === 'monthly' ? 30 : 90))

  useAppStore.setState({
    paymentComplete: true,
    subscriptionStatus: 'active',
    subscriptionPeriodEnd: periodEnd.toISOString(),
    subscriptionCancelAtPeriodEnd: false,
  })
}
