function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || process.env.VITE_ADMIN_PASSWORD || ''
}

function verifyAdminRequest(req) {
  const expected = getAdminPassword()
  if (!expected) return false

  const header = req.headers['x-admin-password']
  const provided = Array.isArray(header) ? header[0] : header
  return provided === expected
}

module.exports = { getAdminPassword, verifyAdminRequest }
