const { getSupabaseAdmin } = require('./supabase-admin')

function startOfTodayIso() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

const PROFILE_FIELDS =
  'user_id, email, name, avatar_url, selected_plan, payment_complete, subscription_status, stripe_customer_id, stripe_subscription_id, onboarding_complete, challenge_id, challenge_accepted, current_day, invested_days, photos_count, total_xp, created_at, updated_at, last_seen_at'

const PROFILE_FIELDS_BASIC =
  'user_id, email, name, avatar_url, challenge_id, challenge_accepted, current_day, invested_days, photos_count, total_xp, last_seen_at'

async function attachProfiles(items, userIdKey = 'user_id') {
  const userIds = [...new Set(items.map((p) => p[userIdKey]).filter(Boolean))]
  if (userIds.length === 0) return items

  const client = getSupabaseAdmin()
  const { data: profs } = await client
    .from('profiles')
    .select('user_id, email, name, avatar_url, subscription_status, payment_complete')
    .in('user_id', userIds)

  const profileMap = new Map((profs ?? []).map((p) => [p.user_id, p]))

  return items.map((item) => ({
    ...item,
    profile: profileMap.get(item[userIdKey]) ?? null,
    email: profileMap.get(item[userIdKey])?.email ?? null,
    name: profileMap.get(item[userIdKey])?.name ?? null,
  }))
}

async function fetchDashboardStats() {
  const client = getSupabaseAdmin()
  const today = startOfTodayIso()

  const [
    paymentsTodayRes,
    paymentsAllRes,
    profilesRes,
    newTodayRes,
    photosTodayRes,
    recentPaymentsRes,
    eventsTodayRes,
    newClientsTodayRes,
    renewalsTodayRes,
    failedTodayRes,
    pastDueRes,
    activeSubsRes,
    recentEventsRes,
  ] = await Promise.all([
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
      .select('id, amount, plan_type, method, status, event_type, created_at, user_id')
      .order('created_at', { ascending: false })
      .limit(8),
    client
      .from('stripe_events')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', today),
    client
      .from('stripe_events')
      .select('id', { count: 'exact', head: true })
      .eq('event_type', 'checkout.session.completed')
      .gte('created_at', today),
    client
      .from('stripe_events')
      .select('id', { count: 'exact', head: true })
      .eq('event_type', 'invoice.paid')
      .gte('created_at', today),
    client
      .from('stripe_events')
      .select('id', { count: 'exact', head: true })
      .eq('event_type', 'invoice.payment_failed')
      .gte('created_at', today),
    client
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_status', 'past_due'),
    client
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_status', 'active'),
    client
      .from('stripe_events')
      .select(
        'id, event_type, category, title, description, amount, status, user_id, created_at'
      )
      .order('created_at', { ascending: false })
      .limit(12),
  ])

  const salesToday = (paymentsTodayRes.data ?? []).reduce((s, p) => s + Number(p.amount), 0)
  const totalRevenue = (paymentsAllRes.data ?? []).reduce((s, p) => s + Number(p.amount), 0)

  const { count: subscribers } = await client
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('payment_complete', true)

  const recentPayments = await attachProfiles(recentPaymentsRes.data ?? [])
  const recentEvents = await attachProfiles(recentEventsRes.data ?? [])

  return {
    salesToday,
    salesTodayCount: paymentsTodayRes.data?.length ?? 0,
    newUsersToday: newTodayRes.count ?? 0,
    newClientsToday: newClientsTodayRes.count ?? 0,
    renewalsToday: Math.max(0, (renewalsTodayRes.count ?? 0) - (newClientsTodayRes.count ?? 0)),
    failedPaymentsToday: failedTodayRes.count ?? 0,
    pastDueCount: pastDueRes.count ?? 0,
    activeSubscriptions: activeSubsRes.count ?? 0,
    eventsToday: eventsTodayRes.count ?? 0,
    totalSubscribers: subscribers ?? 0,
    totalRevenue,
    totalUsers: profilesRes.count ?? 0,
    photosToday: photosTodayRes.count ?? 0,
    recentPayments: recentPayments.map((p) => ({
      id: p.id,
      amount: Number(p.amount),
      plan_type: p.plan_type,
      method: p.method,
      status: p.status,
      event_type: p.event_type,
      created_at: p.created_at,
      email: p.email,
      name: p.name,
    })),
    recentEvents: recentEvents.map((e) => ({
      id: e.id,
      event_type: e.event_type,
      category: e.category,
      title: e.title,
      description: e.description,
      amount: e.amount != null ? Number(e.amount) : null,
      status: e.status,
      created_at: e.created_at,
      email: e.email,
      name: e.name,
    })),
  }
}

