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

O login com Google usa **Supabase Auth**. As chaves do Google **não** entram no código nem na Vercel — só no painel do Supabase.

### Onde cada coisa fica

| Credencial | Onde configurar |
|------------|-----------------|
| Google **Client ID** + **Client Secret** | [Supabase](https://supabase.com/dashboard) → **Authentication** → **Providers** → **Google** |
| **Project URL** + **anon public key** | Arquivo `.env.local` (local) e **Vercel → Environment Variables** |
| **service_role key** | Só backend/scripts. **Nunca** no front, **nunca** com prefixo `VITE_` |

### 1. Google Cloud Console

1. [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials**
2. **Create Credentials** → **OAuth client ID** → tipo **Web application**
3. **Authorized JavaScript origins**
   - `http://localhost:5173` (dev)
   - `https://SEU-DOMINIO.vercel.app` (produção)
4. **Authorized redirect URIs** (obrigatório para Supabase)
   - `https://SEU_PROJECT_REF.supabase.co/auth/v1/callback`
   - O `PROJECT_REF` está na URL do projeto Supabase (ex.: `abcdefghijklmnop`)

Copie **Client ID** e **Client Secret** → cole no Supabase (passo 2).

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

- [ ] Google OAuth criado com redirect `…supabase.co/auth/v1/callback`
- [ ] Google ativado no Supabase com ID + Secret
- [ ] Site URL e Redirect URLs no Supabase
- [ ] `.env` ou `.env.local` com `VITE_SUPABASE_*` (local)
- [ ] Mesmas vars na Vercel + **redeploy** após adicionar
- [ ] Supabase → Redirect URLs inclui `https://SEU-DOMINIO.vercel.app/auth/callback`
- [ ] Google OAuth redirect aponta para `…supabase.co/auth/v1/callback`

Login Google implementado: landing → Google → `/auth/callback` → onboarding ou app.

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
