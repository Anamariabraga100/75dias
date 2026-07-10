const { createClient } = require('@supabase/supabase-js')
const { getSupabaseUrl, getSupabaseAnonKey } = require('../_lib/env')
const { isR2Configured, uploadMirrorPhoto } = require('../_lib/r2')

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

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  if (!isR2Configured()) {
    res.status(503).json({ error: 'Armazenamento de fotos não configurado.' })
    return
  }

  try {
    const auth = await authenticateUser(req)
    if (auth.error) {
      res.status(auth.status).json({ error: auth.error })
      return
    }

    const body = await readJsonBody(req)
    const day = Number(body.day)
    const imageBase64 = typeof body.imageBase64 === 'string' ? body.imageBase64 : ''

    if (!Number.isFinite(day) || day < 1 || day > 90) {
      res.status(400).json({ error: 'Dia inválido.' })
      return
    }

    const match = imageBase64.match(/^data:(image\/[a-z+]+);base64,(.+)$/i)
    const base64Data = match ? match[2] : imageBase64
    const contentType = match ? match[1] : 'image/jpeg'

    if (!base64Data) {
      res.status(400).json({ error: 'Imagem inválida.' })
      return
    }

    const buffer = Buffer.from(base64Data, 'base64')
    if (buffer.length > 5 * 1024 * 1024) {
      res.status(400).json({ error: 'Imagem muito grande.' })
      return
    }

    const url = await uploadMirrorPhoto({
      userId: auth.user.id,
      day,
      buffer,
      contentType,
    })

    res.status(200).json({ url })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'upload_failed'
    console.error('[photos/upload]', message)
    res.status(500).json({ error: message })
  }
}
