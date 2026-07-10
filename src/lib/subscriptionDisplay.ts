import type { PlanType } from '../store/useAppStore'
import type { SubscriptionStatus } from './subscription'
import { PRICING, getPlanDisplayLabel } from './pricing'
import { hasActiveAccess } from './subscription'

export type SubscriptionPlanInfo = {
  selectedPlan: PlanType
  usePromoOffer: boolean
  subscriptionStatus: SubscriptionStatus | null
  paymentComplete: boolean
  periodEnd: string | null
  cancelAtPeriodEnd: boolean
}

export type SubscriptionSummary = {
  planLabel: string
  billingLabel: string
  statusLabel: string
  statusTone: 'active' | 'warning' | 'danger' | 'muted'
  headline: string
  detailLine: string | null
  daysRemaining: number | null
  periodEndFormatted: string | null
  showManageButton: boolean
  hasPaidAccess: boolean
}

function formatPeriodEnd(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso))
}

export function daysUntil(iso: string | null): number | null {
  if (!iso) return null
  const end = new Date(iso)
  if (Number.isNaN(end.getTime())) return null
  const diff = end.getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

function getBillingLabel(plan: PlanType, usePromo: boolean): string {
  if (usePromo) {
    return `Cobrança trimestral de ${PRICING.promoQuarterly.displayTotal}`
  }
  if (plan === 'quarterly') {
    return `Cobrança trimestral de ${PRICING.quarterly.displayTotal}`
  }
  return `Cobrança mensal de ${PRICING.monthly.display}`
}

function getRenewalCycleLabel(plan: PlanType): string {
  return plan === 'monthly' ? 'Renovação mensal' : 'Renovação trimestral'
}

export function getSubscriptionSummary(info: SubscriptionPlanInfo): SubscriptionSummary {
  const planLabel = getPlanDisplayLabel(info.selectedPlan, info.usePromoOffer)
  const billingLabel = getBillingLabel(info.selectedPlan, info.usePromoOffer)
  const renewalCycle = getRenewalCycleLabel(info.selectedPlan)
  const hasPaidAccess = hasActiveAccess(info.subscriptionStatus, info.paymentComplete)
  const daysRemaining = daysUntil(info.periodEnd)
  const periodEndFormatted = info.periodEnd ? formatPeriodEnd(info.periodEnd) : null

  if (!hasPaidAccess) {
    return {
      planLabel,
      billingLabel,
      statusLabel: 'Inativo',
      statusTone: 'muted',
      headline: 'Sem assinatura ativa',
      detailLine: 'Assine um plano para acessar o Reset90.',
      daysRemaining,
      periodEndFormatted,
      showManageButton: false,
      hasPaidAccess: false,
    }
  }

  if (info.subscriptionStatus === 'past_due') {
    return {
      planLabel,
      billingLabel,
      statusLabel: 'Pagamento pendente',
      statusTone: 'warning',
      headline: 'Regularize o pagamento',
      detailLine: periodEndFormatted
        ? `Tentamos renovar em ${periodEndFormatted}. Atualize seu cartão para manter o acesso.`
        : 'Atualize seu método de pagamento para manter o acesso.',
      daysRemaining,
      periodEndFormatted,
      showManageButton: true,
      hasPaidAccess: false,
    }
  }

  if (info.subscriptionStatus === 'paused') {
    return {
      planLabel,
      billingLabel,
      statusLabel: 'Pausada',
      statusTone: 'warning',
      headline: 'Assinatura pausada',
      detailLine: periodEndFormatted
        ? `Seu acesso pode encerrar em ${periodEndFormatted}.`
        : 'Retome a assinatura para continuar no programa.',
      daysRemaining,
      periodEndFormatted,
      showManageButton: true,
      hasPaidAccess: false,
    }
  }

  if (info.subscriptionStatus === 'canceled') {
    return {
      planLabel,
      billingLabel,
      statusLabel: 'Encerrada',
      statusTone: 'danger',
      headline: 'Assinatura encerrada',
      detailLine: periodEndFormatted
        ? `O acesso terminou em ${periodEndFormatted}.`
        : 'Renove para voltar ao programa.',
      daysRemaining,
      periodEndFormatted,
      showManageButton: true,
      hasPaidAccess: false,
    }
  }

  if (info.cancelAtPeriodEnd) {
    const daysText =
      daysRemaining === null
        ? ''
        : daysRemaining === 0
          ? ' — encerra hoje'
          : daysRemaining === 1
            ? ' — falta 1 dia'
            : ` — faltam ${daysRemaining} dias`

    return {
      planLabel,
      billingLabel,
      statusLabel: 'Cancelada',
      statusTone: 'warning',
      headline: periodEndFormatted
        ? `Acesso até ${periodEndFormatted}${daysText}`
        : `Cancelamento agendado${daysText}`,
      detailLine: 'Você mantém o acesso até o fim do período já pago. Não haverá nova cobrança.',
      daysRemaining,
      periodEndFormatted,
      showManageButton: true,
      hasPaidAccess: true,
    }
  }

  const daysText =
    daysRemaining === null
      ? null
      : daysRemaining === 0
        ? 'Renova hoje'
        : daysRemaining === 1
          ? 'Renova amanhã'
          : `Renova em ${daysRemaining} dias`

  return {
    planLabel,
    billingLabel,
    statusLabel: 'Ativa',
    statusTone: 'active',
    headline: daysText || renewalCycle,
    detailLine: periodEndFormatted
      ? `Próxima cobrança em ${periodEndFormatted} · ${billingLabel}`
      : `${renewalCycle} · ${billingLabel}`,
    daysRemaining,
    periodEndFormatted,
    showManageButton: true,
    hasPaidAccess: true,
  }
}

export function formatDaysRemainingLabel(days: number | null): string | null {
  if (days === null) return null
  if (days === 0) return 'Hoje'
  if (days === 1) return '1 dia'
  return `${days} dias`
}
