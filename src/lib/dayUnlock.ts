import type { ChallengeId } from '../store/useAppStore'
import { normalizeProgramDay } from './demoProgress'
import { isDayComplete } from './streak'

/** Tempo normal até liberar o próximo dia após concluir o atual. */
export const DAY_UNLOCK_MS = 24 * 60 * 60 * 1000

/** Modo teste: 1 minuto em vez de 24h. */
export const FAST_DAY_UNLOCK_MS = 60 * 1000

export function isFastDayMode(): boolean {
  return import.meta.env.DEV || import.meta.env.VITE_DEV_FAST_DAYS === 'true'
}

export function getDayUnlockMs(): number {
  return isFastDayMode() ? FAST_DAY_UNLOCK_MS : DAY_UNLOCK_MS
}

export function formatUnlockCountdown(remainingMs: number): string {
  if (remainingMs <= 0) return 'agora'

  const totalSec = Math.ceil(remainingMs / 1000)

  if (isFastDayMode() && totalSec < 3600) {
    const mins = Math.floor(totalSec / 60)
    const secs = totalSec % 60
    if (mins > 0) return `${mins}m ${secs}s`
    return `${secs}s`
  }

  const hours = Math.floor(totalSec / 3600)
  const mins = Math.floor((totalSec % 3600) / 60)
  if (hours > 0) return `${hours}h ${mins}m`
  return `${mins}m`
}

export interface DayUnlockStatus {
  dayComplete: boolean
  canAdvance: boolean
  remainingMs: number
  unlockAt: number | null
}

export function getDayUnlockStatus(input: {
  challengeAccepted: boolean
  challengeId: ChallengeId | null
  currentDay: number
  taskChecksByDay: Record<number, Record<string, boolean>>
  mirrorPhotos: Record<number, string>
  dayCompletedAt: string | null
  now?: number
}): DayUnlockStatus {
  const {
    challengeAccepted,
    challengeId,
    currentDay,
    taskChecksByDay,
    mirrorPhotos,
    dayCompletedAt,
    now = Date.now(),
  } = input

  const programDay = normalizeProgramDay(currentDay)

  if (!challengeAccepted || !challengeId || programDay >= 90) {
    return { dayComplete: false, canAdvance: false, remainingMs: 0, unlockAt: null }
  }

  const dayComplete = isDayComplete(challengeId, programDay, taskChecksByDay, mirrorPhotos)

  if (!dayComplete || !dayCompletedAt) {
    return { dayComplete, canAdvance: false, remainingMs: 0, unlockAt: null }
  }

  const completedAt = new Date(dayCompletedAt).getTime()
  const unlockAt = completedAt + getDayUnlockMs()
  const remainingMs = Math.max(0, unlockAt - now)

  return {
    dayComplete: true,
    canAdvance: remainingMs <= 0,
    remainingMs,
    unlockAt,
  }
}
