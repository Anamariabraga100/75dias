-- Reset90 — schema admin (rodar no SQL Editor do Supabase)

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
  status text not null default 'completed',
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

-- Helper: usuário é admin
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

-- Impede que usuários se promovam a admin pelo client
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

-- Profiles
create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (auth.uid() = user_id or public.is_admin_user());

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = user_id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = user_id);

-- Payments
create policy "payments_insert_own"
  on public.payments for insert
  with check (auth.uid() = user_id);

create policy "payments_select_own_or_admin"
  on public.payments for select
  using (auth.uid() = user_id or public.is_admin_user());

-- Mirror photos
create policy "mirror_photos_insert_own"
  on public.mirror_photo_logs for insert
  with check (auth.uid() = user_id);

create policy "mirror_photos_select_own_or_admin"
  on public.mirror_photo_logs for select
  using (auth.uid() = user_id or public.is_admin_user());

-- Primeiro admin (troque o e-mail):
-- update public.profiles set is_admin = true where email = 'seu@email.com';
