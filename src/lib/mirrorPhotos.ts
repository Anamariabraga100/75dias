/** Fotos de demonstração para simular registros no espelho */
export const DEMO_MIRROR_PHOTOS = [
  '/gallery/train-1.jpg',
  '/gallery/train-2.jpg',
  '/gallery/train-3.jpg',
  '/gallery/train-4.jpg',
  '/gallery/train-5.jpg',
  '/gallery/train-6.jpg',
]

export function demoPhotoForSlot(slotIndex: number): string {
  return DEMO_MIRROR_PHOTOS[slotIndex % DEMO_MIRROR_PHOTOS.length]
}
