const { createClient } = require('@supabase/supabase-js')
const { getAppUrl, getSupabaseUrl, getSupabaseAnonKey } = require('../_lib/env')
const { getStripe } = require('../_lib/stripe')
const { resolvePriceId } = require('../_lib/stripe-prices')
const { getConnectCheckoutOptions } = require('../_lib/stripe-connect')

async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    return req.body
  }
  const chunks = []
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  const raw = Buffer.concat(chunks).toString('utf8')
  return raw ? JSON.parse(raw) : {}
}

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

  return { user: data.user, token }
}

module.exports = async function handler(req, res) {
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

    const body = await readJsonBody(req)
    const selectedPlan = body.selectedPlan === 'monthly' ? 'monthly' : 'quarterly'
    const usePromoOffer = Boolean(body.usePromoOffer)

    const priceId = resolvePriceId(selectedPlan, usePromoOffer)
    const stripe = getStripe()
    const admin = require('../_lib/supabase-admin').getSupabaseAdmin()

    const { data: profile } = await admin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('user_id', auth.user.id)
      .maybeSingle()

    const connectOpts = getConnectCheckoutOptions(selectedPlan)

    const sessionParams = {
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/onboarding/pagamento/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/onboarding/planos`,
      payment_method_types: ['card'],
      metadata: {
        userId: auth.user.id,
        plan: selectedPlan,
        usePromo: usePromoOffer ? 'true' : 'false',
      },
      subscription_data: {
        metadata: {
          userId: auth.user.id,
          plan: selectedPlan,
          usePromo: usePromoOffer ? 'true' : 'false',
        },
        ...connectOpts.subscription_data,
      },
    }

    if (profile?.stripe_customer_id) {
      sessionParams.customer = profile.stripe_customer_id
    } else if (auth.user.email) {
      sessionParams.customer_email = auth.user.email
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    await admin.from('profiles').upsert(
      {
        user_id: auth.user.id,
        email: auth.user.email,
        selected_plan: selectedPlan,
        use_promo_offer: usePromoOffer,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )

    res.status(200).json({ url: session.url, sessionId: session.id })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'checkout_failed'
    console.error('[stripe/create-checkout-session]', message)
    res.status(500).json({ error: message })
  }
}
