const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')

let r2Client = null

function isR2Configured() {
  return Boolean(
    process.env.R2_ENDPOINT &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET &&
      process.env.R2_PUBLIC_URL
  )
}

function getR2Client() {
  if (!isR2Configured()) {
    throw new Error('R2 não configurado no servidor.')
  }
  if (!r2Client) {
    r2Client = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    })
  }
  return r2Client
}

function buildObjectKey(userId, day) {
  const safeUser = String(userId).replace(/[^a-zA-Z0-9-]/g, '')
  const stamp = Date.now()
  return `reset90/${safeUser}/day-${day}-${stamp}.jpg`
}

function getPublicUrl(key) {
  const base = process.env.R2_PUBLIC_URL.replace(/\/$/, '')
  return `${base}/${key}`
}

async function uploadMirrorPhoto({ userId, day, buffer, contentType = 'image/jpeg' }) {
  const client = getR2Client()
  const key = buildObjectKey(userId, day)

  await client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    })
  )

  return getPublicUrl(key)
}

module.exports = { isR2Configured, uploadMirrorPhoto }
