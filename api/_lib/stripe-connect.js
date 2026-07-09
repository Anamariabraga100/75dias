/**
 * Stripe Connect — split de pagamento entre plataforma e parceiro(s).
 *
 * Para ativar depois:
 *   STRIPE_CONNECT_ENABLED=true
 *   STRIPE_CONNECT_ACCOUNT_ID=acct_xxx          (conta padrão do parceiro)
 *   STRIPE_CONNECT_APPLICATION_FEE_PERCENT=10   (% que fica na plataforma)
 *
 * Contas diferentes por plano (opcional):
 *   STRIPE_CONNECT_ACCOUNT_MONTHLY=acct_aaa
 *   STRIPE_CONNECT_ACCOUNT_QUARTERLY=acct_bbb
 *
 * Documentação: https://stripe.com/docs/connect/subscriptions
 */

function isConnectEnabled() {
  return process.env.STRIPE_CONNECT_ENABLED === 'true'
}

function getConnectedAccountId(plan) {
  if (!isConnectEnabled()) return null

  if (plan === 'monthly' && process.env.STRIPE_CONNECT_ACCOUNT_MONTHLY) {
    return process.env.STRIPE_CONNECT_ACCOUNT_MONTHLY
  }
  if (plan === 'quarterly' && process.env.STRIPE_CONNECT_ACCOUNT_QUARTERLY) {
    return process.env.STRIPE_CONNECT_ACCOUNT_QUARTERLY
  }
  return process.env.STRIPE_CONNECT_ACCOUNT_ID || null
}

function getApplicationFeePercent() {
  const pct = parseFloat(process.env.STRIPE_CONNECT_APPLICATION_FEE_PERCENT || '0')
  return Number.isFinite(pct) && pct > 0 ? pct : 0
}

/**
 * Retorna opções extras para stripe.checkout.sessions.create.
 * Quando Connect estiver desligado, retorna {} (sem impacto).
 */
function getConnectCheckoutOptions(plan) {
  const destination = getConnectedAccountId(plan)
  if (!destination) return {}

  const subscriptionData = {
    transfer_data: { destination },
  }

  const feePercent = getApplicationFeePercent()
  if (feePercent > 0) {
    subscriptionData.application_fee_percent = feePercent
  }

  return { subscription_data: subscriptionData }
}

module.exports = {
  isConnectEnabled,
  getConnectedAccountId,
  getApplicationFeePercent,
  getConnectCheckoutOptions,
}
