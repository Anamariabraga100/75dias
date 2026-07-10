const { createClient } = require('@supabase/supabase-js')
const { getSupabaseUrl, getSupabaseAnonKey } = require('../_lib/env')
const { getStripe } = require('../_lib/stripe')
const { getSupabaseAdmin } = require('../_lib/supabase-admin')
const { fulfillCheckoutSession } = require('../_lib/stripe-billing')

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

  return { user: data.user }
}

/** Confirma pagamento na volta do Stripe — fallback se o webhook atrasar ou falhar. */
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

    const body = await readJsonBody(req)
    const sessionId = typeof body.sessionId === 'string' ? body.sessionId.trim() : ''
    if (!sessionId.startsWith('cs_')) {
      res.status(400).json({ error: 'sessionId inválido' })
      return
    }

    const stripe = getStripe()
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.metadata?.userId && session.metadata.userId !== auth.user.id) {
      res.status(403).json({ error: 'Esta sessão não pertence à sua conta.' })
      return
    }

    const admin = getSupabaseAdmin()
    const result = await fulfillCheckoutSession(admin, session, {
      eventType: 'checkout.session.completed',
      stripeEventId: `verify_${sessionId}`,
    })

    if (!result.ok) {
      res.status(200).json({
        active: false,
        error: result.error,
        payment_status: result.payment_status ?? session.payment_status,
      })
      return
    }

    res.status(200).json({ active: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'verify_session_failed'
    console.error('[stripe/verify-session]', message)
    res.status(500).json({ error: message })
  }
}
