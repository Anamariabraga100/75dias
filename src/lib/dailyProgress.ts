import type { AppState } from '../store/useAppStore'
import type { ChallengeId } from '../store/useAppStore'
import { normalizeProgramDay } from './demoProgress'

export type DailyProgressSnapshot = {
  currentDay: number
  challengeAccepted: boolean
  challengeId: ChallengeId | null
  taskChecksByDay: Record<number, Record<string, boolean>>
  dayCompletedAt: string | null
  programDayStartedAt: string | null
  mirrorPhotos: Record<number, string>
  shieldedDays: number[]
  lastShieldUsedDay: number | null
  xpAwardedKeys: string[]
  totalXp: number
  disciplineShields: number
  readScienceCardIds: string[]
  seenTierUnlockModals: string[]
}

export function buildDailyProgressSnapshot(state: AppState): DailyProgressSnapshot {
  return {
    currentDay: normalizeProgramDay(state.currentDay),
    challengeAccepted: state.challengeAccepted,
    challengeId: state.challengeId,
    taskChecksByDay: state.taskChecksByDay,
    dayCompletedAt: state.dayCompletedAt,
    programDayStartedAt: state.programDayStartedAt,
    mirrorPhotos: state.mirrorPhotos,
    shieldedDays: state.shieldedDays,
    lastShieldUsedDay: state.lastShieldUsedDay,
    xpAwardedKeys: state.xpAwardedKeys,
    totalXp: state.totalXp,
    disciplineShields: state.disciplineShields,
    readScienceCardIds: state.readScienceCardIds,
    seenTierUnlockModals: state.seenTierUnlockModals,
  }
}

function normalizeTaskChecks(
  raw: unknown
): Record<number, Record<string, boolean>> {
  if (!raw || typeof raw !== 'object') return {}
  const out: Record<number, Record<string, boolean>> = {}
  for (const [dayKey, checks] of Object.entries(raw as Record<string, unknown>)) {
    const day = Number(dayKey)
    if (!Number.isFinite(day) || !checks || typeof checks !== 'object') continue
    out[day] = {}
    for (const [taskId, checked] of Object.entries(checks as Record<string, unknown>)) {
      if (checked) out[day][taskId] = true
    }
  }
  return out
}

function normalizeNumberRecord(raw: unknown): Record<number, string> {
  if (!raw || typeof raw !== 'object') return {}
  const out: Record<number, string> = {}
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    const day = Number(key)
    if (!Number.isFinite(day) || typeof value !== 'string') continue
    out[day] = value
  }
  return out
}

function normalizeNumberArray(raw: unknown): number[] {
  if (!Array.isArray(raw)) return []
  return raw.filter((n): n is number => typeof n === 'number' && Number.isFinite(n))
}

function normalizeStringArray(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  return raw.filter((s): s is string => typeof s === 'string')
}

function isChallengeId(value: unknown): value is ChallengeId {
  return value === 'iniciante' || value === 'intermediario' || value === 'implacavel'
}

export function parseDailyProgressSnapshot(raw: unknown): DailyProgressSnapshot | null {
  if (!raw || typeof raw !== 'object') return null
  const row = raw as Record<string, unknown>

  return {
    currentDay:
      typeof row.currentDay === 'number'
        ? normalizeProgramDay(row.currentDay)
        : 1,
    challengeAccepted: Boolean(row.challengeAccepted),
    challengeId: isChallengeId(row.challengeId) ? row.challengeId : null,
    taskChecksByDay: normalizeTaskChecks(row.taskChecksByDay),
    dayCompletedAt: typeof row.dayCompletedAt === 'string' ? row.dayCompletedAt : null,
    programDayStartedAt:
      typeof row.programDayStartedAt === 'string' ? row.programDayStartedAt : null,
    mirrorPhotos: normalizeNumberRecord(row.mirrorPhotos),
    shieldedDays: normalizeNumberArray(row.shieldedDays),
    lastShieldUsedDay:
      typeof row.lastShieldUsedDay === 'number' ? row.lastShieldUsedDay : null,
    xpAwardedKeys: normalizeStringArray(row.xpAwardedKeys),
    totalXp: typeof row.totalXp === 'number' ? row.totalXp : 0,
    disciplineShields:
      typeof row.disciplineShields === 'number' ? row.disciplineShields : 0,
    readScienceCardIds: normalizeStringArray(row.readScienceCardIds),
    seenTierUnlockModals: normalizeStringArray(row.seenTierUnlockModals),
  }
}

