import { useState } from 'react'
import { CalendarClock, CreditCard, ShieldCheck } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import {
  formatDaysRemainingLabel,
  getSubscriptionSummary,
} from '../../lib/subscriptionDisplay'
import { openBillingPortal } from '../../lib/subscriptionSync'

type SubscriptionPlanCardProps = {
  variant?: 'compact' | 'full'
  onManageClick?: () => void
}

const toneClasses = {
  active: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  danger: 'border-red-500/30 bg-red-500/10 text-red-300',
  muted: 'border-neutral-700 bg-neutral-900/50 text-neutral-400',
}

export function SubscriptionPlanCard({ variant = 'full', onManageClick }: SubscriptionPlanCardProps) {
  const {
    selectedPlan,
    usePromoOffer,
    subscriptionStatus,
    paymentComplete,
    subscriptionPeriodEnd,
    subscriptionCancelAtPeriodEnd,
  } = useAppStore()
  const [loadingPortal, setLoadingPortal] = useState(false)

  const summary = getSubscriptionSummary({
    selectedPlan,
    usePromoOffer,
    subscriptionStatus,
    paymentComplete,
    periodEnd: subscriptionPeriodEnd,
    cancelAtPeriodEnd: subscriptionCancelAtPeriodEnd,
  })

  const daysLabel = formatDaysRemainingLabel(summary.daysRemaining)

  const handleManage = async () => {
    if (onManageClick) {
      onManageClick()
      return
    }
    setLoadingPortal(true)
    try {
      await openBillingPortal()
    } catch {
      setLoadingPortal(false)
    }
  }

  if (variant === 'compact') {
    return (
      <div className="px-4 py-2.5 border-b border-neutral-800">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-widest text-neutral-500">Assinatura</p>
              <p className="font-bold text-sm text-white truncate">{summary.planLabel}</p>
            </div>
            <span
              className={`shrink-0 text-[10px] font-bold uppercase px-2 py-1 rounded-full border ${toneClasses[summary.statusTone]}`}
            >
              {summary.statusLabel}
            </span>
          </div>

          <p className="text-xs font-semibold text-neutral-200 leading-snug">{summary.headline}</p>
          {summary.detailLine && (
            <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">{summary.detailLine}</p>
          )}

          {daysLabel && summary.hasPaidAccess && !subscriptionCancelAtPeriodEnd && (
            <p className="text-[11px] text-sky-300/80 mt-2 tabular-nums">{daysLabel} para renovar</p>
          )}

          {summary.showManageButton && (
            <button
              type="button"
              onClick={handleManage}
              disabled={loadingPortal}
              className="mt-2.5 w-full py-2 rounded-lg text-[11px] font-semibold border border-neutral-700 text-neutral-300 hover:bg-neutral-800 transition-colors disabled:opacity-60"
            >
              {loadingPortal ? 'Abrindo...' : 'Gerenciar assinatura'}
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
            <ShieldCheck size={18} className="text-sky-300" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-widest text-neutral-500">Sua assinatura</p>
            <p className="font-bold text-white truncate">{summary.planLabel}</p>
          </div>
        </div>
        <span
          className={`shrink-0 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${toneClasses[summary.statusTone]}`}
        >
          {summary.statusLabel}
        </span>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-start gap-2">
          <CalendarClock size={14} className="text-neutral-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-neutral-100">{summary.headline}</p>
            {summary.detailLine && (
              <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">{summary.detailLine}</p>
            )}
          </div>
        </div>

        <div className="flex items-start gap-2">
          <CreditCard size={14} className="text-neutral-500 shrink-0 mt-0.5" />
          <p className="text-xs text-neutral-400 leading-relaxed">{summary.billingLabel}</p>
        </div>
      </div>

      {summary.periodEndFormatted && (
        <div className="rounded-xl bg-black/30 border border-neutral-800 px-3 py-2 mb-3">
          <p className="text-[10px] uppercase tracking-widest text-neutral-600">
            {subscriptionCancelAtPeriodEnd ? 'Acesso até' : 'Próxima renovação'}
          </p>
          <p className="text-sm font-bold text-white mt-0.5">{summary.periodEndFormatted}</p>
          {daysLabel && (
            <p className="text-xs text-sky-300/80 mt-0.5 tabular-nums">
              {subscriptionCancelAtPeriodEnd ? `${daysLabel} restantes` : `${daysLabel} para renovar`}
            </p>
          )}
        </div>
      )}

      {summary.showManageButton && (
        <button
          type="button"
          onClick={handleManage}
          disabled={loadingPortal}
          className="w-full py-2.5 rounded-xl text-sm font-semibold border border-neutral-700 text-neutral-200 hover:bg-neutral-800 transition-colors disabled:opacity-60"
        >
          {loadingPortal ? 'Abrindo portal...' : 'Gerenciar assinatura'}
        </button>
      )}
    </section>
  )
}
