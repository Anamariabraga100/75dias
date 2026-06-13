import type { PlanType } from '../store/useAppStore'

export const PRICING = {
  monthly: {
    label: 'Mensal',
    total: 34.9,
    display: 'R$ 34,90',
    period: '/mês',
    footer: 'Cobrança mensal recorrente',
    planLabel: 'Plano Mensal',
  },
  quarterly: {
    label: 'Trimestral',
    total: 59.9,
    perMonth: 19.97,
    displayPerMonth: 'R$ 19,97',
    displayTotal: 'R$ 59,90',
    period: '/mês',
    footer: 'R$ 59,90 a cada 3 meses',
    planLabel: 'Plano Trimestral',
    discountPercent: 43,
  },
  promoQuarterly: {
    total: 49.9,
    displayTotal: 'R$ 49,90',
    perMonth: 16.63,
    displayPerMonth: 'R$ 16,63',
    period: '/trimestre',
    planLabel: 'Plano Trimestral — Oferta',
    discountPercent: 52,
  },
} as const

export function getCheckoutPrice(plan: PlanType, usePromo: boolean) {
  if (usePromo) {
    return {
      label: PRICING.promoQuarterly.planLabel,
      total: PRICING.promoQuarterly.displayTotal,
      period: PRICING.promoQuarterly.period,
      discount: PRICING.promoQuarterly.discountPercent,
    }
  }
  if (plan === 'quarterly') {
    return {
      label: PRICING.quarterly.planLabel,
      total: PRICING.quarterly.displayTotal,
      period: '/trimestre',
      discount: PRICING.quarterly.discountPercent,
    }
  }
  return {
    label: PRICING.monthly.planLabel,
    total: PRICING.monthly.display,
    period: PRICING.monthly.period,
    discount: null as number | null,
  }
}

export function getPlanDisplayLabel(plan: PlanType, usePromo: boolean) {
  if (usePromo) return PRICING.promoQuarterly.planLabel
  return plan === 'quarterly' ? PRICING.quarterly.planLabel : PRICING.monthly.planLabel
}