function countCheckedHabits(taskChecksByDay: Record<number, Record<string, boolean>>): number {
  let total = 0
  for (const checks of Object.values(taskChecksByDay)) {
    total += Object.values(checks).filter(Boolean).length
  }
  return total
}

export function mergeDailyProgress(
  local: AppState,
  cloud: DailyProgressSnapshot | null
): Partial<AppState> {
  if (!cloud) return {}

  const localChecks = countCheckedHabits(local.taskChecksByDay)
  const cloudChecks = countCheckedHabits(cloud.taskChecksByDay)

  if (cloudChecks === 0 && localChecks > 0) return {}

  if (localChecks === 0 && cloudChecks > 0) {
    return {
      currentDay: Math.max(normalizeProgramDay(local.currentDay), cloud.currentDay),
      challengeAccepted: local.challengeAccepted || cloud.challengeAccepted,
      challengeId: local.challengeId ?? cloud.challengeId,
      taskChecksByDay: cloud.taskChecksByDay,
      dayCompletedAt: cloud.dayCompletedAt,
      programDayStartedAt: cloud.programDayStartedAt,
      mirrorPhotos: cloud.mirrorPhotos,
      shieldedDays: cloud.shieldedDays,
      lastShieldUsedDay: cloud.lastShieldUsedDay,
      xpAwardedKeys: cloud.xpAwardedKeys,
      totalXp: cloud.totalXp,
      disciplineShields: cloud.disciplineShields,
      readScienceCardIds: cloud.readScienceCardIds,
      seenTierUnlockModals: cloud.seenTierUnlockModals,
    }
  }

  const mergedTaskChecks: Record<number, Record<string, boolean>> = {
    ...cloud.taskChecksByDay,
  }
  for (const [dayKey, checks] of Object.entries(local.taskChecksByDay)) {
    const day = Number(dayKey)
    mergedTaskChecks[day] = { ...mergedTaskChecks[day], ...checks }
  }

  const mergedMirrorPhotos = { ...cloud.mirrorPhotos, ...local.mirrorPhotos }
  const mergedXpKeys = [...new Set([...cloud.xpAwardedKeys, ...local.xpAwardedKeys])]
  const mergedScience = [
    ...new Set([...cloud.readScienceCardIds, ...local.readScienceCardIds]),
  ]
  const mergedTierModals = [
    ...new Set([...cloud.seenTierUnlockModals, ...local.seenTierUnlockModals]),
  ]
  const mergedShields = [...new Set([...cloud.shieldedDays, ...local.shieldedDays])]

  return {
    currentDay: Math.max(normalizeProgramDay(local.currentDay), cloud.currentDay),
    challengeAccepted: local.challengeAccepted || cloud.challengeAccepted,
    challengeId: local.challengeId ?? cloud.challengeId,
    taskChecksByDay: mergedTaskChecks,
    dayCompletedAt: local.dayCompletedAt ?? cloud.dayCompletedAt,
    programDayStartedAt: local.programDayStartedAt ?? cloud.programDayStartedAt,
    mirrorPhotos: mergedMirrorPhotos,
    shieldedDays: mergedShields,
    lastShieldUsedDay: local.lastShieldUsedDay ?? cloud.lastShieldUsedDay,
    xpAwardedKeys: mergedXpKeys,
    totalXp: Math.max(local.totalXp, cloud.totalXp),
    disciplineShields: Math.max(local.disciplineShields, cloud.disciplineShields),
    readScienceCardIds: mergedScience,
    seenTierUnlockModals: mergedTierModals,
  }
}

export function hasMeaningfulLocalProgress(state: AppState): boolean {
  return Boolean(
    state.challengeAccepted ||
      state.onboardingComplete ||
      state.paymentComplete ||
      state.dayCompletedAt ||
      state.totalXp > 0 ||
      state.currentDay > 1 ||
      countCheckedHabits(state.taskChecksByDay) > 0 ||
      Object.keys(state.mirrorPhotos).length > 0
  )
}
