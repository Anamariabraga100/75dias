-- Reset90 — Stripe billing (rodar no SQL Editor do Supabase)

alter table public.profiles
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists subscription_status text not null default 'inactive';

alter table public.payments
  add column if not exists stripe_session_id text,
  add column if not exists stripe_invoice_id text;

alter table public.payments
  alter column status set default 'pending';

create index if not exists idx_profiles_subscription on public.profiles (subscription_status);
create index if not exists idx_profiles_stripe_customer on public.profiles (stripe_customer_id);
create index if not exists idx_payments_stripe_session on public.payments (stripe_session_id);

-- Impede que o client altere flags de cobrança (webhook usa service_role)
create or replace function public.protect_billing_flags()
returns trigger
language plpgsql
as $$
begin
  -- service_role (webhook) pode alterar flags de cobrança
  if coalesce(auth.role(), '') = 'service_role' then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.payment_complete := false;
    new.subscription_status := coalesce(new.subscription_status, 'inactive');
    new.stripe_customer_id := null;
    new.stripe_subscription_id := null;
  elsif tg_op = 'UPDATE' then
    if new.payment_complete is distinct from old.payment_complete then
      new.payment_complete := old.payment_complete;
    end if;
    if new.subscription_status is distinct from old.subscription_status then
      new.subscription_status := old.subscription_status;
    end if;
    if new.stripe_customer_id is distinct from old.stripe_customer_id then
      new.stripe_customer_id := old.stripe_customer_id;
    end if;
    if new.stripe_subscription_id is distinct from old.stripe_subscription_id then
      new.stripe_subscription_id := old.stripe_subscription_id;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_billing_flags on public.profiles;
create trigger protect_billing_flags
  before insert or update on public.profiles
  for each row execute function public.protect_billing_flags();

-- Pagamentos só via webhook (service_role)
drop policy if exists "payments_insert_own" on public.payments;
