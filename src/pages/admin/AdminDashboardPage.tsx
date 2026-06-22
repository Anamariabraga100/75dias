import { useEffect, useState } from 'react'
import { fetchDashboardStats, type DashboardStats } from '../../lib/adminApi'
import { StatCard, formatCurrency } from './AdminLayout'

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
      .then(setStats)
      .catch((e) => setError(e instanceof Error ? e.message : 'Erro ao carregar dashboard.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <p className="text-neutral-500 text-sm py-8">Carregando dashboard…</p>
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-900/50 bg-red-950/20 p-5 text-red-300 text-sm">
        {error}
        <p className="text-neutral-500 text-xs mt-2">
          Confira se rodou a migration SQL no Supabase e se sua conta tem is_admin = true.
        </p>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold mb-1">Dashboard</h2>
        <p className="text-neutral-500 text-sm">Visão geral de hoje e do negócio</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Vendas hoje"
          value={formatCurrency(stats.salesToday)}
          hint={`${stats.salesTodayCount} pagamento(s)`}
          accent="green"
        />
        <StatCard
          label="Novos usuários hoje"
          value={String(stats.newUsersToday)}
          hint="Cadastros no app"
          accent="blue"
        />
        <StatCard
          label="Assinantes"
          value={String(stats.totalSubscribers)}
          hint="Pagamento confirmado"
          accent="purple"
        />
        <StatCard
          label="Receita total"
          value={formatCurrency(stats.totalRevenue)}
          hint={`${stats.totalUsers} usuários`}
          accent="orange"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <StatCard
          label="Fotos de evolução hoje"
          value={String(stats.photosToday)}
          hint="Registros no espelho"
          accent="blue"
        />
        <StatCard
          label="Taxa de conversão"
          value={
            stats.totalUsers > 0
              ? `${Math.round((stats.totalSubscribers / stats.totalUsers) * 100)}%`
              : '—'
          }
          hint="Assinantes / usuários"
          accent="green"
        />
      </div>

      <section className="rounded-2xl border border-neutral-800 bg-neutral-950/50 overflow-hidden">
        <div className="px-4 py-3 border-b border-neutral-800">
          <h3 className="font-bold text-sm">Últimos pagamentos</h3>
        </div>
        {stats.recentPayments.length === 0 ? (
          <p className="px-4 py-8 text-neutral-500 text-sm text-center">Nenhum pagamento registrado ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-neutral-500 text-left border-b border-neutral-800">
                  <th className="px-4 py-2.5 font-medium">Usuário</th>
                  <th className="px-4 py-2.5 font-medium">Plano</th>
                  <th className="px-4 py-2.5 font-medium">Valor</th>
                  <th className="px-4 py-2.5 font-medium">Quando</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentPayments.map((p) => (
                  <tr key={p.id} className="border-b border-neutral-800/60 last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium truncate max-w-[140px]">{p.name || '—'}</p>
                      <p className="text-neutral-500 text-xs truncate max-w-[140px]">{p.email}</p>
                    </td>
                    <td className="px-4 py-3 capitalize text-neutral-300">{p.plan_type}</td>
                    <td className="px-4 py-3 font-semibold tabular-nums">{formatCurrency(p.amount)}</td>
                    <td className="px-4 py-3 text-neutral-500 text-xs whitespace-nowrap">
                      {formatDate(p.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
