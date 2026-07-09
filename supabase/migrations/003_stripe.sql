-- Reset90 — setup completo para Stripe
-- Rode este arquivo no SQL Editor do Supabase.
-- É idempotente: seguro rodar em banco novo ou após 001/002.

-- =============================================================================
-- 1) Schema base (equivalente ao 001_admin_schema.sql)
-- =============================================================================

create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text,
  name text,
  avatar_url text,
  is_admin boolean not null default false,
  selected_plan text,
  use_promo_offer boolean not null default false,
  payment_complete boolean not null default false,
  onboarding_complete boolean not null default false,
  challenge_id text,
  challenge_accepted boolean not null default false,
  current_day int not null default 1,
  discipline_score int,
  invested_days int not null default 0,
  photos_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  amount numeric(10, 2) not null,
  plan_type text not null,
  method text not null default 'pix',
  status text not null default 'pending',
  use_promo boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.mirror_photo_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  day int not null,
  created_at timestamptz not null default now(),
  unique (user_id, day)
);

create index if not exists idx_profiles_payment on public.profiles (payment_complete);
create index if not exists idx_profiles_updated on public.profiles (updated_at desc);
create index if not exists idx_payments_created on public.payments (created_at desc);
create index if not exists idx_payments_user on public.payments (user_id);

alter table public.profiles enable row level security;
alter table public.payments enable row level security;
alter table public.mirror_photo_logs enable row level security;

create or replace function public.is_admin_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select is_admin from public.profiles where user_id = auth.uid()),
    false
  );
$$;

create or replace function public.protect_admin_flag()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    new.is_admin := false;
  elsif tg_op = 'UPDATE' and new.is_admin is distinct from old.is_admin then
    new.is_admin := old.is_admin;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_admin_flag on public.profiles;
create trigger protect_admin_flag
  before insert or update on public.profiles
  for each row execute function public.protect_admin_flag();

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (auth.uid() = user_id or public.is_admin_user());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = user_id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = user_id);

drop policy if exists "payments_select_own_or_admin" on public.payments;
create policy "payments_select_own_or_admin"
  on public.payments for select
  using (auth.uid() = user_id or public.is_admin_user());

drop policy if exists "mirror_photos_insert_own" on public.mirror_photo_logs;
create policy "mirror_photos_insert_own"
  on public.mirror_photo_logs for insert
  with check (auth.uid() = user_id);

drop policy if exists "mirror_photos_select_own_or_admin" on public.mirror_photo_logs;
create policy "mirror_photos_select_own_or_admin"
  on public.mirror_photo_logs for select
  using (auth.uid() = user_id or public.is_admin_user());

-- =============================================================================
-- 2) Colunas Stripe
-- =============================================================================

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

-- =============================================================================
-- 3) Proteção de cobrança (webhook usa service_role)
-- =============================================================================

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
