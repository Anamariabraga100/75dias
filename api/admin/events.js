const { verifyAdminRequest } = require('../_lib/admin-auth')
const { fetchStripeEvents } = require('../_lib/admin-data')

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  if (!verifyAdminRequest(req)) {
    res.status(401).json({ error: 'Senha admin inválida' })
    return
  }

  try {
    const limit = Math.min(100, Math.max(10, Number(req.query?.limit) || 50))
    const rows = await fetchStripeEvents(limit)
    res.status(200).json(rows)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'admin_events_failed'
    res.status(500).json({ error: message })
  }
}