async function fetchSubscribers() {
  const client = getSupabaseAdmin()
  const { data, error } = await client
    .from('profiles')
    .select(PROFILE_FIELDS)
    .eq('payment_complete', true)
    .order('last_seen_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map(normalizeProfile)
}

async function fetchAllUsers() {
  const client = getSupabaseAdmin()
  const { data, error } = await client
    .from('profiles')
    .select(PROFILE_FIELDS)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map(normalizeProfile)
}

function normalizeProfile(row) {
  return {
    ...row,
    invested_days: Number(row.invested_days ?? 0),
    photos_count: Number(row.photos_count ?? 0),
    total_xp: Number(row.total_xp ?? 0),
    current_day: Number(row.current_day ?? 1),
  }
}

async function fetchEngagementLeaderboard() {
  const client = getSupabaseAdmin()

  const [topInvested, topXp, topPhotos, recentPhotosRes] = await Promise.all([
    client
      .from('profiles')
      .select(PROFILE_FIELDS_BASIC)
      .gt('invested_days', 0)
      .order('invested_days', { ascending: false })
      .limit(15),
    client
      .from('profiles')
      .select(PROFILE_FIELDS_BASIC)
      .gt('total_xp', 0)
      .order('total_xp', { ascending: false })
      .limit(15),
    client
      .from('profiles')
      .select(PROFILE_FIELDS_BASIC)
      .gt('photos_count', 0)
      .order('photos_count', { ascending: false })
      .limit(15),
    client
      .from('mirror_photo_logs')
      .select('id, user_id, day, photo_url, created_at')
      .not('photo_url', 'is', null)
      .order('created_at', { ascending: false })
      .limit(60),
  ])

  if (topInvested.error) throw topInvested.error
  if (topXp.error) throw topXp.error
  if (topPhotos.error) throw topPhotos.error
  if (recentPhotosRes.error) throw recentPhotosRes.error

  const recentPhotos = await attachProfiles(recentPhotosRes.data ?? [])

  return {
    topInvested: (topInvested.data ?? []).map(normalizeProfile),
    topXp: (topXp.data ?? []).map(normalizeProfile),
    topPhotos: (topPhotos.data ?? []).map(normalizeProfile),
    recentPhotos: recentPhotos.map((p) => ({
      id: p.id,
      user_id: p.user_id,
      day: Number(p.day),
      photo_url: p.photo_url,
      created_at: p.created_at,
      name: p.name,
      email: p.email,
      avatar_url: p.profile?.avatar_url ?? null,
    })),
  }
}

async function fetchUserPhotos(userId) {
  const client = getSupabaseAdmin()

  const [profileRes, photosRes] = await Promise.all([
    client.from('profiles').select(PROFILE_FIELDS_BASIC).eq('user_id', userId).maybeSingle(),
    client
      .from('mirror_photo_logs')
      .select('id, user_id, day, photo_url, created_at')
      .eq('user_id', userId)
      .not('photo_url', 'is', null)
      .order('day', { ascending: true }),
  ])

  if (profileRes.error) throw profileRes.error
  if (photosRes.error) throw photosRes.error

  return {
    profile: profileRes.data ? normalizeProfile(profileRes.data) : null,
    photos: (photosRes.data ?? []).map((p) => ({
      id: p.id,
      user_id: p.user_id,
      day: Number(p.day),
      photo_url: p.photo_url,
      created_at: p.created_at,
    })),
  }
}

async function fetchPayments(limit = 50) {
  const client = getSupabaseAdmin()
  const { data, error } = await client
    .from('payments')
    .select(
      'id, amount, plan_type, method, status, event_type, stripe_invoice_id, stripe_session_id, created_at, user_id'
    )
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  const withProfiles = await attachProfiles(data ?? [])
  return withProfiles.map((p) => ({
    ...p,
    amount: Number(p.amount),
  }))
}

async function fetchStripeEvents(limit = 50) {
  const client = getSupabaseAdmin()
  const { data, error } = await client
    .from('stripe_events')
    .select(
      'id, stripe_event_id, event_type, category, title, description, amount, currency, status, stripe_customer_id, stripe_subscription_id, stripe_invoice_id, created_at, user_id'
    )
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return attachProfiles(data ?? [])
}

module.exports = {
  fetchDashboardStats,
  fetchSubscribers,
  fetchAllUsers,
  fetchPayments,
  fetchStripeEvents,
  fetchEngagementLeaderboard,
  fetchUserPhotos,
}
