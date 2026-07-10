import { isDevBypassPayment } from './devMode'

export type SubscriptionStatus = 'inactive' | 'active' | 'canceled' | 'past_due' | 'paused'

export function hasActiveAccess(
  subscriptionStatus: SubscriptionStatus | null | undefined,
  paymentComplete: boolean
): boolean {
  if (isDevBypassPayment()) return true
  if (subscriptionStatus === 'active') return true
  if (subscriptionStatus === 'paused' || subscriptionStatus === 'past_due' || subscriptionStatus === 'canceled') {
    return false
  }
  return paymentComplete
}

export function parseSubscriptionStatus(value: string | null | undefined): SubscriptionStatus | null {
  if (
    value === 'active' ||
    value === 'canceled' ||
    value === 'past_due' ||
    value === 'inactive' ||
    value === 'paused'
  ) {
    return value
  }
  return null
}
