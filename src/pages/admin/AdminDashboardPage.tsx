import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchDashboardStats, type DashboardStats } from '../../lib/adminApi'
import { StatCard, formatCurrency } from './AdminLayout'
import {
  AdminCard,
  AdminEmpty,
  AdminError,
  AdminPageHeader,
  EventIcon,
  EventStatusBadge,
  formatAdminDate,
  PaymentStatusBadge,
} from './adminUi'

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

  if (error) return <AdminError message={error} />
  if (!stats) return null

  return (
    <div className="space-y-6 animate-fade-in">
      <AdminPageHeader
        title="Dashboard"
        subtitle="Visão geral de hoje — vendas, usuários e eventos Stripe"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Vendas hoje"
          value={formatCurrency(stats.salesToday)}
          hint={`${stats.salesTodayCount} pagamento(s)`}
          accent="green"
        />
        <StatCard
          label="Novos clientes"
          value={String(stats.newClientsToday)}
          hint="Primeiras compras hoje"
          accent="blue"
        />
        <StatCard
          label="Novos usuários"
          value={String(stats.newUsersToday)}
          hint="Cadastros no app"
          accent="purple"
        />
        <StatCard
          label="Renovações hoje"
          value={String(stats.renewalsToday)}
          hint="Faturas pagas (recorrência)"
          accent="green"
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Receita total"
          value={formatCurrency(stats.totalRevenue)}
          hint={`${stats.totalSubscribers} assinantes`}
          accent="orange"
        />
        <StatCard
          label="Assinaturas ativas"
          value={String(stats.activeSubscriptions)}
          hint="Status active no Stripe"
          accent="green"
        />
        <StatCard
          label="Inadimplentes"
          value={String(stats.pastDueCount)}
          hint={`${stats.failedPaymentsToday} falha(s) hoje`}
          accent="orange"
        />
        <StatCard
          label="Eventos hoje"
          value={String(stats.eventsToday)}
          hint="Webhooks Stripe"
          accent="blue"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <AdminCard title="Últimos pagamentos">
          {stats.recentPayments.length === 0 ? (
            <AdminEmpty message="Nenhum pagamento registrado ainda." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-neutral-500 text-left border-b border-neutral-800">
                    <th className="px-4 py-2.5 font-medium">Usuário</th>
                    <th className="px-4 py-2.5 font-medium">Status</th>
                    <th className="px-4 py-2.5 font-medium">Valor</th>
                    <th className="px-4 py-2.5 font-medium">Quando</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentPayments.map((p) => (
                    <tr key={p.id} className="border-b border-neutral-800/60 last:border-0">
                      <td className="px-4 py-3">
                        <p className="font-medium truncate max-w-[120px]">{p.name || '—'}</p>
                        <p className="text-neutral-500 text-xs truncate max-w-[120px]">{p.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <PaymentStatusBadge status={p.status} />
                      </td>
                      <td className="px-4 py-3 font-semibold tabular-nums">
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="px-4 py-3 text-neutral-500 text-xs whitespace-nowrap">
                        {formatAdminDate(p.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="px-4 py-3 border-t border-neutral-800">
            <Link
              to="/admin/pagamentos"
              className="text-xs font-semibold text-sky-400 hover:text-sky-300"
            >
              Ver todos os pagamentos →
            </Link>
          </div>
        </AdminCard>

        <AdminCard title="Atividade Stripe">
          {stats.recentEvents.length === 0 ? (
            <AdminEmpty message="Nenhum evento ainda. Configure o webhook no Stripe." />
          ) : (
            <ul className="divide-y divide-neutral-800/80">
              {stats.recentEvents.map((e) => (
                <li key={e.id} className="px-4 py-3 flex gap-3">
                  <EventIcon eventType={e.event_type} category={e.category} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm">{e.title}</p>
                      <EventStatusBadge status={e.status} />
                    </div>
                    <p className="text-neutral-500 text-xs mt-0.5 line-clamp-2">{e.description}</p>
                    <p className="text-neutral-600 text-[10px] mt-1">
                      {e.name || e.email || '—'} · {formatAdminDate(e.created_at)}
                      {e.amount != null && (
                        <span className="text-neutral-400"> · {formatCurrency(e.amount)}</span>
                      )}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="px-4 py-3 border-t border-neutral-800">
            <Link
              to="/admin/eventos"
              className="text-xs font-semibold text-sky-400 hover:text-sky-300"
            >
              Ver todos os eventos →
            </Link>
          </div>
        </AdminCard>
      </div>
    </div>
  )
}
