-- Log de eventos Stripe + campos extras em payments

create table if not exists public.stripe_events (
  id uuid primary key default gen_random_uuid(),
  stripe_event_id text not null unique,
  event_type text not null,
  category text not null default 'billing',
  title text not null,
  description text,
  amount numeric(10, 2),
  currency text not null default 'brl',
  user_id uuid references auth.users (id) on delete set null,
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_invoice_id text,
  stripe_charge_id text,
  stripe_session_id text,
  status text not null default 'info',
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists idx_stripe_events_created on public.stripe_events (created_at desc);
create index if not exists idx_stripe_events_type on public.stripe_events (event_type);
create index if not exists idx_stripe_events_user on public.stripe_events (user_id);
create index if not exists idx_stripe_events_status on public.stripe_events (status);

alter table public.payments
  add column if not exists event_type text,
  add column if not exists stripe_charge_id text,
  add column if not exists stripe_event_id text;

create index if not exists idx_payments_status on public.payments (status);
create index if not exists idx_payments_created on public.payments (created_at desc);

alter table public.stripe_events enable row level security;
