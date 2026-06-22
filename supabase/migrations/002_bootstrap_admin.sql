-- Reset90 — setup do admin (rodar DEPOIS do 001_admin_schema.sql)
--
-- ORDEM:
--   1) Rode 001_admin_schema.sql  (cria tabela profiles)
--   2) Authentication → Users → Add user (admin@admin.com + senha = VITE_ADMIN_PASSWORD)
--   3) Rode este arquivo

-- 1) Confirmar e-mail
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, timezone('utc', now()))
WHERE lower(email) = lower('admin@admin.com');

-- 2) Marcar como admin
ALTER TABLE public.profiles DISABLE TRIGGER protect_admin_flag;

INSERT INTO public.profiles (user_id, email, is_admin)
SELECT id, email, true
FROM auth.users
WHERE lower(email) = lower('admin@admin.com')
ON CONFLICT (user_id) DO UPDATE
SET is_admin = true, email = EXCLUDED.email;

ALTER TABLE public.profiles ENABLE TRIGGER protect_admin_flag;

-- 3) Desligue "Confirm email" em Authentication → Providers → Email
