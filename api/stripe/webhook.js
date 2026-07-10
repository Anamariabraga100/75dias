const { requireEnv } = require('../_lib/env')
const { getStripe } = require('../_lib/stripe')
const { getSupabaseAdmin } = require('../_lib/supabase-admin')
const {
  activateSubscription,
  setSubscriptionStatus,
  recordPayment,
  parseMetadata,
} = require('../_lib/stripe-billing')

async function readRawBody(req) {
  if (Buffer.isBuffer(req.body)) return req.body
  if (typeof req.body === 'string') return Buffer.from(req.body)
  const chunks = []
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
}

async function handleCheckoutCompleted(session) {
  const { userId, plan, usePromo } = parseMetadata(session.metadata)
  if (!userId) {
    console.error('[stripe/webhook] checkout.session.completed sem userId')
    return
  }

  const admin = getSupabaseAdmin()
  const subscriptionId =
    typeof session.subscription === 'string' ? session.subscription : session.subscription?.id
  const customerId =
    typeof session.customer === 'string' ? session.customer : session.customer?.id

  await activateSubscription(admin, {
    userId,
    customerId,
    subscriptionId,
    plan,
    usePromo,
  })

  const amountPaid = session.amount_total ? session.amount_total / 100 : undefined
  await recordPayment(admin, {
    userId,
    plan,
    usePromo,
    amount: amountPaid,
    sessionId: session.id,
    invoiceId: typeof session.invoice === 'string' ? session.invoice : session.invoice?.id,
    method: 'card',
  })
}

async function handleInvoicePaid(invoice) {
  const subscriptionId =
    typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id
  if (!subscriptionId) return

  const admin = getSupabaseAdmin()
  const stripe = getStripe()
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const { userId, plan, usePromo } = parseMetadata(subscription.metadata)

  if (!userId) return

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
    method: 'card',
  })
}

async function handleSubscriptionUpdated(subscription) {
  const subscriptionId = subscription.id
  const status = subscription.status

  if (status === 'active' || status === 'trialing') {
    await setSubscriptionStatus(getSupabaseAdmin(), subscriptionId, 'active', true)
    return
  }

  if (status === 'past_due' || status === 'unpaid') {
    await setSubscriptionStatus(getSupabaseAdmin(), subscriptionId, 'past_due', false)
    return
  }

  if (status === 'canceled' || status === 'incomplete_expired') {
    await setSubscriptionStatus(getSupabaseAdmin(), subscriptionId, 'canceled', false)
  }
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
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object)
        break
      case 'invoice.paid':
        await handleInvoicePaid(event.data.object)
        break
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object)
        break
      case 'customer.subscription.deleted':
        await setSubscriptionStatus(
          getSupabaseAdmin(),
          event.data.object.id,
          'canceled',
          false
        )
        break
      case 'invoice.payment_failed':
        if (event.data.object.subscription) {
          const subId =
            typeof event.data.object.subscription === 'string'
              ? event.data.object.subscription
              : event.data.object.subscription.id
          await setSubscriptionStatus(getSupabaseAdmin(), subId, 'past_due', false)
        }
        break
      default:
        break
    }

    res.status(200).json({ received: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'webhook_handler_failed'
    console.error('[stripe/webhook]', event.type, message)
    res.status(500).send(message)
  }
}
