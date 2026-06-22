# Reset90 (75 Dias)

App web de disciplina e desafios de 90 dias — frontend em PT-BR.

## Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- React Router
- Zustand (estado + localStorage)
- Supabase (auth — em integração)

## Como rodar

```bash
npm install
cp .env.example .env.local   # preencha com Supabase (ver abaixo)
npm run dev
```

Abra [http://localhost:5173](http://localhost:5173)

---

## Credenciais: Google + Supabase

Há **dois modos** de login Google:

| Modo | Redirect no Google Cloud | Quando usar |
|------|--------------------------|-------------|
| **Custom (recomendado)** — igual Varvos | `https://SEU-DOMINIO.vercel.app/api/auth/callback/google` | Produção na Vercel |
| **Supabase direto** | `https://SEU_PROJECT_REF.supabase.co/auth/v1/callback` | Dev local (`VITE_CUSTOM_GOOGLE_OAUTH` desligado) |

### Modo custom (seu domínio, como varvos.com)

Fluxo: **App → Google → `/api/auth/callback/google` → Supabase (sessão) → `/auth/callback`**

#### Google Cloud Console

1. **Authorized redirect URIs:**
   ```
   https://SEU-DOMINIO.vercel.app/api/auth/callback/google
   ```
2. **Authorized JavaScript origins:** `https://SEU-DOMINIO.vercel.app`

#### Vercel — Environment Variables

| Name | Onde |
|------|------|
| `VITE_CUSTOM_GOOGLE_OAUTH` | `true` |
| `VITE_APP_URL` | `https://SEU-DOMINIO.vercel.app` |
| `APP_URL` | mesma URL (servidor) |
| `GOOGLE_CLIENT_ID` | Google Cloud (servidor) |
| `GOOGLE_CLIENT_SECRET` | Google Cloud (servidor) |
| `SUPABASE_URL` | URL do projeto |
| `SUPABASE_ANON_KEY` | anon public key |
| `VITE_SUPABASE_URL` | igual `SUPABASE_URL` |
| `VITE_SUPABASE_ANON_KEY` | igual `SUPABASE_ANON_KEY` |

No **Supabase → Authentication → Google**, ative com o **mesmo** Client ID + Secret (necessário para `signInWithIdToken`).

Redeploy após salvar.

#### Dev local

Com `VITE_CUSTOM_GOOGLE_OAUTH=true`, use `npx vercel dev` (as rotas `/api/*` não rodam no `npm run dev` puro).

Ou deixe `VITE_CUSTOM_GOOGLE_OAUTH=false` localmente e use o modo Supabase abaixo.

---

### Modo Supabase direto (dev / fallback)

O login com Google passa pelo callback do Supabase antes de voltar ao app.

### Onde cada coisa fica

| Credencial | Onde configurar |
|------------|-----------------|
| Google **Client ID** + **Client Secret** | [Supabase](https://supabase.com/dashboard) → **Authentication** → **Providers** → **Google** |
| **Project URL** + **anon public key** | Arquivo `.env.local` (local) e **Vercel → Environment Variables** |
| **service_role key** | Só backend/scripts. **Nunca** no front, **nunca** com prefixo `VITE_` |

### 1. Google Cloud Console (modo Supabase)

1. [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials**
2. **Create Credentials** → **OAuth client ID** → tipo **Web application**
3. **Authorized JavaScript origins**
   - `http://localhost:5173` (dev)
   - `https://SEU-DOMINIO.vercel.app` (produção)
4. **Authorized redirect URIs**
   - `https://SEU_PROJECT_REF.supabase.co/auth/v1/callback`

### 2. Supabase Dashboard

1. **Project Settings** → **API**
   - **Project URL** → vira `VITE_SUPABASE_URL`
   - **anon public** → vira `VITE_SUPABASE_ANON_KEY`
2. **Authentication** → **Providers** → **Google** → ativar e colar Client ID + Secret do Google
3. **Authentication** → **URL Configuration**
   - **Site URL**: `http://localhost:5173` (dev) ou `https://SEU-DOMINIO.vercel.app` (prod)
   - **Redirect URLs** (adicione todas):
     - `http://localhost:5173/**`
     - `https://SEU-DOMINIO.vercel.app/**`

### 3. Local (`.env.local`)

Na raiz do projeto, crie `.env.local` (já está no `.gitignore` via `*.local`):

```env
VITE_SUPABASE_URL=https://SEU_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Reinicie o `npm run dev` depois de salvar.

### 4. Vercel

1. Projeto na Vercel → **Settings** → **Environment Variables**
2. Adicione as **mesmas duas** variáveis:

| Name | Value | Environments |
|------|--------|--------------|
| `VITE_SUPABASE_URL` | URL do Supabase | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | anon public key | Production, Preview, Development |

3. **Redeploy** após salvar (Vite embute `VITE_*` no build)

**Não** adicione na Vercel: Google Client Secret, service_role, ou qualquer segredo que não seja a anon key pública.

### Checklist rápido

- [ ] **Modo custom:** redirect Google = `https://SEU-DOMINIO/api/auth/callback/google` + vars `GOOGLE_*` e `VITE_CUSTOM_GOOGLE_OAUTH=true`
- [ ] **Modo Supabase:** redirect Google = `…supabase.co/auth/v1/callback`
- [ ] Site URL e Redirect URLs no Supabase
- [ ] `.env` ou `.env.local` com `VITE_SUPABASE_*` (local)
- [ ] Mesmas vars na Vercel + **redeploy** após adicionar
- [ ] `VITE_APP_URL` na Vercel = URL de produção (ex.: `https://seu-app.vercel.app`)
- [ ] Supabase → Redirect URLs inclui `https://SEU-DOMINIO.vercel.app/auth/callback`
- [ ] Supabase → Email → **Confirm email OFF** (cadastro sem confirmação)
- [ ] Google OAuth redirect (modo custom): `https://SEU-DOMINIO/api/auth/callback/google`

Login Google: landing → Google → **`/api/auth/callback/google`** (custom) ou Supabase → `/auth/callback` → onboarding ou app.

---

## Fluxo do app

1. **Landing** → onboarding (nome, objetivos, quiz, paywall)
2. **Paywall** → pagamento (simulado) → app
3. **App** → níveis, hábitos diários, progresso, evolução no espelho (Implacável)

## Painel Admin

URL: **`/admin`** (login em `/admin/login`)

### 1. Rodar a migration no Supabase

No **SQL Editor** do Supabase, cole e execute o arquivo:

`supabase/migrations/001_admin_schema.sql`

### 2. Credenciais na Vercel (ou `.env` local)

Adicione as variáveis (mesmo e-mail/senha do usuário no Supabase Auth):

```
VITE_ADMIN_EMAIL=admin@seudominio.com
VITE_ADMIN_PASSWORD=sua_senha_admin
```

Na Vercel: **Settings → Environment Variables** → redeploy após salvar.

Crie o usuário em **Supabase → Authentication → Users → Add user** (marque **Auto Confirm User**) com o mesmo e-mail e senha.

Ou desative confirmação de e-mail: **Authentication → Providers → Email → Confirm email OFF** (recomendado para admin).

Depois libere admin:

```sql
UPDATE public.profiles SET is_admin = true WHERE email = 'admin@seudominio.com';
```

(Se o perfil ainda não existir, faça login uma vez no admin e rode o SQL de novo.)

### 3. Acessar

1. Abra `/admin/login`
2. Entre com **e-mail e senha**
3. Marque **Lembrar senha** para não digitar de novo neste navegador
4. Dashboard: vendas do dia, novos usuários, receita, últimos pagamentos
5. Assinantes: plano, dias investidos, fotos de evolução, último acesso

Os dados são sincronizados do app para o Supabase ao login, pagamento, marcar hábitos e registrar fotos.

---

## Próximos passos

- [x] Integrar Supabase Auth (Google + e-mail)
- [x] Persistir perfil e progresso no Supabase (sync básico)
- [x] Painel admin (dashboard + assinantes)
- [ ] Gateway de pagamento real (Pix + cartão)
- [ ] Upload de fotos no S3

## Estrutura

```
src/
  components/   # UI reutilizável
  pages/        # Telas (landing, onboarding, app)
  store/        # Estado global (Zustand)
public/
  landing/      # Hero da landing
  niveis/       # Imagens dos níveis + paywall
```
