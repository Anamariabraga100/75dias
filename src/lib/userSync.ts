import type { PlanType } from '../store/useAppStore'
import { useAppStore } from '../store/useAppStore'
import { PRICING } from './pricing'
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
      payment_complete: state.paymentComplete,
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

export async function recordPaymentToCloud(
  plan: PlanType,
  method: 'pix' | 'card',
  usePromo: boolean
) {
  const client = getClient()
  const userId = await getAuthUserId()
  if (!client || !userId) return

  const amount =
    usePromo && plan === 'quarterly'
      ? PRICING.promoQuarterly.total
      : plan === 'quarterly'
        ? PRICING.quarterly.total
        : PRICING.monthly.total

  await client.from('payments').insert({
    user_id: userId,
    amount,
    plan_type: plan,
    method,
    status: 'completed',
    use_promo: usePromo,
  })

  await syncProfileToCloud()
}

export async function logMirrorPhotoToCloud(day: number) {
  const client = getClient()
  const userId = await getAuthUserId()
  if (!client || !userId) return

  await client.from('mirror_photo_logs').upsert(
    { user_id: userId, day },
    { onConflict: 'user_id,day' }
  )

  await syncProfileToCloud()
}

let syncTimer: ReturnType<typeof setTimeout> | null = null

export function scheduleProfileSync() {
  if (syncTimer) clearTimeout(syncTimer)
  syncTimer = setTimeout(() => {
    void syncProfileToCloud()
  }, 800)
}
