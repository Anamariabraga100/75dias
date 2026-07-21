import type { ChallengeId } from '../store/useAppStore'
import { CHALLENGES } from '../store/useAppStore'
import { normalizeProgramDay } from './demoProgress'
import { isPhotoDay } from './photoSchedule'

/** Fração mínima de missões para poder finalizar o dia. */
export const DAY_COMPLETE_MIN_RATIO = 0.6

export type DayMissionProgress = {
  done: number
  total: number
  ratio: number
  /** Atingiu pelo menos 60% — pode finalizar o dia. */
  canFinalize: boolean
  /** 100% das missões do dia. */
  isPerfect: boolean
}

export function getDayMissionProgress(
  challengeId: ChallengeId,
  day: number,
  taskChecksByDay: Record<number, Record<string, boolean>>,
  mirrorPhotos: Record<number, string>,
  shieldedDays: number[] = []
): DayMissionProgress {
  if (shieldedDays.includes(day)) {
    return { done: 1, total: 1, ratio: 1, canFinalize: true, isPerfect: true }
  }

  const checks = taskChecksByDay[day] ?? {}
  const checkTasks = CHALLENGES[challengeId].tasks.filter((t) => t.type === 'check')
  let done = checkTasks.filter((t) => checks[t.id]).length
  let total = checkTasks.length

  if (challengeId === 'implacavel' && isPhotoDay(day)) {
    total += 1
    if (mirrorPhotos[day]) done += 1
  }

  if (total === 0) {
    return { done: 0, total: 0, ratio: 0, canFinalize: false, isPerfect: false }
  }

  const ratio = done / total
  return {
    done,
    total,
    ratio,
    canFinalize: ratio >= DAY_COMPLETE_MIN_RATIO,
    isPerfect: done === total,
  }
}

/** Dia conta como completo a partir de ~60% das missões (ou escudo). */
export function isDayComplete(
  challengeId: ChallengeId,
  day: number,
  taskChecksByDay: Record<number, Record<string, boolean>>,
  mirrorPhotos: Record<number, string>,
  shieldedDays: number[] = []
): boolean {
  return getDayMissionProgress(
    challengeId,
    day,
    taskChecksByDay,
    mirrorPhotos,
    shieldedDays
  ).canFinalize
}

/** Sequência consecutiva de dias completos (ou protegidos) até `upToDay`. */
export function computeConsecutiveStreak(
  challengeId: ChallengeId,
  upToDay: number,
  taskChecksByDay: Record<number, Record<string, boolean>>,
  mirrorPhotos: Record<number, string>,
  shieldedDays: number[] = []
): number {
  let streak = 0

  for (let day = upToDay; day >= 1; day--) {
    if (!isDayComplete(challengeId, day, taskChecksByDay, mirrorPhotos, shieldedDays)) {
      if (day === upToDay) continue
      break
    }
    streak++
  }

  return streak
}

/** Dias investidos — no desafio, mínimo 1 (dia 1 já conta). */
export function computeInvestedDays(
  challengeAccepted: boolean,
  challengeId: ChallengeId | null,
  currentDay: number,
  taskChecksByDay: Record<number, Record<string, boolean>>,
  mirrorPhotos: Record<number, string>,
  shieldedDays: number[] = []
): number {
  if (!challengeAccepted || !challengeId) return 0

  const displayDay = normalizeProgramDay(currentDay)
  const streak = computeConsecutiveStreak(
    challengeId,
    displayDay,
    taskChecksByDay,
    mirrorPhotos,
    shieldedDays
  )

  return Math.max(streak, 1)
}
