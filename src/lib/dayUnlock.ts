import type { ChallengeId } from '../store/useAppStore'
import { normalizeProgramDay } from './demoProgress'
import { isDayComplete } from './streak'

/** Tempo normal até liberar o próximo dia após concluir o atual. */
export const DAY_UNLOCK_MS = 24 * 60 * 60 * 1000

/** Próxima meia-noite local após o instante informado. */
export function getNextMidnightMs(fromMs: number): number {
  const date = new Date(fromMs)
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1, 0, 0, 0, 0).getTime()
}

/** Modo teste: 10s em dev local, 1 min com VITE_DEV_FAST_DAYS. */
export const FAST_DAY_UNLOCK_MS = import.meta.env.DEV ? 10 * 1000 : 60 * 1000

export function isFastDayMode(): boolean {
  return import.meta.env.DEV || import.meta.env.VITE_DEV_FAST_DAYS === 'true'
}

export function getDayUnlockMs(): number {
  return isFastDayMode() ? FAST_DAY_UNLOCK_MS : DAY_UNLOCK_MS
}

export function formatUnlockCountdown(remainingMs: number): string {
  if (remainingMs <= 0) return 'agora'

  const { hours, minutes, seconds } = getMidnightCountdownParts(remainingMs)

  if (isFastDayMode() && hours === 0) {
    if (minutes > 0) return `${minutes}m ${String(seconds).padStart(2, '0')}s`
    return `${seconds}s`
  }

  if (hours > 0) return `${hours}h ${String(minutes).padStart(2, '0')}m`
  if (minutes > 0) return `${minutes}m ${String(seconds).padStart(2, '0')}s`
  return `${seconds}s`
}

export function getMidnightCountdownParts(remainingMs: number) {
  const totalSec = Math.max(0, Math.ceil(remainingMs / 1000))
  return {
    hours: Math.floor(totalSec / 3600),
    minutes: Math.floor((totalSec % 3600) / 60),
    seconds: totalSec % 60,
  }
}

/** Relógio 00:00:00 até a meia-noite (ou mm:ss em modo teste rápido). */
export function formatMidnightClock(remainingMs: number): string {
  if (remainingMs <= 0) return '00:00:00'
  const { hours, minutes, seconds } = getMidnightCountdownParts(remainingMs)
  if (isFastDayMode() && hours === 0) {
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
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
  shieldedDays?: number[]
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
    shieldedDays = [],
  } = input

  const programDay = normalizeProgramDay(currentDay)

  if (!challengeAccepted || !challengeId || programDay >= 90) {
    return { dayComplete: false, canAdvance: false, remainingMs: 0, unlockAt: null }
  }

  const dayComplete = isDayComplete(
    challengeId,
    programDay,
    taskChecksByDay,
    mirrorPhotos,
    shieldedDays
  )

  if (!dayComplete || !dayCompletedAt) {
    return { dayComplete, canAdvance: false, remainingMs: 0, unlockAt: null }
  }

  const completedAt = new Date(dayCompletedAt).getTime()
  const unlockAt = isFastDayMode() ? completedAt + getDayUnlockMs() : getNextMidnightMs(completedAt)
  const remainingMs = Math.max(0, unlockAt - now)

  return {
    dayComplete: true,
    canAdvance: remainingMs <= 0,
    remainingMs,
    unlockAt,
  }
}
