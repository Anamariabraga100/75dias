-- URL pública da foto no R2 (opcional — fallback local continua no dispositivo)
alter table public.mirror_photo_logs
  add column if not exists photo_url text;
