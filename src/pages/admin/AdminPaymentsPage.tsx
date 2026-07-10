import { useEffect, useMemo, useState } from 'react'
import { fetchPayments, type AdminPayment } from '../../lib/adminApi'
import { formatCurrency } from './AdminLayout'
import {
  AdminCard,
  AdminEmpty,
  AdminError,
  AdminPageHeader,
  formatAdminDate,
  isToday,
  NewBadge,
  PaymentStatusBadge,
  planLabel,
} from './adminUi'

export function AdminPaymentsPage() {
  const [rows, setRows] = useState<AdminPayment[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    fetchPayments()
      .then(setRows)
      .catch((e) => setError(e instanceof Error ? e.message : 'Erro ao carregar pagamentos.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return rows
    return rows.filter((r) => r.status === statusFilter)
  }, [rows, statusFilter])

  const stats = useMemo(() => {
    const today = rows.filter((r) => r.status === 'completed' && isToday(r.created_at))
    return {
      total: rows.filter((r) => r.status === 'completed').reduce((s, r) => s + r.amount, 0),
      today: today.reduce((s, r) => s + r.amount, 0),
      todayCount: today.length,
      failed: rows.filter((r) => r.status === 'failed').length,
      refunded: rows.filter((r) => r.status === 'refunded').length,
    }
  }, [rows])

  const filters = [
    { id: 'all', label: 'Todos' },
    { id: 'completed', label: 'Pagos' },
    { id: 'failed', label: 'Falhos' },
    { id: 'refunded', label: 'Reembolsos' },
    { id: 'disputed', label: 'Disputas' },
  ]

  if (loading) return <p className="text-neutral-500 text-sm py-8">Carregando pagamentos…</p>
  if (error) return <AdminError message={error} />

  return (
    <div className="space-y-6 animate-fade-in">
      <AdminPageHeader
        title="Pagamentos"
        subtitle="Compras, renovações, falhas e reembolsos registrados via Stripe"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
          <p className="text-[10px] text-emerald-400 uppercase">Receita (pagos)</p>
          <p className="text-lg font-black tabular-nums text-emerald-300">
            {formatCurrency(stats.total)}
          </p>
        </div>
        <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-3">
          <p className="text-[10px] text-sky-400 uppercase">Hoje</p>
          <p className="text-lg font-black tabular-nums text-sky-300">
            {formatCurrency(stats.today)}
          </p>
          <p className="text-[10px] text-neutral-500">{stats.todayCount} pagamento(s)</p>
        </div>
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3">
          <p className="text-[10px] text-red-400 uppercase">Falhas</p>
          <p className="text-lg font-black tabular-nums text-red-300">{stats.failed}</p>
        </div>
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
          <p className="text-[10px] text-amber-400 uppercase">Reembolsos</p>
          <p className="text-lg font-black tabular-nums text-amber-300">{stats.refunded}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 rounded-xl border border-neutral-800 p-1 bg-neutral-950 w-fit">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setStatusFilter(f.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === f.id ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <AdminCard>
        {filtered.length === 0 ? (
          <AdminEmpty message="Nenhum pagamento neste filtro." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-neutral-500 text-left border-b border-neutral-800">
                  <th className="px-4 py-2.5 font-medium">Usuário</th>
                  <th className="px-4 py-2.5 font-medium">Evento</th>
                  <th className="px-4 py-2.5 font-medium">Plano</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium">Valor</th>
                  <th className="px-4 py-2.5 font-medium">Data</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-neutral-800/60 last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium truncate max-w-[130px]">
                        {p.name || '—'}
                        {isToday(p.created_at) && p.status === 'completed' && <NewBadge />}
                      </p>
                      <p className="text-neutral-500 text-xs truncate max-w-[130px]">{p.email}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-neutral-400 max-w-[120px] truncate">
                      {p.event_type?.replace('invoice.', '').replace('checkout.session.', 'checkout.') ??
                        '—'}
                    </td>
                    <td className="px-4 py-3 text-neutral-300">{planLabel(p.plan_type)}</td>
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
      </AdminCard>
    </div>
  )
}
