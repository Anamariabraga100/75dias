import { useEffect, useMemo, useState } from 'react'
import { fetchAllUsers, type AdminProfile } from '../../lib/adminApi'
import { UserAvatar } from '../../components/ui/UserAvatar'
import {
  AdminCard,
  AdminEmpty,
  AdminError,
  AdminPageHeader,
  formatAdminDateShort,
  isToday,
  NewBadge,
  planLabel,
  SubscriptionStatusBadge,
} from './adminUi'

export function AdminUsersPage() {
  const [rows, setRows] = useState<AdminProfile[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'today'>('all')

  useEffect(() => {
    fetchAllUsers()
      .then(setRows)
      .catch((e) => setError(e instanceof Error ? e.message : 'Erro ao carregar usuários.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    let list = rows
    if (filter === 'today') {
      list = list.filter((r) => isToday(r.created_at))
    }
    const q = query.trim().toLowerCase()
    if (!q) return list
    return list.filter(
      (r) => r.name?.toLowerCase().includes(q) || r.email?.toLowerCase().includes(q)
    )
  }, [rows, query, filter])

  const newToday = useMemo(() => rows.filter((r) => isToday(r.created_at)).length, [rows])

  if (loading) return <p className="text-neutral-500 text-sm py-8">Carregando usuários…</p>
  if (error) return <AdminError message={error} />

  return (
    <div className="space-y-6 animate-fade-in">
      <AdminPageHeader
        title="Usuários"
        subtitle="Todos os cadastros — novos usuários e status de assinatura"
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-neutral-800 bg-neutral-950/50 p-3 text-center">
          <p className="text-[10px] text-neutral-500 uppercase">Total</p>
          <p className="text-xl font-black tabular-nums">{rows.length}</p>
        </div>
        <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-3 text-center">
          <p className="text-[10px] text-sky-400 uppercase">Novos hoje</p>
          <p className="text-xl font-black tabular-nums text-sky-300">{newToday}</p>
        </div>
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-center col-span-2 sm:col-span-1">
          <p className="text-[10px] text-emerald-400 uppercase">Com assinatura</p>
          <p className="text-xl font-black tabular-nums text-emerald-300">
            {rows.filter((r) => r.payment_complete).length}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nome ou e-mail…"
          className="flex-1 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2.5 text-sm placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600"
        />
        <div className="flex rounded-xl border border-neutral-800 p-1 bg-neutral-950">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'all' ? 'bg-white text-black' : 'text-neutral-400'
            }`}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => setFilter('today')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'today' ? 'bg-white text-black' : 'text-neutral-400'
            }`}
          >
            Novos hoje
          </button>
        </div>
      </div>

      <AdminCard>
        {filtered.length === 0 ? (
          <AdminEmpty message="Nenhum usuário encontrado." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-neutral-500 text-left border-b border-neutral-800">
                  <th className="px-4 py-2.5 font-medium">Usuário</th>
                  <th className="px-4 py-2.5 font-medium">Plano</th>
                  <th className="px-4 py-2.5 font-medium">Assinatura</th>
                  <th className="px-4 py-2.5 font-medium">Onboarding</th>
                  <th className="px-4 py-2.5 font-medium">Cadastro</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.user_id} className="border-b border-neutral-800/60 last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5 min-w-[160px]">
                        <UserAvatar name={r.name ?? ''} avatarUrl={r.avatar_url} size="sm" />
                        <div className="min-w-0">
                          <p className="font-medium truncate">
                            {r.name || '—'}
                            {isToday(r.created_at) && <NewBadge />}
                          </p>
                          <p className="text-neutral-500 text-xs truncate">{r.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-neutral-300">{planLabel(r.selected_plan)}</td>
                    <td className="px-4 py-3">
                      <SubscriptionStatusBadge
                        status={
                          r.payment_complete
                            ? r.subscription_status || 'active'
                            : r.subscription_status || 'inactive'
                        }
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-semibold ${
                          r.onboarding_complete ? 'text-emerald-400' : 'text-neutral-500'
                        }`}
                      >
                        {r.onboarding_complete ? 'Completo' : 'Pendente'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-500 text-xs whitespace-nowrap">
                      {formatAdminDateShort(r.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    </div>
  )
}
