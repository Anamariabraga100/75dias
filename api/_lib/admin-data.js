const { getSupabaseAdmin } = require('./supabase-admin')

function startOfTodayIso() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

async function fetchDashboardStats() {
  const client = getSupabaseAdmin()
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
  let profileMap = new Map()
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

async function fetchSubscribers() {
  const client = getSupabaseAdmin()
  const { data, error } = await client
    .from('profiles')
    .select(
      'user_id, email, name, avatar_url, selected_plan, payment_complete, onboarding_complete, challenge_id, challenge_accepted, current_day, invested_days, photos_count, created_at, updated_at, last_seen_at'
    )
    .eq('payment_complete', true)
    .order('last_seen_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

async function fetchAllUsers() {
  const client = getSupabaseAdmin()
  const { data, error } = await client
    .from('profiles')
    .select(
      'user_id, email, name, avatar_url, selected_plan, payment_complete, onboarding_complete, challenge_id, challenge_accepted, current_day, invested_days, photos_count, created_at, updated_at, last_seen_at'
    )
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

module.exports = { fetchDashboardStats, fetchSubscribers, fetchAllUsers }
