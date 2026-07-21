import type { AppState, ChallengeId } from '../store/useAppStore'
import { normalizeProgramDay } from './demoProgress'
import type { DailyProgressSnapshot } from './dailyProgress'
import { mergeDailyProgress } from './dailyProgress'
import { parseSubscriptionStatus, hasActiveAccess } from './subscription'

export type CloudProfileRow = {
  name: string | null
  email: string | null
  avatar_url: string | null
  selected_plan: string | null
  use_promo_offer: boolean
  payment_complete: boolean
  subscription_status: string | null
  subscription_period_end: string | null
  subscription_cancel_at_period_end: boolean
  onboarding_complete: boolean
  challenge_id: string | null
  challenge_accepted: boolean
  current_day: number
  discipline_score: number | null
  total_xp: number | null
  invested_days?: number | null
}

function isChallengeId(value: string | null): value is ChallengeId {
  return value === 'iniciante' || value === 'intermediario' || value === 'implacavel'
}

function resolveCloudOnboardingComplete(row: CloudProfileRow): boolean {
  if (!row.onboarding_complete) return false
  if (row.discipline_score == null && !row.challenge_accepted) return false
  return true
}

function maxDay(...values: number[]): number {
  return Math.min(90, Math.max(1, ...values.map((v) => normalizeProgramDay(v))))
}

function buildCloudProgressSnapshot(
  row: CloudProfileRow,
  cloudProgress: DailyProgressSnapshot | null
): DailyProgressSnapshot {
  const cloudChallengeId = isChallengeId(row.challenge_id) ? row.challenge_id : null
  const columnXp = typeof row.total_xp === 'number' ? row.total_xp : 0

  if (cloudProgress) {
    return {
      ...cloudProgress,
      currentDay: maxDay(
        cloudProgress.currentDay,
        row.current_day ?? 1,
        row.invested_days ?? 1
      ),
      challengeAccepted: row.challenge_accepted || cloudProgress.challengeAccepted,
      challengeId: cloudChallengeId ?? cloudProgress.challengeId,
      totalXp: Math.max(cloudProgress.totalXp, columnXp),
    }
  }

  return {
    currentDay: maxDay(row.current_day ?? 1, row.invested_days ?? 1),
    challengeAccepted: row.challenge_accepted,
    challengeId: cloudChallengeId,
    taskChecksByDay: {},
    dayCompletedAt: null,
    programDayStartedAt: null,
    mirrorPhotos: {},
    shieldedDays: [],
    lastShieldUsedDay: null,
    xpAwardedKeys: [],
    totalXp: columnXp,
    disciplineShields: 0,
    readScienceCardIds: [],
    seenTierUnlockModals: [],
    investidaStreak: 0,
    lastInvestidaDate: null,
  }
}

/** Nuvem é a fonte de verdade; local só entra para otimismo na mesma sessão. */
export function mergeCloudIntoLocal(
  local: AppState,
  row: CloudProfileRow,
  cloudProgress: DailyProgressSnapshot | null
): Partial<AppState> {
  const subscriptionStatus = parseSubscriptionStatus(row.subscription_status)
  const cloudOnboarding = resolveCloudOnboardingComplete(row)
  const cloudPayment = Boolean(row.payment_complete) || hasActiveAccess(subscriptionStatus, false)

  const cloudBase = buildCloudProgressSnapshot(row, cloudProgress)
  const progressPatch = mergeDailyProgress(local, cloudBase)

  const keepLocalScores =
    !row.onboarding_complete && Boolean(local.profileInsights)

  const {
    totalXp: patchXp,
    currentDay: patchDay,
    challengeAccepted: patchAccepted,
    challengeId: patchChallengeId,
    ...progressFields
  } = progressPatch

  return {
    name: row.name?.trim() || local.name,
    email: row.email || local.email,
    avatarUrl: row.avatar_url ?? local.avatarUrl,
    selectedPlan: row.selected_plan === 'monthly' ? 'monthly' : 'quarterly',
    usePromoOffer: row.use_promo_offer,
    paymentComplete: cloudPayment || local.paymentComplete,
    subscriptionStatus: subscriptionStatus ?? local.subscriptionStatus,
    subscriptionPeriodEnd: row.subscription_period_end ?? local.subscriptionPeriodEnd,
    subscriptionCancelAtPeriodEnd:
      local.subscriptionCancelAtPeriodEnd || Boolean(row.subscription_cancel_at_period_end),
    onboardingComplete: cloudOnboarding || local.onboardingComplete,
    challengeId: patchChallengeId ?? cloudBase.challengeId ?? local.challengeId,
    challengeAccepted: patchAccepted ?? cloudBase.challengeAccepted ?? local.challengeAccepted,
    currentDay: maxDay(
      cloudBase.currentDay,
      patchDay ?? 1,
      normalizeProgramDay(local.currentDay)
    ),
    disciplineScore: keepLocalScores
      ? local.disciplineScore
      : (row.discipline_score ?? local.disciplineScore),
    ...progressFields,
    totalXp: Math.max(cloudBase.totalXp, patchXp ?? 0, local.totalXp),
  }
}

export function shouldPushLocalToCloud(local: AppState): boolean {
  return Boolean(
    local.challengeAccepted ||
      local.onboardingComplete ||
      local.paymentComplete ||
      local.dayCompletedAt ||
      local.totalXp > 0 ||
      local.currentDay > 1 ||
      Object.keys(local.taskChecksByDay).length > 0
  )
}
