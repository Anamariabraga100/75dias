const { verifyAdminRequest } = require('../_lib/admin-auth')
const { fetchUserPhotos } = require('../_lib/admin-data')

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  if (!verifyAdminRequest(req)) {
    res.status(401).json({ error: 'Senha admin inválida' })
    return
  }

  const userId = req.query.user_id
  if (!userId || typeof userId !== 'string') {
    res.status(400).json({ error: 'user_id obrigatório' })
    return
  }

  try {
    const data = await fetchUserPhotos(userId)
    res.status(200).json(data)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'admin_photos_failed'
    res.status(500).json({ error: message })
  }
}
