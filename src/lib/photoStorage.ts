import { compressImageFile } from './imageCompress'

/** Salva foto localmente (data URL). Futuro: upload S3 e retorna URL pública. */
export async function storeMirrorPhoto(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Selecione um arquivo de imagem.')
  }

  if (file.size > 15 * 1024 * 1024) {
    throw new Error('Imagem muito grande. Use uma foto de até 15 MB.')
  }

  return compressImageFile(file)
}

/** Reservado para integração com bucket S3 (credenciais virão depois). */
export async function uploadMirrorPhotoToCloud(_file: File, _day: number): Promise<string> {
  throw new Error('Upload na nuvem ainda não configurado.')
}
