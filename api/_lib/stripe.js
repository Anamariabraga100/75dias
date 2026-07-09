const Stripe = require('stripe')
const { requireEnv } = require('./env')

let stripeClient = null

function getStripe() {
  if (!stripeClient) {
    stripeClient = new Stripe(requireEnv('STRIPE_SECRET_KEY'), {
      apiVersion: '2025-02-24.acacia',
    })
  }
  return stripeClient
}

module.exports = { getStripe }
