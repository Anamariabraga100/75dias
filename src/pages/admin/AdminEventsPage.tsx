import { useEffect, useMemo, useState } from 'react'
import { fetchStripeEvents, type AdminStripeEvent } from '../../lib/adminApi'
import { formatCurrency } from './AdminLayout'
import {
  AdminCard,
  AdminEmpty,
  AdminError,
  AdminPageHeader,
  EventIcon,
  EventStatusBadge,
  formatAdminDate,
  isToday,
  NewBadge,
} from './adminUi'

const CATEGORY_FILTERS = [
  { id: 'all', label: 'Todos' },
  { id: 'checkout', label: 'Checkout' },
  { id: 'payment', label: 'Pagamentos' },
  { id: 'subscription', label: 'Assinaturas' },
  { id: 'refund', label: 'Reembolsos' },
  { id: 'dispute', label: 'Disputas' },
]

export function AdminEventsPage() {
  const [rows, setRows] = useState<AdminStripeEvent[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('all')

  useEffect(() => {
    fetchStripeEvents()
      .then(setRows)
      .catch((e) => setError(e instanceof Error ? e.message : 'Erro ao carregar eventos.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    if (category === 'all') return rows
    return rows.filter((r) => r.category === category)
  }, [rows, category])

  const todayCount = useMemo(() => rows.filter((r) => isToday(r.created_at)).length, [rows])

  if (loading) return <p className="text-neutral-500 text-sm py-8">Carregando eventos…</p>
  if (error) return <AdminError message={error} />

  return (
    <div className="space-y-6 animate-fade-in">
      <AdminPageHeader
        title="Eventos Stripe"
        subtitle="Timeline de webhooks — compras, renovações, falhas, cancelamentos e disputas"
      />

      <div className="grid grid-cols-2 gap-3 max-w-md">
        <div className="rounded-xl border border-neutral-800 bg-neutral-950/50 p-3 text-center">
          <p className="text-[10px] text-neutral-500 uppercase">Total registrado</p>
          <p className="text-xl font-black tabular-nums">{rows.length}</p>
        </div>
        <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-3 text-center">
          <p className="text-[10px] text-sky-400 uppercase">Hoje</p>
          <p className="text-xl font-black tabular-nums text-sky-300">{todayCount}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 rounded-xl border border-neutral-800 p-1 bg-neutral-950">
        {CATEGORY_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setCategory(f.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              category === f.id ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <AdminCard>
        {filtered.length === 0 ? (
          <AdminEmpty message="Nenhum evento nesta categoria. Dispare um teste no Stripe Dashboard." />
        ) : (
          <ul className="divide-y divide-neutral-800/80">
            {filtered.map((e) => (
              <li key={e.id} className="px-4 py-4 flex gap-3 hover:bg-neutral-900/30 transition-colors">
                <EventIcon eventType={e.event_type} category={e.category} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-sm">{e.title}</p>
                        {isToday(e.created_at) && <NewBadge />}
                        <EventStatusBadge status={e.status} />
                      </div>
                      <p className="text-neutral-400 text-xs mt-1 leading-relaxed">{e.description}</p>
                    </div>
                    {e.amount != null && (
                      <p className="font-bold text-sm tabular-nums shrink-0">
                        {formatCurrency(e.amount)}
                      </p>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-neutral-600">
                    <span>{formatAdminDate(e.created_at)}</span>
                    {e.name && <span>{e.name}</span>}
                    {e.email && <span className="truncate max-w-[180px]">{e.email}</span>}
                    <span className="font-mono text-neutral-700">{e.event_type}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </AdminCard>
    </div>
  )
}
