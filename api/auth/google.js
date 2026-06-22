const { encodeOAuthState, getAppUrl, getGoogleRedirectUri, requireEnv } = require('../_lib/env')

module.exports = function handler(req, res) {
  try {
    const appUrl = getAppUrl(req)
    const clientId = requireEnv('GOOGLE_CLIENT_ID')

    if (!appUrl) {
      res.status(500).json({ error: 'Configure APP_URL ou VITE_APP_URL na Vercel.' })
      return
    }

    const redirectUri = getGoogleRedirectUri(req)

    const state = encodeOAuthState({
      returning: typeof req.query.returning === 'string' ? req.query.returning : '',
      next: typeof req.query.next === 'string' ? req.query.next : '',
    })

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'select_account',
      state,
    })

    res.redirect(302, `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'OAuth não configurado'
    res.status(500).json({ error: message })
  }
}
