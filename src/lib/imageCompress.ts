export interface CompressOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  mimeType?: string
}

export async function compressImageFile(
  file: File,
  options: CompressOptions = {}
): Promise<string> {
  const {
    maxWidth = 1200,
    maxHeight = 1600,
    quality = 0.82,
    mimeType = 'image/jpeg',
  } = options

  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxWidth / bitmap.width, maxHeight / bitmap.height)
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Não foi possível processar a imagem.')

  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error('Falha ao comprimir imagem.'))),
      mimeType,
      quality
    )
  })

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Falha ao ler imagem.'))
    reader.readAsDataURL(blob)
  })
}
