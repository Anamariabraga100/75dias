const EVENT_META = {
  'checkout.session.completed': {
    title: 'Primeira compra concluída',
    description: 'Checkout finalizado — cliente e assinatura associados.',
    category: 'checkout',
    status: 'success',
  },
  'invoice.paid': {
    title: 'Pagamento confirmado',
    description: 'Fatura paga — acesso liberado ou renovado.',
    category: 'payment',
    status: 'success',
  },
  'invoice.payment_failed': {
    title: 'Pagamento falhou',
    description: 'Cobrança recusada — assinatura marcada como inadimplente.',
    category: 'payment',
    status: 'error',
  },
  'customer.subscription.created': {
    title: 'Nova assinatura',
    description: 'Assinatura criada no Stripe — plano e período registrados.',
    category: 'subscription',
    status: 'success',
  },
  'customer.subscription.updated': {
    title: 'Assinatura atualizada',
    description: 'Mudança de plano, status ou datas da assinatura.',
    category: 'subscription',
    status: 'info',
  },
  'customer.subscription.deleted': {
    title: 'Assinatura cancelada',
    description: 'Acesso encerrado — assinatura removida.',
    category: 'subscription',
    status: 'warning',
  },
  'customer.subscription.paused': {
    title: 'Assinatura pausada',
    description: 'Cobranças pausadas — acesso suspenso.',
    category: 'subscription',
    status: 'warning',
  },
  'customer.subscription.resumed': {
    title: 'Assinatura reativada',
    description: 'Cobranças retomadas — acesso restaurado.',
    category: 'subscription',
    status: 'success',
  },
  'charge.refunded': {
    title: 'Reembolso realizado',
    description: 'Valor devolvido ao cliente — receita e acesso atualizados.',
    category: 'refund',
    status: 'warning',
  },
  'charge.dispute.created': {
    title: 'Chargeback iniciado',
    description: 'Cliente contestou a cobrança no banco.',
    category: 'dispute',
    status: 'error',
  },
  'charge.dispute.closed': {
    title: 'Chargeback encerrado',
    description: 'Disputa finalizada — verifique o resultado.',
    category: 'dispute',
    status: 'info',
  },
}

function getEventMeta(eventType) {
  return (
    EVENT_META[eventType] ?? {
      title: eventType,
      description: 'Evento Stripe recebido.',
      category: 'billing',
      status: 'info',
    }
  )
}

async function findUserIdByCustomer(admin, customerId) {
  if (!customerId) return null
  const { data } = await admin
    .from('profiles')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .maybeSingle()
  return data?.user_id ?? null
}

function extractCustomerId(obj) {
  if (!obj?.customer) return null
  return typeof obj.customer === 'string' ? obj.customer : obj.customer?.id ?? null
}

function extractSubscriptionId(obj) {
  if (!obj?.subscription) return null
  return typeof obj.subscription === 'string' ? obj.subscription : obj.subscription?.id ?? null
}

function extractAmountCents(obj) {
  if (typeof obj?.amount_total === 'number') return obj.amount_total
  if (typeof obj?.amount_paid === 'number') return obj.amount_paid
  if (typeof obj?.amount === 'number') return obj.amount
  if (typeof obj?.amount_refunded === 'number') return obj.amount_refunded
  return null
}

async function claimStripeEvent(admin, event, extra = {}) {
  const meta = getEventMeta(event.type)
  const object = event.data?.object ?? {}

  const customerId = extra.stripe_customer_id ?? extractCustomerId(object)
  let userId = extra.user_id ?? null

  if (!userId && object.metadata?.userId) {
    userId = object.metadata.userId
  }
  if (!userId && customerId) {
    userId = await findUserIdByCustomer(admin, customerId)
  }

  const amountCents = extra.amount_cents ?? extractAmountCents(object)
  const amount = amountCents != null ? amountCents / 100 : extra.amount ?? null

  const row = {
    stripe_event_id: event.id,
    event_type: event.type,
    category: meta.category,
    title: extra.title ?? meta.title,
    description: extra.description ?? meta.description,
    amount,
    currency: (object.currency || extra.currency || 'brl').toLowerCase(),
    user_id: userId,
    stripe_customer_id: customerId,
    stripe_subscription_id:
      extra.stripe_subscription_id ??
      extractSubscriptionId(object) ??
      (typeof object.id === 'string' && object.id.startsWith('sub_') ? object.id : null),
    stripe_invoice_id:
      extra.stripe_invoice_id ??
      (typeof object.invoice === 'string' ? object.invoice : object.invoice?.id) ??
      (object.id?.startsWith?.('in_') ? object.id : null),
    stripe_charge_id:
      extra.stripe_charge_id ??
      (typeof object.charge === 'string' ? object.charge : object.charge?.id) ??
      (object.id?.startsWith?.('ch_') || object.id?.startsWith?.('py_') ? object.id : null),
    stripe_session_id:
      extra.stripe_session_id ?? (object.id?.startsWith?.('cs_') ? object.id : null),
    status: extra.status ?? meta.status,
    metadata: {
      livemode: event.livemode,
      ...(extra.metadata ?? {}),
    },
  }

  const { error } = await admin.from('stripe_events').insert(row)

  if (error?.code === '23505') {
    return { claimed: false, userId, meta }
  }
  if (error) throw error

  return { claimed: true, userId, meta, row }
}

module.exports = {
  EVENT_META,
  getEventMeta,
  claimStripeEvent,
  findUserIdByCustomer,
  extractCustomerId,
  extractSubscriptionId,
}
