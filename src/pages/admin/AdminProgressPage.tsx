import { useEffect, useState } from 'react'
import { Camera, Flame, Trophy, X, Zap } from 'lucide-react'
import {
  fetchEngagementLeaderboard,
  fetchUserPhotos,
  type AdminEngagementData,
  type AdminLeaderboardProfile,
  type AdminUserPhotosData,
} from '../../lib/adminApi'
import { UserAvatar } from '../../components/ui/UserAvatar'
import { LEVEL_META } from '../../components/ui/ChallengeLevelCard'
import type { ChallengeId } from '../../store/useAppStore'
import { formatAdminDateShort, AdminCard, AdminError } from './adminUi'

type LeaderboardTab = 'invested' | 'xp' | 'photos'

function formatXp(value: number) {
  return value.toLocaleString('pt-BR')
}

function levelLabel(challengeId: string | null) {
  if (!challengeId || !(challengeId in LEVEL_META)) return '—'
  return LEVEL_META[challengeId as ChallengeId].label
}

function LeaderboardRow({
  rank,
  user,
  metric,
  metricLabel,
  onSelect,
}: {
  rank: number
  user: AdminLeaderboardProfile
  metric: number
  metricLabel: string
  onSelect: () => void
}) {
  const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}.`

  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-neutral-900/80 transition-colors text-left"
    >
      <span className="w-7 text-center text-sm font-bold text-neutral-500 shrink-0">{medal}</span>
      <UserAvatar name={user.name ?? ''} avatarUrl={user.avatar_url} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">{user.name || 'Sem nome'}</p>
        <p className="text-neutral-500 text-xs truncate">
          {levelLabel(user.challenge_id)} · Dia {user.current_day}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="font-black tabular-nums text-white">{metric}</p>
        <p className="text-[10px] text-neutral-500 uppercase">{metricLabel}</p>
      </div>
    </button>
  )
}

function UserPhotoDrawer({
  userId,
  onClose,
}: {
  userId: string
  onClose: () => void
}) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<AdminLeaderboardProfile | null>(null)
  const [photos, setPhotos] = useState<AdminUserPhotosData['photos']>([])

  useEffect(() => {
    fetchUserPhotos(userId)
      .then((data) => {
        setProfile(data.profile)
        setPhotos(data.photos)
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Erro ao carregar fotos.'))
      .finally(() => setLoading(false))
  }, [userId])

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" className="absolute inset-0 bg-black/70" onClick={onClose} aria-label="Fechar" />
      <aside className="relative w-full max-w-md h-full bg-[#111] border-l border-neutral-800 overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-4 border-b border-neutral-800 bg-[#111]/95 backdrop-blur">
          <div className="flex items-center gap-3 min-w-0">
            {profile && <UserAvatar name={profile.name ?? ''} avatarUrl={profile.avatar_url} size="md" />}
            <div className="min-w-0">
              <p className="font-bold truncate">{profile?.name || 'Usuário'}</p>
              <p className="text-neutral-500 text-xs truncate">{profile?.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-neutral-900 flex items-center justify-center text-neutral-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {profile && (
          <div className="grid grid-cols-3 gap-2 p-4 border-b border-neutral-800/80">
            <div className="rounded-xl bg-neutral-900/80 p-3 text-center">
              <p className="text-[10px] text-neutral-500 uppercase">Investida</p>
              <p className="text-lg font-black text-accent-orange tabular-nums">{profile.invested_days}</p>
            </div>
            <div className="rounded-xl bg-neutral-900/80 p-3 text-center">
              <p className="text-[10px] text-neutral-500 uppercase">XP</p>
              <p className="text-lg font-black text-amber-400 tabular-nums">{formatXp(profile.total_xp)}</p>
            </div>
            <div className="rounded-xl bg-neutral-900/80 p-3 text-center">
              <p className="text-[10px] text-neutral-500 uppercase">Fotos</p>
              <p className="text-lg font-black tabular-nums">{profile.photos_count}</p>
            </div>
          </div>
        )}

        <div className="p-4">
          {loading && <p className="text-neutral-500 text-sm">Carregando fotos…</p>}
          {error && <AdminError message={error} />}
          {!loading && !error && photos.length === 0 && (
            <p className="text-neutral-500 text-sm text-center py-8">Nenhuma foto de progresso enviada.</p>
          )}
          <div className="grid grid-cols-2 gap-3">
            {photos.map((photo) => (
              <a
                key={photo.id}
                href={photo.photo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900"
              >
                <div className="aspect-[3/4] bg-neutral-950">
                  <img
                    src={photo.photo_url}
                    alt={`Dia ${photo.day}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="px-2.5 py-2 flex items-center justify-between">
                  <span className="text-xs font-bold">Dia {photo.day}</span>
                  <span className="text-[10px] text-neutral-500">{formatAdminDateShort(photo.created_at)}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </aside>
    </div>
  )
}

