import type { ReactNode } from 'react'
import {
  CheckCircle2,
  CreditCard,
  RefreshCw,
  UserPlus,
  XCircle,
  AlertTriangle,
  PauseCircle,
  RotateCcw,
  ShieldAlert,
  ShoppingCart,
  type LucideIcon,
} from 'lucide-react'

export function formatAdminDate(iso: string, withYear = false) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    ...(withYear ? { year: '2-digit' } : {}),
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatAdminDateShort(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  })
}

export function planLabel(plan: string | null) {
  if (plan === 'quarterly') return 'Trimestral'
  if (plan === 'monthly') return 'Mensal'
  return '—'
}

const PAYMENT_STATUS: Record<string, { label: string; className: string }> = {
  completed: { label: 'Pago', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  failed: { label: 'Falhou', className: 'bg-red-500/15 text-red-400 border-red-500/30' },
  refunded: { label: 'Reembolsado', className: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  disputed: { label: 'Disputa', className: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
  pending: { label: 'Pendente', className: 'bg-neutral-500/15 text-neutral-400 border-neutral-500/30' },
}

const SUB_STATUS: Record<string, { label: string; className: string }> = {
  active: { label: 'Ativo', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  past_due: { label: 'Inadimplente', className: 'bg-red-500/15 text-red-400 border-red-500/30' },
  canceled: { label: 'Cancelado', className: 'bg-neutral-500/15 text-neutral-400 border-neutral-500/30' },
  paused: { label: 'Pausado', className: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  inactive: { label: 'Inativo', className: 'bg-neutral-500/15 text-neutral-500 border-neutral-500/30' },
}

const EVENT_STATUS: Record<string, { className: string }> = {
  success: { className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  error: { className: 'bg-red-500/15 text-red-400 border-red-500/30' },
  warning: { className: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  info: { className: 'bg-sky-500/15 text-sky-400 border-sky-500/30' },
}

const EVENT_ICONS: Record<string, LucideIcon> = {
  checkout: ShoppingCart,
  payment: CreditCard,
  subscription: RefreshCw,
  refund: RotateCcw,
  dispute: ShieldAlert,
  billing: CreditCard,
}

const EVENT_TYPE_ICONS: Record<string, LucideIcon> = {
  'checkout.session.completed': ShoppingCart,
  'invoice.paid': CheckCircle2,
  'invoice.payment_failed': XCircle,
  'customer.subscription.created': UserPlus,
  'customer.subscription.updated': RefreshCw,
  'customer.subscription.deleted': XCircle,
  'customer.subscription.paused': PauseCircle,
  'customer.subscription.resumed': CheckCircle2,
  'charge.refunded': RotateCcw,
  'charge.dispute.created': ShieldAlert,
  'charge.dispute.closed': AlertTriangle,
}

export function PaymentStatusBadge({ status }: { status: string }) {
  const meta = PAYMENT_STATUS[status] ?? PAYMENT_STATUS.pending
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${meta.className}`}
    >
      {meta.label}
    </span>
  )
}

export function SubscriptionStatusBadge({ status }: { status: string | null }) {
  const meta = SUB_STATUS[status ?? 'inactive'] ?? SUB_STATUS.inactive
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${meta.className}`}
    >
      {meta.label}
    </span>
  )
}

export function EventStatusBadge({ status }: { status: string }) {
  const meta = EVENT_STATUS[status] ?? EVENT_STATUS.info
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${meta.className}`}
    >
      {status === 'success' ? 'OK' : status === 'error' ? 'Erro' : status === 'warning' ? 'Alerta' : 'Info'}
    </span>
  )
}

export function EventIcon({ eventType, category }: { eventType: string; category?: string }) {
  const Icon = EVENT_TYPE_ICONS[eventType] ?? EVENT_ICONS[category ?? 'billing'] ?? CreditCard
  return (
    <div className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0">
      <Icon size={16} className="text-neutral-300" />
    </div>
  )
}

export function AdminPageHeader({
  title,
  subtitle,
}: {
  title: string
  subtitle: string
}) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-1">{title}</h2>
      <p className="text-neutral-500 text-sm">{subtitle}</p>
    </div>
  )
}

export function AdminCard({
  title,
  children,
  className = '',
}: {
  title?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={`rounded-2xl border border-neutral-800 bg-neutral-950/50 overflow-hidden ${className}`}
    >
      {title && (
        <div className="px-4 py-3 border-b border-neutral-800">
          <h3 className="font-bold text-sm">{title}</h3>
        </div>
      )}
      {children}
    </section>
  )
}

export function AdminEmpty({ message }: { message: string }) {
  return <p className="px-4 py-10 text-neutral-500 text-sm text-center">{message}</p>
}

export function AdminError({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-red-900/50 bg-red-950/20 p-5 text-red-300 text-sm">
      {message}
      <p className="text-neutral-500 text-xs mt-2">
        Rode a migration 005_stripe_events.sql no Supabase e confira SUPABASE_SERVICE_ROLE_KEY na Vercel.
      </p>
    </div>
  )
}

export function isToday(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  )
}

export function NewBadge() {
  return (
    <span className="ml-1.5 inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-sky-500/20 text-sky-400 border border-sky-500/30">
      Novo
    </span>
  )
}
