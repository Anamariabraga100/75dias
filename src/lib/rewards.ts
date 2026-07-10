export const DISCIPLINE_SHIELD_COST = 1000
export const MAX_DISCIPLINE_SHIELDS = 2

export const COMING_SOON_REWARDS = [
  { emoji: '🎨', label: 'Tema exclusivo', cost: 1500 },
  { emoji: '🏅', label: 'Badge raro', cost: 2000 },
  { emoji: '👤', label: 'Moldura de perfil', cost: 1000 },
  { emoji: '🎁', label: '2x XP por 24h', cost: 800 },
] as const

export function canPurchaseShield(currentShields: number, totalXp: number): boolean {
  return currentShields < MAX_DISCIPLINE_SHIELDS && totalXp >= DISCIPLINE_SHIELD_COST
}

export function canApplyShield(
  day: number,
  shieldedDays: number[],
  lastShieldUsedDay: number | null,
  shieldsAvailable: number
): boolean {
  if (shieldsAvailable <= 0) return false
  if (shieldedDays.includes(day)) return false
  if (lastShieldUsedDay !== null && lastShieldUsedDay === day - 1) return false
  return true
}
