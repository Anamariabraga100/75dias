const { requireEnv } = require('./env')

/**
 * Resolve o Price ID da Stripe para o plano escolhido.
 * Crie os prices no Dashboard (recurring):
 *   - monthly: interval month, count 1 → R$ 34,90
 *   - quarterly: interval month, count 3 → R$ 59,90
 *   - promo quarterly: interval month, count 3 → R$ 49,90
 */
function resolvePriceId(selectedPlan, usePromoOffer) {
  if (selectedPlan === 'monthly') {
    return requireEnv('STRIPE_PRICE_MONTHLY')
  }
  if (usePromoOffer && process.env.STRIPE_PRICE_PROMO_QUARTERLY) {
    return process.env.STRIPE_PRICE_PROMO_QUARTERLY
  }
  return requireEnv('STRIPE_PRICE_QUARTERLY')
}

/** Valores em reais (para gravar em payments). */
const PLAN_AMOUNTS = {
  monthly: 34.9,
  quarterly: 59.9,
  promoQuarterly: 49.9,
}

function resolvePlanAmount(selectedPlan, usePromoOffer) {
  if (selectedPlan === 'monthly') return PLAN_AMOUNTS.monthly
  if (usePromoOffer) return PLAN_AMOUNTS.promoQuarterly
  return PLAN_AMOUNTS.quarterly
}

module.exports = { resolvePriceId, resolvePlanAmount, PLAN_AMOUNTS }
