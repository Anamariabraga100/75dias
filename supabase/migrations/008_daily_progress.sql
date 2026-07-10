-- Progresso diário (hábitos marcados, dia completo, etc.)
alter table public.profiles
  add column if not exists daily_progress jsonb;
