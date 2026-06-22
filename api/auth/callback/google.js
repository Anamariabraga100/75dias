const { createClient } = require('@supabase/supabase-js')
const {
  decodeOAuthState,
  getAppUrl,
  getGoogleRedirectUri,
  requireEnv,
} = require('../../_lib/env')

module.exports = async function handler(req, res) {
  const appUrl = getAppUrl(req)
  if (!appUrl) {
    res.status(500).send('Configure APP_URL na Vercel.')
    return
  }

  const oauthError = typeof req.query.error === 'string' ? req.query.error : null
  if (oauthError) {
    res.redirect(302, `${appUrl}/?auth_error=${encodeURIComponent(oauthError)}`)
    return
  }

  const code = typeof req.query.code === 'string' ? req.query.code : null
  if (!code) {
    res.status(400).send('Código OAuth ausente.')
    return
  }

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: requireEnv('GOOGLE_CLIENT_ID'),
        client_secret: requireEnv('GOOGLE_CLIENT_SECRET'),
        redirect_uri: getGoogleRedirectUri(req),
        grant_type: 'authorization_code',
      }),
    })

    const tokens = await tokenRes.json()

    if (!tokenRes.ok || !tokens.id_token) {
      const detail = tokens.error_description || tokens.error || 'token_exchange_failed'
      res.redirect(302, `${appUrl}/?auth_error=${encodeURIComponent(detail)}`)
      return
    }

    const supabase = createClient(requireEnv('SUPABASE_URL'), requireEnv('SUPABASE_ANON_KEY'))

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: tokens.id_token,
    })

    if (error || !data.session) {
      res.redirect(302, `${appUrl}/?auth_error=${encodeURIComponent(error?.message || 'session')}`)
      return
    }

    const state = decodeOAuthState(typeof req.query.state === 'string' ? req.query.state : undefined)
    const query = new URLSearchParams()
    if (state.returning === '1') query.set('returning', '1')
    if (state.next) query.set('next', state.next)
    const qs = query.toString()

    const hash = new URLSearchParams({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: String(data.session.expires_in ?? 3600),
      token_type: data.session.token_type ?? 'bearer',
    })

    res.redirect(302, `${appUrl}/auth/callback${qs ? `?${qs}` : ''}#${hash.toString()}`)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'oauth_failed'
    res.redirect(302, `${appUrl}/?auth_error=${encodeURIComponent(message)}`)
  }
}
