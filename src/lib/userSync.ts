import type { SubscriptionStatus } from './subscription'
import { hasActiveAccess } from './subscription'
import { useAppStore } from '../store/useAppStore'
import { normalizeProgramDay } from './demoProgress'
import { supabase } from './supabase'
import {
  buildDailyProgressSnapshot,
  parseDailyProgressSnapshot,
} from './dailyProgress'
import { mergeCloudIntoLocal, shouldPushLocalToCloud } from './progressMerge'
import { reconcileXpFromProgress } from './xp'
import { waitForStoreHydration } from './storeHydration'

function getClient() {
  if (!supabase) return null
  return supabase
}

export async function getAuthUserId(): Promise<string | null> {
  const client = getClient()
  if (!client) return null
  const { data } = await client.auth.getUser()
  return data.user?.id ?? null
}

type CloudProfile = {
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
  invested_days: number | null
  daily_progress: unknown
}

function userHasPaidAccess(
  subscriptionStatus: SubscriptionStatus | null,
  paymentComplete: boolean
) {
  return hasActiveAccess(subscriptionStatus, paymentComplete)
}

let hydrateInFlight: Promise<boolean> | null = null

/** Carrega progresso do Supabase — nuvem é a fonte de verdade após reload. */
export async function hydrateFromCloud(): Promise<boolean> {
  if (hydrateInFlight) return hydrateInFlight

  hydrateInFlight = (async () => {
    const client = getClient()
    const userId = await getAuthUserId()
    if (!client || !userId) return false

    await waitForStoreHydration()
    let local = useAppStore.getState()

    if (local.authUserId && local.authUserId !== userId) {
      useAppStore.getState().resetProgressForNewAccount(userId)
      local = useAppStore.getState()
    }

    const { data: profile, error } = await client
      .from('profiles')
      .select(
        'name, email, avatar_url, selected_plan, use_promo_offer, payment_complete, subscription_status, subscription_period_end, subscription_cancel_at_period_end, onboarding_complete, challenge_id, challenge_accepted, current_day, discipline_score, total_xp, invested_days, daily_progress'
      )
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      useAppStore.setState({ authUserId: userId })
      if (shouldPushLocalToCloud(local)) scheduleProfileSync()
      return false
    }

    if (!profile) {
      useAppStore.setState({ authUserId: userId })
      if (shouldPushLocalToCloud(local)) {
        scheduleProfileSync()
      } else {
        useAppStore.getState().resetProgressForNewAccount(userId)
      }
      return false
    }

    const row = profile as CloudProfile
    const cloudProgress = parseDailyProgressSnapshot(row.daily_progress)
    const merged = mergeCloudIntoLocal(local, row, cloudProgress)

    useAppStore.setState({
      authUserId: userId,
      ...merged,
    })

    const afterMerge = useAppStore.getState()
    const reconciled = reconcileXpFromProgress(afterMerge)
    useAppStore.setState({
      ...reconciled,
      totalXp: Math.max(afterMerge.totalXp, reconciled.totalXp),
    })

    const afterReconcile = useAppStore.getState()
    if (shouldPushLocalToCloud(afterReconcile)) {
      await flushProfileSync()
    }

    const final = useAppStore.getState()
    return Boolean(
      final.onboardingComplete &&
        userHasPaidAccess(final.subscriptionStatus, final.paymentComplete)
    )
  })().finally(() => {
    hydrateInFlight = null
  })

  return hydrateInFlight
}

/** Após pagamento — só precisa confirmar assinatura ativa (não exige onboarding no retorno). */
export async function confirmPaymentFromCloud(): Promise<boolean> {
  await hydrateFromCloud()
  const state = useAppStore.getState()
  return userHasPaidAccess(state.subscriptionStatus, state.paymentComplete)
}

export async function syncProfileToCloud() {
  const client = getClient()
  const userId = await getAuthUserId()
  if (!client || !userId) return

  const state = useAppStore.getState()
  const photosCount = Object.keys(state.mirrorPhotos).length
  const investedDays = state.challengeAccepted
    ? normalizeProgramDay(state.currentDay)
    : 0

  await client.from('profiles').upsert(
    {
      user_id: userId,
      email: state.email || null,
      name: state.name || null,
      avatar_url: state.avatarUrl,
      selected_plan: state.selectedPlan,
      use_promo_offer: state.usePromoOffer,
      onboarding_complete: state.onboardingComplete,
      challenge_id: state.challengeId,
      challenge_accepted: state.challengeAccepted,
      current_day: state.currentDay,
      discipline_score: state.disciplineScore,
      invested_days: investedDays,
      photos_count: photosCount,
      total_xp: state.totalXp,
      daily_progress: buildDailyProgressSnapshot(state),
      updated_at: new Date().toISOString(),
      last_seen_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  )
}

export async function logMirrorPhotoToCloud(day: number, photoUrl?: string) {
  const client = getClient()
  const userId = await getAuthUserId()
  if (!client || !userId) return

  const row: { user_id: string; day: number; photo_url?: string } = {
    user_id: userId,
    day,
  }
  if (photoUrl) row.photo_url = photoUrl

  await client.from('mirror_photo_logs').upsert(row, { onConflict: 'user_id,day' })

  await syncProfileToCloud()
}

let syncTimer: ReturnType<typeof setTimeout> | null = null
let syncInFlight: Promise<void> | null = null

export async function flushProfileSync() {
  if (syncTimer) {
    clearTimeout(syncTimer)
    syncTimer = null
  }
  if (!syncInFlight) {
    syncInFlight = syncProfileToCloud().finally(() => {
      syncInFlight = null
    })
  }
  await syncInFlight
}

export function scheduleProfileSync() {
  if (syncTimer) clearTimeout(syncTimer)
  syncTimer = setTimeout(() => {
    syncTimer = null
    void syncProfileToCloud()
  }, 500)
}
