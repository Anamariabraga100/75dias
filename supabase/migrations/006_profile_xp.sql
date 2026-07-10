-- XP acumulado (sincronizado do cliente)
alter table public.profiles
  add column if not exists total_xp int not null default 0;

create index if not exists idx_profiles_invested_days on public.profiles (invested_days desc);
create index if not exists idx_profiles_total_xp on public.profiles (total_xp desc);
create index if not exists idx_profiles_photos_count on public.profiles (photos_count desc);
create index if not exists idx_mirror_photo_logs_created on public.mirror_photo_logs (created_at desc);
