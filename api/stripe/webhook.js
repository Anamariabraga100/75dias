const { requireEnv } = require('../_lib/env')
const { getStripe } = require('../_lib/stripe')
const { getSupabaseAdmin } = require('../_lib/supabase-admin')
const {
  activateSubscription,
  setSubscriptionStatus,
  setSubscriptionStatusByCustomer,
  recordPayment,
  recordFailedPayment,
  markPaymentRefunded,
  markPaymentDisputed,
  parseMetadata,
  fulfillCheckoutSession,
} = require('../_lib/stripe-billing')
const { claimStripeEvent, findUserIdByCustomer } = require('../_lib/stripe-events')

async function readRawBody(req) {
  if (Buffer.isBuffer(req.body)) return req.body
  if (typeof req.body === 'string') return Buffer.from(req.body)
  const chunks = []
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
}

async function resolveSubscriptionContext(subscription) {
  const admin = getSupabaseAdmin()
  const subscriptionId = subscription.id
  const customerId =
    typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id

  let { userId, plan, usePromo } = parseMetadata(subscription.metadata)

  if (!userId && customerId) {
    userId = await findUserIdByCustomer(admin, customerId)
  }

  return { admin, subscriptionId, customerId, userId, plan, usePromo }
}

async function handleCheckoutCompleted(session, event) {
  const admin = getSupabaseAdmin()
  const result = await fulfillCheckoutSession(admin, session, {
    eventType: event.type,
    stripeEventId: event.id,
  })
  if (!result.ok) {
    console.error('[stripe/webhook] checkout.session.completed', result.error)
  }
}

async function handleInvoicePaid(invoice, event) {
  const subscriptionId =
    typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id
  if (!subscriptionId) return

  const stripe = getStripe()
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const { userId, plan, usePromo } = parseMetadata(subscription.metadata)
  if (!userId) return

  const admin = getSupabaseAdmin()
  await activateSubscription(admin, {
    userId,
    customerId:
      typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id,
    subscriptionId,
    plan,
    usePromo,
  })

  await recordPayment(admin, {
    userId,
    plan,
    usePromo,
    amount: invoice.amount_paid ? invoice.amount_paid / 100 : undefined,
    sessionId: null,
    invoiceId: invoice.id,
    chargeId: typeof invoice.charge === 'string' ? invoice.charge : invoice.charge?.id,
    method: 'card',
    eventType: event.type,
    stripeEventId: event.id,
  })
}

async function handleInvoicePaymentFailed(invoice, event) {
  const subscriptionId =
    typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id
  if (!subscriptionId) return

  const admin = getSupabaseAdmin()
  await setSubscriptionStatus(admin, subscriptionId, 'past_due', false)

  const stripe = getStripe()
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const { userId, plan, usePromo } = parseMetadata(subscription.metadata)

  if (userId) {
    await recordFailedPayment(admin, {
      userId,
      plan,
      usePromo,
      amount: invoice.amount_due ? invoice.amount_due / 100 : undefined,
      invoiceId: invoice.id,
      eventType: event.type,
      stripeEventId: event.id,
    })
  }
}

async function handleSubscriptionCreated(subscription, event) {
  const { admin, subscriptionId, customerId, userId, plan, usePromo } =
    await resolveSubscriptionContext(subscription)

  if (userId) {
    await activateSubscription(admin, {
      userId,
      customerId,
      subscriptionId,
      plan,
      usePromo,
    })
  }
}

async function handleSubscriptionUpdated(subscription, event) {
  const { admin, subscriptionId } = await resolveSubscriptionContext(subscription)
  const status = subscription.status

  if (subscription.pause_collection) {
    await setSubscriptionStatus(admin, subscriptionId, 'paused', false)
    return
  }

  if (status === 'active' || status === 'trialing') {
    await setSubscriptionStatus(admin, subscriptionId, 'active', true)
    return
  }

  if (status === 'past_due' || status === 'unpaid') {
    await setSubscriptionStatus(admin, subscriptionId, 'past_due', false)
    return
  }

  if (status === 'canceled' || status === 'incomplete_expired') {
    await setSubscriptionStatus(admin, subscriptionId, 'canceled', false)
  }
}

