module.exports = function handler(_req, res) {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim()
  if (!clientId) {
    res.status(404).json({ error: 'GOOGLE_CLIENT_ID não configurado' })
    return
  }
  res.setHeader('Cache-Control', 'public, max-age=300')
  res.json({ clientId })
}
