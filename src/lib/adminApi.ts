import { supabase } from './supabase'

export type AdminProfile = {
  user_id: string
  email: string | null
  name: string | null
  avatar_url: string | null
  selected_plan: string | null
  payment_complete: boolean
  onboarding_complete: boolean
  challenge_id: string | null
  challenge_accepted: boolean
  current_day: number
  invested_days: number
  photos_count: number
  created_at: string
  updated_at: string
  last_seen_at: string
}

export type DashboardStats = {
  salesToday: number
  salesTodayCount: number
  newUsersToday: number
  totalSubscribers: number
  totalRevenue: number
  totalUsers: number
  photosToday: number
  recentPayments: {
    id: string
    amount: number
    plan_type: string
    method: string
    created_at: string
    email: string | null
    name: string | null
  }[]
}

function startOfTodayIso() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

function assertClient() {
  if (!supabase) throw new Error('Supabase não configurado.')
  return supabase
}

export async function checkIsAdmin(): Promise<boolean> {
  const client = assertClient()
  const { data: userData } = await client.auth.getUser()
  const userId = userData.user?.id
  if (!userId) return false

  const { data, error } = await client
    .from('profiles')
    .select('is_admin')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) return false
  return Boolean(data?.is_admin)
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const client = assertClient()
  const today = startOfTodayIso()

  const [paymentsTodayRes, paymentsAllRes, profilesRes, newTodayRes, photosTodayRes, recentRes] =
    await Promise.all([
      client.from('payments').select('amount').gte('created_at', today).eq('status', 'completed'),
      client.from('payments').select('amount').eq('status', 'completed'),
      client.from('profiles').select('user_id', { count: 'exact', head: true }),
      client.from('profiles').select('user_id', { count: 'exact', head: true }).gte('created_at', today),
      client
        .from('mirror_photo_logs')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', today),
      client
        .from('payments')
        .select('id, amount, plan_type, method, created_at, user_id')
        .order('created_at', { ascending: false })
        .limit(8),
    ])

  const salesToday = (paymentsTodayRes.data ?? []).reduce((s, p) => s + Number(p.amount), 0)
  const totalRevenue = (paymentsAllRes.data ?? []).reduce((s, p) => s + Number(p.amount), 0)

  const { count: subscribers } = await client
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('payment_complete', true)

  const userIds = [...new Set((recentRes.data ?? []).map((p) => p.user_id))]
  let profileMap = new Map<string, { email: string | null; name: string | null }>()
  if (userIds.length > 0) {
    const { data: profs } = await client
      .from('profiles')
      .select('user_id, email, name')
      .in('user_id', userIds)
    profileMap = new Map((profs ?? []).map((p) => [p.user_id, { email: p.email, name: p.name }]))
  }

  return {
    salesToday,
    salesTodayCount: paymentsTodayRes.data?.length ?? 0,
    newUsersToday: newTodayRes.count ?? 0,
    totalSubscribers: subscribers ?? 0,
    totalRevenue,
    totalUsers: profilesRes.count ?? 0,
    photosToday: photosTodayRes.count ?? 0,
    recentPayments: (recentRes.data ?? []).map((p) => ({
      id: p.id,
      amount: Number(p.amount),
      plan_type: p.plan_type,
      method: p.method,
      created_at: p.created_at,
      email: profileMap.get(p.user_id)?.email ?? null,
      name: profileMap.get(p.user_id)?.name ?? null,
    })),
  }
}

export async function fetchSubscribers(): Promise<AdminProfile[]> {
  const client = assertClient()
  const { data, error } = await client
    .from('profiles')
    .select(
      'user_id, email, name, avatar_url, selected_plan, payment_complete, onboarding_complete, challenge_id, challenge_accepted, current_day, invested_days, photos_count, created_at, updated_at, last_seen_at'
    )
    .eq('payment_complete', true)
    .order('last_seen_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as AdminProfile[]
}

export async function fetchAllUsers(): Promise<AdminProfile[]> {
  const client = assertClient()
  const { data, error } = await client
    .from('profiles')
    .select(
      'user_id, email, name, avatar_url, selected_plan, payment_complete, onboarding_complete, challenge_id, challenge_accepted, current_day, invested_days, photos_count, created_at, updated_at, last_seen_at'
    )
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as AdminProfile[]
}