async function handleSubscriptionDeleted(subscription) {
  await setSubscriptionStatus(getSupabaseAdmin(), subscription.id, 'canceled', false)
}

async function handleSubscriptionPaused(subscription) {
  await setSubscriptionStatus(getSupabaseAdmin(), subscription.id, 'paused', false)
}

async function handleSubscriptionResumed(subscription) {
  const { admin, subscriptionId } = await resolveSubscriptionContext(subscription)
  await setSubscriptionStatus(admin, subscriptionId, 'active', true)
}

async function handleChargeRefunded(charge, event) {
  const admin = getSupabaseAdmin()
  const chargeId = charge.id
  const refunded = charge.amount_refunded ? charge.amount_refunded / 100 : undefined

  await markPaymentRefunded(admin, chargeId, refunded)

  const customerId =
    typeof charge.customer === 'string' ? charge.customer : charge.customer?.id
  if (customerId) {
    const fullRefund = charge.refunded === true
    if (fullRefund) {
      await setSubscriptionStatusByCustomer(admin, customerId, 'canceled', false)
    }
  }
}

async function handleDisputeCreated(dispute) {
  const chargeId = typeof dispute.charge === 'string' ? dispute.charge : dispute.charge?.id
  await markPaymentDisputed(getSupabaseAdmin(), chargeId, true)
}

async function handleDisputeClosed(dispute) {
  const chargeId = typeof dispute.charge === 'string' ? dispute.charge : dispute.charge?.id
  const won = dispute.status === 'won'
  await markPaymentDisputed(getSupabaseAdmin(), chargeId, !won)
}

async function processStripeEvent(event) {
  const admin = getSupabaseAdmin()

  try {
    const claim = await claimStripeEvent(admin, event)
    if (!claim.claimed) return { duplicate: true }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'event_log_failed'
    console.warn('[stripe/webhook] stripe_events log skipped:', message)
  }

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object, event)
      break
    case 'invoice.paid':
      await handleInvoicePaid(event.data.object, event)
      break
    case 'invoice.payment_failed':
      await handleInvoicePaymentFailed(event.data.object, event)
      break
    case 'customer.subscription.created':
      await handleSubscriptionCreated(event.data.object, event)
      break
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object, event)
      break
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object)
      break
    case 'customer.subscription.paused':
      await handleSubscriptionPaused(event.data.object)
      break
    case 'customer.subscription.resumed':
      await handleSubscriptionResumed(event.data.object)
      break
    case 'charge.refunded':
      await handleChargeRefunded(event.data.object, event)
      break
    case 'charge.dispute.created':
      await handleDisputeCreated(event.data.object)
      break
    case 'charge.dispute.closed':
      await handleDisputeClosed(event.data.object)
      break
    default:
      break
  }

  return { duplicate: false }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).send('Method not allowed')
    return
  }

  const stripe = getStripe()
  const sig = req.headers['stripe-signature']

  if (!sig) {
    res.status(400).send('Missing stripe-signature')
    return
  }

  let event
  try {
    const rawBody = await readRawBody(req)
    event = stripe.webhooks.constructEvent(rawBody, sig, requireEnv('STRIPE_WEBHOOK_SECRET'))
  } catch (e) {
    const message = e instanceof Error ? e.message : 'invalid_signature'
    console.error('[stripe/webhook] signature error:', message)
    res.status(400).send(`Webhook Error: ${message}`)
    return
  }

  try {
    const result = await processStripeEvent(event)
    res.status(200).json({ received: true, duplicate: result.duplicate === true })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'webhook_handler_failed'
    console.error('[stripe/webhook]', event.type, message)
    res.status(500).send(message)
  }
}
