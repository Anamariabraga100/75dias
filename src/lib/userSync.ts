import type { ChallengeId } from '../store/useAppStore'
import type { SubscriptionStatus } from './subscription'
import { hasActiveAccess, parseSubscriptionStatus } from './subscription'
import { useAppStore } from '../store/useAppStore'
import { computeInvestedDays } from './streak'
import { supabase } from './supabase'

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
  onboarding_complete: boolean
  challenge_id: string | null
  challenge_accepted: boolean
  current_day: number
  discipline_score: number | null
}

function userHasPaidAccess(
  subscriptionStatus: SubscriptionStatus | null,
  paymentComplete: boolean
) {
  return hasActiveAccess(subscriptionStatus, paymentComplete)
}

function isChallengeId(value: string | null): value is ChallengeId {
  return value === 'iniciante' || value === 'intermediario' || value === 'implacavel'
}

/** Carrega progresso do Supabase — evita pular onboarding por cache local. */
export async function hydrateFromCloud(): Promise<boolean> {
  const client = getClient()
  const userId = await getAuthUserId()
  if (!client || !userId) return false

  const stateBefore = useAppStore.getState()

  if (stateBefore.authUserId && stateBefore.authUserId !== userId) {
    useAppStore.getState().resetProgressForNewAccount(userId)
  }

  const { data: profile, error } = await client
    .from('profiles')
    .select(
      'name, email, avatar_url, selected_plan, use_promo_offer, payment_complete, subscription_status, onboarding_complete, challenge_id, challenge_accepted, current_day, discipline_score'
    )
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    useAppStore.setState({ authUserId: userId })
    const state = useAppStore.getState()
    return Boolean(
      state.onboardingComplete &&
        userHasPaidAccess(state.subscriptionStatus, state.paymentComplete)
    )
  }

  if (!profile) {
    useAppStore.getState().resetProgressForNewAccount(userId)
    return false
  }

  const row = profile as CloudProfile
  const challengeId = isChallengeId(row.challenge_id) ? row.challenge_id : null
  const subscriptionStatus = parseSubscriptionStatus(row.subscription_status)

  useAppStore.setState({
    authUserId: userId,
    name: row.name?.trim() || stateBefore.name,
    email: row.email || stateBefore.email,
    avatarUrl: row.avatar_url ?? stateBefore.avatarUrl,
    selectedPlan: row.selected_plan === 'monthly' ? 'monthly' : 'quarterly',
    usePromoOffer: row.use_promo_offer,
    paymentComplete: Boolean(row.payment_complete),
    subscriptionStatus,
    onboardingComplete: Boolean(row.onboarding_complete),
    challengeId,
    challengeAccepted: row.challenge_accepted,
    currentDay: Math.min(90, Math.max(1, row.current_day ?? 1)),
    disciplineScore: row.discipline_score ?? stateBefore.disciplineScore,
  })

  const final = useAppStore.getState()
  return Boolean(
    final.onboardingComplete &&
      userHasPaidAccess(final.subscriptionStatus, final.paymentComplete)
  )
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
  const investedDays = computeInvestedDays(
    state.challengeAccepted,
    state.challengeId,
    state.currentDay,
    state.taskChecksByDay,
    state.mirrorPhotos
  )

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
  }, 800)
}
