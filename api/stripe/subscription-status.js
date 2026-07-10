const { createClient } = require('@supabase/supabase-js')
const { getAppUrl, getSupabaseUrl, getSupabaseAnonKey } = require('../_lib/env')
const { getStripe } = require('../_lib/stripe')
const { getSupabaseAdmin } = require('../_lib/supabase-admin')
const { syncSubscriptionDetails } = require('../_lib/stripe-billing')

async function authenticateUser(req) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return { error: 'Não autenticado', status: 401 }

  const supabase = createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) {
    return { error: 'Sessão inválida', status: 401 }
  }

  return { user: data.user }
}

function toPayload(profile) {
  return {
    selectedPlan: profile.selected_plan === 'monthly' ? 'monthly' : 'quarterly',
    usePromoOffer: Boolean(profile.use_promo_offer),
    subscriptionStatus: profile.subscription_status || 'inactive',
    paymentComplete: Boolean(profile.payment_complete),
    periodEnd: profile.subscription_period_end || null,
    cancelAtPeriodEnd: Boolean(profile.subscription_cancel_at_period_end),
  }
}

/** Atualiza período da assinatura a partir do Stripe e devolve status ao app. */
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const auth = await authenticateUser(req)
    if (auth.error) {
      res.status(auth.status).json({ error: auth.error })
      return
    }

    const admin = getSupabaseAdmin()
    const { data: profile, error } = await admin
      .from('profiles')
      .select(
        'selected_plan, use_promo_offer, subscription_status, payment_complete, subscription_period_end, subscription_cancel_at_period_end, stripe_subscription_id, stripe_customer_id'
      )
      .eq('user_id', auth.user.id)
      .maybeSingle()

    if (error) throw error
    if (!profile) {
      res.status(404).json({ error: 'Perfil não encontrado' })
      return
    }

    if (profile.stripe_subscription_id) {
      const stripe = getStripe()
      const subscription = await stripe.subscriptions.retrieve(profile.stripe_subscription_id)
      await syncSubscriptionDetails(admin, subscription, auth.user.id)

      const { data: refreshed } = await admin
        .from('profiles')
        .select(
          'selected_plan, use_promo_offer, subscription_status, payment_complete, subscription_period_end, subscription_cancel_at_period_end'
        )
        .eq('user_id', auth.user.id)
        .maybeSingle()

      res.status(200).json(toPayload(refreshed || profile))
      return
    }

    res.status(200).json(toPayload(profile))
  } catch (e) {
    const message = e instanceof Error ? e.message : 'subscription_status_failed'
    console.error('[stripe/subscription-status]', message)
    res.status(500).json({ error: message })
  }
}

module.exports.createBillingPortalSession = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const appUrl = getAppUrl(req)
  if (!appUrl) {
    res.status(500).json({ error: 'Configure APP_URL na Vercel.' })
    return
  }

  try {
    const auth = await authenticateUser(req)
    if (auth.error) {
      res.status(auth.status).json({ error: auth.error })
      return
    }

    const admin = getSupabaseAdmin()
    const { data: profile } = await admin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('user_id', auth.user.id)
      .maybeSingle()

    if (!profile?.stripe_customer_id) {
      res.status(400).json({ error: 'Nenhuma assinatura vinculada a esta conta.' })
      return
    }

    const stripe = getStripe()
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${appUrl}/app`,
    })

    res.status(200).json({ url: session.url })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'billing_portal_failed'
    console.error('[stripe/billing-portal]', message)
    res.status(500).json({ error: message })
  }
}
