import type { ChallengeId } from '../store/useAppStore'
import { CHALLENGES } from '../store/useAppStore'
import { normalizeProgramDay } from './demoProgress'
import { isPhotoDay } from './photoSchedule'

export function isDayComplete(
  challengeId: ChallengeId,
  day: number,
  taskChecksByDay: Record<number, Record<string, boolean>>,
  mirrorPhotos: Record<number, string>
): boolean {
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

/** Dias investidos — no desafio, mínimo 1 (dia 1 já conta). */
export function computeInvestedDays(
  challengeAccepted: boolean,
  challengeId: ChallengeId | null,
  currentDay: number,
  taskChecksByDay: Record<number, Record<string, boolean>>,
  mirrorPhotos: Record<number, string>
): number {
  if (!challengeAccepted || !challengeId) return 0

  const displayDay = normalizeProgramDay(currentDay)
  let streak = 0

  for (let day = displayDay; day >= 1; day--) {
    if (!isDayComplete(challengeId, day, taskChecksByDay, mirrorPhotos)) {
      if (day === displayDay) continue
      break
    }
    streak++
  }

  return Math.max(streak, 1)
}
