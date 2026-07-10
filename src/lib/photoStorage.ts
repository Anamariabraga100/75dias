import { ensureAuthSession } from './auth'
import { compressImageFile, compressImageFileToBlob } from './imageCompress'
import { supabase } from './supabase'

/** Comprime e envia para R2 quando possível; senão salva data URL local. */
export async function storeMirrorPhoto(file: File, day: number): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Selecione um arquivo de imagem.')
  }

  if (file.size > 15 * 1024 * 1024) {
    throw new Error('Imagem muito grande. Use uma foto de até 15 MB.')
  }

  const { dataUrl } = await compressImageFileToBlob(file)

  if (!supabase) {
    return dataUrl
  }

  try {
    return await uploadMirrorPhotoToCloud(dataUrl, day)
  } catch {
    return dataUrl
  }
}

export async function uploadMirrorPhotoToCloud(dataUrl: string, day: number): Promise<string> {
  const session = await ensureAuthSession()

  const res = await fetch('/api/photos/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ day, imageBase64: dataUrl }),
  })

  const payload = (await res.json().catch(() => ({}))) as { url?: string; error?: string }

  if (!res.ok) {
    throw new Error(payload.error || 'Falha ao enviar foto.')
  }

  if (!payload.url) {
    throw new Error('URL da foto inválida.')
  }

  return payload.url
}

/** Mantido para compatibilidade — prefira storeMirrorPhoto. */
export async function storeMirrorPhotoLegacy(file: File): Promise<string> {
  return compressImageFile(file)
}
