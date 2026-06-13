export const PHOTO_INTERVAL_DAYS = 3

/** Dias em que a foto é obrigatória: 1, 4, 7, 10… */
export function isPhotoDay(day: number): boolean {
  return day >= 1 && (day - 1) % PHOTO_INTERVAL_DAYS === 0
}

export function daysUntilNextPhoto(currentDay: number): number {
  if (isPhotoDay(currentDay)) return 0
  return PHOTO_INTERVAL_DAYS - ((currentDay - 1) % PHOTO_INTERVAL_DAYS)
}

export function getPhotoDaysUpTo(maxDay: number): number[] {
  const days: number[] = []
  for (let d = 1; d <= maxDay; d += PHOTO_INTERVAL_DAYS) {
    days.push(d)
  }
  return days
}

export function getWeeklyComparisons(maxDay: number): { from: number; to: number; week: number }[] {
  const pairs: { from: number; to: number; week: number }[] = []
  for (let week = 1, from = 1; from <= 90; week++, from += 7) {
    const to = Math.min(from + 6, 90)
    pairs.push({ from, to, week })
    if (to >= maxDay && maxDay < 90) break
  }
  return pairs
}

/** Índice da comparação ativa (primeira ainda não concluída). */
export function getActiveComparisonIndex(
  slots: readonly { to: number }[],
  day: number
): number {
  for (let i = 0; i < slots.length; i++) {
    if (day < slots[i].to) return i
  }
  return slots.length - 1
}

/** Todas as janelas semanais do Reset90 (para linha do tempo). */
export function getAllWeeklySlots() {
  const slots: { from: number; to: number; week: number }[] = []
  for (let week = 1, from = 1; from <= 90; week++, from += 7) {
    slots.push({ from, to: Math.min(from + 6, 90), week })
  }
  return slots
}

export const MONTHLY_COMPARISONS = [
  { from: 1, to: 30, label: 'Mês 1 — início vs dia 30' },
  { from: 30, to: 60, label: 'Mês 2 — dia 30 vs dia 60' },
  { from: 60, to: 90, label: 'Mês 3 — dia 60 vs transformação' },
] as const
