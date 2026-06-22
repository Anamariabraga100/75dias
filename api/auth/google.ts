import type { VercelRequest, VercelResponse } from '@vercel/node'
import { encodeOAuthState, getAppUrl, getGoogleRedirectUri, requireEnv } from '../_lib/env'

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const appUrl = getAppUrl()
    const clientId = requireEnv('GOOGLE_CLIENT_ID')

    if (!appUrl) {
      res.status(500).json({ error: 'Configure APP_URL ou VITE_APP_URL na Vercel.' })
      return
    }

    const state = encodeOAuthState({
      returning: typeof req.query.returning === 'string' ? req.query.returning : '',
      next: typeof req.query.next === 'string' ? req.query.next : '',
    })

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: getGoogleRedirectUri(),
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
