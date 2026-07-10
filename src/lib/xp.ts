import type { ChallengeId } from '../store/useAppStore'
import { CHALLENGES } from '../store/useAppStore'
import { normalizeProgramDay } from './demoProgress'
import { isDayComplete, computeConsecutiveStreak } from './streak'

export const XP_PER_HABIT = 5
export const XP_PER_DAY = 50
export const XP_PER_STREAK_7 = 100
export const XP_PER_TIER_UNLOCK = 300
export const XP_PER_SCIENCE = 10

export function formatXp(value: number): string {
  if (value >= 10000) return `${(value / 1000).toFixed(1)}k`
  return value.toLocaleString('pt-BR')
}

export function tryAwardXp(
  totalXp: number,
  xpAwardedKeys: string[],
  key: string,
  amount: number
): { totalXp: number; xpAwardedKeys: string[]; awarded: number } {
  if (xpAwardedKeys.includes(key)) {
    return { totalXp, xpAwardedKeys, awarded: 0 }
  }
  return {
    totalXp: totalXp + amount,
    xpAwardedKeys: [...xpAwardedKeys, key],
    awarded: amount,
  }
}

type XpStateSlice = {
  challengeAccepted: boolean
  challengeId: ChallengeId | null
  currentDay: number
  taskChecksByDay: Record<number, Record<string, boolean>>
  mirrorPhotos: Record<number, string>
  shieldedDays: number[]
  totalXp: number
  xpAwardedKeys: string[]
  readScienceCardIds: string[]
}

export function reconcileXpFromProgress(state: XpStateSlice): {
  totalXp: number
  xpAwardedKeys: string[]
} {
  if (!state.challengeAccepted || !state.challengeId) {
    return { totalXp: state.totalXp, xpAwardedKeys: state.xpAwardedKeys }
  }

  let totalXp = state.totalXp
  let xpAwardedKeys = [...state.xpAwardedKeys]
  const challengeId = state.challengeId
  const displayDay = normalizeProgramDay(state.currentDay)

  for (let day = 1; day <= displayDay; day++) {
    const checks = state.taskChecksByDay[day] ?? {}
    for (const task of CHALLENGES[challengeId].tasks) {
      if (task.type !== 'check' || !checks[task.id]) continue
      const result = tryAwardXp(totalXp, xpAwardedKeys, `habit-${day}-${task.id}`, XP_PER_HABIT)
      totalXp = result.totalXp
      xpAwardedKeys = result.xpAwardedKeys
    }

    if (
      isDayComplete(
        challengeId,
        day,
        state.taskChecksByDay,
        state.mirrorPhotos,
        state.shieldedDays
      )
    ) {
      const dayResult = tryAwardXp(totalXp, xpAwardedKeys, `day-${day}`, XP_PER_DAY)
      totalXp = dayResult.totalXp
      xpAwardedKeys = dayResult.xpAwardedKeys

      const streak = computeConsecutiveStreak(
        challengeId,
        day,
        state.taskChecksByDay,
        state.mirrorPhotos,
        state.shieldedDays
      )
      if (streak >= 7 && streak % 7 === 0) {
        const streakResult = tryAwardXp(
          totalXp,
          xpAwardedKeys,
          `streak-${streak}`,
          XP_PER_STREAK_7
        )
        totalXp = streakResult.totalXp
        xpAwardedKeys = streakResult.xpAwardedKeys
      }

      if (day === 30) {
        const tier = tryAwardXp(totalXp, xpAwardedKeys, 'tier-intermediario', XP_PER_TIER_UNLOCK)
        totalXp = tier.totalXp
        xpAwardedKeys = tier.xpAwardedKeys
      }
      if (day === 60) {
        const tier = tryAwardXp(totalXp, xpAwardedKeys, 'tier-implacavel', XP_PER_TIER_UNLOCK)
        totalXp = tier.totalXp
        xpAwardedKeys = tier.xpAwardedKeys
      }
    }
  }

  for (const cardId of state.readScienceCardIds) {
    const science = tryAwardXp(totalXp, xpAwardedKeys, `science-${cardId}`, XP_PER_SCIENCE)
    totalXp = science.totalXp
    xpAwardedKeys = science.xpAwardedKeys
  }

  return { totalXp, xpAwardedKeys }
}

export function awardHabitXp(
  totalXp: number,
  xpAwardedKeys: string[],
  day: number,
  taskId: string
) {
  return tryAwardXp(totalXp, xpAwardedKeys, `habit-${day}-${taskId}`, XP_PER_HABIT)
}

export function awardDayXp(
  totalXp: number,
  xpAwardedKeys: string[],
  day: number,
  challengeId: ChallengeId,
  taskChecksByDay: Record<number, Record<string, boolean>>,
  mirrorPhotos: Record<number, string>,
  shieldedDays: number[]
) {
  let nextXp = totalXp
  let nextKeys = xpAwardedKeys

  const dayResult = tryAwardXp(nextXp, nextKeys, `day-${day}`, XP_PER_DAY)
  nextXp = dayResult.totalXp
  nextKeys = dayResult.xpAwardedKeys

  const streak = computeConsecutiveStreak(
    challengeId,
    day,
    taskChecksByDay,
    mirrorPhotos,
    shieldedDays
  )
  if (streak >= 7 && streak % 7 === 0) {
    const streakResult = tryAwardXp(nextXp, nextKeys, `streak-${streak}`, XP_PER_STREAK_7)
    nextXp = streakResult.totalXp
    nextKeys = streakResult.xpAwardedKeys
  }

  return { totalXp: nextXp, xpAwardedKeys: nextKeys }
}

export function awardScienceXp(
  totalXp: number,
  xpAwardedKeys: string[],
  cardId: string
) {
  return tryAwardXp(totalXp, xpAwardedKeys, `science-${cardId}`, XP_PER_SCIENCE)
}

export function awardTierUnlockXp(
  totalXp: number,
  xpAwardedKeys: string[],
  tier: 'intermediario' | 'implacavel'
) {
  return tryAwardXp(totalXp, xpAwardedKeys, `tier-${tier}`, XP_PER_TIER_UNLOCK)
}
