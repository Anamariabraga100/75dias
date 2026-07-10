const { verifyAdminRequest } = require('../_lib/admin-auth')
const { fetchAllUsers } = require('../_lib/admin-data')

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
    const rows = await fetchAllUsers()
    res.status(200).json(rows)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'admin_users_failed'
    res.status(500).json({ error: message })
  }
}
