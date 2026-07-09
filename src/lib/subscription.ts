export type SubscriptionStatus = 'inactive' | 'active' | 'canceled' | 'past_due'

export function hasActiveAccess(
  subscriptionStatus: SubscriptionStatus | null | undefined,
  paymentComplete: boolean
): boolean {
  if (subscriptionStatus === 'active') return true
  return paymentComplete
}

export function parseSubscriptionStatus(value: string | null | undefined): SubscriptionStatus | null {
  if (value === 'active' || value === 'canceled' || value === 'past_due' || value === 'inactive') {
    return value
  }
  return null
}
