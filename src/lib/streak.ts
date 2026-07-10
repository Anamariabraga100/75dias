import type { ChallengeId } from '../store/useAppStore'
import { CHALLENGES } from '../store/useAppStore'
import { normalizeProgramDay } from './demoProgress'
import { isPhotoDay } from './photoSchedule'

export function isDayComplete(
  challengeId: ChallengeId,
  day: number,
  taskChecksByDay: Record<number, Record<string, boolean>>,
  mirrorPhotos: Record<number, string>,
  shieldedDays: number[] = []
): boolean {
  if (shieldedDays.includes(day)) return true

  const checks = taskChecksByDay[day] ?? {}
  const checkTasks = CHALLENGES[challengeId].tasks.filter((t) => t.type === 'check')

  if (checkTasks.length === 0) return false

  const checksDone = checkTasks.every((t) => checks[t.id])
  if (!checksDone) return false

  if (challengeId === 'implacavel' && isPhotoDay(day)) {
    return Boolean(mirrorPhotos[day])
  }

  return true
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
