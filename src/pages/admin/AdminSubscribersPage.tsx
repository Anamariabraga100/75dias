import { useEffect, useMemo, useState } from 'react'
import { fetchSubscribers, type AdminProfile } from '../../lib/adminApi'
import { UserAvatar } from '../../components/ui/UserAvatar'
import { LEVEL_META } from '../../components/ui/ChallengeLevelCard'
import type { ChallengeId } from '../../store/useAppStore'
import { formatAdminDateShort, planLabel, SubscriptionStatusBadge } from './adminUi'

export function AdminSubscribersPage() {
  const [rows, setRows] = useState<AdminProfile[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  useEffect(() => {
    fetchSubscribers()
      .then(setRows)
      .catch((e) => setError(e instanceof Error ? e.message : 'Erro ao carregar assinantes.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter(
      (r) =>
        r.name?.toLowerCase().includes(q) ||
        r.email?.toLowerCase().includes(q) ||
        r.challenge_id?.toLowerCase().includes(q)
    )
  }, [rows, query])

  const totals = useMemo(
    () => ({
      invested: filtered.reduce((s, r) => s + r.invested_days, 0),
      photos: filtered.reduce((s, r) => s + r.photos_count, 0),
      active: filtered.filter((r) => r.challenge_accepted).length,
    }),
    [filtered]
  )

  if (loading) {
    return <p className="text-neutral-500 text-sm py-8">Carregando assinantes…</p>
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-900/50 bg-red-950/20 p-5 text-red-300 text-sm">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold mb-1">Assinantes</h2>
        <p className="text-neutral-500 text-sm">
          Usuários com pagamento confirmado — progresso e evolução
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-neutral-800 bg-neutral-950/50 p-3 text-center">
          <p className="text-[10px] text-neutral-500 uppercase">Assinantes</p>
          <p className="text-xl font-black tabular-nums">{filtered.length}</p>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-950/50 p-3 text-center">
          <p className="text-[10px] text-neutral-500 uppercase">Dias investidos (soma)</p>
          <p className="text-xl font-black tabular-nums">{totals.invested}</p>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-950/50 p-3 text-center">
          <p className="text-[10px] text-neutral-500 uppercase">Fotos enviadas</p>
          <p className="text-xl font-black tabular-nums">{totals.photos}</p>
        </div>
      </div>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar por nome, e-mail ou nível…"
        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-white/10 placeholder:text-neutral-600"
      />

      {filtered.length === 0 ? (
        <p className="text-neutral-500 text-sm text-center py-12">Nenhum assinante encontrado.</p>
      ) : (
        <div className="rounded-2xl border border-neutral-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="text-neutral-500 text-left bg-neutral-950/80 border-b border-neutral-800">
                  <th className="px-4 py-3 font-medium">Usuário</th>
                  <th className="px-4 py-3 font-medium">Plano</th>
                  <th className="px-4 py-3 font-medium">Stripe</th>
                  <th className="px-4 py-3 font-medium">Desafio</th>
                  <th className="px-4 py-3 font-medium">Dia</th>
                  <th className="px-4 py-3 font-medium">Investida</th>
                  <th className="px-4 py-3 font-medium">Fotos</th>
                  <th className="px-4 py-3 font-medium">Último acesso</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const level =
                    r.challenge_id && r.challenge_id in LEVEL_META
                      ? LEVEL_META[r.challenge_id as ChallengeId].label
                      : '—'
                  return (
                    <tr key={r.user_id} className="border-b border-neutral-800/60 last:border-0 hover:bg-neutral-900/40">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <UserAvatar name={r.name ?? ''} avatarUrl={r.avatar_url} size="sm" />
                          <div className="min-w-0">
                            <p className="font-medium truncate max-w-[120px]">{r.name || '—'}</p>
                            <p className="text-neutral-500 text-xs truncate max-w-[140px]">{r.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-neutral-300">{planLabel(r.selected_plan)}</td>
                      <td className="px-4 py-3">
                        <SubscriptionStatusBadge status={r.subscription_status || 'active'} />
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            r.challenge_accepted
                              ? 'bg-accent-green/15 text-accent-green'
                              : 'bg-neutral-800 text-neutral-500'
                          }`}
                        >
                          {r.challenge_accepted ? level : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-4 py-3 tabular-nums font-medium">{r.current_day}/90</td>
                      <td className="px-4 py-3 tabular-nums">
                        <span className="font-bold text-accent-orange">{r.invested_days}</span>
                        <span className="text-neutral-600 text-xs"> dias</span>
                      </td>
                      <td className="px-4 py-3 tabular-nums font-medium">{r.photos_count}</td>
                      <td className="px-4 py-3 text-neutral-500 text-xs whitespace-nowrap">
                        {formatAdminDateShort(r.last_seen_at)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
