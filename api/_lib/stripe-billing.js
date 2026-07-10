const { resolvePlanAmount } = require('./stripe-prices')

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

async function setSubscriptionStatusByCustomer(admin, customerId, status, paymentComplete) {
  const update = {
    subscription_status: status,
    updated_at: new Date().toISOString(),
  }
  if (typeof paymentComplete === 'boolean') {
    update.payment_complete = paymentComplete
  }

  await admin.from('profiles').update(update).eq('stripe_customer_id', customerId)
}

async function recordPayment(admin, {
  userId,
  plan,
  usePromo,
  amount,
  sessionId,
  invoiceId,
  chargeId,
  method,
  status = 'completed',
  eventType,
  stripeEventId,
}) {
  const resolvedAmount = amount ?? resolvePlanAmount(plan, usePromo)

  if (invoiceId) {
    const { data: existing } = await admin
      .from('payments')
      .select('id')
      .eq('stripe_invoice_id', invoiceId)
      .maybeSingle()
    if (existing) return
  } else if (sessionId) {
    const { data: existing } = await admin
      .from('payments')
      .select('id')
      .eq('stripe_session_id', sessionId)
      .maybeSingle()
    if (existing) return
  }

  await admin.from('payments').insert({
    user_id: userId,
    amount: resolvedAmount,
    plan_type: plan,
    method: method || 'card',
    status,
    use_promo: usePromo,
    stripe_session_id: sessionId || null,
    stripe_invoice_id: invoiceId || null,
    stripe_charge_id: chargeId || null,
    event_type: eventType || null,
    stripe_event_id: stripeEventId || null,
  })
}

async function recordFailedPayment(admin, {
  userId,
  plan,
  usePromo,
  amount,
  invoiceId,
  eventType,
  stripeEventId,
}) {
  if (invoiceId) {
    const { data: existing } = await admin
      .from('payments')
      .select('id')
      .eq('stripe_invoice_id', invoiceId)
      .eq('status', 'failed')
      .maybeSingle()
    if (existing) return
  }

  await admin.from('payments').insert({
    user_id: userId,
    amount: amount ?? resolvePlanAmount(plan, usePromo),
    plan_type: plan || 'monthly',
    method: 'card',
    status: 'failed',
    use_promo: usePromo ?? false,
    stripe_invoice_id: invoiceId || null,
    event_type: eventType || 'invoice.payment_failed',
    stripe_event_id: stripeEventId || null,
  })
}

async function markPaymentRefunded(admin, chargeId, amount) {
  if (!chargeId) return

  const { data: payment } = await admin
    .from('payments')
    .select('id, amount')
    .eq('stripe_charge_id', chargeId)
    .maybeSingle()

  if (payment) {
    await admin
      .from('payments')
      .update({
        status: 'refunded',
        amount: Math.max(0, Number(payment.amount) - (amount ?? Number(payment.amount))),
      })
      .eq('id', payment.id)
    return
  }

  await admin
    .from('payments')
    .update({ status: 'refunded' })
    .eq('stripe_charge_id', chargeId)
}

async function markPaymentDisputed(admin, chargeId, disputed = true) {
  if (!chargeId) return
  await admin
    .from('payments')
    .update({ status: disputed ? 'disputed' : 'completed' })
    .eq('stripe_charge_id', chargeId)
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
  setSubscriptionStatusByCustomer,
  recordPayment,
  recordFailedPayment,
  markPaymentRefunded,
  markPaymentDisputed,
  parseMetadata,
}
