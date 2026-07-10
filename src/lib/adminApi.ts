import { getAdminPasswordFromEnv } from './adminCredentials'
import { isAdminSession } from './adminSession'

export type AdminProfile = {
  user_id: string
  email: string | null
  name: string | null
  avatar_url: string | null
  selected_plan: string | null
  payment_complete: boolean
  subscription_status?: string | null
  stripe_customer_id?: string | null
  stripe_subscription_id?: string | null
  onboarding_complete: boolean
  challenge_id: string | null
  challenge_accepted: boolean
  current_day: number
  invested_days: number
  photos_count: number
  total_xp: number
  created_at: string
  updated_at: string
  last_seen_at: string
}

export type AdminPayment = {
  id: string
  amount: number
  plan_type: string
  method: string
  status: string
  event_type: string | null
  stripe_invoice_id: string | null
  stripe_session_id: string | null
  created_at: string
  user_id: string
  email: string | null
  name: string | null
}

export type AdminStripeEvent = {
  id: string
  stripe_event_id: string
  event_type: string
  category: string
  title: string
  description: string | null
  amount: number | null
  currency: string
  status: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  stripe_invoice_id: string | null
  created_at: string
  user_id: string | null
  email: string | null
  name: string | null
}

export type DashboardStats = {
  salesToday: number
  salesTodayCount: number
  newUsersToday: number
  newClientsToday: number
  renewalsToday: number
  failedPaymentsToday: number
  pastDueCount: number
  activeSubscriptions: number
  eventsToday: number
  totalSubscribers: number
  totalRevenue: number
  totalUsers: number
  photosToday: number
  recentPayments: {
    id: string
    amount: number
    plan_type: string
    method: string
    status: string
    event_type: string | null
    created_at: string
    email: string | null
    name: string | null
  }[]
  recentEvents: {
    id: string
    event_type: string
    category: string
    title: string
    description: string | null
    amount: number | null
    status: string
    created_at: string
    email: string | null
    name: string | null
  }[]
}

async function adminFetch<T>(path: string): Promise<T> {
  const password = getAdminPasswordFromEnv()
  if (!password) throw new Error('VITE_ADMIN_PASSWORD não configurada.')

  const res = await fetch(`/api/admin/${path}`, {
    headers: { 'X-Admin-Password': password },
  })

  const payload = (await res.json().catch(() => ({}))) as T & { error?: string }
  if (!res.ok) {
    throw new Error(payload.error || 'Não foi possível carregar dados do admin.')
  }

  return payload
}

export async function checkIsAdmin(): Promise<boolean> {
  return isAdminSession()
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  if (!isAdminSession()) throw new Error('Sessão admin expirada.')
  return adminFetch<DashboardStats>('dashboard')
}

export async function fetchSubscribers(): Promise<AdminProfile[]> {
  if (!isAdminSession()) throw new Error('Sessão admin expirada.')
  return adminFetch<AdminProfile[]>('subscribers')
}

export async function fetchAllUsers(): Promise<AdminProfile[]> {
  if (!isAdminSession()) throw new Error('Sessão admin expirada.')
  return adminFetch<AdminProfile[]>('users')
}

export async function fetchPayments(): Promise<AdminPayment[]> {
  if (!isAdminSession()) throw new Error('Sessão admin expirada.')
  return adminFetch<AdminPayment[]>('payments')
}

export async function fetchStripeEvents(): Promise<AdminStripeEvent[]> {
  if (!isAdminSession()) throw new Error('Sessão admin expirada.')
  return adminFetch<AdminStripeEvent[]>('events')
}

export type AdminLeaderboardProfile = Pick<
  AdminProfile,
  | 'user_id'
  | 'email'
  | 'name'
  | 'avatar_url'
  | 'challenge_id'
  | 'challenge_accepted'
  | 'current_day'
  | 'invested_days'
  | 'photos_count'
  | 'total_xp'
  | 'last_seen_at'
>

export type AdminProgressPhoto = {
  id: string
  user_id: string
  day: number
  photo_url: string
  created_at: string
  name: string | null
  email: string | null
  avatar_url?: string | null
}

export type AdminEngagementData = {
  topInvested: AdminLeaderboardProfile[]
  topXp: AdminLeaderboardProfile[]
  topPhotos: AdminLeaderboardProfile[]
  recentPhotos: AdminProgressPhoto[]
}

export type AdminUserPhotosData = {
  profile: AdminLeaderboardProfile | null
  photos: Omit<AdminProgressPhoto, 'name' | 'email' | 'avatar_url'>[]
}

export async function fetchEngagementLeaderboard(): Promise<AdminEngagementData> {
  if (!isAdminSession()) throw new Error('Sessão admin expirada.')
  return adminFetch<AdminEngagementData>('engagement')
}

export async function fetchUserPhotos(userId: string): Promise<AdminUserPhotosData> {
  if (!isAdminSession()) throw new Error('Sessão admin expirada.')
  return adminFetch<AdminUserPhotosData>(`photos?user_id=${encodeURIComponent(userId)}`)
}
