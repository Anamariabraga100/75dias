import type { ChallengeId } from '../store/useAppStore'
import { TOTAL_PROGRAM_DAYS } from './demoProgress'

export const TIER_ORDER: ChallengeId[] = ['iniciante', 'intermediario', 'implacavel']

export type TierTheme = 'green' | 'amber' | 'fire'

export interface TierInfo {
  id: ChallengeId
  emoji: string
  label: string
  unlockDay: number
  badge: string
  theme: TierTheme
  unlockHint: string
  features: string[]
}

export const TIER_INFO: Record<ChallengeId, TierInfo> = {
  iniciante: {
    id: 'iniciante',
    emoji: '🌱',
    label: 'Desafiante',
    unlockDay: 1,
    badge: '🌱 Desafiante',
    theme: 'green',
    unlockHint: 'Disponível desde o Dia 1',
    features: ['4 missões diárias', 'Dashboard básico', 'Foco em consistência'],
  },
  intermediario: {
    id: 'intermediario',
    emoji: '💪',
    label: 'Dominante',
    unlockDay: 30,
    badge: '💪 Dominante',
    theme: 'amber',
    unlockHint: 'Desbloqueia ao completar 30 dias do desafio',
    features: ['Estatísticas detalhadas', 'Novos hábitos', 'Conquistas especiais'],
  },
  implacavel: {
    id: 'implacavel',
    emoji: '🔥',
    label: 'Implacável',
    unlockDay: 60,
    badge: '🔥 Implacável',
    theme: 'fire',
    unlockHint: 'Desbloqueia ao completar 60 dias do desafio',
    features: ['Missões extras', 'Fotos de evolução', 'Conquistas Elite', 'Tema exclusivo'],
  },
}

export function isTierUnlocked(tier: ChallengeId, completedDays: number): boolean {
  if (tier === 'iniciante') return true
  return completedDays >= TIER_INFO[tier].unlockDay
}

export function getUnlockedTiers(completedDays: number): ChallengeId[] {
  return TIER_ORDER.filter((tier) => isTierUnlocked(tier, completedDays))
}

export function getNextTier(current: ChallengeId | null): ChallengeId | null {
  if (!current) return 'iniciante'
  const index = TIER_ORDER.indexOf(current)
  if (index < 0 || index >= TIER_ORDER.length - 1) return null
  return TIER_ORDER[index + 1]
}

export function getLevelProgress(displayDay: number, challengeId: ChallengeId | null) {
  const nextTier = getNextTier(challengeId)

  if (!nextTier) {
    return {
      currentDay: displayDay,
      targetDay: TOTAL_PROGRAM_DAYS,
      nextEmoji: '🏆',
      nextLabel: 'Reset completo',
      daysLeft: Math.max(0, TOTAL_PROGRAM_DAYS - displayDay),
      pct: Math.min(100, Math.round((displayDay / TOTAL_PROGRAM_DAYS) * 100)),
    }
  }

  const next = TIER_INFO[nextTier]
  const targetDay = next.unlockDay
  const pct = Math.min(100, Math.round((displayDay / targetDay) * 100))

  return {
    currentDay: displayDay,
    targetDay,
    nextEmoji: next.emoji,
    nextLabel: next.label,
    daysLeft: Math.max(0, targetDay - displayDay),
    pct,
  }
}

export function getPendingUnlockModal(
  programDay: number,
  allDone: boolean,
  seenKeys: string[]
): '30' | '60' | '90' | null {
  if (!allDone) return null
  if (programDay === 30 && !seenKeys.includes('unlock-30')) return '30'
  if (programDay === 60 && !seenKeys.includes('unlock-60')) return '60'
  if (programDay === 90 && !seenKeys.includes('unlock-90')) return '90'
  return null
}

export const THEME_BAR: Record<TierTheme, string> = {
  green: 'from-accent-green via-emerald-400 to-teal-400',
  amber: 'from-amber-400 via-orange-400 to-yellow-400',
  fire: 'from-orange-500 via-red-500 to-amber-500',
}
