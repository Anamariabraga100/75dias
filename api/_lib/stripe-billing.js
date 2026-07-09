const { getSupabaseAdmin } = require('../_lib/supabase-admin')
const { resolvePlanAmount } = require('../_lib/stripe-prices')

async function activateSubscription(admin, {
  userId,
  customerId,
  subscriptionId,
  plan,
  usePromo,
}) {
  await admin.from('profiles').update({
    payment_complete: true,
    subscription_status: 'active',
    stripe_customer_id: customerId || null,
    stripe_subscription_id: subscriptionId || null,
    selected_plan: plan,
    use_promo_offer: usePromo,
    updated_at: new Date().toISOString(),
  }).eq('user_id', userId)
}

async function setSubscriptionStatus(admin, subscriptionId, status, paymentComplete) {
  const update = {
    subscription_status: status,
    updated_at: new Date().toISOString(),
  }
  if (typeof paymentComplete === 'boolean') {
    update.payment_complete = paymentComplete
  }

  await admin.from('profiles').update(update).eq('stripe_subscription_id', subscriptionId)
}

async function recordPayment(admin, {
  userId,
  plan,
  usePromo,
  amount,
  sessionId,
  invoiceId,
  method,
}) {
  const resolvedAmount = amount ?? resolvePlanAmount(plan, usePromo)

  const { data: existing } = await admin
    .from('payments')
    .select('id')
    .eq('stripe_invoice_id', invoiceId)
    .maybeSingle()

  if (existing) return

  await admin.from('payments').insert({
    user_id: userId,
    amount: resolvedAmount,
    plan_type: plan,
    method: method || 'card',
    status: 'completed',
    use_promo: usePromo,
    stripe_session_id: sessionId || null,
    stripe_invoice_id: invoiceId || null,
  })
}

function parseMetadata(metadata) {
  const userId = metadata?.userId
  const plan = metadata?.plan === 'monthly' ? 'monthly' : 'quarterly'
  const usePromo = metadata?.usePromo === 'true'
  return { userId, plan, usePromo }
}

module.exports = {
  activateSubscription,
  setSubscriptionStatus,
  recordPayment,
  parseMetadata,
}