export function AdminProgressPage() {
  const [data, setData] = useState<AdminEngagementData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<LeaderboardTab>('invested')
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  useEffect(() => {
    fetchEngagementLeaderboard()
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Erro ao carregar progresso.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <p className="text-neutral-500 text-sm py-8">Carregando rankings…</p>
  }

  if (error || !data) {
    return <AdminError message={error ?? 'Dados indisponíveis.'} />
  }

  const tabs: { id: LeaderboardTab; label: string; icon: typeof Flame }[] = [
    { id: 'invested', label: 'Investida', icon: Flame },
    { id: 'xp', label: 'XP', icon: Zap },
    { id: 'photos', label: 'Fotos', icon: Camera },
  ]

  const currentList =
    tab === 'invested' ? data.topInvested : tab === 'xp' ? data.topXp : data.topPhotos

  const metricForTab = (user: AdminLeaderboardProfile) => {
    if (tab === 'invested') return { value: user.invested_days, label: 'dias' }
    if (tab === 'xp') return { value: user.total_xp, label: 'xp' }
    return { value: user.photos_count, label: 'fotos' }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold mb-1">Progresso dos usuários</h2>
        <p className="text-neutral-500 text-sm">
          Rankings de investida, XP e fotos de evolução
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <AdminCard className="lg:col-span-1">
          <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={16} className="text-amber-400" />
            <h3 className="font-bold text-sm">Top usuários</h3>
          </div>

          <div className="flex gap-1 mb-3 p-1 rounded-xl bg-neutral-900">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  tab === id ? 'bg-white text-black' : 'text-neutral-500 hover:text-white'
                }`}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>

          <div className="space-y-1">
            {currentList.length === 0 ? (
              <p className="text-neutral-500 text-sm text-center py-6">Sem dados ainda.</p>
            ) : (
              currentList.map((user, index) => {
                const metric = metricForTab(user)
                return (
                  <LeaderboardRow
                    key={user.user_id}
                    rank={index + 1}
                    user={user}
                    metric={metric.value}
                    metricLabel={metric.label}
                    onSelect={() => setSelectedUserId(user.user_id)}
                  />
                )
              })
            )}
          </div>
          </div>
        </AdminCard>

        <AdminCard className="lg:col-span-2">
          <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Camera size={16} className="text-sky-400" />
              <h3 className="font-bold text-sm">Fotos recentes de evolução</h3>
            </div>
            <span className="text-xs text-neutral-500">{data.recentPhotos.length} fotos</span>
          </div>

          {data.recentPhotos.length === 0 ? (
            <p className="text-neutral-500 text-sm text-center py-12">
              Nenhuma foto enviada ainda. Fotos aparecem quando usuários do nível Implacável fazem check-in.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {data.recentPhotos.map((photo) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setSelectedUserId(photo.user_id)}
                  className="group rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900 text-left hover:border-neutral-600 transition-colors"
                >
                  <div className="aspect-[3/4] bg-neutral-950 relative">
                    <img
                      src={photo.photo_url}
                      alt={`${photo.name ?? 'Usuário'} — dia ${photo.day}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 text-[10px] font-bold">
                      Dia {photo.day}
                    </div>
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-semibold truncate">{photo.name || 'Usuário'}</p>
                    <p className="text-[10px] text-neutral-500">{formatAdminDateShort(photo.created_at)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
          </div>
        </AdminCard>
      </div>

      {selectedUserId && (
        <UserPhotoDrawer userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
      )}
    </div>
  )
}
