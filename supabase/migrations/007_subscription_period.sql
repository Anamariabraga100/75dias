-- Período da assinatura Stripe (renovação / cancelamento ao fim do ciclo)

alter table public.profiles
  add column if not exists subscription_period_end timestamptz,
  add column if not exists subscription_cancel_at_period_end boolean not null default false;

create or replace function public.protect_billing_flags()
returns trigger
language plpgsql
as $$
begin
  if coalesce(auth.role(), '') = 'service_role' then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.payment_complete := false;
    new.subscription_status := coalesce(new.subscription_status, 'inactive');
    new.stripe_customer_id := null;
    new.stripe_subscription_id := null;
    new.subscription_period_end := null;
    new.subscription_cancel_at_period_end := false;
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
    if new.subscription_period_end is distinct from old.subscription_period_end then
      new.subscription_period_end := old.subscription_period_end;
    end if;
    if new.subscription_cancel_at_period_end is distinct from old.subscription_cancel_at_period_end then
      new.subscription_cancel_at_period_end := old.subscription_cancel_at_period_end;
    end if;
  end if;
  return new;
end;
$$;
